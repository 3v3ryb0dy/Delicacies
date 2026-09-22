import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'

/**
 * Minimal front-matter reader for the recipe files. Recipes only use plain
 * scalars, inline arrays (`tags: [ofen, deutsch]`) and block lists, so a full
 * YAML parser would be more dependency than the format needs.
 */
export function parseFrontmatter(raw) {
  const normalized = raw.replace(/\r\n?/g, '\n')
  if (!normalized.startsWith('---\n')) return { data: {}, body: normalized }

  const end = normalized.indexOf('\n---', 3)
  if (end === -1) return { data: {}, body: normalized }

  const header = normalized.slice(4, end)
  const body = normalized.slice(end + 4).replace(/^\n+/, '')
  const data = {}

  const lines = header.split('\n')
  let currentKey = null

  for (const line of lines) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue

    const blockItem = /^\s+-\s+(.*)$/.exec(line)
    if (blockItem && currentKey) {
      if (!Array.isArray(data[currentKey])) data[currentKey] = []
      data[currentKey].push(unquote(blockItem[1].trim()))
      continue
    }

    const pair = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line)
    if (!pair) continue

    const [, key, rawValue] = pair
    const value = rawValue.trim()
    currentKey = key

    if (value === '') {
      data[key] = []
      continue
    }

    if (value.startsWith('[') && value.endsWith(']')) {
      data[key] = value
        .slice(1, -1)
        .split(',')
        .map((item) => unquote(item.trim()))
        .filter(Boolean)
      continue
    }

    if (value === 'true' || value === 'false') {
      data[key] = value === 'true'
      continue
    }

    data[key] = unquote(value)
  }

  return { data, body }
}

function unquote(value) {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1)
  }
  return value
}

/** Reads every recipe file, sorted by title, with the raw body attached. */
export async function readRecipes(recipesDir) {
  const entries = (await readdir(recipesDir)).filter((file) => file.endsWith('.md'))

  const recipes = await Promise.all(
    entries.map(async (file) => {
      const raw = await readFile(path.join(recipesDir, file), 'utf8')
      const { data, body } = parseFrontmatter(raw)
      return {
        slug: file.replace(/\.md$/, ''),
        file,
        title: data.title ?? file.replace(/\.md$/, ''),
        category: data.category ?? 'sonstiges',
        subcategory: data.subcategory,
        tags: Array.isArray(data.tags) ? data.tags : [],
        ingredientTips: data.ingredientTips,
        image: typeof data.image === 'string' ? data.image : undefined,
        imageAlt: typeof data.imageAlt === 'string' ? data.imageAlt : undefined,
        servings: typeof data.servings === 'string' ? data.servings : undefined,
        wip: data.wip === true,
        preparationPending: data.preparationPending === true,
        body
      }
    })
  )

  return recipes.sort((a, b) => a.title.localeCompare(b.title, 'de'))
}

/** Reads a plain markdown file, dropping optional front-matter. */
export async function readProse(file) {
  const { body } = parseFrontmatter(await readFile(file, 'utf8'))
  return body.trim()
}

/**
 * Category and subcategory checks shared by the README generator and the
 * content check. `src/content.config.ts` enforces the same rules for the
 * website build, so a bad file fails both paths instead of quietly losing a
 * recipe from the home page.
 */
export function validateRecipes(recipes, categories) {
  const categoryById = new Map(categories.map((category) => [category.id, category]))

  for (const recipe of recipes) {
    const category = categoryById.get(recipe.category)
    if (!category) {
      throw new Error(
        `Unknown category "${recipe.category}" in recipes/${recipe.file}. ` +
          `Allowed: ${[...categoryById.keys()].join(', ')}`
      )
    }
    if (recipe.subcategory === undefined) continue

    const declared = category.subcategories ?? []
    if (!declared.some((subcategory) => subcategory.id === recipe.subcategory)) {
      throw new Error(
        `Unknown subcategory "${recipe.subcategory}" for category "${recipe.category}" in recipes/${recipe.file}. ` +
          `Allowed: ${declared.map((subcategory) => subcategory.id).join(', ') || 'none'}`
      )
    }
  }
}

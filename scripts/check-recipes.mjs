#!/usr/bin/env node
import { readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { categories } from '../src/config/taxonomy.ts'
import { ingredientTips } from '../src/config/ingredient-tips.ts'
import { resolveIngredientTips } from '../src/lib/ingredient-tips.ts'
import { resolveRecipeImage } from '../src/lib/recipe-image.ts'
import { parsePairingLinks, parseRecipeBody } from '../src/lib/recipe-body.ts'
import { readRecipes, validateRecipes } from './lib/recipes.mjs'

/**
 * Checks the parts of a recipe that the renderer cannot: whether the markdown
 * still matches the shape `parseRecipeBody` understands, and whether the image
 * and pairing references resolve. Runs before the site build so a mistake fails
 * with the file name instead of an empty section on the page.
 */
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const recipesDir = path.join(root, 'recipes')
const imagesDir = path.join(recipesDir, 'images')

const recipes = await readRecipes(recipesDir)
const photos = Object.fromEntries((await readdir(imagesDir)).map((file) => [`images/${file}`, `images/${file}`]))
const recipeIds = new Set(recipes.map((recipe) => recipe.slug))
const failures = []

try {
  validateRecipes(recipes, categories)
} catch (error) {
  failures.push(error.message)
}

for (const recipe of recipes) {
  const where = `recipes/${recipe.file}`
  const body = parseRecipeBody(recipe.body)
  const hasPreparation = body.preparation.length > 0 || body.thermomixPreparation.length > 0

  try {
    resolveIngredientTips(body.ingredients, recipe.ingredientTips, ingredientTips, where)
  } catch (error) {
    failures.push(error.message)
  }

  if (body.ingredients.length === 0) {
    failures.push(`${where}: no ingredients. Expected "## Zutaten" with list items.`)
  }

  if (!recipe.preparationPending && !hasPreparation) {
    failures.push(
      `${where}: no preparation. Expected "## Zubereitung" with quoted paragraphs, ` +
        'or `preparationPending: true` while the recipe is still a placeholder.'
    )
  }

  if (body.notes.length > 0) {
    failures.push(`${where}: text the parser could not place: ${body.notes.map((note) => `"${note}"`).join(', ')}`)
  }

  if (recipe.image) {
    const resolved = resolveRecipeImage(recipe.image, photos)
    if (!resolved) {
      failures.push(`${where}: image "${recipe.image}" is missing from recipes/images/.`)
    } else if (/\.(webp|png|jpe?g)$/i.test(recipe.image) && resolved !== recipe.image.replace(/^\.\//, '')) {
      failures.push(
        `${where}: image "${recipe.image}" resolves to "${resolved}" — the named format is missing. ` +
          'Drop the extension or point the front matter at the file that exists.'
      )
    }
  }

  for (const line of body.pairings) {
    try {
      parsePairingLinks(line, recipeIds, recipe.slug)
    } catch (error) {
      failures.push(`${where}: ${error.message}`)
    }
  }
}

if (failures.length > 0) {
  console.error(`Recipe check failed for ${failures.length} issue(s):`)
  for (const failure of failures) console.error(`  - ${failure}`)
  process.exit(1)
}

console.log(`Checked ${recipes.length} recipes: sections, images, pairings and ingredient tips.`)

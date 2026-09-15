import assert from 'node:assert/strict'
import path from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { categories } from '../../src/config/taxonomy.ts'
import { parseFrontmatter, readRecipes, validateRecipes } from './recipes.mjs'

const recipesDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../recipes')

test('front matter reads plain scalars, inline arrays and block lists', () => {
  const { data, body } = parseFrontmatter(
    [
      '---',
      '# a comment',
      'title: Pizza (Basis)',
      'category: hauptgerichte',
      'tags: [ofen, italienisch]',
      'source: https://example.com/pizza',
      'wip: true',
      'preparationPending: false',
      'note: "Mit Belag nach Wahl"',
      '---',
      '',
      '## Zutaten',
      '',
      '- 200 g Mehl'
    ].join('\n')
  )

  assert.deepEqual(data, {
    title: 'Pizza (Basis)',
    category: 'hauptgerichte',
    tags: ['ofen', 'italienisch'],
    source: 'https://example.com/pizza',
    wip: true,
    preparationPending: false,
    note: 'Mit Belag nach Wahl'
  })
  assert.equal(body, '## Zutaten\n\n- 200 g Mehl')
})

test('front matter reads block lists and unquotes values', () => {
  const { data, body } = parseFrontmatter(
    ['---', "title: 'Kürbisbrot'", 'tags:', '  - ofen', '  - vegetarisch', '---', 'Body'].join('\r\n')
  )

  assert.deepEqual(data, { title: 'Kürbisbrot', tags: ['ofen', 'vegetarisch'] })
  assert.equal(body, 'Body')
})

test('markdown without front matter stays a body', () => {
  assert.deepEqual(parseFrontmatter('## Zutaten\n\n- Salz'), { data: {}, body: '## Zutaten\n\n- Salz' })
})

test('recipes must name a category and a subcategory their category declares', () => {
  assert.doesNotThrow(() =>
    validateRecipes([{ file: 'a.md', category: 'beilagen', subcategory: 'gemuese' }], categories)
  )
  assert.doesNotThrow(() => validateRecipes([{ file: 'a.md', category: 'beilagen' }], categories))
  assert.throws(
    () => validateRecipes([{ file: 'a.md', category: 'beilagen', subcategory: 'gemüse' }], categories),
    /Unknown subcategory "gemüse" for category "beilagen" in recipes\/a\.md/
  )
  assert.throws(
    () => validateRecipes([{ file: 'a.md', category: 'dessert', subcategory: 'gemuese' }], categories),
    /Unknown category "dessert"/
  )
})

test('the recipes in this repository satisfy those rules', async () => {
  const recipes = await readRecipes(recipesDir)
  assert.ok(recipes.length > 0)
  assert.doesNotThrow(() => validateRecipes(recipes, categories))
})

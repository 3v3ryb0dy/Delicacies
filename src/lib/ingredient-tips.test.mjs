import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ingredientTips } from '../config/ingredient-tips.ts'
import { ingredientMatchesTip, resolveIngredientTips, selectIngredientTips } from './ingredient-tips.ts'
import { parseRecipeBody } from './recipe-body.ts'
import { readRecipes, parseFrontmatter } from '../../scripts/lib/recipes.mjs'

const guide = (id) => ingredientTips.find((tip) => tip.id === id)
const resolve = (items, ids) => resolveIngredientTips([{ items }], ids, ingredientTips, 'recipes/test.md')[0]

test('guides require explicit selection and preserve ingredient rows', () => {
  assert.deepEqual(resolve(['200 g Basmatireis', '1 Avocado'], undefined), [[], []])
  assert.deepEqual(resolve(['200 g Basmatireis', '1 Avocado'], []), [[], []])
  assert.deepEqual(resolve(['200 g Basmatireis', '1 Avocado'], ['avocado-schneiden']), [
    [],
    [guide('avocado-schneiden')]
  ])
})

test('aliases match case, compounds and punctuation without matching inside other words', () => {
  for (const item of ['200 g BASMATIREIS', '150 g Carnaroli- oder Arborio-Reis', '100 g Sushi-Reis']) {
    assert.equal(ingredientMatchesTip(item, guide('reis-waschen')), true, item)
  }
  for (const item of [
    'Reisbandnudeln',
    'Reisnudeln',
    'Reismehl',
    'Reissirup',
    'Reisessig',
    'Kreis',
    'ÖReis',
    'Reisä',
    '_Reis',
    'Reis2'
  ]) {
    assert.equal(ingredientMatchesTip(item, guide('reis-waschen')), false, item)
  }
  assert.equal(ingredientMatchesTip('2 EL Grapefruitsaft', guide('zitrus-filetieren')), false)
  assert.equal(ingredientMatchesTip('1 TL Knoblauchpulver', guide('knoblauch-braten')), false)
  assert.equal(ingredientMatchesTip('400 g Seidentofu', guide('tofu-braten')), false)
})

test('zest guidance attaches to qualified fruit or zest, never juice-only fruit', () => {
  const items = [
    '½ Bio-Zitrone (Abrieb)',
    '½ Zitrone (Saft)',
    '1 Spritzer Zitronensaft',
    '3 Zitronen (Schale fein abgerieben, etwa 1 EL)',
    '½ Bio-Zitrone (Abrieb und Saft)'
  ]
  assert.deepEqual(
    resolve(items, ['zitrusschale-abreiben']).map((tips) => tips.length),
    [1, 0, 0, 1, 1]
  )
})

test('literal aliases escape regex syntax and keep Unicode word boundaries', () => {
  const tip = { ...guide('reis-waschen'), aliases: ['Sauce (hell)', 'A+B'] }
  assert.equal(ingredientMatchesTip('1 EL Sauce (hell), optional', tip), true)
  assert.equal(ingredientMatchesTip('1 EL Sauce hell', tip), false)
  assert.equal(ingredientMatchesTip('2 TL A+B', tip), true)
  assert.equal(ingredientMatchesTip('2 TL AAAB', tip), false)
})

test('multiple guides follow selection order and repeated aliases produce one guide per row', () => {
  const rows = resolve(
    ['Champignons mit Knoblauch, Knoblauchzehen', 'Champignons oder Austernpilze'],
    ['knoblauch-braten', 'pilze-braten']
  )
  assert.deepEqual(
    rows.map((row) => row.map((tip) => tip.id)),
    [['knoblauch-braten', 'pilze-braten'], ['pilze-braten']]
  )
})

test('repeated ingredients in different groups keep their own guide assignments', () => {
  const groups = [
    { title: 'Teig', items: ['1 Knoblauchzehe'] },
    { title: 'Sauce', items: ['2 Knoblauchzehen', 'Salz'] }
  ]
  const before = structuredClone(groups)
  assert.deepEqual(
    resolveIngredientTips(groups, ['knoblauch-braten'], ingredientTips, 'a.md').map((rows) =>
      rows.map((tips) => tips.length)
    ),
    [[1], [1, 0]]
  )
  assert.deepEqual(groups, before)
})

test('invalid selections report the recipe and guide instead of silently dropping advice', () => {
  assert.throws(() => resolve(['Reis'], ['missing']), /recipes\/test\.md: unknown ingredient tip "missing"/)
  assert.throws(
    () => resolve(['Reis'], ['reis-waschen', 'reis-waschen']),
    /recipes\/test\.md: duplicate ingredient tip "reis-waschen"/
  )
  assert.throws(
    () => resolve(['Reismehl'], ['reis-waschen']),
    /recipes\/test\.md: ingredient tip "reis-waschen" matches no ingredient/
  )
  for (const selection of ['reis-waschen', null, [123], {}]) {
    assert.throws(() => resolve(['Reis'], selection), /recipes\/test\.md: ingredientTips must be an array/)
  }
})

test('existing frontmatter formats can select guides without nested YAML', () => {
  for (const field of [
    'ingredientTips: [reis-waschen, pilze-braten]',
    'ingredientTips:\n  - reis-waschen\n  - pilze-braten'
  ]) {
    const { data } = parseFrontmatter(`---\n${field}\n---\n`)
    assert.deepEqual(
      selectIngredientTips(data.ingredientTips, ingredientTips, 'test.md').map((tip) => tip.id),
      ['reis-waschen', 'pilze-braten']
    )
  }
})

test('the catalog has unique IDs, usable aliases, concise guides and editorial sources', () => {
  assert.ok(ingredientTips.length > 0)
  assert.equal(new Set(ingredientTips.map((tip) => tip.id)).size, ingredientTips.length)
  for (const tip of ingredientTips) {
    assert.match(tip.id, /^[a-z]+(?:-[a-z]+)*$/)
    assert.ok(tip.aliases.length > 0 && tip.aliases.every((alias) => alias.trim().length > 0))
    assert.ok(tip.title && tip.intro && tip.points.length > 0)
    assert.ok(tip.sources.length > 0 && tip.sources.every((source) => new URL(source.url).protocol === 'https:'))
  }
})

test('all curated recipes resolve, with precise assignments for the risotto ingredients', async () => {
  const recipes = await readRecipes(new URL('../../recipes', import.meta.url).pathname)
  for (const recipe of recipes) {
    const body = parseRecipeBody(recipe.body)
    const rows = resolveIngredientTips(body.ingredients, recipe.ingredientTips, ingredientTips, recipe.file)
    if (recipe.slug === 'jakobsmuscheln-mit-spargelrisotto') {
      assert.deepEqual(
        rows
          .flat()
          .filter((tips) => tips.length)
          .map((tips) => tips.map((tip) => tip.id)),
        [['reis-waschen'], ['zitrusschale-abreiben']]
      )
    }
  }
})

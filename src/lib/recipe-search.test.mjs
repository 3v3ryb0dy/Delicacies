import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { parseFrontmatter } from '../../scripts/lib/recipes.mjs'
import { parseRecipeBody } from './recipe-body.ts'
import { matchRecipeSearch, recipeSearchFields, recipeSearchGroup, searchAllRecipeTerms } from './recipe-search.ts'

test('search fields keep ingredients, recipe prose and pairing labels separate', () => {
  const body = parseRecipeBody(`## Tipp
> Kurz marinieren.
## Zutaten
### Fisch
- 200 g Lachs
## Zubereitung
> In Butter braten.
## Zubereitung (Thermomix)
> Schonend dämpfen.

Passende Begleitung: [Pilzsuppe](pfifferlingscremesuppe.md).
## Notizen
Gut abtropfen lassen.`)
  const fields = recipeSearchFields(
    { title: 'Fischgericht', category: 'hauptgerichte', tags: ['asiatisch'], note: 'Familienrezept' },
    body,
    'Hauptgerichte'
  )
  assert.equal(fields.ingredients, 'Fisch · 200 g Lachs')
  assert.equal(fields.pairings, 'Passende Begleitung: Pilzsuppe.')
  for (const query of ['marinieren', 'Butter', 'dämpfen', 'abtropfen', 'asiatisch', 'Familienrezept']) {
    assert.equal(matchRecipeSearch(fields, query)?.field, 'recipeText', query)
  }
  assert.equal(matchRecipeSearch(fields, 'Lachs')?.field, 'ingredients')
  assert.equal(matchRecipeSearch(fields, 'Pilzsuppe')?.field, 'pairings')
  assert.equal(matchRecipeSearch(fields, 'pfifferlingscremesuppe'), undefined)
  assert.equal(matchRecipeSearch(fields, 'Pilzsuppe unbekannt'), undefined)
  assert.equal(matchRecipeSearch(fields, '  '), undefined)
  assert.equal(matchRecipeSearch(fields, 'BUTTER lachs')?.field, 'ingredients')
  assert.equal(matchRecipeSearch(fields, 'Pilzsuppe Fischgericht')?.field, 'title')
  const pending = recipeSearchFields(
    { title: 'Fischgericht', category: 'hauptgerichte', tags: [], preparationPending: true },
    body
  )
  assert.equal(matchRecipeSearch(pending, 'dämpfen'), undefined)
})

test('real Pfifferling recipes choose their highest matching field for single and multiple terms', async () => {
  const entries = await Promise.all(
    ['pfifferlingscremesuppe', 'rinderfilet-mit-pfifferlingsrisotto', 'kurz-gebeizter-lachs'].map(async (slug) => {
      const { data, body } = parseFrontmatter(
        await readFile(new URL(`../../recipes/${slug}.md`, import.meta.url), 'utf8')
      )
      return recipeSearchFields(data, parseRecipeBody(body))
    })
  )
  assert.deepEqual(
    entries.map((fields) => matchRecipeSearch(fields, 'Pfifferling')?.field),
    ['title', 'title', 'pairings']
  )
  assert.equal(matchRecipeSearch(entries[2], 'Lachs Pfifferling')?.field, 'title')
})

test('Pagefind field priority is independent of metadata order, with a recipe-text fallback', () => {
  assert.equal(recipeSearchGroup(['pairings', 'recipeText', 'ingredients', 'title']).field, 'title')
  assert.equal(recipeSearchGroup(['pairings', 'recipeText', 'ingredients']).field, 'ingredients')
  assert.equal(recipeSearchGroup(['pairings', 'recipeText']).field, 'recipeText')
  assert.equal(recipeSearchGroup(['pairings']).field, 'pairings')
  assert.equal(recipeSearchGroup(['image_alt']).field, 'recipeText')
  assert.equal(recipeSearchGroup().field, 'recipeText')
})

test('multiword search intersects stable IDs, forwards filters and keeps full-query relevance', async () => {
  const high = { id: 'high', matchedMetaFields: ['title'] }
  const low = { id: 'low', matchedMetaFields: ['ingredients'] }
  const partial = { id: 'partial', matchedMetaFields: ['pairings'] }
  const calls = []
  const filters = { filters: { wip: ['false'], tag: ['vegetarisch'] } }
  const index = {
    search: async (query, options) => {
      calls.push([query, options])
      return { results: query === 'lachs' ? [low, high] : [high, partial, low] }
    }
  }
  assert.deepEqual(await searchAllRecipeTerms(index, 'Lachs Pfifferling', filters), [high, low])
  assert.deepEqual(
    calls.map(([query]) => query),
    ['Lachs Pfifferling', 'lachs', 'pfifferling']
  )
  assert.ok(calls.every(([, options]) => options === filters))
})

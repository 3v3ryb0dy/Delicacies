import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parsePairingLinks, parseRecipeBody } from './recipe-body.ts'

const recipeIds = new Set(['rotkohl', 'rosenkohl'])

test('pairings preserve prose and punctuation around multiple explicit recipe links', () => {
  const line = 'Passendes Gemüse: [Rotkohl](rotkohl.md), [Rosenkohl](rosenkohl.md).'
  const body = parseRecipeBody(`## Zubereitung\n\n> Schmoren.\n\n${line}`)
  assert.deepEqual(body.pairings, [line])
  assert.deepEqual(body.preparation, [{ paragraphs: ['Schmoren.'] }])
  assert.deepEqual(parsePairingLinks(body.pairings[0], recipeIds, 'ochsenbaeckchen'), [
    { text: 'Passendes Gemüse: ' },
    { text: 'Rotkohl', recipeId: 'rotkohl' },
    { text: ', ' },
    { text: 'Rosenkohl', recipeId: 'rosenkohl' },
    { text: '.' }
  ])
})

test('plain pairing suggestions stay literal, including names of existing recipes', () => {
  const text = 'Passende Beilagen: Rotkohl, Kartoffelstampf, Herzoginkartoffeln, Kartoffelklöße'
  assert.deepEqual(parsePairingLinks(text, recipeIds, 'ochsenbaeckchen'), [{ text }])
})

test('recipe references support an explicit relative prefix and custom labels', () => {
  assert.deepEqual(parsePairingLinks('[Gebackener Rosenkohl](./rosenkohl.md)', recipeIds, 'ochsenbaeckchen'), [
    { text: 'Gebackener Rosenkohl', recipeId: 'rosenkohl' }
  ])
})

test('a missing recipe identifies both source and target', () => {
  assert.throws(
    () => parsePairingLinks('[Kartoffelstampf](kartoffelstampf.md)', recipeIds, 'ochsenbaeckchen'),
    /Recipe "ochsenbaeckchen\.md" links to missing recipe "kartoffelstampf\.md"/
  )
})

test('unsupported markup stays literal and link labels remain text for Astro to escape', () => {
  const text = '<b>Gemüse</b> [Extern](https://example.com/rotkohl.md) [Unfertig](rotkohl.md'
  assert.deepEqual(parsePairingLinks(text, recipeIds, 'ochsenbaeckchen'), [{ text }])
  assert.deepEqual(parsePairingLinks('[<b>Rotkohl</b>](rotkohl.md)', recipeIds, 'ochsenbaeckchen'), [
    { text: '<b>Rotkohl</b>', recipeId: 'rotkohl' }
  ])
})

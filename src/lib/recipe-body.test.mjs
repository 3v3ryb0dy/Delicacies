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

test('preparation hard breaks stay inside one paragraph while soft wraps join with spaces', () => {
  for (const marker of ['\\', '  ']) {
    const body = parseRecipeBody(
      ['## Zubereitung', `> Eier schlagen.${marker}`, '>Mehl sieben', '> und einarbeiten.', '>', '> Backen.'].join(
        '\r\n'
      )
    )
    assert.deepEqual(body.preparation, [{ paragraphs: ['Eier schlagen.\nMehl sieben und einarbeiten.', 'Backen.'] }])
  }
})

test('hard breaks do not cross paragraph or group boundaries and final backslashes stay literal', () => {
  const body = parseRecipeBody(
    ['## Zubereitung', '> Rühren.\\', '>', '> Backen.\\', '### Glasur', '> Bestreichen.\\'].join('\n')
  )
  assert.deepEqual(body.preparation, [
    { paragraphs: ['Rühren.\\', 'Backen.\\'] },
    { title: 'Glasur', paragraphs: ['Bestreichen.\\'] }
  ])
})

test('an escaped trailing backslash does not force a line break', () => {
  const body = parseRecipeBody('## Zubereitung\n> Text\\\\\n> Fortsetzung.')
  assert.deepEqual(body.preparation, [{ paragraphs: ['Text\\\\ Fortsetzung.'] }])
})

test('missing and empty tips default to an empty array without affecting recipe sections', () => {
  for (const prefix of ['', '## Tipp\n\n', '## Tipp\n>\n>   \n']) {
    const body = parseRecipeBody(`${prefix}## Zutaten\n- 200 g Mehl\n## Zubereitung\n> Verrühren.`)
    assert.deepEqual(body, {
      tips: [],
      ingredients: [{ items: ['200 g Mehl'] }],
      preparation: [{ paragraphs: ['Verrühren.'] }],
      thermomixPreparation: [],
      pairings: [],
      notes: []
    })
  }
})

test('a tip stays separate from subsequent grouped ingredients and preparation', () => {
  const body = parseRecipeBody(
    '## Tipp\n\n> Kalt halten.\n\n## Zutaten\n### Teig\n- 200 g Mehl\n\n## Zubereitung\n### Teig\n> Verrühren.'
  )
  assert.deepEqual(body, {
    tips: ['Kalt halten.'],
    ingredients: [{ title: 'Teig', items: ['200 g Mehl'] }],
    preparation: [{ title: 'Teig', paragraphs: ['Verrühren.'] }],
    thermomixPreparation: [],
    pairings: [],
    notes: []
  })
})

test('tips preserve paragraphs and line breaks without becoming pairings or notes', () => {
  const body = parseRecipeBody(
    ['## Tipp', '> Kalt', '> halten.\\', '> Kurz rühren.', '>', '> Passende Beilagen: Gemüse.'].join('\r\n')
  )
  assert.deepEqual(body.tips, ['Kalt halten.\nKurz rühren.', 'Passende Beilagen: Gemüse.'])
  assert.deepEqual(body.pairings, [])
  assert.deepEqual(body.notes, [])
  assert.deepEqual(body.preparation, [])
})

test('alternative methods keep their groups and hard breaks separate with shared tips and pairings', () => {
  const body = parseRecipeBody(
    [
      '## Tipp',
      '> Kalt halten.',
      '## Zutaten',
      '### Creme',
      '- 150 g Sahne',
      '## Zubereitung',
      '### Creme',
      '> Sahne schlagen.\\',
      '> Von Hand unterheben.',
      '## Zubereitung (Thermomix)',
      '### Creme',
      '> Stufe 3.',
      '>',
      '> Umfüllen.',
      '### Schichten',
      '> Kühlen.',
      '',
      'Passende Beilagen: Obst',
      '## Notizen',
      '> Noch ungetestet.'
    ].join('\n')
  )
  assert.deepEqual(body.preparation, [{ title: 'Creme', paragraphs: ['Sahne schlagen.\nVon Hand unterheben.'] }])
  assert.deepEqual(body.thermomixPreparation, [
    { title: 'Creme', paragraphs: ['Stufe 3.', 'Umfüllen.'] },
    { title: 'Schichten', paragraphs: ['Kühlen.'] }
  ])
  assert.deepEqual(body.ingredients, [{ title: 'Creme', items: ['150 g Sahne'] }])
  assert.deepEqual(body.tips, ['Kalt halten.'])
  assert.deepEqual(body.pairings, ['Passende Beilagen: Obst'])
  assert.deepEqual(body.notes, ['Notizen', 'Noch ungetestet.'])
})

test('absent and empty alternatives stay empty and ungrouped alternatives do not leak', () => {
  for (const suffix of ['', '\n## Zubereitung (Thermomix)', '\n## Zubereitung (Thermomix)\n### Leer\n>']) {
    const body = parseRecipeBody('## Zubereitung\n> Rühren.' + suffix)
    assert.deepEqual(body.thermomixPreparation, [])
    assert.deepEqual(body.preparation, [{ paragraphs: ['Rühren.'] }])
  }
  const body = parseRecipeBody('## Zubereitung (Thermomix)\n> Mixen.\n## Zubereitung\n> Rühren.')
  assert.deepEqual(body.thermomixPreparation, [{ paragraphs: ['Mixen.'] }])
  assert.deepEqual(body.preparation, [{ paragraphs: ['Rühren.'] }])
})

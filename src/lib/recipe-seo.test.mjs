import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseRecipeBody } from './recipe-body.ts'
import { buildRecipeStructuredData, serializeRecipeStructuredData } from './recipe-seo.ts'

const input = {
  title: 'Kräutersuppe',
  description: 'Suppe mit frischen Kräutern',
  canonical: new URL('https://cook.drng.me/rezept/kraeutersuppe/'),
  image: '/_astro/suppe.jpg',
  category: 'Suppen',
  body: parseRecipeBody('## Zutaten\n- 1 Zwiebel\n- Kräuter\n## Zubereitung\n> Schneiden.\n>\n> Kochen.')
}

test('recipe markup preserves ingredients and paragraphs without inventing metadata', () => {
  assert.deepEqual(buildRecipeStructuredData(input), {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: 'Kräutersuppe',
    description: 'Suppe mit frischen Kräutern',
    url: 'https://cook.drng.me/rezept/kraeutersuppe/',
    image: 'https://cook.drng.me/_astro/suppe.jpg',
    recipeCategory: 'Suppen',
    recipeIngredient: ['1 Zwiebel', 'Kräuter'],
    recipeInstructions: [
      { '@type': 'HowToStep', text: 'Schneiden.' },
      { '@type': 'HowToStep', text: 'Kochen.' }
    ]
  })
})

test('named components retain their order, headings and paragraph hard breaks', () => {
  const body = parseRecipeBody(
    '## Zutaten\n### Teig\n- Mehl\n### Belag\n- Käse\n## Zubereitung\n### Teig\n> Kneten.\\\n> Ruhen lassen.\n### Belag\n> Belegen.'
  )
  const result = buildRecipeStructuredData({ ...input, body })
  assert.deepEqual(result.recipeIngredient, ['Mehl', 'Käse'])
  assert.deepEqual(result.recipeInstructions, [
    {
      '@type': 'HowToSection',
      name: 'Teig',
      itemListElement: [{ '@type': 'HowToStep', text: 'Kneten.\nRuhen lassen.' }]
    },
    { '@type': 'HowToSection', name: 'Belag', itemListElement: [{ '@type': 'HowToStep', text: 'Belegen.' }] }
  ])
})

test('Normal and Thermomix alternatives never become consecutive instructions', () => {
  const both = parseRecipeBody('## Zubereitung\n> Im Topf kochen.\n## Zubereitung (Thermomix)\n> Im Mixtopf kochen.')
  assert.deepEqual(buildRecipeStructuredData({ ...input, body: both }).recipeInstructions, [
    { '@type': 'HowToStep', text: 'Im Topf kochen.' }
  ])
  const thermomix = { ...both, preparation: [] }
  assert.deepEqual(buildRecipeStructuredData({ ...input, body: thermomix }).recipeInstructions, [
    { '@type': 'HowToStep', text: 'Im Mixtopf kochen.' }
  ])
})

test('existing servings remain verbatim and absolute image URLs remain absolute', () => {
  const result = buildRecipeStructuredData({
    ...input,
    servings: '8 kleine oder 4 große Portionen',
    image: 'https://cook.drng.me/_astro/photo.jpg'
  })
  assert.equal(result.recipeYield, '8 kleine oder 4 große Portionen')
  assert.equal(result.image, 'https://cook.drng.me/_astro/photo.jpg')
  assert.equal(Object.hasOwn(buildRecipeStructuredData(input), 'recipeYield'), false)
})

test('unfinished and photo-free recipes omit markup; complete untested recipes keep it', () => {
  assert.equal(buildRecipeStructuredData({ ...input, preparationPending: true }), undefined)
  assert.equal(buildRecipeStructuredData({ ...input, image: undefined }), undefined)
  assert.deepEqual(buildRecipeStructuredData({ ...input, wip: true }), buildRecipeStructuredData(input))
})

test('serialized JSON round-trips quotes and German text without allowing script termination', () => {
  const dangerous = 'Käse "würzig" </script><script>alert(1)</script> & Öl'
  const data = buildRecipeStructuredData({ ...input, title: dangerous, description: dangerous })
  const serialized = serializeRecipeStructuredData(data)
  assert.equal(serialized.includes('<'), false)
  assert.ok(serialized.includes('\\u003c/script>'))
  assert.deepEqual(JSON.parse(serialized), data)
})

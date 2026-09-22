import assert from 'node:assert/strict'
import { test } from 'node:test'
import { checkRecipeSeo, readSeoMetadata } from './recipe-seo.mjs'
import { createRecipeSitemapFilter } from './recipe-indexing.mjs'
import { parseFrontmatter } from './recipes.mjs'
import { parseRecipeBody } from '../../src/lib/recipe-body.ts'
import { buildRecipeStructuredData, serializeRecipeStructuredData } from '../../src/lib/recipe-seo.ts'

const canonical = 'https://cook.drng.me/rezept/suppe/'
const image = 'https://cook.drng.me/_astro/suppe.jpg'
const assets = new Set(['/_astro/suppe.jpg'])
const recipe = {
  slug: 'suppe',
  title: 'Suppe',
  category: 'suppen',
  image: 'images/suppe.webp',
  imageAlt: 'Feine Suppe',
  body: '## Zutaten\n- 1 Zwiebel\n## Zubereitung\n> Kochen.'
}
const data = {
  '@context': 'https://schema.org',
  '@type': 'Recipe',
  name: 'Suppe',
  url: canonical,
  image,
  description: 'Feine Suppe',
  recipeCategory: 'Suppen',
  recipeIngredient: ['1 Zwiebel'],
  recipeInstructions: [{ '@type': 'HowToStep', text: 'Kochen.' }]
}
const page = (json = JSON.stringify(data), pending = false) =>
  `<html><head><meta name="description" content="Feine Suppe"><meta property="og:image" content="${image}">` +
  (pending ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${canonical}">`) +
  `</head><body>${json === undefined || json === '' ? '' : `<script type="application/ld+json">${json}</script>`}</body></html>`
const check = (options = {}) => checkRecipeSeo({ html: page(), recipe, canonical, assets, inSitemap: true, ...options })

test('built recipe SEO validates against independently specified content and assets', () => {
  assert.deepEqual(check(), [])
  assert.deepEqual(check({ recipe: { ...recipe, wip: true } }), [])
  assert.deepEqual(check({ recipe: { ...recipe, image: undefined }, html: page('') }), [])
  assert.deepEqual(
    check({ recipe: { ...recipe, preparationPending: true }, html: page('', true), inSitemap: false }),
    []
  )
})

test('built checks reject missing, malformed, duplicate and mismatched structured data', () => {
  assert.match(check({ html: page('') }).join(), /expected 1 JSON-LD/)
  assert.match(check({ html: page('{') }).join(), /invalid JSON-LD/)
  assert.match(check({ html: page('null') }).join(), /Recipe object/)
  assert.match(check({ html: page() + '<script type="application/ld+json">{}</script>' }).join(), /expected 1 JSON-LD/)
  for (const mutation of [
    { name: 'Andere Suppe' },
    { recipeIngredient: [] },
    { recipeInstructions: [] },
    { image: '/_astro/suppe.jpg' },
    { image: 'https://foreign.test/_astro/suppe.jpg' },
    { recipeCategory: 'suppen' },
    { recipeYield: '4' },
    { description: 'Andere Beschreibung' }
  ])
    assert.ok(check({ html: page(JSON.stringify({ ...data, ...mutation })) }).length > 0, JSON.stringify(mutation))
  assert.match(check({ assets: new Set() }).join(), /existing recipe social image/)
})

test('built checks reject disagreement between status, robots, sitemap and canonical', () => {
  assert.match(check({ html: page('', true) }).join(), /noindex/)
  assert.match(check({ inSitemap: false }).join(), /sitemap/)
  assert.match(
    check({ html: page().replace(`href="${canonical}"`, 'href="https://foreign.test/"') }).join(),
    /canonical/
  )
  assert.match(check({ recipe: { ...recipe, preparationPending: true } }).join(), /expected 0 JSON-LD/)
})

test('metadata extraction decodes HTML attributes but leaves JSON script text intact', () => {
  const html = `<head><meta content='Käse &amp; &quot;Öl&quot;' name='description'><meta name='robots' content='follow, noindex'><script>const x = '<meta name="description" content="wrong">';</script></head><script type='application/ld+json'>{"name":"&amp;"}</script>`
  assert.deepEqual(readSeoMetadata(html), {
    noindex: true,
    canonicals: [],
    description: 'Käse & "Öl"',
    image: undefined,
    jsonLd: ['{"name":"&amp;"}']
  })
})

test('finishing a recipe restores sitemap and markup eligibility at the same URL', () => {
  for (const status of ['preparationPending: true', 'preparationPending: false', '']) {
    const { data: frontmatter, body } = parseFrontmatter(`---\ntitle: Suppe\n${status}\nwip: true\n---\n${recipe.body}`)
    const current = { ...recipe, ...frontmatter, body }
    const pending = current.preparationPending === true
    const filter = createRecipeSitemapFilter([current], 'https://cook.drng.me')
    assert.equal(filter(canonical), !pending)
    assert.equal(filter('https://cook.drng.me/404.html'), false)
    assert.equal(filter('https://cook.drng.me/'), true)
    assert.equal(filter('https://cook.drng.me/rezept/andere-suppe/'), true)
    const structured = buildRecipeStructuredData({
      title: current.title,
      description: current.imageAlt,
      canonical: new URL(canonical),
      image,
      category: 'Suppen',
      preparationPending: current.preparationPending,
      body: parseRecipeBody(body)
    })
    assert.equal(Boolean(structured), !pending)
    const html = page(structured ? serializeRecipeStructuredData(structured) : '', pending)
    assert.deepEqual(check({ html, recipe: current, inSitemap: filter(canonical) }), [])
  }
})

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createIndex, close } from 'pagefind'
import { recipeSearchGroup, searchAllRecipeTerms } from './recipe-search.ts'

test('a real German Pagefind index reports fields for compounds, inflections and cross-field queries', async (t) => {
  const { index, errors } = await createIndex({ forceLanguage: 'de' })
  t.after(() => close())
  assert.deepEqual(errors, [])
  const examples = [
    {
      title: 'Pfifferlingscremesuppe',
      ingredients: 'Pfifferlinge Sahne',
      recipeText: 'Fein pürieren',
      pairings: 'Lachs'
    },
    { title: 'Pilzpfanne', ingredients: 'Pfifferlinge', recipeText: 'Braten' },
    { title: 'Herbstgericht', recipeText: 'Optional mit Pfifferlingen servieren' },
    { title: 'Lachs', ingredients: 'Fisch Salz', recipeText: 'Kurz braten', pairings: 'Pfifferlingscremesuppe' }
  ]
  const escape = (text) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;')
  for (const [i, fields] of examples.entries()) {
    const result = await index.addHTMLFile({
      url: `/rezept/${i}/`,
      content: `<html lang="de"><body><article data-pagefind-body><h1>${fields.title}</h1>${Object.entries(fields)
        .filter(([field]) => field !== 'title')
        .map(([field, text]) => `<p data-pagefind-meta="${field}">${escape(text)}</p>`)
        .join('')}</article></body></html>`
    })
    assert.deepEqual(result.errors, [])
  }
  // Exercise the shipped browser search module against in-memory generated assets.
  const generated = await index.getFiles()
  assert.deepEqual(generated.errors, [])
  const files = new Map(generated.files.map((file) => [file.path, file.content]))
  t.mock.method(globalThis, 'fetch', async (input) => {
    const url = new URL(typeof input === 'string' ? input : (input.url ?? input))
    const key = url.pathname.replace(/^\/pagefind\//, '')
    assert.ok(files.has(key), `Missing Pagefind asset: ${key}`)
    return new Response(files.get(key), {
      headers: { 'Content-Type': key.endsWith('.wasm') ? 'application/wasm' : 'application/octet-stream' }
    })
  })
  const pagefind = await import(
    'data:text/javascript;base64,' + Buffer.from(files.get('pagefind.js')).toString('base64')
  )
  t.after(() => pagefind.destroy())
  await pagefind.options({ basePath: 'https://search.test/pagefind/', baseUrl: '/', forceLanguage: 'de' })
  const search = async (query) => {
    const results = await searchAllRecipeTerms(pagefind, query)
    return new Map(
      await Promise.all(
        results.map(async (result) => [
          (await result.data()).meta.title,
          recipeSearchGroup(result.matchedMetaFields).field
        ])
      )
    )
  }
  assert.deepEqual(
    await search('Pfifferling'),
    new Map([
      ['Pfifferlingscremesuppe', 'title'],
      ['Pilzpfanne', 'ingredients'],
      ['Herbstgericht', 'recipeText'],
      ['Lachs', 'pairings']
    ])
  )
  assert.equal((await search('Pfifferlingen')).get('Pilzpfanne'), 'ingredients')
  assert.equal((await search('Lachs Pfifferling')).get('Lachs'), 'title')
  assert.equal((await search('Lachs Pfifferling')).has('Pilzpfanne'), false)
  assert.equal((await search('Pfifferling unbekannt')).size, 0)
})

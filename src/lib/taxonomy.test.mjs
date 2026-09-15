import assert from 'node:assert/strict'
import { test } from 'node:test'
import { categories, categoryById, subcategoryById } from '../config/taxonomy.ts'

test('subcategories resolve to the title the site renders', () => {
  assert.equal(subcategoryById('beilagen', 'gemuese')?.title, 'Gemüse')
  assert.equal(subcategoryById('beilagen', 'saettigungsbeilagen')?.title, 'Sättigungsbeilagen')
})

test('unknown or foreign subcategories stay unresolved', () => {
  assert.equal(subcategoryById('beilagen', 'gemüse'), undefined)
  assert.equal(subcategoryById('kuchen', 'gemuese'), undefined)
  assert.equal(subcategoryById('kuchen', 'teig'), undefined)
})

test('every declared subcategory belongs to exactly one category', () => {
  const declared = categories.flatMap((category) =>
    (category.subcategories ?? []).map((subcategory) => `${category.id}/${subcategory.id}`)
  )
  assert.equal(new Set(declared).size, declared.length)
  assert.ok(declared.every((entry) => categoryById.has(entry.split('/')[0])))
})

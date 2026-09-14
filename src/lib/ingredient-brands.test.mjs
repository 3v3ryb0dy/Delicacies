import assert from 'node:assert/strict'
import { test } from 'node:test'
import { brandRecommendations } from '../config/brands.ts'
import { parseIngredientBrands } from './ingredient-brands.ts'

test('ingredient matching is case insensitive and preserves quantities, spelling and punctuation', () => {
  assert.deepEqual(parseIngredientBrands('50 g FISCHsauce (nach Geschmack).', brandRecommendations), [
    { text: '50 g ' },
    { text: 'FISCHsauce', brandId: 'fischsauce' },
    { text: ' (nach Geschmack).' }
  ])
})

test('multiple and repeated ingredients link independently without changing the text', () => {
  const text = 'Fischsauce, Tamarindenpaste / Austernsauce; fischsauce'
  const segments = parseIngredientBrands(text, brandRecommendations)
  assert.equal(segments.map((segment) => segment.text).join(''), text)
  assert.deepEqual(
    segments.filter((segment) => segment.brandId).map((segment) => segment.brandId),
    ['fischsauce', 'tamarindenpaste', 'austernsauce', 'fischsauce']
  )
})

test('Tahini links to its registered brand while surrounding text stays literal', () => {
  const text = '3 EL Tahini und etwas Sojasauce'
  assert.deepEqual(parseIngredientBrands(text, brandRecommendations), [
    { text: '3 EL ' },
    { text: 'Tahini', brandId: 'tahini' },
    { text: ' und etwas Sojasauce' }
  ])
})

test('unregistered ingredients remain plain text', () => {
  const text = '3 EL Tahini und etwas Sojasauce'
  const recommendations = [{ id: 'fischsauce', ingredient: 'Fischsauce', brand: 'Red Boat' }]
  assert.deepEqual(parseIngredientBrands(text, recommendations), [{ text }])
  assert.deepEqual(parseIngredientBrands('Fischsauce', []), [{ text: 'Fischsauce' }])
})

test('ingredient names do not match inside longer words, including Unicode letters', () => {
  const text = 'Fischsaucen Ersatzfischsauce Fischsauceersatz ÖFischsauce Fischsauceä _Fischsauce Fischsauce2'
  assert.deepEqual(parseIngredientBrands(text, brandRecommendations), [{ text }])
})

test('matching treats configured names literally and supports multiword ingredients', () => {
  const recommendations = [{ id: 'test', ingredient: 'Sauce (hell)', brand: 'Testmarke' }]
  assert.deepEqual(parseIngredientBrands('1 EL Sauce (hell), optional', recommendations), [
    { text: '1 EL ' },
    { text: 'Sauce (hell)', brandId: 'test' },
    { text: ', optional' }
  ])
})

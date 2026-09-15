import assert from 'node:assert/strict'
import { test } from 'node:test'
import { resolveContentImageReference, resolveRecipeImage } from './recipe-image.ts'

test('explicit filenames win when multiple formats exist', () => {
  const images = { 'images/dish.webp': 'WEBP', 'images/dish.png': 'PNG', 'images/dish.jpg': 'JPG' }
  assert.equal(resolveRecipeImage('images/dish.jpg', images), 'JPG')
  assert.equal(resolveRecipeImage('./images/dish.png', images), 'PNG')
  assert.equal(resolveRecipeImage('images/dish.webp', images), 'WEBP')
})

test('replacing another format with WebP needs no frontmatter edit', () => {
  assert.equal(resolveRecipeImage('images/dish.jpg', { 'images/dish.webp': 'WEBP' }), 'WEBP')
  assert.equal(resolveRecipeImage('images/dish.png', { 'images/dish.webp': 'WEBP' }), 'WEBP')
})

test('legacy PNG, JPG, and JPEG fallbacks remain supported', () => {
  assert.equal(resolveRecipeImage('images/dish.jpg', { 'images/dish.png': 'PNG' }), 'PNG')
  assert.equal(resolveRecipeImage('images/dish.png', { 'images/dish.jpg': 'JPG' }), 'JPG')
  assert.equal(resolveRecipeImage('images/dish.png', { 'images/dish.jpeg': 'JPEG' }), 'JPEG')
})

test('extensionless references prefer WebP, then legacy formats', () => {
  assert.equal(resolveRecipeImage('images/dish', { 'images/dish.webp': 0, 'images/dish.png': 1 }), 0)
  assert.equal(resolveRecipeImage('images/dish', { 'images/dish.png': 1, 'images/dish.jpg': 2 }), 1)
  assert.equal(resolveRecipeImage('images/dish', { 'images/dish.jpg': 2, 'images/dish.jpeg': 3 }), 2)
  assert.equal(resolveRecipeImage('images/dish', { 'images/dish.jpeg': 3 }), 3)
})

test('missing photos never resolve to another recipe', () => {
  assert.equal(resolveRecipeImage('images/missing.jpg', { 'images/dish.jpg': 'JPG' }), undefined)
})

test('stale extensionless content paths resolve to imported metadata after the photo is added', () => {
  const reference = './images/honig-joghurt-cheesecake'
  assert.equal(resolveRecipeImage(reference, {}), undefined)
  const metadata = { src: '/_astro/cheesecake.webp', width: 1448, height: 1086, format: 'webp' }
  assert.equal(resolveRecipeImage(reference, { 'images/honig-joghurt-cheesecake.webp': metadata }), metadata)
})

test('content image references are explicitly relative for Astro', () => {
  assert.equal(resolveContentImageReference('images/dish.webp', {}), './images/dish.webp')
  assert.equal(
    resolveContentImageReference('images/dish.jpg', { 'images/dish.webp': 'images/dish.webp' }),
    './images/dish.webp'
  )
  assert.equal(resolveContentImageReference('./images/dish.webp', {}), './images/dish.webp')
})

test('content image references preserve URLs and absolute paths', () => {
  assert.equal(resolveContentImageReference('https://example.com/dish.webp', {}), 'https://example.com/dish.webp')
  assert.equal(resolveContentImageReference('/images/dish.webp', {}), '/images/dish.webp')
})

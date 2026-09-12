import assert from 'node:assert/strict'
import { test } from 'node:test'
import { resolveRecipeImage } from './recipe-image.ts'

test('explicit filenames win when multiple formats exist', () => {
  const images = { 'images/dish.png': 'PNG', 'images/dish.jpg': 'JPG' }
  assert.equal(resolveRecipeImage('images/dish.jpg', images), 'JPG')
  assert.equal(resolveRecipeImage('./images/dish.png', images), 'PNG')
})

test('replacing JPG with PNG or PNG with JPEG needs no frontmatter edit', () => {
  assert.equal(resolveRecipeImage('images/dish.jpg', { 'images/dish.png': 'PNG' }), 'PNG')
  assert.equal(resolveRecipeImage('images/dish.png', { 'images/dish.jpg': 'JPG' }), 'JPG')
  assert.equal(resolveRecipeImage('images/dish.png', { 'images/dish.jpeg': 'JPEG' }), 'JPEG')
})

test('extensionless references use PNG, then JPG, then JPEG', () => {
  assert.equal(resolveRecipeImage('images/dish', { 'images/dish.png': 1, 'images/dish.jpg': 2 }), 1)
  assert.equal(resolveRecipeImage('images/dish', { 'images/dish.jpg': 2, 'images/dish.jpeg': 3 }), 2)
  assert.equal(resolveRecipeImage('images/dish', { 'images/dish.jpeg': 3 }), 3)
})

test('missing photos never resolve to another recipe', () => {
  assert.equal(resolveRecipeImage('images/missing.jpg', { 'images/dish.jpg': 'JPG' }), undefined)
})

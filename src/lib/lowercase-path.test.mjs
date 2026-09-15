import assert from 'node:assert/strict'
import { test } from 'node:test'
import { lowercasePathAfterBase } from './lowercase-path.ts'

test('mixed case paths are corrected below the deployment base', () => {
  assert.equal(lowercasePathAfterBase('/Rezept/Pizza/', '/'), '/rezept/pizza/')
  assert.equal(lowercasePathAfterBase('/delicacies/Rezept/Pizza/', '/delicacies/'), '/delicacies/rezept/pizza/')
})

test('already correct and untouched paths stay as they are', () => {
  assert.equal(lowercasePathAfterBase('/rezept/pizza/', '/'), undefined)
  assert.equal(lowercasePathAfterBase('/', '/'), undefined)
  assert.equal(lowercasePathAfterBase('/other/Path/', '/delicacies/'), undefined)
})

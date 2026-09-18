import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ingredientTipPosition, initIngredientTipDialog } from './ingredient-tip-dialog.ts'

test('a desktop guide opens below its ingredient when there is room', () => {
  assert.deepEqual(
    ingredientTipPosition(
      { left: 120, right: 152, top: 200, bottom: 232 },
      { width: 400, height: 300 },
      { width: 1280, height: 900 }
    ),
    { left: 120, top: 240 }
  )
})

test('near the lower right corner, the guide flips above and stays on screen', () => {
  assert.deepEqual(
    ingredientTipPosition(
      { left: 1200, right: 1232, top: 750, bottom: 782 },
      { width: 400, height: 300 },
      { width: 1280, height: 900 }
    ),
    { left: 868, top: 442 }
  )
})

test('tall guides clamp to the viewport and account for zoom offsets', () => {
  assert.deepEqual(
    ingredientTipPosition(
      { left: -40, right: -8, top: 300, bottom: 332 },
      { width: 400, height: 576 },
      { width: 600, height: 600 }
    ),
    { left: 12, top: 12 }
  )
  assert.deepEqual(
    ingredientTipPosition(
      { left: 0, right: 32, top: 90, bottom: 122 },
      { width: 250, height: 400 },
      { width: 500, height: 450, left: 100, top: 50 }
    ),
    { left: 112, top: 62 }
  )
})

test('pages without the feature and browsers without native dialogs retain the fallback', () => {
  assert.doesNotThrow(() => initIngredientTipDialog({ querySelector: () => null }))
  assert.doesNotThrow(() => initIngredientTipDialog({ querySelector: () => ({ querySelector: () => null }) }))
})

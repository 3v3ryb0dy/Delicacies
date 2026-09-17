import assert from 'node:assert/strict'
import { test } from 'node:test'

test('related recipes fill three eligible slots and resync a cached page with the preference', async () => {
  let preference = false
  let blocked = false
  const items = [true, false, true, false, false].map((wip) => ({
    hidden: false,
    hasAttribute: () => wip
  }))
  const section = { hidden: false }
  const attributes = new Set()
  const listeners = {}
  globalThis.document = {
    documentElement: {
      setAttribute: (name) => attributes.add(name),
      removeAttribute: (name) => attributes.delete(name)
    },
    querySelectorAll: () => items,
    querySelector: () => section
  }
  globalThis.localStorage = {
    getItem() {
      if (blocked) throw Error('denied')
      return String(preference)
    }
  }
  globalThis.window = {
    addEventListener: (event, listener) => {
      listeners[event] = listener
    }
  }
  await import('../scripts/recipe-back.ts')
  assert.deepEqual(
    items.map((item) => item.hidden),
    [true, false, true, false, false]
  )
  assert.equal(attributes.has('data-untested-hidden'), true)
  preference = true
  listeners.pageshow()
  assert.deepEqual(
    items.map((item) => item.hidden),
    [false, false, false, true, true]
  )
  assert.equal(attributes.has('data-untested-hidden'), false)
  blocked = true
  listeners.storage()
  assert.deepEqual(
    items.map((item) => item.hidden),
    [true, false, true, false, false]
  )
  assert.equal(section.hidden, false)
})

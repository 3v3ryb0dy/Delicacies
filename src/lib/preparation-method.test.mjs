import assert from 'node:assert/strict'
import { test } from 'node:test'
import { initPreparationMethods } from './preparation-method.ts'

function fixture(methods = ['normal', 'thermomix'], hasSelector = true) {
  const selector = { hidden: true }
  const panels = methods.map((method) => ({ dataset: { methodPanel: method }, hidden: false }))
  const buttons = methods.map((method) => ({
    dataset: { methodButton: method },
    attributes: { 'aria-controls': `zubereitung-${method}` },
    listeners: {},
    setAttribute(key, value) {
      this.attributes[key] = value
    },
    addEventListener(event, handler) {
      this.listeners[event] = handler
    }
  }))
  const root = {
    querySelector: () => (hasSelector ? selector : null),
    querySelectorAll: (selector) => (selector === '[data-method-button]' ? buttons : panels)
  }
  return { root, selector, panels, buttons }
}

test('both methods remain available until enhanced, then Normal is selected', () => {
  const ui = fixture()
  assert.equal(
    ui.panels.every((panel) => !panel.hidden),
    true
  )
  initPreparationMethods(ui.root)
  assert.equal(ui.selector.hidden, false)
  assert.equal(
    ui.panels.every((panel) => panel.dataset.methodEnhanced === 'true'),
    true
  )
  assert.deepEqual(
    ui.panels.map((panel) => panel.hidden),
    [false, true]
  )
  assert.deepEqual(
    ui.buttons.map((button) => button.attributes['aria-pressed']),
    ['true', 'false']
  )
})

test('native button activation switches only method panels and reset restores Normal', () => {
  const ui = fixture()
  const reset = initPreparationMethods(ui.root)
  ui.buttons[1].listeners.click()
  assert.deepEqual(
    ui.panels.map((panel) => panel.hidden),
    [true, false]
  )
  assert.deepEqual(
    ui.buttons.map((button) => button.attributes['aria-pressed']),
    ['false', 'true']
  )
  assert.equal(ui.buttons[1].attributes['aria-controls'], 'zubereitung-thermomix')
  reset()
  assert.deepEqual(
    ui.panels.map((panel) => panel.hidden),
    [false, true]
  )
  ui.buttons[0].listeners.click()
  assert.deepEqual(
    ui.panels.map((panel) => panel.hidden),
    [false, true]
  )
})

test('single methods and recipes without preparation do not gain a switch or lose content', () => {
  for (const methods of [[], ['normal'], ['thermomix']]) {
    const ui = fixture(methods, false)
    initPreparationMethods(ui.root)()
    assert.equal(ui.selector.hidden, true)
    assert.equal(
      ui.panels.every((panel) => !panel.hidden),
      true
    )
  }
})

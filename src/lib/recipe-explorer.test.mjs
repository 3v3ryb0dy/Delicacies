import assert from 'node:assert/strict'
import { test } from 'node:test'
import { initRecipeExplorer } from '../scripts/recipe-explorer.ts'

/** Lets pending microtasks (the Pagefind loader) settle before asserting. */
const flush = () => new Promise((resolve) => setImmediate(resolve))

/**
 * Runs the real controller against a small DOM fixture. The controller only
 * touches globals at init time, so each explorer() installs its own and returns
 * a handle to the behaviour under test.
 */
function explorer({ saved = null, blocked = false, pagefind = null } = {}) {
  const element = (dataset = {}) => ({
    dataset,
    hidden: false,
    checked: false,
    value: '',
    textContent: '',
    innerHTML: '',
    style: { setProperty() {} },
    listeners: {},
    children: [],
    className: '',
    attributes: {},
    setAttribute(name, value) {
      this.attributes[name] = String(value)
    },
    getAttribute(name) {
      return this.attributes[name]
    },
    addEventListener(event, listener) {
      this.listeners[event] = listener
    },
    appendChild(child) {
      this.children.push(child)
    },
    getBoundingClientRect: () => ({ top: 0, height: 0 }),
    querySelectorAll: () => [],
    querySelector: () => null
  })
  const entries = [
    ['Bouletten', 'hauptgerichte', 'fleisch', false],
    ['Burger Buns', 'brot', 'vegetarisch', false],
    ['Cloud Burger Buns', 'brot', 'vegetarisch', true],
    ['Farfallesalat', 'salate', 'vegetarisch', true]
  ]
  const cards = entries.map(([title, category, tags, wip]) => {
    const item = element()
    const card = element({ title, category, tags, wip: String(wip) })
    card.closest = () => item
    card.querySelector = () => ({ getAttribute: () => '/rezept/' + title })
    card.item = item
    return card
  })
  const sections = ['hauptgerichte', 'brot', 'salate'].map((category) => {
    const section = element()
    section.count = element()
    section.querySelector = () => section.count
    section.querySelectorAll = () => cards.filter((card) => card.dataset.category === category && !card.item.hidden)
    return section
  })
  const subgroup = element()
  subgroup.querySelector = () => cards.find((card) => card.dataset.wip === 'true' && !card.item.hidden)
  const ids = Object.fromEntries(
    [
      'rezept-liste',
      'suche-bereich',
      'suche-liste',
      'suche-leer',
      'rezept-status',
      'rezept-suche',
      'keine-treffer',
      'show-wip',
      'rezepte'
    ].map((id) => [id, element()])
  )
  ids.rezepte.dataset.pagefindUrl = '/pagefind/pagefind.js'
  ids.rezepte.dataset.basePath = '/'
  const singles = Object.fromEntries(
    ['[data-empty-block]', '[data-reset-filters]', '[data-sticky-bar]', '[data-wip-control]'].map((id) => [
      id,
      element()
    ])
  )
  singles['#rezept-suche'] = ids['rezept-suche']
  singles['#show-wip'] = ids['show-wip']
  const categoryButtons = ['', 'brot', 'salate'].map((category) => element({ filterCategory: category }))
  const tagButton = element({ filterTag: 'fleisch' })
  const tagChip = element({ chipLabel: 'fleisch' })
  tagButton.querySelector = () => tagChip
  const lists = {
    '[data-category-section]': sections,
    '[data-recipe]': cards,
    '[data-filter-category]': categoryButtons,
    '[data-filter-tag]': [tagButton],
    '[data-empty-category]': [],
    '[data-subcategory-section]': [subgroup]
  }
  const storage = new Map([['delicacies.showWip', saved]])
  const scrollCalls = []
  globalThis.document = {
    documentElement: {
      style: { setProperty() {} },
      attributes: {},
      setAttribute(name, value) {
        this.attributes[name] = String(value)
      },
      removeAttribute(name) {
        delete this.attributes[name]
      }
    },
    fonts: { ready: Promise.resolve() },
    readyState: 'complete',
    getElementById: (id) => ids[id],
    querySelector: (selector) => singles[selector],
    querySelectorAll: (selector) => lists[selector] || [],
    createElement: () => element()
  }
  globalThis.localStorage = {
    getItem(key) {
      if (blocked) throw Error('blocked')
      return storage.get(key)
    },
    setItem(key, value) {
      if (blocked) throw Error('blocked')
      storage.set(key, value)
    }
  }
  globalThis.window = {
    location: { hash: '', pathname: '/', search: '' },
    scrollY: 800,
    scrollTo: (options) => scrollCalls.push(options),
    addEventListener() {}
  }
  globalThis.getComputedStyle = () => ({ top: '0', scrollPaddingTop: '0' })
  globalThis.ResizeObserver = class {
    observe() {}
  }

  const controller = initRecipeExplorer({
    loadPagefind: async () => pagefind
  })

  return {
    controller,
    documentElement: globalThis.document.documentElement,
    ids,
    sections,
    subgroup,
    storage,
    scrollCalls,
    categoryButtons,
    tagChip,
    tagButton,
    visible: () => cards.filter((card) => !card.item.hidden).map((card) => card.dataset.title),
    search: (query, options) => controller.search(query, options),
    filters: () => controller.activeFilters(),
    toggle(value) {
      ids['show-wip'].checked = value
      singles['[data-wip-control]'].hidden = false
      return ids['show-wip'].listeners.change()
    },
    category(value) {
      categoryButtons.find((button) => button.dataset.filterCategory === value).listeners.click()
    },
    tag() {
      tagButton.listeners.click()
    },
    reset() {
      singles['[data-reset-filters]'].listeners.click()
    }
  }
}

test('filter updates preserve single-line icon and label layout', () => {
  const ui = explorer()
  for (const update of [() => ui.category('brot'), () => ui.tag(), () => ui.reset()]) {
    update()
    for (const chip of [...ui.categoryButtons, ui.tagChip]) {
      const classes = new Set(chip.className.split(/\s+/))
      for (const required of ['inline-flex', 'items-center', 'shrink-0', 'whitespace-nowrap']) {
        assert.ok(classes.has(required), `Missing ${required} after filter update`)
      }
    }
  }
})

test('filter chips expose their pressed state', () => {
  const ui = explorer()
  ui.category('brot')
  const pressed = (category) =>
    ui.categoryButtons.find((button) => button.dataset.filterCategory === category).attributes['aria-pressed']
  assert.equal(pressed('brot'), 'true')
  assert.equal(pressed(''), 'false')
  assert.equal(ui.tagButton.attributes['aria-pressed'], 'false')
  ui.tag()
  assert.equal(ui.tagButton.attributes['aria-pressed'], 'true')
  ui.reset()
  assert.equal(pressed(''), 'true')
  assert.equal(ui.tagButton.attributes['aria-pressed'], 'false')
})

test('default, invalid, and unavailable preferences hide WIP list items and empty groups', () => {
  for (const options of [{}, { saved: 'false' }, { saved: 'invalid' }, { saved: 'true', blocked: true }]) {
    const ui = explorer(options)
    assert.deepEqual(ui.visible(), ['Bouletten', 'Burger Buns'])
    assert.equal(ui.ids['rezept-status'].textContent, '2 Rezepte')
    assert.equal(ui.sections[1].count.textContent, '1 Rezept')
    assert.equal(ui.sections[2].hidden, true)
    assert.equal(ui.subgroup.hidden, true)
  }
})

test('the untested flag follows the preference and the toggle', () => {
  const hidden = explorer()
  assert.equal(hidden.documentElement.attributes['data-untested-hidden'], '')
  hidden.toggle(true)
  assert.equal(hidden.documentElement.attributes['data-untested-hidden'], undefined)
  hidden.toggle(false)
  assert.equal(hidden.documentElement.attributes['data-untested-hidden'], '')

  assert.equal(explorer({ saved: 'true' }).documentElement.attributes['data-untested-hidden'], undefined)
})

test('toggle persists across controller reloads, composes with filters, and survives reset', () => {
  const ui = explorer()
  ui.toggle(true)
  assert.equal(ui.visible().length, 4)
  assert.equal(ui.subgroup.hidden, false)
  assert.equal(ui.storage.get('delicacies.showWip'), 'true')
  assert.equal(explorer({ saved: ui.storage.get('delicacies.showWip') }).visible().length, 4)
  ui.category('salate')
  assert.deepEqual(ui.visible(), ['Farfallesalat'])
  ui.toggle(false)
  assert.equal(ui.ids['keine-treffer'].hidden, false)
  ui.toggle(true)
  ui.reset()
  assert.equal(ui.visible().length, 4)
  ui.tag()
  assert.deepEqual(ui.visible(), ['Bouletten'])
  ui.toggle(false)
  assert.equal(ui.storage.get('delicacies.showWip'), 'false')
})

test('blocked persistence does not prevent toggling', () => {
  const ui = explorer({ blocked: true })
  ui.toggle(true)
  assert.equal(ui.visible().length, 4)
  ui.toggle(false)
  assert.equal(ui.visible().length, 2)
})

test('WIP toggles do not scroll the recipe list, while category filters still do', async () => {
  const ui = explorer()
  await ui.toggle(true)
  await ui.toggle(false)
  assert.equal(ui.scrollCalls.length, 0)
  ui.category('brot')
  assert.equal(ui.scrollCalls.length, 1)
})

test('WIP toggles refresh fallback search without scrolling', async () => {
  const ui = explorer()
  ui.ids['rezept-suche'].value = 'Cloud'
  await ui.search('Cloud')
  assert.equal(ui.scrollCalls.length, 1)
  ui.scrollCalls.length = 0
  await ui.toggle(true)
  assert.equal(ui.ids['rezept-status'].textContent, '1 Treffer')
  await ui.toggle(false)
  assert.equal(ui.ids['suche-leer'].hidden, false)
  assert.equal(ui.scrollCalls.length, 0)
})

test('WIP toggles refresh Pagefind matches and empty results without scrolling', async () => {
  const ui = explorer({
    pagefind: {
      init: async () => {},
      search: async (_query, options) => ({
        results: options?.filters?.wip
          ? []
          : [{ data: async () => ({ url: '/rezept/cloud-burger-buns/', meta: { title: 'Cloud Burger Buns' } }) }]
      })
    }
  })
  ui.ids['rezept-suche'].value = 'Cloud'
  await ui.toggle(true)
  assert.equal(ui.ids['rezept-status'].textContent, '1 Treffer')
  await ui.toggle(false)
  assert.equal(ui.ids['rezept-status'].textContent, 'Keine Treffer')
  assert.equal(ui.scrollCalls.length, 0)
  await ui.search('Cloud')
  assert.equal(ui.scrollCalls.length, 1)
})

test('fallback search hides untested recipes until enabled', async () => {
  const ui = explorer()
  await ui.search('Cloud')
  assert.equal(ui.ids['suche-leer'].hidden, false)
  ui.toggle(true)
  await ui.search('Cloud')
  assert.equal(ui.ids['rezept-status'].textContent, '1 Treffer')
  ui.category('salate')
  await ui.search('Cloud')
  assert.equal(ui.ids['suche-leer'].hidden, false)
  await ui.search('Farfallesalat')
  assert.equal(ui.ids['rezept-status'].textContent, '1 Treffer')
})

test('Pagefind receives the WIP filter with other filters and stale searches cannot render', async () => {
  const pending = []
  const ui = explorer({
    pagefind: {
      init: async () => {},
      search: (_query, options) => new Promise((resolve) => pending.push({ options, resolve }))
    }
  })
  ui.category('brot')
  const oldSearch = ui.search('Burger')
  await flush()
  assert.deepEqual(JSON.parse(JSON.stringify(pending[0].options.filters)), { wip: ['false'], category: ['brot'] })
  ui.toggle(true)
  const newSearch = ui.search('Burger')
  await flush()
  assert.deepEqual(JSON.parse(JSON.stringify(pending[1].options.filters)), { category: ['brot'] })
  pending[1].resolve({
    results: [
      { data: async () => ({ url: '/rezept/cloud-burger-buns/', meta: { title: 'Cloud Burger Buns' }, excerpt: '' }) }
    ]
  })
  await newSearch
  pending[0].resolve({ results: [] })
  await oldSearch
  assert.equal(ui.ids['rezept-status'].textContent, '1 Treffer')
  assert.equal(ui.ids['suche-leer'].hidden, true)
})

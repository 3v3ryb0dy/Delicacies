import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { runInNewContext } from 'node:vm'

// Exercise the actual inline controller with a small DOM fixture and search adapter.
const source = readFileSync(new URL('../components/RecipeExplorer.astro', import.meta.url), 'utf8')
const script = source.match(/<script is:inline[^>]*>([\s\S]*?)<\/script>/)[1]

function explorer({ saved = null, blocked = false } = {}) {
  const element = (dataset = {}) => ({
    dataset,
    hidden: false,
    value: '',
    textContent: '',
    innerHTML: '',
    style: { setProperty() {} },
    listeners: {},
    children: [],
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
  const singles = Object.fromEntries(
    ['[data-empty-block]', '[data-reset-filters]', '[data-sticky-bar]', '[data-wip-control]'].map((id) => [
      id,
      element()
    ])
  )
  const categoryButtons = ['', 'brot', 'salate'].map((category) => element({ filterCategory: category }))
  const tagButton = element({ filterTag: 'fleisch' })
  const lists = {
    '[data-category-section]': sections,
    '[data-recipe]': cards,
    '[data-filter-category]': categoryButtons,
    '[data-filter-tag]': [tagButton],
    '[data-empty-category]': [],
    '[data-subcategory-section]': [subgroup]
  }
  const storage = new Map([['delicacies.showWip', saved]])
  const context = {
    document: {
      currentScript: { dataset: {} },
      documentElement: {},
      getElementById: (id) => ids[id],
      querySelector: (id) => singles[id],
      querySelectorAll: (id) => lists[id] || [],
      createElement: () => element()
    },
    localStorage: {
      getItem(key) {
        if (blocked) throw Error('blocked')
        return storage.get(key)
      },
      setItem(key, value) {
        if (blocked) throw Error('blocked')
        storage.set(key, value)
      }
    },
    window: { location: { hash: '' }, scrollY: 0, scrollTo() {} },
    getComputedStyle: () => ({ top: '0', scrollPaddingTop: '0' }),
    ResizeObserver: class {
      observe() {}
    },
    clearTimeout,
    setTimeout
  }
  runInNewContext(
    script +
      '\n globalThis.controller = { local: (query) => { pagefindFailed = true; return runSearch(query) }, search: runSearch, setPagefind: (adapter) => { pagefind = adapter }, filters: activeFilters };',
    context
  )
  return {
    ...context.controller,
    ids,
    sections,
    subgroup,
    storage,
    visible: () => cards.filter((card) => !card.item.hidden).map((card) => card.dataset.title),
    toggle(value) {
      ids['show-wip'].checked = value
      singles['[data-wip-control]'].hidden = false
      ids['show-wip'].listeners.change()
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

test('fallback search hides untested recipes until enabled', async () => {
  const ui = explorer()
  await ui.local('Cloud')
  assert.equal(ui.ids['suche-leer'].hidden, false)
  ui.toggle(true)
  await ui.local('Cloud')
  assert.equal(ui.ids['rezept-status'].textContent, '1 Treffer')
  ui.category('salate')
  await ui.local('Cloud')
  assert.equal(ui.ids['suche-leer'].hidden, false)
  await ui.local('Farfallesalat')
  assert.equal(ui.ids['rezept-status'].textContent, '1 Treffer')
})

test('Pagefind receives the WIP filter with other filters and stale searches cannot render', async () => {
  const ui = explorer()
  const pending = []
  ui.setPagefind({ search: (_query, options) => new Promise((resolve) => pending.push({ options, resolve })) })
  ui.category('brot')
  const oldSearch = ui.search('Burger')
  assert.deepEqual(JSON.parse(JSON.stringify(pending[0].options.filters)), { wip: ['false'], category: ['brot'] })
  ui.toggle(true)
  const newSearch = ui.search('Burger')
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

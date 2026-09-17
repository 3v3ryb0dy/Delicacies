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
function explorer({
  saved = null,
  blocked = false,
  pagefind = null,
  snapshot,
  hash = '',
  query = '',
  navigationType = 'navigate'
} = {}) {
  const element = (dataset = {}) => ({
    dataset,
    hidden: false,
    checked: false,
    value: '',
    textContent: '',
    get innerHTML() {
      return this.html ?? ''
    },
    set innerHTML(value) {
      this.html = value
      this.children = []
    },
    style: { setProperty() {} },
    scrollLeft: 0,
    scrollWidth: 300,
    clientWidth: 300,
    focus() {},
    scrollBy({ left }) {
      this.scrollLeft += left
    },
    listeners: {},
    children: [],
    className: '',
    attributes: {},
    setAttribute(name, value) {
      this.attributes[name] = String(value)
    },
    removeAttribute(name) {
      delete this.attributes[name]
    },
    getClientRects() {
      return this.hidden ? [] : [this.getBoundingClientRect()]
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
    getBoundingClientRect: () => ({ top: 0, height: 0, bottom: 3000, left: 0, right: 300 }),
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
    card.dataset.recipeId = title.toLowerCase().replaceAll(' ', '-')
    card.id = 'rezept-' + card.dataset.recipeId
    card.matches = (selector) => selector.includes('[data-recipe]')
    card.closest = () => item
    card.querySelector = () => ({ getAttribute: () => '/rezept/' + card.dataset.recipeId + '/' })
    card.item = item
    return card
  })
  const sections = ['hauptgerichte', 'brot', 'salate'].map((category, index) => {
    const section = element()
    section.id = category
    section.top = 400 + index * 600
    section.getBoundingClientRect = () => ({ top: section.top, bottom: section.top + 500 })
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
  cards.forEach((card) => {
    ids[card.id] = card
  })
  ids.rezepte.dataset.pagefindUrl = '/pagefind/pagefind.js'
  ids.rezepte.dataset.basePath = '/'
  const singles = Object.fromEntries(
    [
      '[data-empty-block]',
      '[data-reset-filters]',
      '[data-sticky-bar]',
      '[data-wip-control]',
      '[data-category-nav]'
    ].map((id) => [id, element()])
  )
  singles['#rezept-suche'] = ids['rezept-suche']
  singles['#show-wip'] = ids['show-wip']
  sections.forEach((section) => {
    ids[section.id] = section
  })
  const categoryLinks = ['hauptgerichte', 'brot', 'salate'].map((category) =>
    element({ categoryLink: category, categoryLabel: category })
  )
  const tagButton = element({ filterTag: 'fleisch' })
  const tagChip = element({ chipLabel: 'fleisch' })
  tagButton.querySelector = () => tagChip
  const lists = {
    '[data-category-section]': sections,
    '[data-recipe]': cards,
    '[data-category-link]': categoryLinks,
    '[data-filter-tag]': [tagButton],
    '[data-reset-filters]': [singles['[data-reset-filters]']],
    '[data-empty-category]': [],
    '[data-subcategory-section]': [subgroup]
  }
  const storage = new Map([['delicacies.showWip', saved]])
  const scrollCalls = []
  const documentListeners = {}
  globalThis.document = {
    referrer: '',
    addEventListener(event, listener) {
      documentListeners[event] = listener
    },
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
  const windowListeners = {}
  const initialUrl = snapshot?.url ?? 'https://cook.test/' + query + hash
  const entriesHistory = [
    { state: snapshot ? { delicaciesNavigation: { version: 2, overview: snapshot } } : null, url: initialUrl }
  ]
  let historyIndex = 0
  const frames = []
  const flushFrames = () => {
    for (const callback of frames.splice(0)) callback()
  }
  globalThis.window = {
    location: new URL(initialUrl),
    history: {
      get state() {
        return entriesHistory[historyIndex].state
      },
      replaceState(state, _unused, url) {
        const href = url ? new URL(url, explorerWindow.location.href).href : entriesHistory[historyIndex].url
        entriesHistory[historyIndex] = { state: structuredClone(state), url: href }
        if (url) explorerWindow.location = new URL(href)
      },
      pushState(state, _unused, url) {
        const href = new URL(url, explorerWindow.location.href).href
        entriesHistory.splice(historyIndex + 1)
        entriesHistory.push({ state: structuredClone(state), url: href })
        historyIndex++
        explorerWindow.location = new URL(href)
      },
      back() {
        if (!historyIndex) return
        historyIndex--
        explorerWindow.location = new URL(entriesHistory[historyIndex].url)
        windowListeners.popstate?.forEach((callback) => callback({}))
      },
      get length() {
        return entriesHistory.length
      }
    },
    performance: { getEntriesByType: () => [{ type: navigationType }] },
    sessionStorage: { getItem: () => null, removeItem() {} },
    scrollY: 800,
    scrollTo: (options) => scrollCalls.push(options),
    requestAnimationFrame(callback) {
      frames.push(callback)
      return frames.length
    },
    addEventListener(event, callback) {
      ;(windowListeners[event] ??= []).push(callback)
    }
  }
  globalThis.getComputedStyle = () => ({ top: '0', scrollPaddingTop: '0' })
  globalThis.ResizeObserver = class {
    observe() {}
  }

  const explorerWindow = globalThis.window
  const controller = initRecipeExplorer({
    loadPagefind: async () => pagefind
  })

  globalThis.history = explorerWindow.history
  flushFrames()
  return {
    controller,
    history: explorerWindow.history,
    win: explorerWindow,
    input(value) {
      ids['rezept-suche'].value = value
      ids['rezept-suche'].listeners.input()
    },
    async enter() {
      ids['rezept-suche'].listeners.keydown({ key: 'Enter' })
      await flush()
    },
    leave() {
      windowListeners.pagehide.forEach((callback) => callback())
    },
    openRecipe(recipe) {
      class Link {
        href = 'https://cook.test/rezept/' + recipe + '/'
        target = ''
        closest() {
          return this
        }
        hasAttribute() {
          return false
        }
      }
      globalThis.Element = Link
      documentListeners.click({ target: new Link(), button: 0 })
      windowListeners.pagehide.forEach((callback) => callback())
    },
    async settled() {
      await flush()
      flushFrames()
      await controller.ready
    },
    interrupt() {
      windowListeners.wheel?.forEach((callback) => callback())
    },
    nav: singles['[data-category-nav]'],
    flushFrames,
    scroll() {
      windowListeners.scroll.forEach((callback) => callback())
      flushFrames()
    },
    documentElement: globalThis.document.documentElement,
    ids,
    sections,
    subgroup,
    storage,
    scrollCalls,
    categoryLinks,
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
      const pending = categoryLinks
        .find((button) => button.dataset.categoryLink === value)
        .listeners.click({ button: 0, preventDefault() {}, detail: 1 })
      flushFrames()
      return pending
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
    for (const chip of [...ui.categoryLinks, ui.tagChip]) {
      const classes = new Set(chip.className.split(/\s+/))
      for (const required of ['inline-flex', 'items-center', 'shrink-0', 'whitespace-nowrap']) {
        assert.ok(classes.has(required), `Missing ${required} after filter update`)
      }
    }
  }
})

test('category links navigate without filtering recipes and tags retain pressed state', () => {
  const ui = explorer()
  ui.category('brot')
  assert.deepEqual(ui.visible(), ['Bouletten', 'Burger Buns'])
  assert.deepEqual(ui.filters(), { wip: ['false'] })
  assert.equal(ui.tagButton.attributes['aria-pressed'], 'false')
  ui.tag()
  assert.equal(ui.tagButton.attributes['aria-pressed'], 'true')
  ui.category('hauptgerichte')
  assert.equal(ui.tagButton.attributes['aria-pressed'], 'true')
  assert.deepEqual(ui.visible(), ['Bouletten'])
})

test('scroll position controls the current category, including scrolling back and leaving the list', () => {
  const ui = explorer()
  const current = () =>
    ui.categoryLinks
      .filter((link) => link.attributes['aria-current'] === 'location')
      .map((link) => link.dataset.categoryLink)
  assert.deepEqual(current(), [])
  ui.sections[0].top = 16
  ui.scroll()
  assert.deepEqual(current(), ['hauptgerichte'])
  ui.sections[0].top = -600
  ui.sections[1].top = 16
  ui.scroll()
  assert.deepEqual(current(), ['brot'])
  ui.sections[0].top = 16
  ui.sections[1].top = 616
  ui.scroll()
  assert.deepEqual(current(), ['hauptgerichte'])
  ui.ids['rezept-liste'].getBoundingClientRect = () => ({ bottom: 0 })
  ui.scroll()
  assert.deepEqual(current(), [])
})

test('category navigation preserves search and shows only categories with matches', async () => {
  const ui = explorer()
  ui.sections[1].top = 16
  ui.scroll()
  ui.input('Burger')
  await ui.enter()
  ui.flushFrames()
  assert.equal(ui.categoryLinks[1].attributes['aria-current'], 'location')
  ui.category('brot')
  assert.equal(ui.ids['rezept-suche'].value, 'Burger')
  assert.equal(ui.ids['rezept-liste'].hidden, true)
  assert.equal(ui.ids['suche-bereich'].hidden, false)
  assert.deepEqual(
    ui.categoryLinks.filter((link) => !link.hidden).map((link) => link.dataset.categoryLink),
    ['brot']
  )
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
  assert.equal(ui.visible().length, 4)
  ui.toggle(false)
  assert.equal(ui.ids['keine-treffer'].hidden, true)
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

test('WIP toggles do not scroll and category links use the measured header offset', async () => {
  const ui = explorer()
  await ui.toggle(true)
  await ui.toggle(false)
  assert.equal(ui.scrollCalls.length, 0)
  ui.category('brot')
  assert.equal(ui.scrollCalls.length, 1)
})

test('WIP toggles refresh fallback search without scrolling', async () => {
  const ui = explorer()
  ui.input('Cloud')
  await ui.enter()
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
  ui.input('Cloud')
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
  assert.equal(ui.ids['rezept-status'].textContent, '1 Treffer')
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
  assert.deepEqual(JSON.parse(JSON.stringify(pending[0].options.filters)), { wip: ['false'] })
  ui.toggle(true)
  const newSearch = ui.search('Burger')
  await flush()
  assert.deepEqual(pending[1].options, undefined)
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

const savedOverview = {
  url: 'https://cook.test/#brot',
  query: '',
  tags: [],
  showWip: true,
  scrollY: 2400,
  categoryScrollLeft: 180,
  recipe: 'cloud-burger-buns'
}

test('a reconstructed history entry restores filters and exact scroll position instead of the category anchor', async () => {
  const ui = explorer({
    snapshot: { ...savedOverview, url: 'https://cook.test/?tag=fleisch#brot', tags: ['fleisch'] },
    hash: '#brot',
    navigationType: 'back_forward'
  })
  assert.deepEqual(ui.visible(), ['Bouletten'])
  assert.deepEqual(ui.filters(), { tag: ['fleisch'] })
  assert.equal(ui.ids['show-wip'].checked, true)
  assert.equal(ui.scrollCalls.length, 0)
  await ui.settled()
  assert.deepEqual(ui.scrollCalls, [{ top: 2400, behavior: 'instant' }])
  assert.equal(ui.nav.scrollLeft, 180)
  assert.equal(ui.storage.get('delicacies.showWip'), null)
})

test('restored search waits for results before restoring position', async () => {
  let resolveSearch
  const ui = explorer({
    snapshot: { ...savedOverview, url: 'https://cook.test/?q=Cloud#brot', query: 'Cloud' },
    navigationType: 'reload',
    pagefind: {
      init: async () => {},
      search: () =>
        new Promise((resolve) => {
          resolveSearch = resolve
        })
    }
  })
  await flush()
  ui.flushFrames()
  assert.equal(ui.ids['rezept-suche'].value, 'Cloud')
  assert.equal(ui.ids['rezept-liste'].hidden, true)
  assert.equal(ui.scrollCalls.length, 0)
  resolveSearch({
    results: [
      { data: async () => ({ url: '/rezept/cloud-burger-buns/', meta: { title: 'Cloud Burger Buns' }, excerpt: '' }) }
    ]
  })
  await ui.settled()
  assert.equal(ui.ids['rezept-status'].textContent, '1 Treffer')
  assert.deepEqual(ui.scrollCalls, [{ top: 2400, behavior: 'instant' }])
})

test('interaction cancels the delayed position correction', async () => {
  const ui = explorer({ snapshot: savedOverview, navigationType: 'back_forward' })
  ui.interrupt()
  await ui.settled()
  assert.equal(ui.scrollCalls.length, 0)
})

test('direct card anchors reveal untested recipes without persisting the preference', async () => {
  const ui = explorer({ hash: '#rezept-cloud-burger-buns' })
  assert.equal(ui.ids['show-wip'].checked, true)
  assert.ok(ui.visible().includes('Cloud Burger Buns'))
  await ui.settled()
  assert.deepEqual(ui.scrollCalls, [{ top: 784, behavior: 'instant' }])
  assert.equal(ui.storage.get('delicacies.showWip'), null)
})

test('malformed fragments do not break the overview', async () => {
  const ui = explorer({ hash: '#%invalid' })
  await ui.settled()
  assert.deepEqual(ui.visible(), ['Bouletten', 'Burger Buns'])
  assert.equal(ui.scrollCalls.length, 0)
})

test('a failing search index falls back before restoring the view', async () => {
  const ui = explorer({
    snapshot: { ...savedOverview, url: 'https://cook.test/?q=Cloud#brot', query: 'Cloud' },
    navigationType: 'back_forward',
    pagefind: {
      init: async () => {},
      search: async () => {
        throw Error('offline')
      }
    }
  })
  await ui.settled()
  assert.equal(ui.ids['rezept-status'].textContent, '1 Treffer')
  assert.deepEqual(ui.scrollCalls, [{ top: 2400, behavior: 'instant' }])
})

test('opening a recipe captures the actual search, tags, visibility, and position in its overview entry', async () => {
  const ui = explorer()
  ui.tag()
  await ui.toggle(true)
  ui.input('Bouletten')
  await ui.enter()
  ui.nav.scrollLeft = 120
  ui.openRecipe('bouletten')
  assert.deepEqual(ui.history.state.delicaciesNavigation.overview, {
    url: 'https://cook.test/?q=Bouletten&tag=fleisch',
    query: 'Bouletten',
    tags: ['fleisch'],
    showWip: true,
    scrollY: 800,
    categoryScrollLeft: 120,
    recipe: 'bouletten'
  })
})

test('fresh search survives reload without ever opening a recipe', async () => {
  const ui = explorer()
  await ui.settled()
  ui.input('Burger')
  await ui.enter()
  ui.leave()
  assert.equal(ui.win.location.search, '?q=Burger')
  assert.equal(ui.history.state.delicaciesNavigation.overview.recipe, undefined)
  const reload = explorer({ snapshot: ui.history.state.delicaciesNavigation.overview, navigationType: 'reload' })
  await reload.settled()
  assert.equal(reload.ids['rezept-suche'].value, 'Burger')
  assert.equal(reload.ids['rezept-status'].textContent, '1 Treffer')
  assert.deepEqual(
    reload.categoryLinks.filter((link) => !link.hidden).map((link) => link.dataset.categoryLink),
    ['brot']
  )
})

test('continuous page and category scrolling keeps history writes below browser flood limits', async (t) => {
  const ui = explorer()
  await ui.settled()
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const writes = t.mock.method(ui.history, 'replaceState')
  const initialUrl = ui.win.location.href
  for (let frame = 1; frame <= 600; frame++) {
    ui.win.scrollY = frame * 4
    ui.nav.scrollLeft = frame
    ui.scroll()
    ui.nav.listeners.scroll()
    t.mock.timers.tick(16)
  }
  assert.ok(writes.mock.callCount() <= 20, `${writes.mock.callCount()} history writes during 9.6s of scrolling`)
  t.mock.timers.tick(500)
  assert.equal(ui.history.state.delicaciesNavigation.overview.scrollY, 2400)
  assert.equal(ui.history.state.delicaciesNavigation.overview.categoryScrollLeft, 600)
  assert.equal(ui.win.location.href, initialUrl)
  assert.equal(ui.history.length, 1)
})

test('leaving during a pending scroll save captures the latest position and cancels delayed writes', async (t) => {
  const ui = explorer()
  await ui.settled()
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const writes = t.mock.method(ui.history, 'replaceState')
  ui.win.scrollY = 1234
  ui.nav.scrollLeft = 90
  ui.scroll()
  ui.openRecipe('burger-buns')
  assert.equal(ui.history.state.delicaciesNavigation.overview.scrollY, 1234)
  assert.equal(ui.history.state.delicaciesNavigation.overview.categoryScrollLeft, 90)
  const departureWrites = writes.mock.callCount()
  t.mock.timers.tick(500)
  assert.equal(writes.mock.callCount(), departureWrites)
})

test('Back cancels a pending scroll save before restoring the destination entry', async (t) => {
  const ui = explorer()
  await ui.settled()
  await ui.category('brot')
  t.mock.timers.enable({ apis: ['setTimeout'] })
  ui.win.scrollY = 1900
  ui.scroll()
  ui.history.back()
  const destination = structuredClone(ui.history.state)
  const writes = t.mock.method(ui.history, 'replaceState')
  t.mock.timers.tick(500)
  assert.equal(writes.mock.callCount(), 0)
  assert.deepEqual(ui.history.state, destination)
  await ui.settled()
  const restoredWrites = writes.mock.callCount()
  t.mock.timers.tick(500)
  assert.equal(writes.mock.callCount(), restoredWrites)
})

test('search editing creates one entry and category Back restores search and position', async () => {
  const ui = explorer()
  await ui.settled()
  ui.input('Bu')
  ui.input('Burger')
  await ui.enter()
  assert.equal(ui.history.length, 2)
  ui.nav.scrollLeft = 45
  await ui.category('brot')
  assert.equal(ui.win.location.hash, '#brot')
  assert.equal(ui.history.length, 3)
  ui.history.back()
  await ui.settled()
  assert.equal(ui.win.location.hash, '')
  assert.equal(ui.ids['rezept-suche'].value, 'Burger')
  assert.equal(ui.nav.scrollLeft, 45)
  ui.history.back()
  await ui.settled()
  assert.equal(ui.ids['rezept-suche'].value, '')
})

test('copied query URLs apply supported tags and reset clears both query and tags', async () => {
  const ui = explorer({ query: '?q=Bouletten&tag=fleisch&tag=unknown', saved: 'true' })
  await ui.settled()
  assert.deepEqual(ui.filters(), { tag: ['fleisch'] })
  assert.equal(ui.ids['rezept-status'].textContent, '1 Treffer')
  ui.reset()
  assert.equal(ui.ids['rezept-suche'].value, '')
  assert.equal(ui.win.location.search, '')
  assert.deepEqual(ui.filters(), {})
  assert.equal(ui.ids['show-wip'].checked, true)
})

test('category navigation cancels the automatic scroll of an older search', async () => {
  const pending = []
  const ui = explorer({
    pagefind: {
      init: async () => {},
      search: () => new Promise((resolve) => pending.push(resolve))
    }
  })
  await ui.settled()
  ui.input('Burger')
  await ui.enter()
  const jump = ui.category('brot')
  await flush()
  const result = {
    results: [{ data: async () => ({ url: '/rezept/burger-buns/', meta: { title: 'Burger Buns' }, excerpt: '' }) }]
  }
  pending[1](result)
  await jump
  const scrollCount = ui.scrollCalls.length
  pending[0](result)
  await flush()
  assert.equal(ui.win.location.hash, '#brot')
  assert.equal(ui.ids['rezept-suche'].value, 'Burger')
  assert.equal(ui.scrollCalls.length, scrollCount, 'the older search must not jump back to the results heading')
})

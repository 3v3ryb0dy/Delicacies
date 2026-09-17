import assert from 'node:assert/strict'
import { test } from 'node:test'
import { initRecipeNavigation, readOverviewSnapshot } from './recipe-navigation.ts'

const overviewUrl = 'https://cook.test/cookbook/'
const recipeUrl = (slug) => overviewUrl + 'rezept/' + slug + '/'
const snapshot = {
  url: overviewUrl + '#brot',
  query: 'Burger',
  tags: ['vegetarisch'],
  showWip: true,
  scrollY: 3456,
  categoryScrollLeft: 220,
  recipe: 'burger-buns'
}

function page({
  url,
  referrer = '',
  type = 'navigate',
  state = {},
  storage = new Map(),
  blocked = false,
  readOverview
} = {}) {
  const documentListeners = {}
  const windowListeners = {}
  class Link {
    constructor(href, attributes = {}) {
      this.href = href
      this.attributes = attributes
      this.target = attributes.target ?? ''
    }
    closest() {
      return this
    }
    hasAttribute(name) {
      return Object.hasOwn(this.attributes, name)
    }
  }
  globalThis.Element = Link
  globalThis.document = {
    referrer,
    addEventListener(event, callback) {
      documentListeners[event] = callback
    }
  }
  const win = (globalThis.window = {
    location: { href: url },
    performance: { getEntriesByType: () => [{ type }] },
    history: {
      state,
      replaceState(next) {
        this.state = next
      }
    },
    sessionStorage: {
      getItem(key) {
        if (blocked) throw Error('denied')
        return storage.get(key) ?? null
      },
      removeItem(key) {
        if (blocked) throw Error('denied')
        storage.delete(key)
      },
      setItem(key, value) {
        if (blocked) throw Error('denied')
        storage.set(key, value)
      }
    },
    addEventListener(event, callback) {
      windowListeners[event] = callback
    }
  })
  const restored = initRecipeNavigation({ overviewUrl, readOverview })
  return {
    restored,
    storage,
    history: win.history,
    click(href, attributes = {}, event = {}) {
      documentListeners.click({ target: new Link(href, attributes), button: 0, ...event })
    },
    leave() {
      windowListeners.pagehide()
    },
    show() {
      windowListeners.pageshow()
    }
  }
}

test('list → recipe → related recipe → overview preserves the original view and unrelated history state', () => {
  const storage = new Map()
  const list = page({ url: snapshot.url, storage, state: { anotherFeature: 7 }, readOverview: () => snapshot })
  list.click(recipeUrl('burger-buns'))
  assert.equal(storage.size, 0, 'handoff only commits when the source leaves')
  list.leave()
  assert.equal(list.history.state.anotherFeature, 7)
  assert.deepEqual(list.history.state.delicaciesNavigation.overview, snapshot)

  const first = page({ url: recipeUrl('burger-buns'), referrer: overviewUrl, storage })
  assert.deepEqual(first.restored, snapshot, 'referrers omit the source category fragment')
  assert.equal(storage.size, 0, 'handoff is consumed once')
  first.click(recipeUrl('cloud-burger-buns'))
  first.leave()

  const second = page({ url: recipeUrl('cloud-burger-buns'), referrer: recipeUrl('burger-buns'), storage })
  assert.deepEqual(second.restored, snapshot)
  const back = overviewUrl + '#rezept-cloud-burger-buns'
  second.click(back, { 'data-recipe-back': '' })
  second.leave()
  const returned = page({ url: back, referrer: recipeUrl('cloud-burger-buns'), storage, readOverview: () => snapshot })
  assert.deepEqual(returned.restored, snapshot)
  assert.equal(storage.size, 0)
})

test('recipe reload and browser history traversal retain their own return context', () => {
  for (const type of ['reload', 'back_forward']) {
    const recipe = page({
      url: recipeUrl('burger-buns'),
      type,
      state: { other: 'retained', delicaciesNavigation: { version: 1, returnTo: snapshot } }
    })
    assert.deepEqual(recipe.restored, snapshot)
    assert.equal(recipe.history.state.other, 'retained')
  }
})

test('direct visits and new tabs cannot inherit an unrelated previous list', () => {
  const storage = new Map()
  const list = page({ url: snapshot.url, storage, readOverview: () => snapshot })
  list.click(recipeUrl('burger-buns'), { target: '_blank' })
  const newTab = page({ url: recipeUrl('burger-buns'), referrer: overviewUrl, storage: new Map(storage) })
  assert.equal(newTab.restored, undefined)
  const direct = page({ url: recipeUrl('burger-buns'), storage })
  direct.click(overviewUrl + '#rezept-burger-buns', { 'data-recipe-back': '' })
  direct.leave()
  assert.equal(storage.size, 0)
})

test('modified, cancelled, download, and non-primary clicks do not pass context', () => {
  for (const [attributes, event] of [
    [{}, { metaKey: true }],
    [{}, { ctrlKey: true }],
    [{}, { shiftKey: true }],
    [{}, { altKey: true }],
    [{}, { button: 1 }],
    [{}, { defaultPrevented: true }],
    [{ download: '' }, {}],
    [{ target: '_blank' }, {}]
  ]) {
    const list = page({ url: snapshot.url, readOverview: () => snapshot })
    list.click(recipeUrl('burger-buns'), attributes, event)
    list.leave()
    assert.equal(list.storage.size, 0)
  }
})

test('keyboard activation passes context and a cached page does not resend old handoffs', () => {
  const list = page({ url: snapshot.url, readOverview: () => snapshot })
  list.click(recipeUrl('burger-buns'), {}, { detail: 0 })
  list.leave()
  assert.equal(list.storage.size, 1)
  list.show()
  list.leave()
  assert.equal(list.storage.size, 0)
})

test('unrelated destinations cannot receive or reuse the pending context', () => {
  const list = page({ url: snapshot.url, readOverview: () => snapshot })
  list.click(recipeUrl('burger-buns'))
  list.leave()
  const wrong = page({ url: recipeUrl('cloud-burger-buns'), referrer: overviewUrl, storage: list.storage })
  assert.equal(wrong.restored, undefined)
  assert.equal(list.storage.size, 0)
})

test('expired, corrupt, and mismatched-referrer handoffs fall back safely', () => {
  for (const mutation of ['expired', 'corrupt', 'referrer']) {
    const list = page({ url: snapshot.url, readOverview: () => snapshot })
    list.click(recipeUrl('burger-buns'))
    list.leave()
    const key = [...list.storage.keys()][0]
    if (mutation === 'expired') {
      const value = JSON.parse(list.storage.get(key))
      value.created -= 60_000
      list.storage.set(key, JSON.stringify(value))
    }
    if (mutation === 'corrupt') list.storage.set(key, '{broken')
    const destination = page({
      url: recipeUrl('burger-buns'),
      referrer: mutation === 'referrer' ? '' : overviewUrl,
      storage: list.storage
    })
    assert.equal(destination.restored, undefined)
    assert.equal(list.storage.size, 0)
  }
})

test('blocked storage does not break anchor navigation or history snapshots', () => {
  const list = page({ url: snapshot.url, blocked: true, readOverview: () => snapshot })
  list.click(recipeUrl('burger-buns'))
  list.leave()
  assert.deepEqual(list.history.state.delicaciesNavigation.overview, snapshot)
  assert.equal(page({ url: recipeUrl('burger-buns'), blocked: true }).restored, undefined)
})

test('snapshots reject foreign overview URLs and invalid values', () => {
  assert.deepEqual(readOverviewSnapshot(snapshot, overviewUrl), snapshot)
  for (const changes of [
    { url: 'https://other.test/' },
    { url: recipeUrl('burger-buns') },
    { scrollY: -1 },
    { scrollY: '12' },
    { categoryScrollLeft: Infinity },
    { tags: [7] },
    { showWip: 'true' },
    { recipe: '../burger' },
    { query: null }
  ])
    assert.equal(readOverviewSnapshot({ ...snapshot, ...changes }, overviewUrl), undefined)
})

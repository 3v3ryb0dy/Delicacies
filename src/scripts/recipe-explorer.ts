/**
 * Home page recipe explorer.
 *
 * Owns category navigation, tag filtering, Pagefind search, the remembered "Versuchsküche
 * anzeigen" preference and the scroll handling that keeps results clear
 * of the sticky filter bar.
 *
 * This lives in a module (loaded by `RecipeExplorer.astro`) instead of an
 * `is:inline` script so `astro check` type-checks it. The DOM contract is the
 * `data-*` attributes and ids rendered by that component.
 */

// Explicit `.ts` so the module also loads under `node --test` (plain Node
// resolves extensions, unlike Vite).
import { showWipPreferenceKey, untestedHiddenAttribute } from '../config/preferences.ts'
import {
  afterPageLayout,
  initRecipeNavigation,
  currentOverviewSnapshot,
  saveOverviewSnapshot,
  type OverviewSnapshot
} from '../lib/recipe-navigation.ts'

export type PagefindResultData = {
  url: string
  excerpt: string
  meta: { title?: string; category?: string }
}

export type PagefindAdapter = {
  init: () => Promise<unknown>
  search: (
    query: string,
    options?: { filters?: Record<string, string[]> }
  ) => Promise<{ results: { data: () => Promise<PagefindResultData> }[] }>
}

export type RecipeExplorerOptions = {
  /**
   * Loads the Pagefind bundle for a URL, returning null when search is not
   * available. Overridable so tests can run without a built site.
   */
  loadPagefind?: (url: string) => Promise<PagefindAdapter | null>
}

export type RecipeExplorerHandle = {
  ready: Promise<void>
  search: (query: string, options?: { scroll?: boolean }) => Promise<void>
  activeFilters: () => Record<string, string[]>
}

type FallbackCard = {
  title: string
  category: string
  url: string
  detail: string
  card: HTMLElement
  haystack: string
}

async function defaultLoadPagefind(url: string): Promise<PagefindAdapter | null> {
  try {
    const pagefind = (await import(/* @vite-ignore */ url)) as PagefindAdapter
    await pagefind.init()
    return pagefind
  } catch {
    // `astro dev` has no Pagefind bundle; the caller falls back to the cards.
    return null
  }
}

function required<T extends Element>(element: T | null, selector: string): T {
  if (!element) throw new Error(`Recipe explorer: "${selector}" is missing from the page.`)
  return element
}

export function initRecipeExplorer(options: RecipeExplorerOptions = {}): RecipeExplorerHandle | undefined {
  const doc = document
  const win = window
  const computedStyle = getComputedStyle
  const root = doc.getElementById('rezepte')
  if (!root) return undefined

  const loadPagefind = options.loadPagefind ?? defaultLoadPagefind
  const pagefindUrl = root.dataset.pagefindUrl
  const basePath = root.dataset.basePath ?? '/'

  const cardList = required(doc.getElementById('rezept-liste'), '#rezept-liste')
  const searchArea = required(doc.getElementById('suche-bereich'), '#suche-bereich')
  const searchList = required(doc.getElementById('suche-liste'), '#suche-liste')
  const searchEmpty = required(doc.getElementById('suche-leer'), '#suche-leer')
  const status = required(doc.getElementById('rezept-status'), '#rezept-status')
  const input = required(doc.querySelector<HTMLInputElement>('#rezept-suche'), '#rezept-suche')
  const stickyBar = required(doc.querySelector<HTMLElement>('[data-sticky-bar]'), '[data-sticky-bar]')
  const wipControl = required(doc.querySelector<HTMLElement>('[data-wip-control]'), '[data-wip-control]')
  const wipToggle = required(doc.querySelector<HTMLInputElement>('#show-wip'), '#show-wip')
  const noResults = doc.getElementById('keine-treffer')
  const resetButtons = Array.from(doc.querySelectorAll<HTMLButtonElement>('[data-reset-filters]'))
  const activeFilterBar = doc.querySelector<HTMLElement>('[data-active-filters]')
  const activeFilterChips = doc.querySelector<HTMLElement>('[data-active-filter-chips]')
  const categoryPrevious = doc.querySelector<HTMLButtonElement>('[data-category-previous]')
  const categoryNext = doc.querySelector<HTMLButtonElement>('[data-category-next]')
  const emptyBlock = doc.querySelector<HTMLElement>('[data-empty-block]')
  const emptyEntries = Array.from(doc.querySelectorAll<HTMLElement>('[data-empty-category]'))
  const sections = Array.from(doc.querySelectorAll<HTMLElement>('[data-category-section]'))
  const cards = Array.from(doc.querySelectorAll<HTMLElement>('[data-recipe]'))
  const categoryLinks = Array.from(doc.querySelectorAll<HTMLAnchorElement>('[data-category-link]'))
  const categoryNav = required(doc.querySelector<HTMLElement>('[data-category-nav]'), '[data-category-nav]')
  const tagButtons = Array.from(doc.querySelectorAll<HTMLButtonElement>('[data-filter-tag]'))

  let persistence: Pick<Storage, 'getItem' | 'setItem'> | undefined
  try {
    persistence = localStorage
  } catch {
    // Reading `localStorage` itself throws in locked-down browser modes.
    persistence = undefined
  }

  let showWip = false
  try {
    showWip = persistence?.getItem(showWipPreferenceKey) === 'true'
  } catch {
    // Browsing still works when storage is unavailable.
  }
  wipToggle.checked = showWip
  wipControl.hidden = false

  // Untested recipes are marked up visible so they stay reachable without
  // JavaScript; the layout hides them before the first paint when the stored
  // preference says so, and this keeps that flag in step with the toggle.
  const syncUntestedVisibility = () => {
    if (showWip) doc.documentElement.removeAttribute(untestedHiddenAttribute)
    else doc.documentElement.setAttribute(untestedHiddenAttribute, '')
  }
  syncUntestedVisibility()

  const availableTotal = () => cards.filter((card) => showWip || card.dataset.wip !== 'true').length
  const activeTags = new Set<string>()
  let pagefind: PagefindAdapter | null = null
  let pagefindFailed = false
  let searchToken = 0
  let debounce: ReturnType<typeof setTimeout> | undefined

  const beginResultsChange = () => {
    clearTimeout(debounce)
    debounce = undefined
    ++searchToken
    ++restorationToken
    restoring = false
  }

  const resultsOffset = () => {
    const stickyTop = parseFloat(computedStyle(stickyBar).top) || 0
    return stickyTop + stickyBar.getBoundingClientRect().height + 16
  }

  // Native category links use the same measured clearance as filtering.
  // Scroll padding and scroll margin add together, so subtract the global padding.
  const updateAnchorOffset = () => {
    const padding = parseFloat(computedStyle(doc.documentElement).scrollPaddingTop) || 0
    doc.documentElement.style.setProperty('--recipe-focus-offset', resultsOffset() + 'px')
    const effectivePadding = parseFloat(computedStyle(doc.documentElement).scrollPaddingTop) || padding
    root.style.setProperty('--recipe-anchor-margin', Math.max(0, resultsOffset() - effectivePadding) + 'px')
  }
  updateAnchorOffset()
  new ResizeObserver(updateAnchorOffset).observe(stickyBar)

  const scrollToResults = () => {
    const target = searchArea.hidden ? cardList : searchArea
    const offset = resultsOffset()
    win.scrollTo({
      top: Math.max(0, win.scrollY + target.getBoundingClientRect().top - offset),
      behavior: 'instant'
    })
  }

  const chipBase =
    'focus-ring inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-semibold tracking-wide'
  const chipActive = 'border-transparent bg-ink text-paper'
  const chipIdle = 'border-rule bg-paper-raised text-ink-soft transition-colors hover:text-ink'
  const tagBase =
    'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-sm font-semibold tracking-wide transition-colors'
  const tagActive = 'bg-ink text-paper'
  const tagIdle = 'bg-paper-sunken text-ink-soft'

  const categoryTargets = [...sections, ...emptyEntries].filter((section) =>
    categoryLinks.some((link) => link.dataset.categoryLink === section.id)
  )
  const searchGroups = new Map<string, { section: HTMLElement; list: HTMLElement; count: HTMLElement; total: number }>()
  let currentCategory: string | undefined
  let categoryFrame = 0

  const updateCurrentCategory = () => {
    categoryFrame = 0
    const offset = resultsOffset()
    const listBounds = (searchArea.hidden ? cardList : searchArea).getBoundingClientRect()
    let current = ''
    let currentTop = -Infinity
    if (listBounds.bottom > offset) {
      const targets = searchArea.hidden ? categoryTargets : Array.from(searchGroups.values(), (group) => group.section)
      for (const section of targets) {
        if (!section.getClientRects().length) continue
        const id = section.dataset.searchCategory ?? section.id
        const top = section.getBoundingClientRect().top
        if (top > offset + 1) continue
        // Empty categories can share a row; retain the linked destination there.
        if (top > currentTop || (top === currentTop && win.location.hash === '#' + id)) {
          current = id
          currentTop = top
        }
      }
    }
    const changed = current !== currentCategory
    currentCategory = current
    categoryLinks.forEach((link) => {
      const isActive = link.dataset.categoryLink === current
      link.className = chipBase + ' ' + (isActive ? chipActive : chipIdle)
      if (isActive) link.setAttribute('aria-current', 'location')
      else link.removeAttribute('aria-current')
      if (isActive && changed) {
        // Reveal the active link on narrow screens without moving the page vertically.
        const bounds = link.getBoundingClientRect()
        const navBounds = categoryNav.getBoundingClientRect()
        if (bounds.left < navBounds.left) categoryNav.scrollLeft += bounds.left - navBounds.left
        else if (bounds.right > navBounds.right) categoryNav.scrollLeft += bounds.right - navBounds.right
      }
    })
  }
  const scheduleCategoryUpdate = () => {
    if (!categoryFrame) categoryFrame = win.requestAnimationFrame(updateCurrentCategory)
  }
  win.addEventListener('scroll', scheduleCategoryUpdate, { passive: true })
  win.addEventListener('resize', scheduleCategoryUpdate)
  win.addEventListener('hashchange', scheduleCategoryUpdate)
  const categoryObserver = new ResizeObserver(scheduleCategoryUpdate)
  categoryObserver.observe(cardList)
  categoryObserver.observe(stickyBar)

  const activeFilters = () => {
    const filters: Record<string, string[]> = {}
    if (!showWip) filters.wip = ['false']
    if (activeTags.size) filters.tag = Array.from(activeTags)
    return filters
  }

  const updateCategoryOverflow = () => {
    const overflow = categoryNav.scrollWidth > categoryNav.clientWidth + 2
    if (categoryPrevious) {
      categoryPrevious.hidden = !overflow
      categoryPrevious.disabled = categoryNav.scrollLeft <= 1
    }
    if (categoryNext) {
      categoryNext.hidden = !overflow
      categoryNext.disabled = categoryNav.scrollLeft + categoryNav.clientWidth >= categoryNav.scrollWidth - 2
    }
  }
  categoryNav.addEventListener('scroll', updateCategoryOverflow, { passive: true })
  new ResizeObserver(updateCategoryOverflow).observe(categoryNav)
  for (const [button, direction] of [
    [categoryPrevious, -1],
    [categoryNext, 1]
  ] as const) {
    button?.addEventListener('click', () => {
      categoryNav.scrollBy({ left: direction * categoryNav.clientWidth * 0.75, behavior: 'instant' })
      updateCategoryOverflow()
    })
  }

  const paintButtons = () => {
    tagButtons.forEach((button) => {
      const isActive = activeTags.has(button.dataset.filterTag ?? '')
      button.setAttribute('aria-pressed', String(isActive))
      const chip = button.querySelector<HTMLElement>('[data-chip-label]')
      if (!chip) return
      chip.className = tagBase + ' ' + (isActive ? tagActive : tagIdle)
    })
  }

  const matches = (card: HTMLElement) => {
    if (!showWip && card.dataset.wip === 'true') return false
    if (activeTags.size) {
      const cardTags = (card.dataset.tags ?? '').split(/\s+/).filter(Boolean)
      if (!cardTags.some((tag) => activeTags.has(tag))) return false
    }
    return true
  }

  const syncCategories = (available: Set<string>) => {
    categoryLinks.forEach((link) => {
      link.hidden = !available.has(link.dataset.categoryLink ?? '')
    })
    scheduleCategoryUpdate()
    updateCategoryOverflow()
  }

  const applyFilters = () => {
    let visible = 0
    cards.forEach((card) => {
      const ok = matches(card)
      required(card.closest<HTMLElement>('[data-recipe-item]'), '[data-recipe-item]').hidden = !ok
      if (ok) visible += 1
    })
    doc.querySelectorAll<HTMLElement>('[data-subcategory-section]').forEach((section) => {
      section.hidden = !section.querySelector('[data-recipe-item]:not([hidden])')
    })
    sections.forEach((section) => {
      const count = section.querySelectorAll('[data-recipe-item]:not([hidden])').length
      section.hidden = count === 0
      required(section.querySelector<HTMLElement>('[data-category-count]'), '[data-category-count]').textContent =
        count === 1 ? '1 Rezept' : count + ' Rezepte'
    })
    const total = availableTotal()

    if (emptyBlock) emptyBlock.hidden = activeTags.size > 0
    if (noResults) noResults.hidden = visible > 0

    syncCategories(new Set(cards.filter(matches).map((card) => card.dataset.category ?? '')))

    if (visible === total) status.textContent = total === 1 ? '1 Rezept' : total + ' Rezepte'
    else status.textContent = visible + ' von ' + total + ' Rezepten'
    scheduleCategoryUpdate()
  }

  const escapeHtml = (value: string) =>
    value.replace(
      /[&<>"']/g,
      (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character] as string
    )

  const fold = (value: string | undefined) => (value ?? '').toLowerCase()

  const fallbackCards: FallbackCard[] = cards.map((card) => ({
    title: card.dataset.title ?? 'Rezept',
    category: card.dataset.categoryLabel ?? '',
    url: card.querySelector('a')?.getAttribute('href') ?? '#',
    detail: card.dataset.search ?? '',
    card,
    haystack: fold(
      [card.dataset.title, card.dataset.categoryLabel, card.dataset.category, card.dataset.tags, card.dataset.search]
        .filter(Boolean)
        .join(' · ')
    )
  }))

  const excerpt = (text: string, token: string) => {
    const index = fold(text).indexOf(token)
    const start = index === -1 ? 0 : Math.max(0, index - 60)
    const end = index === -1 ? 140 : Math.min(text.length, index + 90)
    return (start > 0 ? '…' : '') + text.slice(start, end).trim() + (end < text.length ? '…' : '')
  }

  // Pagefind already prefixes result URLs with the site base (it derives it
  // from where its bundle is served), so only add the base when it is absent.
  const resolveResultUrl = (url: string) => {
    if (/^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith('//')) return url
    const base = basePath.replace(/\/$/, '')
    if (!base || url === base || url.startsWith(base + '/')) return url
    return base + (url.startsWith('/') ? url : '/' + url)
  }

  const showSections = () => {
    cardList.hidden = false
    searchArea.hidden = true
    applyFilters()
  }

  const appendResult = (url: string, title: string, meta: string, excerptHtml: string) => {
    const categoryIcon =
      categoryLinks.find((button) => button.dataset.categoryLabel === meta)?.querySelector('svg')?.outerHTML ?? ''
    const item = doc.createElement('li')
    item.innerHTML =
      '<a href="' +
      escapeHtml(url) +
      '" class="focus-ring border-rule bg-paper-raised hover:border-ink/25 flex flex-col gap-1 rounded-2xl border px-5 py-4 transition-colors">' +
      '<span class="font-display text-lg font-semibold tracking-tight">' +
      escapeHtml(title) +
      '</span>' +
      (meta
        ? '<span class="text-accent inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em]">' +
          categoryIcon +
          escapeHtml(meta) +
          '</span>'
        : '') +
      (excerptHtml ? '<span class="text-ink-soft text-sm leading-relaxed">' + excerptHtml + '</span>' : '') +
      '</a>'
    const path = new URL(url, win.location.href).pathname
    const recipe = cards.find(
      (card) => path === new URL(card.querySelector('a')?.getAttribute('href') ?? '', win.location.href).pathname
    )
    const category =
      recipe?.dataset.category ??
      categoryLinks.find((link) => link.dataset.categoryLabel === meta)?.dataset.categoryLink
    if (!category) return
    let group = searchGroups.get(category)
    if (!group) {
      const section = doc.createElement('section')
      section.dataset.searchCategory = category
      section.id = 'suche-' + category
      const heading = doc.createElement('h3')
      heading.className = 'font-display text-2xl font-semibold'
      heading.textContent =
        categoryLinks.find((link) => link.dataset.categoryLink === category)?.dataset.categoryLabel ?? category
      const count = doc.createElement('span')
      count.className = 'text-xs text-ink-soft tabular-nums'
      const header = doc.createElement('div')
      header.className = 'mb-4 flex items-baseline justify-between gap-4 border-b border-rule pb-3'
      header.appendChild(heading)
      header.appendChild(count)
      const list = doc.createElement('ul')
      list.className = 'flex flex-col gap-2'
      section.appendChild(header)
      section.appendChild(list)
      group = { section, list, count, total: 0 }
      searchGroups.set(category, group)
    }
    group.list.appendChild(item)
    group.total++
    group.count.textContent = group.total === 1 ? '1 Treffer' : group.total + ' Treffer'
  }

  const finishSearch = () => {
    // Cookbook order between categories, search relevance within each category.
    categoryLinks.forEach((link) => {
      const group = searchGroups.get(link.dataset.categoryLink ?? '')
      if (group) searchList.appendChild(group.section)
    })
    syncCategories(new Set(searchGroups.keys()))
  }

  const runLocalSearch = (query: string) => {
    const tokens = fold(query).split(/\s+/).filter(Boolean)
    const hits = fallbackCards
      .filter((entry) => matches(entry.card) && tokens.every((token) => entry.haystack.indexOf(token) !== -1))
      .sort((a, b) => {
        const aTitle = fold(a.title).indexOf(tokens[0]) !== -1 ? 0 : 1
        const bTitle = fold(b.title).indexOf(tokens[0]) !== -1 ? 0 : 1
        return aTitle - bTitle || a.title.localeCompare(b.title, 'de')
      })

    if (hits.length === 0) {
      searchEmpty.hidden = false
      status.textContent = 'Keine Treffer'
      return
    }

    hits.forEach((entry) => {
      appendResult(entry.url, entry.title, entry.category, escapeHtml(excerpt(entry.detail, tokens[0])))
    })

    status.textContent = hits.length === 1 ? '1 Treffer' : hits.length + ' Treffer'
  }

  const runSearch = async (query: string, { scroll = true }: { scroll?: boolean } = {}) => {
    const token = ++searchToken
    cardList.hidden = true
    searchArea.hidden = false
    searchEmpty.hidden = true
    searchList.innerHTML = ''
    searchGroups.clear()
    scheduleCategoryUpdate()

    if (!pagefind && !pagefindFailed) {
      pagefind = pagefindUrl ? await loadPagefind(pagefindUrl) : null
      if (!pagefind) pagefindFailed = true
      if (token !== searchToken) return
    }

    if (!pagefind) {
      runLocalSearch(query)
      finishSearch()
      if (scroll) scrollToResults()
      return
    }

    const filters = activeFilters()
    let results: PagefindResultData[]
    try {
      const search = await pagefind.search(query, Object.keys(filters).length ? { filters } : undefined)
      if (token !== searchToken) return
      results = await Promise.all(search.results.map((result) => result.data()))
    } catch {
      if (token !== searchToken) return
      pagefindFailed = true
      pagefind = null
      runLocalSearch(query)
      finishSearch()
      if (scroll) scrollToResults()
      return
    }
    if (token !== searchToken) return

    if (results.length === 0) {
      searchEmpty.hidden = false
      status.textContent = 'Keine Treffer'
      finishSearch()
      if (scroll) scrollToResults()
      return
    }

    results.forEach((result) => {
      const url = resolveResultUrl(result.url)
      const meta = result.meta?.category ?? ''
      // Pagefind highlights matches, so its excerpt markup is inserted as is.
      appendResult(url, result.meta?.title ?? 'Rezept', meta, result.excerpt)
    })

    finishSearch()
    status.textContent = results.length === 1 ? '1 Treffer' : results.length + ' Treffer'
    if (scroll) scrollToResults()
  }

  const overviewUrl = new URL(basePath, win.location.href).href
  let stateQuery = ''
  let originatingRecipe: string | undefined
  let editingSearch = false
  let restoring = false
  let restorationToken = 0
  let scrollSaveTimer: ReturnType<typeof setTimeout> | undefined
  const cancelScrollSave = () => {
    clearTimeout(scrollSaveTimer)
    scrollSaveTimer = undefined
  }
  const readView = (recipe?: string): OverviewSnapshot => {
    if (recipe) originatingRecipe = recipe
    return {
      url: win.location.href,
      query: stateQuery,
      tags: Array.from(activeTags),
      showWip,
      scrollY: win.scrollY,
      categoryScrollLeft: categoryNav.scrollLeft,
      ...(originatingRecipe ? { recipe: originatingRecipe } : {})
    }
  }
  const saveView = () => {
    cancelScrollSave()
    if (!restoring) saveOverviewSnapshot(readView(), win)
  }
  const savedView = initRecipeNavigation({ overviewUrl, readOverview: (recipe) => readView(recipe) })

  const syncLinks = () => {
    categoryLinks.forEach((link) => {
      const url = new URL(win.location.href)
      url.hash = link.dataset.categoryLink ?? ''
      link.href = url.href
    })
  }
  const writeUrl = (mode: 'push' | 'replace', hash = '') => {
    const url = new URL(win.location.href)
    url.searchParams.delete('q')
    url.searchParams.delete('tag')
    if (stateQuery) url.searchParams.set('q', stateQuery)
    activeTags.forEach((tag) => url.searchParams.append('tag', tag))
    url.hash = hash
    try {
      if (mode === 'push' && url.href !== win.location.href)
        win.history.pushState({ ...win.history.state }, '', url.href)
      else win.history.replaceState(win.history.state, '', url.href)
    } catch {
      /* Filtering remains usable without history. */
    }
    syncLinks()
    saveView()
  }
  const paintActiveFilters = () => {
    if (!activeFilterBar || !activeFilterChips) return
    activeFilterChips.innerHTML = ''
    const addChip = (label: string, remove: () => void) => {
      const button = doc.createElement('button')
      button.type = 'button'
      button.className =
        'focus-ring inline-flex shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-full bg-ink px-3 py-1 text-xs font-semibold text-paper'
      button.textContent = label + ' ×'
      button.setAttribute('aria-label', label + ' entfernen')
      button.addEventListener('click', () => {
        saveView()
        beginResultsChange()
        editingSearch = false
        remove()
        writeUrl('push')
        void updateFilteredResults()
        // Removing the focused chip must not lose keyboard focus to the body.
        const next = activeFilterChips.querySelector<HTMLButtonElement>('button')
        ;(next ?? input).focus({ preventScroll: true })
      })
      activeFilterChips.appendChild(button)
    }
    if (stateQuery)
      addChip('Suche: ' + stateQuery, () => {
        stateQuery = ''
        input.value = ''
      })
    activeTags.forEach((tag) => addChip(tag, () => activeTags.delete(tag)))
    activeFilterBar.hidden = !stateQuery && activeTags.size === 0
    updateAnchorOffset()
  }
  const updateFilteredResults = ({ scroll = true }: { scroll?: boolean } = {}) => {
    paintButtons()
    paintActiveFilters()
    if (stateQuery.trim().length >= 2) return runSearch(stateQuery.trim(), { scroll })
    showSections()
    if (scroll) scrollToResults()
    return undefined
  }
  const onQueryChange = () => {
    saveView()
    beginResultsChange()
    stateQuery = input.value
    writeUrl(editingSearch ? 'replace' : 'push')
    editingSearch = true
    paintActiveFilters()
    debounce = setTimeout(() => {
      debounce = undefined
      void updateFilteredResults()
    }, 180)
  }
  input.addEventListener('input', onQueryChange)
  input.addEventListener('blur', () => {
    editingSearch = false
  })
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      editingSearch = false
      clearTimeout(debounce)
      debounce = undefined
      void updateFilteredResults()
    }
  })
  const hashTarget = (): HTMLElement | null => {
    let id = ''
    try {
      id = decodeURIComponent(win.location.hash.slice(1))
    } catch {
      return null
    }
    if (!searchArea.hidden && searchGroups.has(id)) return searchGroups.get(id)!.section
    return doc.getElementById(id)
  }
  const scrollToHash = (focus = false) => {
    const target = hashTarget()
    if (!target?.getClientRects().length) return
    updateAnchorOffset()
    win.scrollTo({
      top: Math.max(0, win.scrollY + target.getBoundingClientRect().top - resultsOffset()),
      behavior: 'instant'
    })
    if (focus) {
      target.tabIndex = -1
      target.focus({ preventScroll: true })
    }
    scheduleCategoryUpdate()
  }
  categoryLinks.forEach((link) => {
    link.addEventListener('click', async (event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      event.preventDefault()
      saveView()
      editingSearch = false
      // Cancel an in-flight search's automatic scroll before navigating its groups.
      beginResultsChange()
      const token = restorationToken
      const pending = updateFilteredResults({ scroll: false })
      if (pending) {
        restoring = true
        await pending
        if (token !== restorationToken) return
        restoring = false
      }
      writeUrl('push', link.dataset.categoryLink)
      scrollToHash(event.detail === 0)
      saveView()
    })
  })
  tagButtons.forEach((button) => {
    button.addEventListener('click', () => {
      saveView()
      beginResultsChange()
      editingSearch = false
      const tag = button.dataset.filterTag
      if (!tag) return
      if (activeTags.has(tag)) activeTags.delete(tag)
      else activeTags.add(tag)
      writeUrl('push')
      return updateFilteredResults()
    })
  })
  wipToggle.addEventListener('change', () => {
    saveView()
    beginResultsChange()
    editingSearch = false
    showWip = wipToggle.checked
    try {
      persistence?.setItem(showWipPreferenceKey, String(showWip))
    } catch {
      /* In-memory preference still works. */
    }
    syncUntestedVisibility()
    // Preference-only changes need an entry too, even though the URL is identical.
    try {
      win.history.pushState({ ...win.history.state }, '', win.location.href)
    } catch {
      /* Optional history. */
    }
    saveView()
    return updateFilteredResults({ scroll: false })
  })
  resetButtons.forEach((button) =>
    button.addEventListener('click', () => {
      saveView()
      beginResultsChange()
      editingSearch = false
      activeTags.clear()
      stateQuery = ''
      input.value = ''
      writeUrl('push')
      void updateFilteredResults()
      input.focus({ preventScroll: true })
    })
  )

  const restoreView = async (snapshot?: OverviewSnapshot, traversal = false) => {
    cancelScrollSave()
    clearTimeout(debounce)
    debounce = undefined
    ++searchToken
    const token = ++restorationToken
    restoring = true
    editingSearch = false
    const url = new URL(win.location.href)
    stateQuery = url.searchParams.get('q') ?? ''
    input.value = stateQuery
    activeTags.clear()
    url.searchParams.getAll('tag').forEach((tag) => {
      if (tagButtons.some((button) => button.dataset.filterTag === tag)) activeTags.add(tag)
    })
    if (snapshot) showWip = snapshot.showWip
    originatingRecipe = snapshot?.recipe
    const anchor = hashTarget()
    if (!snapshot && anchor?.matches('[data-recipe]') && anchor.dataset.wip === 'true') showWip = true
    wipToggle.checked = showWip
    syncUntestedVisibility()
    syncLinks()
    const layout = Promise.resolve(updateFilteredResults({ scroll: false }))
    await afterPageLayout(layout, () => {
      if (token !== restorationToken) return
      updateAnchorOffset()
      if (snapshot) {
        win.scrollTo({ top: snapshot.scrollY, behavior: 'instant' })
        updateCurrentCategory()
        categoryNav.scrollLeft = snapshot.categoryScrollLeft
      } else if (win.location.hash) scrollToHash()
      else if (stateQuery || activeTags.size) scrollToResults()
      else if (traversal) win.scrollTo({ top: 0, behavior: 'instant' })
    })
    if (token !== restorationToken) return
    restoring = false
    saveView()
    updateCategoryOverflow()
  }
  const ready = restoreView(savedView)
  win.history.scrollRestoration = 'manual'
  win.addEventListener('popstate', () => {
    void restoreView(currentOverviewSnapshot(overviewUrl, win), true)
  })
  win.addEventListener('pageshow', (event) => {
    win.history.scrollRestoration = 'manual'
    if (event.persisted) void restoreView(currentOverviewSnapshot(overviewUrl, win), true)
  })
  win.addEventListener('pagehide', () => {
    cancelScrollSave()
    win.history.scrollRestoration = 'auto'
  })
  const scheduleSave = () => {
    if (restoring || scrollSaveTimer !== undefined) return
    // History writes count as navigations, even without a URL change. A frame
    // throttle can exceed Chromium's 200 writes / 10s limit while scrolling.
    // Sample the latest position twice a second; actions/departure save immediately.
    scrollSaveTimer = setTimeout(saveView, 500)
  }
  win.addEventListener('scroll', scheduleSave, { passive: true })
  categoryNav.addEventListener('scroll', scheduleSave, { passive: true })

  return { search: runSearch, activeFilters, ready }
}

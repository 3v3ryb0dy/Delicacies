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
import { afterPageLayout, initRecipeNavigation } from '../lib/recipe-navigation.ts'

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
  const resetButton = doc.querySelector<HTMLButtonElement>('[data-reset-filters]')
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
    ++searchToken
    if (win.location.hash) {
      history.replaceState(history.state, '', win.location.pathname + win.location.search)
    }
  }

  const resultsOffset = () => {
    const stickyTop = parseFloat(computedStyle(stickyBar).top) || 0
    return stickyTop + stickyBar.getBoundingClientRect().height + 16
  }

  // Native category links use the same measured clearance as filtering.
  // Scroll padding and scroll margin add together, so subtract the global padding.
  const updateAnchorOffset = () => {
    const padding = parseFloat(computedStyle(doc.documentElement).scrollPaddingTop) || 0
    root.style.setProperty('--recipe-anchor-margin', resultsOffset() - padding + 'px')
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
  let currentCategory: string | undefined
  let categoryFrame = 0

  const updateCurrentCategory = () => {
    categoryFrame = 0
    const offset = resultsOffset()
    const listBounds = cardList.getBoundingClientRect()
    let current = ''
    let currentTop = -Infinity
    if (!cardList.hidden && listBounds.bottom > offset) {
      for (const section of categoryTargets) {
        if (!section.getClientRects().length) continue
        const top = section.getBoundingClientRect().top
        if (top > offset + 1) continue
        // Empty categories can share a row; retain the linked destination there.
        if (top > currentTop || (top === currentTop && win.location.hash === '#' + section.id)) {
          current = section.id
          currentTop = top
        }
      }
    }
    if (current === currentCategory) return
    currentCategory = current
    categoryLinks.forEach((link) => {
      const isActive = link.dataset.categoryLink === current
      link.className = chipBase + ' ' + (isActive ? chipActive : chipIdle)
      if (isActive) link.setAttribute('aria-current', 'location')
      else link.removeAttribute('aria-current')
      if (isActive) {
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

    // Categories containing only untested recipes become available with the switch.
    categoryLinks.forEach((link) => {
      const categoryCards = cards.filter((card) => card.dataset.category === link.dataset.categoryLink)
      link.hidden = categoryCards.length > 0 && !categoryCards.some((card) => showWip || card.dataset.wip !== 'true')
    })

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
    searchList.appendChild(item)
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

    hits.slice(0, 40).forEach((entry) => {
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
    scheduleCategoryUpdate()

    if (!pagefind && !pagefindFailed) {
      pagefind = pagefindUrl ? await loadPagefind(pagefindUrl) : null
      if (!pagefind) pagefindFailed = true
      if (token !== searchToken) return
    }

    if (!pagefind) {
      runLocalSearch(query)
      if (scroll) scrollToResults()
      return
    }

    const filters = activeFilters()
    let results: PagefindResultData[]
    try {
      const search = await pagefind.search(query, Object.keys(filters).length ? { filters } : undefined)
      if (token !== searchToken) return
      results = await Promise.all(search.results.slice(0, 40).map((result) => result.data()))
    } catch {
      if (token !== searchToken) return
      pagefindFailed = true
      pagefind = null
      runLocalSearch(query)
      if (scroll) scrollToResults()
      return
    }
    if (token !== searchToken) return

    if (results.length === 0) {
      searchEmpty.hidden = false
      status.textContent = 'Keine Treffer'
      if (scroll) scrollToResults()
      return
    }

    results.forEach((result) => {
      const url = resolveResultUrl(result.url)
      const meta = result.meta?.category ?? ''
      // Pagefind highlights matches, so its excerpt markup is inserted as is.
      appendResult(url, result.meta?.title ?? 'Rezept', meta, result.excerpt)
    })

    status.textContent = results.length === 1 ? '1 Treffer' : results.length + ' Treffer'
    if (scroll) scrollToResults()
  }

  const onQueryChange = () => {
    beginResultsChange()
    const query = input.value.trim()
    if (query.length < 2) {
      showSections()
      scrollToResults()
      return
    }
    debounce = setTimeout(() => void runSearch(query), 180)
  }

  input.addEventListener('input', onQueryChange)

  const updateFilteredResults = ({ scroll = true }: { scroll?: boolean } = {}) => {
    paintButtons()
    if (input.value.trim().length >= 2) return runSearch(input.value.trim(), { scroll })
    showSections()
    if (scroll) scrollToResults()
    return undefined
  }

  categoryLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      // Reveal the destination before the browser performs its native fragment jump.
      clearTimeout(debounce)
      ++searchToken
      input.value = ''
      activeTags.clear()
      paintButtons()
      showSections()
      updateAnchorOffset()
      scheduleCategoryUpdate()
    })
  })

  tagButtons.forEach((button) => {
    button.addEventListener('click', () => {
      beginResultsChange()
      const tag = button.dataset.filterTag
      if (!tag) return
      if (activeTags.has(tag)) activeTags.delete(tag)
      else activeTags.add(tag)
      return updateFilteredResults()
    })
  })

  wipToggle.addEventListener('change', () => {
    beginResultsChange()
    showWip = wipToggle.checked
    try {
      persistence?.setItem(showWipPreferenceKey, String(showWip))
    } catch {
      // Keep the in-memory preference even when persistence is blocked.
    }
    syncUntestedVisibility()
    // This preference updates the current view without jumping back to its start.
    return updateFilteredResults({ scroll: false })
  })

  let originatingRecipe = ''
  const savedView = initRecipeNavigation({
    overviewUrl: new URL(basePath, win.location.href).href,
    readOverview: (recipe) => {
      if (recipe) originatingRecipe = recipe
      if (!originatingRecipe) return undefined
      return {
        url: win.location.href,
        query: input.value,
        tags: Array.from(activeTags),
        showWip,
        scrollY: win.scrollY,
        categoryScrollLeft: categoryNav.scrollLeft,
        recipe: originatingRecipe
      }
    }
  })
  const restoredView =
    savedView && cards.some((card) => card.dataset.recipeId === savedView.recipe) ? savedView : undefined
  const initialHash = win.location.hash
  let anchorTarget: HTMLElement | null = null
  try {
    anchorTarget = doc.getElementById(decodeURIComponent(initialHash.slice(1)))
  } catch {
    // An invalid fragment should not prevent searching or browsing.
  }
  const navigation = win.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
  let ready = Promise.resolve()

  if (restoredView) {
    originatingRecipe = restoredView.recipe
    input.value = restoredView.query
    restoredView.tags.forEach((tag) => {
      if (tagButtons.some((button) => button.dataset.filterTag === tag)) activeTags.add(tag)
    })
    showWip = restoredView.showWip
    wipToggle.checked = showWip
    syncUntestedVisibility()
    try {
      win.history.replaceState(win.history.state, '', restoredView.url)
    } catch {
      // Restoration still works when the URL cannot be updated.
    }
    ready = afterPageLayout(Promise.resolve(updateFilteredResults({ scroll: false })), () => {
      updateAnchorOffset()
      win.scrollTo({ top: restoredView.scrollY, behavior: 'instant' })
      updateCurrentCategory()
      categoryNav.scrollLeft = restoredView.categoryScrollLeft
    })
  } else {
    // Direct links to untested cards must reveal their destination for this visit,
    // without changing the visitor's stored Versuchsküche preference.
    if (anchorTarget?.matches('[data-recipe]') && anchorTarget.dataset.wip === 'true') {
      showWip = true
      wipToggle.checked = true
      syncUntestedVisibility()
    }
    applyFilters()
    if (initialHash && navigation?.type !== 'back_forward') {
      ready = afterPageLayout(Promise.resolve(), () => {
        if (win.location.hash !== initialHash) return
        if (
          !anchorTarget?.matches('[data-recipe], [data-category-section], [data-empty-category], #noch-leer') ||
          !anchorTarget.getClientRects().length
        )
          return
        updateAnchorOffset()
        win.scrollTo({
          top: Math.max(0, win.scrollY + anchorTarget.getBoundingClientRect().top - resultsOffset()),
          behavior: 'instant'
        })
        updateCurrentCategory()
      })
    }
  }

  resetButton?.addEventListener('click', () => {
    beginResultsChange()
    activeTags.clear()
    return updateFilteredResults()
  })

  return { search: runSearch, activeFilters, ready }
}

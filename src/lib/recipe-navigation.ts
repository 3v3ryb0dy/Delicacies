/** A list view belongs to a history entry, even before any recipe is opened. */
export type OverviewSnapshot = {
  url: string
  query: string
  tags: string[]
  showWip: boolean
  scrollY: number
  categoryScrollLeft: number
  recipe?: string
}

const stateKey = 'delicaciesNavigation'
const handoffKey = 'delicacies.navigationHandoff'
const version = 2

type NavigationState = {
  version: number
  previous?: string
  overview?: OverviewSnapshot
}
type Handoff = { version: number; from: string; to: string; created: number }

export function readOverviewSnapshot(value: unknown, overviewUrl: string): OverviewSnapshot | undefined {
  if (!value || typeof value !== 'object') return
  const snapshot = value as OverviewSnapshot
  try {
    const expected = new URL(overviewUrl)
    const url = new URL(snapshot.url)
    if (url.origin !== expected.origin || url.pathname !== expected.pathname) return
  } catch {
    return
  }
  if (
    typeof snapshot.query !== 'string' ||
    !Array.isArray(snapshot.tags) ||
    !snapshot.tags.every((tag) => typeof tag === 'string') ||
    typeof snapshot.showWip !== 'boolean' ||
    !Number.isFinite(snapshot.scrollY) ||
    snapshot.scrollY < 0 ||
    !Number.isFinite(snapshot.categoryScrollLeft) ||
    snapshot.categoryScrollLeft < 0 ||
    (snapshot.recipe !== undefined && (typeof snapshot.recipe !== 'string' || !/^[a-z0-9-]+$/.test(snapshot.recipe)))
  )
    return
  return snapshot
}

export function saveOverviewSnapshot(snapshot: OverviewSnapshot, win: Window = window): void {
  try {
    win.history.replaceState(
      {
        ...win.history.state,
        [stateKey]: {
          ...win.history.state?.[stateKey],
          version,
          overview: snapshot
        }
      },
      ''
    )
  } catch {
    // URL navigation and native anchors still work without writable history.
  }
}

export function currentOverviewSnapshot(overviewUrl: string, win: Window = window): OverviewSnapshot | undefined {
  const entry = win.history.state?.[stateKey] as NavigationState | undefined
  if (entry?.version !== version) return
  const snapshot = readOverviewSnapshot(entry.overview, overviewUrl)
  return snapshot?.url === win.location.href ? snapshot : undefined
}

export function isSameTabActivation(event: MouseEvent, link: HTMLAnchorElement): boolean {
  return (
    !event.defaultPrevented &&
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey &&
    (!link.target || link.target === '_self') &&
    !link.hasAttribute('download')
  )
}

/** Prove a same-tab navigation with a one-use handoff committed only on departure.
 * Referrer or history.length alone cannot distinguish a direct/new-tab visit.
 */
export function initRecipeNavigation({
  overviewUrl,
  readOverview
}: {
  overviewUrl: string
  readOverview?: (recipe?: string) => OverviewSnapshot | undefined
}): OverviewSnapshot | undefined {
  const win = window
  const doc = document
  const overview = new URL(overviewUrl, win.location.href)
  const inSite = (value: string) => {
    try {
      const url = new URL(value)
      return url.origin === overview.origin && url.pathname.startsWith(overview.pathname)
    } catch {
      return false
    }
  }
  if (!readOverview) win.history.scrollRestoration = 'auto'
  const navigationType = (win.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined)
    ?.type
  let entry: NavigationState = { version }
  if (navigationType === 'reload' || navigationType === 'back_forward') {
    const saved = win.history.state?.[stateKey] as NavigationState | undefined
    if (saved?.version === version) entry = saved
  }
  let outgoing: Handoff | undefined
  try {
    const raw = win.sessionStorage.getItem(handoffKey)
    win.sessionStorage.removeItem(handoffKey)
    if (raw && navigationType === 'navigate') {
      const pending = JSON.parse(raw) as Handoff
      if (
        pending.version === version &&
        pending.to === win.location.href &&
        pending.from === doc.referrer &&
        inSite(pending.from) &&
        Date.now() - pending.created >= 0 &&
        Date.now() - pending.created < 30_000
      ) {
        entry.previous = pending.from
      }
    }
  } catch {
    /* Direct visitors retain a real overview link. */
  }
  try {
    win.history.replaceState({ ...win.history.state, [stateKey]: entry }, '')
  } catch {
    /* History may be unavailable. */
  }

  const canGoBack = () => {
    const previous = (win.history.state?.[stateKey] as NavigationState | undefined)?.previous
    return typeof previous === 'string' && inSite(previous)
  }
  const paintBack = () => {
    doc.querySelectorAll<HTMLElement>('[data-recipe-back-label]').forEach((label) => {
      label.textContent = canGoBack() ? 'Zurück' : 'Zur Übersicht'
    })
  }
  paintBack()
  doc.addEventListener('click', (event) => {
    const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null
    if (!link || !isSameTabActivation(event, link)) return
    outgoing = undefined
    if (link.hasAttribute('data-recipe-back') && canGoBack()) {
      event.preventDefault()
      win.history.back()
      return
    }
    const destination = new URL(link.href, win.location.href)
    const source = new URL(win.location.href)
    if (!inSite(destination.href) || (destination.pathname === source.pathname && destination.search === source.search))
      return
    const recipePrefix = overview.pathname + 'rezept/'
    const recipe = destination.pathname.startsWith(recipePrefix)
      ? destination.pathname.slice(recipePrefix.length).replace(/\/$/, '')
      : undefined
    const snapshot = readOverview?.(recipe)
    if (snapshot) saveOverviewSnapshot(snapshot, win)
    outgoing = { version, from: source.href.split('#')[0], to: destination.href, created: Date.now() }
  })
  win.addEventListener('pagehide', () => {
    const snapshot = readOverview?.()
    if (snapshot) saveOverviewSnapshot(snapshot, win)
    try {
      win.sessionStorage.removeItem(handoffKey)
      if (outgoing) win.sessionStorage.setItem(handoffKey, JSON.stringify({ ...outgoing, created: Date.now() }))
    } catch {
      /* No handoff means a safe overview fallback. */
    }
    outgoing = undefined
  })
  win.addEventListener('pageshow', () => {
    outgoing = undefined
    paintBack()
  })
  win.addEventListener('popstate', paintBack)
  return currentOverviewSnapshot(overview.href, win)
}

/** Run one layout correction; never fight scrolling, interaction or a page departure. */
export async function afterPageLayout(ready: Promise<unknown>, apply: () => void): Promise<void> {
  const win = window
  const doc = document
  const cancellation = new AbortController()
  let interrupted = false
  const cancel = () => {
    interrupted = true
  }
  for (const event of ['wheel', 'touchstart', 'pointerdown', 'keydown', 'pagehide']) {
    win.addEventListener(event, cancel, { passive: true, signal: cancellation.signal })
  }
  try {
    await Promise.all([
      ready,
      doc.fonts.ready,
      doc.readyState === 'complete'
        ? Promise.resolve()
        : new Promise((resolve) => win.addEventListener('load', resolve, { once: true }))
    ])
    await new Promise<void>((resolve) => win.requestAnimationFrame(() => resolve()))
    if (!interrupted) apply()
  } finally {
    cancellation.abort()
  }
}

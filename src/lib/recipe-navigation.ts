/** A list view belongs to a history entry, not to the last recipe visited in a tab. */
export type OverviewSnapshot = {
  url: string
  query: string
  tags: string[]
  showWip: boolean
  scrollY: number
  categoryScrollLeft: number
  recipe: string
}

const stateKey = 'delicaciesNavigation'
const handoffKey = 'delicacies.navigationHandoff'
const version = 1

type NavigationState = {
  version: number
  overview?: OverviewSnapshot
  returnTo?: OverviewSnapshot
}

type Handoff = {
  version: number
  from: string
  to: string
  kind: 'overview' | 'recipe'
  created: number
  snapshot: OverviewSnapshot
}

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
    typeof snapshot.recipe !== 'string' ||
    !/^[a-z0-9-]+$/.test(snapshot.recipe)
  )
    return
  return snapshot
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
  const recipePrefix = overview.pathname + 'rezept/'
  const navigationType = (win.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined)
    ?.type
  const kind = readOverview ? 'overview' : 'recipe'
  const field = readOverview ? 'overview' : 'returnTo'
  let outgoing: Handoff | undefined

  const save = (snapshot: OverviewSnapshot) => {
    try {
      const state = win.history.state
      win.history.replaceState({ ...state, [stateKey]: { version, [field]: snapshot } }, '')
    } catch {
      // A real anchor remains usable when history or storage is unavailable.
    }
  }

  let restored: OverviewSnapshot | undefined
  try {
    const entry = win.history.state?.[stateKey] as NavigationState | undefined
    if (entry?.version === version && (navigationType === 'reload' || navigationType === 'back_forward')) {
      restored = readOverviewSnapshot(entry[field], overview.href)
    }
    // Consume once, even when stale or intended for another destination.
    const raw = win.sessionStorage.getItem(handoffKey)
    win.sessionStorage.removeItem(handoffKey)
    if (raw && navigationType === 'navigate') {
      const pending = JSON.parse(raw) as Handoff
      if (
        pending.version === version &&
        pending.kind === kind &&
        pending.to === win.location.href &&
        pending.from === doc.referrer &&
        Date.now() - pending.created >= 0 &&
        Date.now() - pending.created < 30_000
      ) {
        restored = readOverviewSnapshot(pending.snapshot, overview.href)
      }
    }
  } catch {
    // Malformed data and denied storage must not break navigation.
  }
  if (restored) save(restored)

  doc.addEventListener('click', (event) => {
    const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null
    if (!link || !isSameTabActivation(event, link)) return
    outgoing = undefined
    const destination = new URL(link.href, win.location.href)
    if (destination.origin !== overview.origin) return
    let snapshot: OverviewSnapshot | undefined
    let destinationKind: Handoff['kind']
    if (link.hasAttribute('data-recipe-back') && destination.pathname === overview.pathname) {
      snapshot = restored
      destinationKind = 'overview'
    } else if (destination.pathname.startsWith(recipePrefix)) {
      const recipe = destination.pathname.slice(recipePrefix.length).replace(/\/$/, '')
      if (!/^[a-z0-9-]+$/.test(recipe)) return
      snapshot = readOverview ? readOverview(recipe) : restored
      destinationKind = 'recipe'
    } else return
    if (!snapshot) return
    save(snapshot)
    outgoing = {
      version,
      from: win.location.href.split('#')[0],
      to: destination.href,
      kind: destinationKind,
      created: Date.now(),
      snapshot
    }
  })

  win.addEventListener('pagehide', () => {
    const snapshot = readOverview?.()
    if (snapshot) save(snapshot)
    // Commit only when this document actually leaves. Modified/new-tab clicks
    // never create a handoff that could be copied into a new tab's storage.
    try {
      win.sessionStorage.removeItem(handoffKey)
      if (outgoing) {
        win.sessionStorage.setItem(
          handoffKey,
          JSON.stringify({ ...outgoing, snapshot: snapshot ?? outgoing.snapshot, created: Date.now() })
        )
      }
    } catch {
      // The destination will use its recipe-card anchor instead.
    }
    outgoing = undefined
  })
  win.addEventListener('pageshow', () => {
    outgoing = undefined
  })
  return restored
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

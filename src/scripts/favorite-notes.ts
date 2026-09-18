import {
  defaultFavoriteSymbols,
  estimateFavoriteTextWidth,
  favoriteTokens,
  layoutFavoriteNote,
  nextFavoriteTextIndex
} from '../lib/favorite-note'

const typographyProperties = [
  'font-family',
  'font-size',
  'font-style',
  'font-weight',
  'font-stretch',
  'font-variant',
  'font-feature-settings',
  'font-variation-settings',
  'font-kerning',
  'letter-spacing',
  'word-spacing',
  'text-transform',
  'text-rendering'
] as const

type NoteTypography = { font: string; properties: [string, string][] }

function measureNoteLayout(text: string | undefined, typography?: NoteTypography) {
  const tokens = favoriteTokens(text)
  if (!typography) return layoutFavoriteNote(tokens)

  // A connected probe also works for filtered-out cards and detached variants.
  // Measure in SVG units, independent of the note's responsive scale or rotation.
  const probe = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  const word = document.createElementNS('http://www.w3.org/2000/svg', 'text')
  probe.setAttribute('aria-hidden', 'true')
  probe.setAttribute('focusable', 'false')
  probe.style.cssText =
    'position: fixed; top: 0; left: 0; width: 1px; height: 1px; visibility: hidden; pointer-events: none'
  typography.properties.forEach(([property, value]) => word.style.setProperty(property, value))
  probe.appendChild(word)
  document.body.appendChild(probe)
  try {
    return layoutFavoriteNote(tokens, (text) => {
      word.textContent = text
      try {
        const width = word.getComputedTextLength()
        if (Number.isFinite(width) && width > 0) return width
      } catch {
        // Keep the server estimate when SVG measurement is unavailable.
      }
      return estimateFavoriteTextWidth(text)
    })
  } finally {
    probe.remove()
  }
}

/** Load the rendered font, then fit each selected note; SVG scaling handles resizes. */
export async function sizeFavoriteNotes() {
  const notes = document.querySelectorAll<HTMLElement>('[data-favorite-note]')
  if (!notes.length) return
  const typographyByNote = new Map<HTMLElement, NoteTypography>()
  notes.forEach((note) => {
    const word = note.querySelector<SVGTextElement>('[data-note-canvas] .note-word')
    if (!word) return
    const style = getComputedStyle(word)
    typographyByNote.set(note, {
      font: `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`,
      properties: typographyProperties.map((property) => [property, style.getPropertyValue(property)])
    })
  })
  await Promise.all(
    [...new Set([...typographyByNote.values()].map(({ font }) => font))].map(async (font) => {
      try {
        await document.fonts.load(font)
      } catch {
        // The SVG probe uses the same fallback font as the visible note.
      }
    })
  )
  const measureCanvas = (canvas: SVGSVGElement, typography: NoteTypography | undefined, text?: string) => {
    const layout = measureNoteLayout(text, typography)
    canvas.dataset.noteWidth = String(layout.width)
    canvas.setAttribute('viewBox', `0 0 ${layout.width} ${layout.height}`)
    canvas.querySelectorAll('[data-note-stripe]').forEach((stripe, index) => {
      stripe.setAttribute('d', layout.stripes[index].d)
      stripe.setAttribute('transform', `translate(${layout.stripes[index].x} 0)`)
    })
    canvas.querySelectorAll<SVGElement>('[data-note-token]').forEach((token, index) => {
      const position = layout.positions[index]
      token.setAttribute('transform', `translate(${position.x} ${position.y})`)
      token.style.setProperty('--write-delay', `${position.delay}ms`)
      token.style.setProperty('--write-duration', `${position.duration}ms`)
    })
  }
  const hoverMedia = window.matchMedia('(hover: hover) and (pointer: fine)')
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const cards = new Map<Element, { setVisible: (visible: boolean) => void; syncInput: () => void }>()
  notes.forEach((note) => {
    const canvas = note.querySelector<SVGSVGElement>('[data-note-canvas]')
    if (!canvas) return
    const typography = typographyByNote.get(note)
    measureCanvas(canvas, typography, note.dataset.noteText)
    note.style.setProperty('--note-width', canvas.dataset.noteWidth!)

    // Custom text stays fixed. Inert templates retain Astro's SVG styles and masks.
    const variants = [...note.querySelectorAll<HTMLTemplateElement>('[data-note-variant]')]
    const doodles = [...note.querySelectorAll<HTMLTemplateElement>('[data-note-doodle]')]
    const card = note.closest<HTMLElement>('[data-recipe]')
    const link = card?.querySelector<HTMLAnchorElement>(':scope > a')
    if (!card || !link) return

    let previous: number | undefined
    let hovered = false
    let focused = false
    let visible = false
    let active = false
    let fadeTimeout: number | undefined
    const fadeDuration = parseFloat(getComputedStyle(note).getPropertyValue('--note-fade-duration'))
    const finishFade = () => {
      if (active) return
      window.clearTimeout(fadeTimeout)
      card.removeAttribute('data-favorite-writing')
      card.removeAttribute('data-favorite-fading')
    }
    note.addEventListener('transitionend', (event) => {
      if (event.target === note && event.propertyName === 'opacity') finishFade()
    })
    const update = () => {
      const scrollActive = !hoverMedia.matches && visible
      const nextActive = hovered || focused || scrollActive
      const resuming = card.hasAttribute('data-favorite-writing')
      if (nextActive && !active && !resuming && variants.length && doodles.length) {
        previous = nextFavoriteTextIndex(previous)
        const symbolIndex = Math.floor(Math.random() * defaultFavoriteSymbols.length)
        const template = variants[previous]
        const variant = template.content.querySelector<SVGSVGElement>('[data-note-canvas]')!
        const replacement = variant.cloneNode(true) as SVGSVGElement
        // The default phrase's final token is its doodle. Store each drawing only
        // once per card instead of duplicating all phrase/doodle combinations.
        const tokens = replacement.querySelectorAll('[data-note-token]')
        tokens[tokens.length - 1].replaceChildren(doodles[symbolIndex].content.cloneNode(true))
        measureCanvas(replacement, typography, `${template.dataset.noteText} ${defaultFavoriteSymbols[symbolIndex]}`)
        note.style.setProperty('--note-width', replacement.dataset.noteWidth!)
        // New nodes restart both writing animations for the selected phrase.
        note.querySelector('[data-note-canvas]')!.replaceWith(replacement)
      }
      if (nextActive) {
        window.clearTimeout(fadeTimeout)
        card.setAttribute('data-favorite-writing', '')
        card.removeAttribute('data-favorite-fading')
      } else if (active) {
        // Freeze the ink while the whole note fades. Re-entry resumes the same
        // drawing; a completed fade resets it for the next activation.
        card.setAttribute('data-favorite-fading', '')
        // Hidden cards may never emit transitionend.
        fadeTimeout = window.setTimeout(finishFade, fadeDuration + 50)
      }
      card.toggleAttribute('data-favorite-visible', scrollActive)
      active = nextActive
      if (!active && reducedMotion.matches) finishFade()
    }
    cards.set(card, {
      setVisible: (nextVisible) => {
        visible = nextVisible
        update()
      },
      syncInput: () => {
        hovered = hoverMedia.matches && card.matches(':hover')
        update()
      }
    })
    card.addEventListener('pointerenter', () => {
      hovered = hoverMedia.matches
      update()
    })
    card.addEventListener('pointerleave', () => {
      hovered = false
      update()
    })
    link.addEventListener('focus', () => {
      focused = link.matches(':focus-visible')
      update()
    })
    link.addEventListener('blur', () => {
      focused = false
      update()
    })
  })

  if (!cards.size) return
  let observer: IntersectionObserver
  const observeScrollThreshold = () => {
    observer?.disconnect()
    // Use pixels: percentage root margins are relative to viewport width.
    const bottomMargin = (document.documentElement.clientHeight * 3) / 5
    // Activate while the card overlaps the upper two-fifths of the viewport.
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => cards.get(entry.target)?.setVisible(entry.isIntersecting))
      },
      { rootMargin: `0px 0px -${bottomMargin}px 0px` }
    )
    cards.forEach((_, card) => observer.observe(card))
  }
  observeScrollThreshold()
  window.addEventListener('resize', observeScrollThreshold)
  hoverMedia.addEventListener('change', () => cards.forEach((card) => card.syncInput()))
}

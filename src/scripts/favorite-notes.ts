import { defaultFavoriteSymbols, favoriteTokens, layoutFavoriteNote, nextFavoriteTextIndex } from '../lib/favorite-note'

/** Load Caveat once, then fit each selected note; SVG scaling handles resizes. */
export async function sizeFavoriteNotes() {
  const notes = document.querySelectorAll<HTMLElement>('[data-favorite-note]')
  if (!notes.length) return
  try {
    await document.fonts.load('600 30px Caveat')
  } catch {
    // If the font is unavailable, measure the same cursive fallback as the CSS.
  }
  const context = document.createElement('canvas').getContext('2d')
  if (!context) return
  context.font = '600 30px Caveat, cursive'
  const measureCanvas = (canvas: SVGSVGElement, text?: string) => {
    const tokens = favoriteTokens(text)
    const layout = layoutFavoriteNote(tokens, (text) => context.measureText(text).width)
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
  notes.forEach((note) => {
    const canvas = note.querySelector<SVGSVGElement>('[data-note-canvas]')
    if (!canvas) return
    measureCanvas(canvas, note.dataset.noteText)
    note.style.setProperty('--note-width', canvas.dataset.noteWidth!)

    // Custom text stays fixed. Inert templates retain Astro's SVG styles and masks.
    const variants = [...note.querySelectorAll<HTMLTemplateElement>('[data-note-variant]')]
    const doodles = [...note.querySelectorAll<HTMLTemplateElement>('[data-note-doodle]')]
    const card = note.closest<HTMLElement>('[data-recipe]')
    const link = card?.querySelector<HTMLAnchorElement>(':scope > a')
    if (!variants.length || !doodles.length || !card || !link) return

    let previous: number | undefined
    let hovered = false
    let focused = false
    let active = false
    const update = () => {
      const nextActive = hovered || focused
      if (nextActive && !active) {
        previous = nextFavoriteTextIndex(previous)
        const symbolIndex = Math.floor(Math.random() * defaultFavoriteSymbols.length)
        const template = variants[previous]
        const variant = template.content.querySelector<SVGSVGElement>('[data-note-canvas]')!
        const replacement = variant.cloneNode(true) as SVGSVGElement
        // The default phrase's final token is its doodle. Store each drawing only
        // once per card instead of duplicating all phrase/doodle combinations.
        const tokens = replacement.querySelectorAll('[data-note-token]')
        tokens[tokens.length - 1].replaceChildren(doodles[symbolIndex].content.cloneNode(true))
        measureCanvas(replacement, `${template.dataset.noteText} ${defaultFavoriteSymbols[symbolIndex]}`)
        note.style.setProperty('--note-width', replacement.dataset.noteWidth!)
        // New nodes restart both writing animations for the selected phrase.
        note.querySelector('[data-note-canvas]')!.replaceWith(replacement)
      }
      active = nextActive
    }
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
}

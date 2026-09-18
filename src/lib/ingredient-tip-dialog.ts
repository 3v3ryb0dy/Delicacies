type Rect = { left: number; top: number; right: number; bottom: number }
type Size = { width: number; height: number }

/** Prefer below the ingredient, then above; clamp even when neither side fits. */
export function ingredientTipPosition(anchor: Rect, card: Size, viewport: Size & { left?: number; top?: number }) {
  const margin = 12
  const gap = 8
  const minLeft = (viewport.left ?? 0) + margin
  const minTop = (viewport.top ?? 0) + margin
  const maxLeft = Math.max(minLeft, minLeft + viewport.width - 2 * margin - card.width)
  const maxTop = Math.max(minTop, minTop + viewport.height - 2 * margin - card.height)
  const preferredTop = anchor.bottom + gap <= maxTop ? anchor.bottom + gap : anchor.top - gap - card.height
  return {
    left: Math.min(maxLeft, Math.max(minLeft, anchor.left)),
    top: Math.min(maxTop, Math.max(minTop, preferredTop))
  }
}

/** Progressive enhancement: keep native details usable until the dialog is ready. */
export function initIngredientTipDialog(root: Document) {
  const dialog = root.querySelector<HTMLDialogElement>('[data-ingredient-tip-dialog]')
  const closeButton = dialog?.querySelector<HTMLButtonElement>('[data-ingredient-tip-close]')
  const content = dialog?.querySelector<HTMLElement>('[data-ingredient-tip-dialog-content]')
  const subtitle = dialog?.querySelector<HTMLElement>('[data-ingredient-tip-subtitle]')
  const view = root.defaultView
  if (!dialog || typeof dialog.showModal !== 'function' || !closeButton || !content || !subtitle || !view) return
  if (dialog.dataset.enhanced) return
  dialog.dataset.enhanced = 'true'

  let trigger: HTMLButtonElement | undefined
  let frame = 0
  let outsidePointerDown = false

  const position = () => {
    if (!dialog.open || !trigger) return
    const viewport = view.visualViewport
    const point = ingredientTipPosition(trigger.getBoundingClientRect(), dialog.getBoundingClientRect(), {
      width: viewport?.width ?? view.innerWidth,
      height: viewport?.height ?? view.innerHeight,
      left: viewport?.offsetLeft ?? 0,
      top: viewport?.offsetTop ?? 0
    })
    dialog.style.setProperty('--tip-left', `${point.left}px`)
    dialog.style.setProperty('--tip-top', `${point.top}px`)
  }
  const schedulePosition = () => {
    view.cancelAnimationFrame(frame)
    if (dialog.open) frame = view.requestAnimationFrame(position)
  }
  const reset = () => {
    view.cancelAnimationFrame(frame)
    delete root.documentElement.dataset.ingredientTipOpen
    trigger?.focus({ preventScroll: true })
    trigger = undefined
    content.replaceChildren()
  }
  const close = () => {
    dialog.close()
    reset()
  }
  const outside = (event: MouseEvent) => {
    const rect = dialog.getBoundingClientRect()
    return (
      event.target === dialog &&
      (event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom)
    )
  }

  closeButton.addEventListener('click', close)
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault()
    close()
  })
  // The guide contains plain text. Cycle between its scrollable region and
  // close control instead of allowing Tab to leave for the browser chrome.
  dialog.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return
    if (event.shiftKey && root.activeElement === closeButton) {
      event.preventDefault()
      content.focus({ preventScroll: true })
    } else if (!event.shiftKey && root.activeElement === content) {
      event.preventDefault()
      closeButton.focus({ preventScroll: true })
    }
  })
  dialog.addEventListener('pointerdown', (event) => {
    outsidePointerDown = outside(event)
  })
  dialog.addEventListener('click', (event) => {
    if (outsidePointerDown && outside(event)) close()
    outsidePointerDown = false
  })
  dialog.addEventListener('close', () => {
    // The native close event is queued. An immediate reopen must keep its
    // new content and focus even if the preceding close event arrives late.
    if (!dialog.open) reset()
  })
  view.addEventListener('resize', schedulePosition)
  view.addEventListener('scroll', schedulePosition)
  view.visualViewport?.addEventListener('resize', schedulePosition)
  view.visualViewport?.addEventListener('scroll', schedulePosition)
  // A restored history entry should never retain an open sheet or a scroll lock.
  view.addEventListener('pagehide', () => {
    if (dialog.open) close()
  })

  root.querySelectorAll<HTMLButtonElement>('[data-ingredient-tip-trigger]').forEach((button) => {
    const fallback = button.closest('[data-ingredient-tip-control]')?.nextElementSibling
    const source = fallback?.querySelector<HTMLElement>('[data-ingredient-tip-content]')
    if (!(fallback instanceof HTMLElement) || !source) return
    button.addEventListener('click', () => {
      trigger = button
      subtitle.textContent = button.dataset.ingredient ?? ''
      content.replaceChildren(...Array.from(source.childNodes, (node) => node.cloneNode(true)))
      dialog.showModal()
      root.documentElement.dataset.ingredientTipOpen = 'true'
      content.scrollTop = 0
      position()
      closeButton.focus({ preventScroll: true })
    })
    fallback.hidden = true
    button.hidden = false
  })
}

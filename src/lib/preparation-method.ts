/** Enhance the two complete, server-rendered methods without persisting a preference. */
export function initPreparationMethods(root: ParentNode) {
  const selector = root.querySelector<HTMLElement>('[data-method-selector]')
  const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-method-button]'))
  const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-method-panel]'))
  if (!selector || buttons.length !== 2 || panels.length !== 2) return () => {}

  const select = (method: string) => {
    panels.forEach((panel) => {
      panel.hidden = panel.dataset.methodPanel !== method
    })
    buttons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.methodButton === method))
    })
  }
  buttons.forEach((button) => button.addEventListener('click', () => select(button.dataset.methodButton!)))
  const reset = () => select('normal')
  reset()
  panels.forEach((panel) => {
    panel.dataset.methodEnhanced = 'true'
  })
  selector.hidden = false
  return reset
}

import { showWipPreferenceKey, untestedHiddenAttribute } from '../config/preferences.ts'

// Render enough candidates to fill three suggestions for either preference.
const updateRelated = () => {
  let showWip = false
  try {
    showWip = localStorage.getItem(showWipPreferenceKey) === 'true'
  } catch {
    /* Default to tested recipes. */
  }
  if (showWip) document.documentElement.removeAttribute(untestedHiddenAttribute)
  else document.documentElement.setAttribute(untestedHiddenAttribute, '')
  let visible = 0
  document.querySelectorAll<HTMLElement>('[data-related-recipe]').forEach((item) => {
    item.hidden = (!showWip && item.hasAttribute('data-untested')) || visible >= 3
    if (!item.hidden) visible++
  })
  const section = document.querySelector<HTMLElement>('[data-related-recipes]')
  if (section) section.hidden = visible === 0
}
updateRelated()
window.addEventListener('pageshow', updateRelated)
window.addEventListener('storage', updateRelated)

/**
 * Browser preferences. Shared by the explorer (which reads and writes them) and
 * the layout (which applies the default before the first paint, so untested
 * recipes never flash in and out).
 */
export const showWipPreferenceKey = 'delicacies.showWip'

/** Marks the document while untested recipes are hidden by default. */
export const untestedHiddenAttribute = 'data-untested-hidden'

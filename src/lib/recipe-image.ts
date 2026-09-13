const photoExtensions = ['webp', 'png', 'jpg', 'jpeg']

/** Prefer an exact filename, then accept another photo format with the same stem. */
export function resolveRecipeImage<T>(reference: string, images: Record<string, T>): T | undefined {
  const normalized = reference.replace(/^\.\//, '')
  if (Object.hasOwn(images, normalized)) return images[normalized]

  const stem = normalized.replace(/\.(webp|png|jpe?g)$/i, '')
  for (const extension of photoExtensions) {
    const candidate = `${stem}.${extension}`
    if (Object.hasOwn(images, candidate)) return images[candidate]
  }
  return undefined
}

/**
 * Keep URLs and absolute paths intact, but make local recipe images explicitly
 * relative so Astro can register them even if the file appears after the
 * recipe during development.
 */
export function resolveContentImageReference(reference: string, images: Record<string, string>): string {
  const resolved = resolveRecipeImage(reference, images) ?? reference
  const isExplicitPath = resolved.startsWith('.') || resolved.startsWith('/')
  const hasScheme = /^[a-z][a-z\d+.-]*:/i.test(resolved)

  return isExplicitPath || hasScheme ? resolved : `./${resolved}`
}

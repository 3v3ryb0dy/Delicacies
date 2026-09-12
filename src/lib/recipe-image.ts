const photoExtensions = ['png', 'jpg', 'jpeg']

/** Prefer an exact filename, then accept another photo format with the same stem. */
export function resolveRecipeImage<T>(reference: string, images: Record<string, T>): T | undefined {
  const normalized = reference.replace(/^\.\//, '')
  if (Object.hasOwn(images, normalized)) return images[normalized]

  const stem = normalized.replace(/\.(png|jpe?g)$/i, '')
  for (const extension of photoExtensions) {
    const candidate = `${stem}.${extension}`
    if (Object.hasOwn(images, candidate)) return images[candidate]
  }
  return undefined
}

import type { BrandRecommendation } from '../config/brands'

export type IngredientSegment = { text: string; brandId?: string }

/** Match complete ingredient names without changing the recipe's original text. */
export function parseIngredientBrands(
  text: string,
  recommendations: readonly BrandRecommendation[]
): IngredientSegment[] {
  if (recommendations.length === 0) return [{ text }]

  const brandsByIngredient = new Map(recommendations.map((item) => [item.ingredient.toLowerCase(), item.id]))
  const names = recommendations.map((item) => item.ingredient.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')
  const pattern = new RegExp(`(?<![\\p{L}\\p{N}_])(?:${names})(?![\\p{L}\\p{N}_])`, 'giu')
  const segments: IngredientSegment[] = []
  let cursor = 0

  for (const match of text.matchAll(pattern)) {
    if (match.index > cursor) segments.push({ text: text.slice(cursor, match.index) })
    segments.push({ text: match[0], brandId: brandsByIngredient.get(match[0].toLowerCase()) })
    cursor = match.index + match[0].length
  }

  if (cursor < text.length) segments.push({ text: text.slice(cursor) })
  return segments
}

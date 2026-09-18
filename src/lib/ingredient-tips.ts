import type { IngredientTip } from '../config/ingredient-tips'
import type { IngredientGroup } from './recipe-body'

export function ingredientMatchesTip(ingredient: string, tip: IngredientTip): boolean {
  return tip.aliases.some((alias) => {
    const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(`(?<![\\p{L}\\p{N}_])${escaped}(?![\\p{L}\\p{N}_])`, 'iu').test(ingredient)
  })
}

/** Validate both the CLI's untyped frontmatter and the content build's selection. */
export function selectIngredientTips(
  selection: unknown,
  catalog: readonly IngredientTip[],
  recipeFile: string
): IngredientTip[] {
  if (selection === undefined) return []
  if (!Array.isArray(selection) || selection.some((id) => typeof id !== 'string')) {
    throw new Error(`${recipeFile}: ingredientTips must be an array of guide IDs.`)
  }
  const seen = new Set<string>()
  return selection.map((id: string) => {
    if (seen.has(id)) throw new Error(`${recipeFile}: duplicate ingredient tip "${id}".`)
    seen.add(id)
    const tip = catalog.find((tip) => tip.id === id)
    if (!tip) throw new Error(`${recipeFile}: unknown ingredient tip "${id}".`)
    return tip
  })
}

/** Keep the same group/row shape as the recipe; each row gets at most one control. */
export function resolveIngredientTips(
  groups: readonly IngredientGroup[],
  selection: unknown,
  catalog: readonly IngredientTip[],
  recipeFile: string
): IngredientTip[][][] {
  const selected = selectIngredientTips(selection, catalog, recipeFile)
  const matched = new Set<string>()
  const rows = groups.map((group) =>
    group.items.map((item) =>
      selected.filter((tip) => {
        if (!ingredientMatchesTip(item, tip)) return false
        matched.add(tip.id)
        return true
      })
    )
  )
  for (const tip of selected) {
    if (!matched.has(tip.id)) {
      throw new Error(
        `${recipeFile}: ingredient tip "${tip.id}" matches no ingredient. Check its aliases or remove the selection.`
      )
    }
  }
  return rows
}

import type { ParsedRecipeBody } from './recipe-body.ts'

export const recipeSearchGroups = [
  { field: 'title', id: 'suche-titel', label: 'Im Titel' },
  { field: 'ingredients', id: 'suche-zutaten', label: 'In den Zutaten' },
  { field: 'recipeText', id: 'suche-rezepttext', label: 'Im Rezepttext' },
  { field: 'pairings', id: 'suche-passt-dazu', label: 'Passt dazu' }
] as const

export type RecipeSearchGroup = (typeof recipeSearchGroups)[number]
export type RecipeSearchFields = Record<RecipeSearchGroup['field'], string>

/** Link labels are recipe content; their Markdown destinations are not. */
const visibleText = (text: string) => text.replace(/\[([^\[\]\n]+)\]\([^\s)]+\)/g, '$1')
const joinText = (parts: (string | undefined)[]) =>
  parts
    .filter(Boolean)
    .map((part) => visibleText(part!))
    .join(' · ')

export function recipeSearchFields(
  recipe: { title: string; category: string; tags: readonly string[]; note?: string; preparationPending?: boolean },
  body: ParsedRecipeBody,
  categoryLabel = recipe.category
): RecipeSearchFields {
  return {
    title: recipe.title,
    ingredients: joinText(body.ingredients.flatMap((group) => [group.title, ...group.items])),
    recipeText: joinText([
      categoryLabel,
      recipe.category,
      ...recipe.tags,
      recipe.note,
      ...body.tips,
      ...(recipe.preparationPending ? [] : [...body.preparation, ...body.thermomixPreparation]).flatMap((group) => [
        group.title,
        ...group.paragraphs
      ]),
      ...body.notes
    ]),
    pairings: joinText(body.pairings)
  }
}

/** A single matching term in a higher-priority field wins, even for multiword queries. */
export function recipeSearchGroup(matchedFields: readonly string[] = []): RecipeSearchGroup {
  return recipeSearchGroups.find((group) => matchedFields.includes(group.field)) ?? recipeSearchGroups[2]
}

export function matchRecipeSearch(fields: RecipeSearchFields, query: string): RecipeSearchGroup | undefined {
  const terms = [...new Set(query.toLocaleLowerCase('de').split(/\s+/).filter(Boolean))]
  if (!terms.length) return undefined
  const normalized = recipeSearchGroups.map((group) => ({
    ...group,
    text: fields[group.field].toLocaleLowerCase('de')
  }))
  if (!terms.every((term) => normalized.some((group) => group.text.includes(term)))) return undefined
  return recipeSearchGroup(
    normalized.filter((group) => terms.some((term) => group.text.includes(term))).map((group) => group.field)
  )
}

/** Pagefind 1.5 can return metadata matches for only part of a multiword query.
 * Intersect its per-term results to enforce AND without losing German stemming
 * or the full query's relevance order, metadata matches and excerpts.
 */
export async function searchAllRecipeTerms<Result extends { id: string }>(
  index: {
    search: (query: string, options?: { filters?: Record<string, string[]> }) => Promise<{ results: Result[] }>
  },
  query: string,
  options?: { filters?: Record<string, string[]> }
): Promise<Result[]> {
  const terms = [...new Set(query.toLocaleLowerCase('de').split(/\s+/).filter(Boolean))]
  if (terms.length < 2) return (await index.search(query, options)).results
  const [full, ...individual] = await Promise.all([query, ...terms].map((term) => index.search(term, options)))
  const ids = individual.map((response) => new Set(response.results.map((result) => result.id)))
  return full.results.filter((result) => ids.every((matches) => matches.has(result.id)))
}

import type { Aroma } from '../config/aromas'
import type { AromaCombination } from '../config/aroma-combinations'

export type AromaSearchField = { label: string; value: string }
export function normalizeAromaSearch(value: string): string {
  return value
    .toLocaleLowerCase('de')
    .replace(/ä|ae/g, 'a')
    .replace(/ö|oe/g, 'o')
    .replace(/ü|ue/g, 'u')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
}
export function aromaSearchFields(aroma: Aroma): AromaSearchField[] {
  return [
    { label: 'Name', value: aroma.name },
    ...aroma.aliases.map((value) => ({ label: 'Auch genannt', value })),
    ...aroma.foods.map((value) => ({ label: 'Lebensmittelpartner', value })),
    ...aroma.partners.map((value) => ({ label: 'Aromapartner', value })),
    ...aroma.tags.map((value) => ({ label: 'Aroma', value })),
    ...aroma.applications.flatMap((application) => [
      { label: 'Einsatzort', value: application.place },
      { label: 'Form', value: application.form }
    ])
  ]
}
export function combinationSearchFields(combination: AromaCombination, aromas: readonly Aroma[]): AromaSearchField[] {
  const steps = [...combination.steps, ...(combination.variant?.steps ?? [])]
  return [
    { label: 'Hauptprodukt', value: combination.product },
    ...steps.flatMap((step) =>
      step.ingredients.flatMap((ingredient) => [
        { label: 'Enthält', value: ingredient.name },
        ...(aromas.find((aroma) => aroma.id === ingredient.aromaId)?.aliases ?? []).map((value) => ({
          label: `Alias für ${ingredient.name}`,
          value
        })),
        { label: 'Form', value: ingredient.form },
        { label: 'Rolle', value: ingredient.role }
      ])
    ),
    ...combination.tags.map((value) => ({ label: 'Aroma', value })),
    ...steps.map((step) => ({ label: 'Einsatzort', value: step.place }))
  ]
}
/** AND across query terms; never infers new pairings from separate entries. */
export function matchAromaSearch(
  fields: readonly AromaSearchField[],
  query: string
): { matches: boolean; reason: string } {
  const terms = [...new Set(normalizeAromaSearch(query).split(' ').filter(Boolean))]
  const matched = terms.map((term) => fields.find((field) => normalizeAromaSearch(field.value).includes(term)))
  if (matched.some((field) => !field)) return { matches: false, reason: '' }
  return { matches: true, reason: [...new Set(matched.map((field) => `${field!.label}: ${field!.value}`))].join(' · ') }
}

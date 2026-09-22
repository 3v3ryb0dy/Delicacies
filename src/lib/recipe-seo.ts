import type { ParsedRecipeBody } from './recipe-body.ts'

type HowToStep = { '@type': 'HowToStep'; text: string }
type HowToSection = { '@type': 'HowToSection'; name: string; itemListElement: HowToStep[] }

export type RecipeStructuredData = {
  '@context': 'https://schema.org'
  '@type': 'Recipe'
  name: string
  description: string
  url: string
  image: string
  recipeCategory: string
  recipeIngredient: string[]
  recipeInstructions: (HowToStep | HowToSection)[]
  recipeYield?: string
}

type RecipeSeoInput = {
  title: string
  description: string
  canonical: URL
  image?: string
  category: string
  servings?: string
  preparationPending?: boolean
  body: ParsedRecipeBody
}

/** Describe the same complete method shown by default, using only existing content. */
export function buildRecipeStructuredData(input: RecipeSeoInput): RecipeStructuredData | undefined {
  if (input.preparationPending || !input.image) return

  const groups = input.body.preparation.length ? input.body.preparation : input.body.thermomixPreparation
  const instructions = groups.flatMap<HowToStep | HowToSection>((group) => {
    const steps = group.paragraphs.map((text): HowToStep => ({ '@type': 'HowToStep', text }))
    return group.title ? [{ '@type': 'HowToSection', name: group.title, itemListElement: steps }] : steps
  })

  return {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: input.title,
    description: input.description,
    url: input.canonical.href,
    image: new URL(input.image, input.canonical).href,
    recipeCategory: input.category,
    recipeIngredient: input.body.ingredients.flatMap((group) => group.items),
    recipeInstructions: instructions,
    ...(input.servings ? { recipeYield: input.servings } : {})
  }
}

/** JSON is embedded as script text, not HTML; a literal closing tag must never escape it. */
export function serializeRecipeStructuredData(data: RecipeStructuredData): string {
  return JSON.stringify(data).replaceAll('<', '\\u003c')
}

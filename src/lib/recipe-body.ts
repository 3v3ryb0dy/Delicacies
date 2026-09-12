export type IngredientGroup = {
  title?: string
  items: string[]
}

export type PreparationGroup = {
  title?: string
  paragraphs: string[]
}

export type ParsedRecipeBody = {
  ingredients: IngredientGroup[]
  preparation: PreparationGroup[]
  /** Lines such as "Passende Beilagen: ..." that pair the dish with other recipes. */
  pairings: string[]
  /** Anything the parser could not place, kept so no text is ever lost. */
  notes: string[]
}

export const EMPTY_RECIPE_BODY: ParsedRecipeBody = {
  ingredients: [],
  preparation: [],
  pairings: [],
  notes: []
}

type Section = 'ingredients' | 'preparation' | 'unknown'

const sectionHeadings: Record<string, Section> = {
  zutaten: 'ingredients',
  zubereitung: 'preparation'
}

const pairingPattern = /^(?:Passendes|Passende)\s+\S/

/**
 * Recipes are markdown with a fixed shape:
 *
 *   ## Zutaten
 *   ### Teig
 *   - 200 g Mehl
 *
 *   ## Zubereitung
 *   ### Teig
 *   > Aus Mehl, Wasser, Öl und Salz einen Teig herstellen.
 *
 * Preparation deliberately stays prose rather than a numbered list, so each
 * blockquote (or hard-wrapped line) becomes one paragraph on the page.
 */
export function parseRecipeBody(markdown: string): ParsedRecipeBody {
  const ingredients: IngredientGroup[] = []
  const preparation: PreparationGroup[] = []
  const pairings: string[] = []
  const notes: string[] = []

  let section: Section = 'unknown'
  let ingredientGroup: IngredientGroup | undefined
  let preparationGroup: PreparationGroup | undefined
  let buffer = ''

  const currentIngredientGroup = () => {
    if (!ingredientGroup) {
      ingredientGroup = { items: [] }
      ingredients.push(ingredientGroup)
    }
    return ingredientGroup
  }

  const currentPreparationGroup = () => {
    if (!preparationGroup) {
      preparationGroup = { paragraphs: [] }
      preparation.push(preparationGroup)
    }
    return preparationGroup
  }

  const flushParagraph = () => {
    const text = buffer.replace(/\s+/g, ' ').trim()
    buffer = ''
    if (!text) return

    if (pairingPattern.test(text)) {
      pairings.push(text)
      return
    }

    if (section === 'preparation') {
      currentPreparationGroup().paragraphs.push(text)
      return
    }

    notes.push(text)
  }

  const lines = markdown.replace(/\r\n?/g, '\n').split('\n')

  for (const rawLine of lines) {
    const line = rawLine.trim()

    if (!line) {
      flushParagraph()
      continue
    }

    const heading = /^(#{2,6})\s+(.*)$/.exec(line)
    if (heading) {
      flushParagraph()
      const depth = heading[1].length
      const text = heading[2].trim()

      if (depth === 2) {
        section = sectionHeadings[text.toLowerCase()] ?? 'unknown'
        ingredientGroup = undefined
        preparationGroup = undefined
        if (section === 'unknown') notes.push(text)
        continue
      }

      if (section === 'ingredients') {
        ingredientGroup = { title: text, items: [] }
        ingredients.push(ingredientGroup)
      } else if (section === 'preparation') {
        preparationGroup = { title: text, paragraphs: [] }
        preparation.push(preparationGroup)
      } else {
        notes.push(text)
      }
      continue
    }

    const listItem = /^[-*]\s+(.*)$/.exec(line)
    if (listItem && section === 'ingredients') {
      flushParagraph()
      currentIngredientGroup().items.push(listItem[1].trim())
      continue
    }

    const quote = /^>\s?(.*)$/.exec(line)
    const text = quote ? quote[1].trim() : line

    if (!text) {
      flushParagraph()
      continue
    }

    buffer = buffer ? `${buffer} ${text}` : text
    if (buffer.endsWith('\\')) {
      buffer = buffer.slice(0, -1)
      flushParagraph()
    }
  }

  flushParagraph()

  return {
    ingredients: ingredients.filter((group) => group.items.length > 0),
    preparation: preparation.filter((group) => group.paragraphs.length > 0),
    pairings,
    notes
  }
}

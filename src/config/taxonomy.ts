export const categoryIds = [
  'vorspeisen',
  'hauptgerichte',
  'desserts',
  'beilagen',
  'kuchen',
  'torten',
  'gebaeck',
  'brot',
  'saucen',
  'salate',
  'suppen',
  'getraenke',
  'sonstiges'
] as const

export type CategoryId = (typeof categoryIds)[number]

export type Category = {
  /** Value used in recipe front-matter and in URLs/filters. */
  id: CategoryId
  /** Heading shown on the site and in the generated README. */
  title: string
  /** Short label used for chips and cards. */
  short: string
  description?: string
  /** Nested groups inside this category, e.g. Beilagen > Gemüse. */
  subcategories?: { id: string; title: string }[]
}

/** Display order mirrors the original README table of contents. */
export const categories: Category[] = [
  {
    id: 'vorspeisen',
    title: 'Vorspeisen',
    short: 'Vorspeisen',
    description: 'Kleine Gerichte zum Beginn.'
  },
  {
    id: 'hauptgerichte',
    title: 'Hauptgerichte',
    short: 'Hauptgerichte',
    description: 'Das Herzstück des Kochbuchs.'
  },
  {
    id: 'desserts',
    title: 'Desserts',
    short: 'Desserts',
    description: 'Süßer Abschluss.'
  },
  {
    id: 'beilagen',
    title: 'Beilagen',
    short: 'Beilagen',
    description: 'Gemüse und Sättigungsbeilagen.',
    subcategories: [
      { id: 'gemuese', title: 'Gemüse' },
      { id: 'saettigungsbeilagen', title: 'Sättigungsbeilagen' }
    ]
  },
  {
    id: 'kuchen',
    title: 'Kuchen',
    short: 'Kuchen',
    description: 'Vom Blech und aus der Form.'
  },
  {
    id: 'torten',
    title: 'Torten',
    short: 'Torten',
    description: 'Für besondere Anlässe.'
  },
  {
    id: 'gebaeck',
    title: 'Gebäck',
    short: 'Gebäck',
    description: 'Kleines aus dem Ofen, süß und herzhaft.'
  },
  {
    id: 'brot',
    title: 'Brot / Brötchen',
    short: 'Brot',
    description: 'Teig, der aufgeht.'
  },
  {
    id: 'saucen',
    title: 'Saucen / Dips / Dressings',
    short: 'Saucen',
    description: 'Was dem Gericht den Schliff gibt.'
  },
  {
    id: 'salate',
    title: 'Salate',
    short: 'Salate',
    description: 'Zum Dazuessen, Mitbringen und fürs Buffet.'
  },
  {
    id: 'suppen',
    title: 'Suppen',
    short: 'Suppen',
    description: 'Wärmend, in der Regel in einem Topf.'
  },
  {
    id: 'getraenke',
    title: 'Getränke',
    short: 'Getränke',
    description: 'Erfrischend oder wärmend, im Glas oder in der Tasse.'
  },
  {
    id: 'sonstiges',
    title: 'Sonstiges',
    short: 'Sonstiges',
    description: 'Grundrezepte und alles, was sonst nirgends passt.'
  }
]

export const categoryById = new Map(categories.map((category) => [category.id, category]))

/** Nested group declared by a category, e.g. Beilagen > Gemüse. */
export function subcategoryById(
  categoryId: CategoryId,
  subcategoryId: string
): { id: string; title: string } | undefined {
  return categoryById.get(categoryId)?.subcategories?.find((subcategory) => subcategory.id === subcategoryId)
}

/**
 * Small, deliberately flat vocabulary so filtering stays useful.
 * `vegetarisch` and `vegan` are only set when the ingredient list supports it.
 */
export const tagVocabulary = [
  'fleisch',
  'hähnchen',
  'fisch',
  'meeresfrüchte',
  'vegetarisch',
  'vegan',
  'ofen',
  'frittiert',
  'grill',
  'asiatisch',
  'italienisch',
  'deutsch',
  'griechisch',
  'grundrezept',
  'familienrezept'
] as const

export type Tag = (typeof tagVocabulary)[number]

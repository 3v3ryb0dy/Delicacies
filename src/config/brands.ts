export type BrandRecommendation = {
  id: string
  ingredient: string
  brand: string
}

/** Shared by the Marken page and automatic links in recipe ingredient lists. */
export const brandRecommendations: readonly BrandRecommendation[] = [
  { id: 'austernsauce', ingredient: 'Austernsauce', brand: 'Lee Kum Kee' },
  { id: 'fischsauce', ingredient: 'Fischsauce', brand: 'Red Boat' },
  { id: 'tamarindenpaste', ingredient: 'Tamarindenpaste', brand: 'Suree' }
]

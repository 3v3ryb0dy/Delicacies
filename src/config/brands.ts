export type BrandRecommendation = {
  id: string
  ingredient: string
  brand: string
}

/** Shared by the Marken page and automatic links in recipe ingredient lists. */
export const brandRecommendations: readonly BrandRecommendation[] = [
  { id: 'austernsauce', ingredient: 'Austernsauce', brand: 'Lee Kum Kee' },
  { id: 'fischsauce', ingredient: 'Fischsauce', brand: 'Red Boat' },
  {
    id: 'reisbandnudeln',
    ingredient: 'Reisbandnudeln',
    brand: 'dmBio Reisnudeln Pad Thai'
  },
  { id: 'tahini', ingredient: 'Tahini', brand: 'Pepperwood Organics' },
  { id: 'tamarindenpaste', ingredient: 'Tamarindenpaste', brand: 'Suree' }
]

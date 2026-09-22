/** Keep unfinished recipes reachable, but out of the search-engine sitemap. */
export function createRecipeSitemapFilter(recipes, site) {
  const excluded = new Set([
    new URL('404.html', site).href,
    ...recipes
      .filter((recipe) => recipe.preparationPending)
      .map((recipe) => new URL(`rezept/${recipe.slug}/`, site).href)
  ])
  return (page) => !excluded.has(page)
}

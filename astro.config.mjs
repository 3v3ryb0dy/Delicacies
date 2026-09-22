import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'
import { fileURLToPath } from 'node:url'
import { readRecipes } from './scripts/lib/recipes.mjs'
import { createRecipeSitemapFilter } from './scripts/lib/recipe-indexing.mjs'
import { site } from './src/config/site.ts'

const recipes = await readRecipes(fileURLToPath(new URL('./recipes', import.meta.url)))

// Deployed to GitHub Pages with the custom domain https://cook.drng.me/.
export default defineConfig({
  site,
  // Match the noindex policy on unfinished recipe pages and the 404 page.
  integrations: [sitemap({ filter: createRecipeSitemapFilter(recipes, site) })],
  build: {
    format: 'directory'
  },
  devToolbar: {
    enabled: false
  },
  vite: {
    plugins: [tailwindcss()]
  }
})

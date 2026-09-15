import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'
import { site } from './src/config/site.ts'

// Deployed to GitHub Pages with the custom domain https://cook.drng.me/.
export default defineConfig({
  site,
  // The 404 page carries `noindex` and stays out of the sitemap.
  integrations: [sitemap({ filter: (page) => !page.endsWith('/404.html') })],
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

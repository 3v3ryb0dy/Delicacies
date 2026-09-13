import { defineConfig } from 'astro/config'

// Deployed to GitHub Pages with the custom domain https://cook.drng.me/.
export default defineConfig({
  site: 'https://cook.drng.me',
  build: {
    format: 'directory'
  },
  devToolbar: {
    enabled: false
  }
})

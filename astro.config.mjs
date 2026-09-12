import { defineConfig } from 'astro/config'

// Deployed to GitHub Pages at https://3v3ryb0dy.github.io/Delicacies/
// For a custom domain: set `site` to the domain and delete `base`.
export default defineConfig({
  site: 'https://3v3ryb0dy.github.io',
  base: '/Delicacies',
  build: {
    format: 'directory'
  },
  devToolbar: {
    enabled: false
  }
})

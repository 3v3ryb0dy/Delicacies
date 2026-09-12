/** @type {import('prettier').Config} */
export default {
  bracketSameLine: true,
  jsxSingleQuote: true,
  plugins: ['prettier-plugin-astro', 'prettier-plugin-tailwindcss'],
  printWidth: 120,
  semi: false,
  singleQuote: true,
  trailingComma: 'none',
  tailwindStylesheet: './src/tailwind.css',
  overrides: [
    {
      files: '*.astro',
      options: {
        parser: 'astro'
      }
    }
  ]
}

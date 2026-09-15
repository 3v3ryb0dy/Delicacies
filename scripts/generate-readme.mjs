#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { site } from '../src/config/site.ts'
import { categories } from '../src/config/taxonomy.ts'
import { readProse, readRecipes, validateRecipes } from './lib/recipes.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const siteUrl = `${site}/`
const checkOnly = process.argv.includes('--check')

const [recipes, vorwort] = await Promise.all([
  readRecipes(path.join(root, 'recipes')),
  readProse(path.join(root, 'content', 'vorwort.md'))
])

const byCategory = new Map(categories.map((category) => [category.id, []]))
validateRecipes(recipes, categories)
for (const recipe of recipes) {
  byCategory.get(recipe.category).push(recipe)
}

const recipeLines = (list) =>
  list.map((recipe) => {
    const labels = [recipe.preparationPending && 'In Arbeit', recipe.wip && 'Ungetestet'].filter(Boolean)
    return `- [${recipe.title}](recipes/${recipe.file})${labels.length ? ` _(${labels.join(', ')})_` : ''}`
  })

const sections = categories.map((category) => {
  const list = byCategory.get(category.id) ?? []
  const lines = [`### ${category.title} (${list.length})`, '']

  if (list.length === 0) {
    lines.push('_Noch keine Rezepte. Hier ist Platz für Neues._')
  } else if (category.subcategories?.length) {
    for (const subcategory of category.subcategories) {
      const subList = list.filter((recipe) => recipe.subcategory === subcategory.id)
      lines.push(`#### ${subcategory.title}`, '')
      lines.push(subList.length === 0 ? '_Noch keine Rezepte._' : recipeLines(subList).join('\n'), '')
    }
    const ungrouped = list.filter((recipe) => !recipe.subcategory)
    if (ungrouped.length) lines.push(recipeLines(ungrouped).join('\n'), '')
  } else {
    lines.push(recipeLines(list).join('\n'), '')
  }

  return lines.join('\n').trimEnd()
})

const readme = `# Kochbuch der Delikatessen

> Gestaltete Fassung mit Suche, Filtern und Druckansicht: **[${siteUrl}](${siteUrl})**

${vorwort}

## Rezepte

${recipes.length} Rezepte, jedes als eigene Markdown-Datei in [\`recipes/\`](recipes).
Diese Übersicht wird beim Build aus den Rezeptdateien erzeugt. Bitte nicht von Hand bearbeiten.

${sections.join('\n\n')}

## Rezept hinzufügen

1. Neue Datei \`recipes/mein-rezept.md\` anlegen, Dateiname bestimmt die Adresse.
2. Kopf ausfüllen: \`title\`, \`category\` (siehe oben), \`tags\` und optional \`image\`.
3. \`## Zutaten\` und \`## Zubereitung\` schreiben, Bilder nach \`recipes/images/\` (Prompt-Vorlage: [Image Generation](docs/image-generation.md)).
   PNG, JPG und JPEG sind möglich, ausgeliefert wird WebP (\`npm run images:webp\`); im Repo liegt nur die WebP-Datei.
   \`image: images/mein-rezept\` funktioniert ohne Dateiendung; mit Dateiendung muss die Datei genau so existieren.
   Ungetestete Rezepte mit \`wip: true\` markieren: Sie sind standardmäßig ausgeblendet und lassen sich über „Ungetestete Rezepte anzeigen“ einblenden. Die Auswahl wird im Browser gespeichert. Nach dem Testen \`wip\` entfernen oder auf \`false\` setzen.
4. \`npm run check\` und danach \`npm run build\` ausführen. Übersicht und README entstehen automatisch. Der Check prüft
   Rezeptaufbau, Bilder und Querverweise, der Build zusätzlich die gebaute Seite und den Suchindex. Beim Commit und
   Push laufen dieselben Prüfungen automatisch über die Git-Hooks (siehe [Contributing](docs/README.md)).

## Ideen

Rezepte, die noch ausprobiert werden wollen: [Ideen](${siteUrl}ideen/)
`

const target = path.join(root, 'README.md')

if (checkOnly) {
  const current = await readFile(target, 'utf8')
  if (current !== readme) {
    console.error('README.md ist veraltet. Bitte `npm run readme` ausführen.')
    process.exit(1)
  }
  console.log('README.md ist aktuell.')
} else {
  await writeFile(target, readme, 'utf8')
  console.log(`README.md aktualisiert: ${recipes.length} Rezepte in ${categories.length} Kategorien.`)
}

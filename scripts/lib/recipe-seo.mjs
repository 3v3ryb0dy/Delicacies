import { isDeepStrictEqual } from 'node:util'
import { parseRecipeBody } from '../../src/lib/recipe-body.ts'
import { categoryById } from '../../src/config/taxonomy.ts'

export function decodeMarkup(value) {
  return value.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt);/gi, (match, entity) => {
    if (entity.startsWith('#')) {
      return String.fromCodePoint(
        entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : Number(entity.slice(1))
      )
    }
    return { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' }[entity.toLowerCase()] ?? match
  })
}

function attributes(tag) {
  return Object.fromEntries(
    [...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map((match) => [
      match[1].toLowerCase(),
      decodeMarkup(match[2] ?? match[3])
    ])
  )
}

/** Read generated markup without mistaking content inside scripts for real metadata. */
export function readSeoMetadata(html) {
  const head = /<head\b[^>]*>([\s\S]*?)<\/head>/i.exec(html)?.[1] ?? ''
  const metadata = new Map()
  const canonicals = []
  for (const match of head.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '').matchAll(/<(meta|link)\b[^>]*>/gi)) {
    const attrs = attributes(match[0])
    if (match[1].toLowerCase() === 'meta') metadata.set(attrs.name ?? attrs.property, attrs.content)
    else if (attrs.rel === 'canonical') canonicals.push(attrs.href)
  }
  const jsonLd = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter((match) => attributes(match[1]).type === 'application/ld+json')
    .map((match) => match[2])
  return {
    noindex: /(?:^|[\s,])noindex(?:$|[\s,])/i.test(metadata.get('robots') ?? ''),
    canonicals,
    description: metadata.get('description'),
    image: metadata.get('og:image'),
    jsonLd
  }
}

/** Independent build-time assertions against the recipe source, not the JSON-LD builder. */
export function checkRecipeSeo({ html, recipe, canonical, inSitemap, assets }) {
  const failures = []
  const seo = readSeoMetadata(html)
  const pending = recipe.preparationPending === true
  if (seo.noindex !== pending) failures.push('robots noindex disagrees with preparationPending')
  if (inSitemap === pending) failures.push('sitemap inclusion disagrees with preparationPending')
  if (!isDeepStrictEqual(seo.canonicals, pending ? [] : [canonical])) failures.push('incorrect canonical URL')

  const expectedCount = !pending && recipe.image ? 1 : 0
  if (seo.jsonLd.length !== expectedCount)
    failures.push(`expected ${expectedCount} JSON-LD script(s), got ${seo.jsonLd.length}`)
  if (!expectedCount || seo.jsonLd.length !== 1) return failures

  let data
  try {
    data = JSON.parse(seo.jsonLd[0])
  } catch {
    failures.push('invalid JSON-LD')
    return failures
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) return [...failures, 'JSON-LD must be a Recipe object']
  if (typeof data.name !== 'string' || !data.name.trim()) failures.push('JSON-LD requires a nonempty recipe name')

  const expected = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title,
    url: canonical,
    description:
      recipe.imageAlt?.trim() || `${recipe.title}: Zutaten und Zubereitung aus dem Kochbuch der Delikatessen.`,
    recipeCategory: categoryById.get(recipe.category)?.title ?? recipe.category,
    recipeYield: recipe.servings || undefined
  }
  for (const [key, value] of Object.entries(expected)) {
    if (data[key] !== value) failures.push(`JSON-LD ${key} does not match recipe content`)
  }
  if (data.description !== seo.description) failures.push('JSON-LD description differs from page metadata')

  try {
    const image = new URL(data.image)
    if (
      typeof data.image !== 'string' ||
      image.origin !== new URL(canonical).origin ||
      !assets.has(image.pathname) ||
      data.image !== seo.image
    )
      failures.push('JSON-LD image must be the absolute, existing recipe social image')
  } catch {
    failures.push('JSON-LD image must be an absolute URL')
  }

  const body = parseRecipeBody(recipe.body)
  const ingredients = body.ingredients.flatMap((group) => group.items)
  if (!ingredients.length || !isDeepStrictEqual(data.recipeIngredient, ingredients)) {
    failures.push('JSON-LD ingredients do not match recipe content')
  }
  const groups = body.preparation.length ? body.preparation : body.thermomixPreparation
  const instructions = groups.flatMap((group) => {
    const steps = group.paragraphs.map((text) => ({ '@type': 'HowToStep', text }))
    return group.title ? [{ '@type': 'HowToSection', name: group.title, itemListElement: steps }] : steps
  })
  if (!instructions.length || !isDeepStrictEqual(data.recipeInstructions, instructions)) {
    failures.push('JSON-LD instructions do not match the default preparation method')
  }
  return failures
}

#!/usr/bin/env node
import { readFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { duplicateIds, findNestedTags, isExternalUrl, pageIds } from './lib/built-site.mjs'

/**
 * Checks the built site after `astro build` and `pagefind`: HTML that must stay
 * valid, links that must resolve to a page and an anchor that exists, and a
 * Pagefind index that covers exactly the recipe pages.
 *
 * Runs as part of `npm run build`, so a broken link or a nested anchor fails the
 * deployment instead of reaching the published site.
 */
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const failures = []
const idsByPage = new Map()

async function walk(directory, files = []) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name)
    if (entry.isDirectory()) await walk(target, files)
    else files.push(target)
  }
  return files
}

function relative(file) {
  return `/${path.relative(dist, file).split(path.sep).join('/')}`
}

/** Maps a site URL path to the file that serves it, the way the host does. */
async function resolveUrl(htmlFile, url) {
  const target = url.startsWith('/') ? url : path.posix.join(path.posix.dirname(relative(htmlFile)), url)
  const [pathname, fragment = ''] = target.split('#')
  const trimmed = pathname.replace(/\/+$/, '')
  const candidates = trimmed === '' ? ['/index.html'] : [`${trimmed}`, `${trimmed}/index.html`, `${trimmed}.html`]

  for (const candidate of candidates) {
    const file = path.join(dist, candidate)
    try {
      const stats = await stat(file)
      if (stats.isFile()) return { file, fragment }
      if (stats.isDirectory() && (await stat(path.join(file, 'index.html'))).isFile())
        return { file: path.join(file, 'index.html'), fragment }
    } catch {
      // Try the next candidate.
    }
  }
  return undefined
}

async function idsForPage(file) {
  if (!idsByPage.has(file)) idsByPage.set(file, pageIds(await readFile(file, 'utf8')))
  return idsByPage.get(file)
}

const files = await walk(dist)
const htmlFiles = files.filter((file) => file.endsWith('.html'))
const assets = new Set(files.map((file) => relative(file)))

for (const file of htmlFiles) {
  const page = relative(file)
  const html = await readFile(file, 'utf8')

  for (const tag of ['a', 'button']) {
    if (findNestedTags(html, tag).length > 0) failures.push(`${page}: nested <${tag}> elements`)
  }

  const duplicates = duplicateIds(html)
  if (duplicates.length > 0) failures.push(`${page}: duplicate id(s) ${duplicates.join(', ')}`)

  for (const match of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const url = match[1]
    if (isExternalUrl(url)) continue

    const target = await resolveUrl(file, url)
    if (!target) {
      failures.push(`${page}: "${url}" does not resolve to a file in dist`)
      continue
    }
    if (target.fragment && !(await idsForPage(target.file)).has(target.fragment)) {
      failures.push(`${page}: "${url}" points at a missing anchor in ${relative(target.file)}`)
    }
  }

  for (const match of html.matchAll(/srcset="([^"]+)"/g)) {
    for (const candidate of match[1].split(',')) {
      const url = candidate.trim().split(/\s+/)[0]
      if (url && !assets.has(url.split('#')[0])) failures.push(`${page}: srcset asset "${url}" is missing from dist`)
    }
  }
}

const recipePages = htmlFiles.filter((file) => relative(file).startsWith('/rezept/'))
const pagefindEntry = path.join(dist, 'pagefind', 'pagefind-entry.json')
try {
  const entry = JSON.parse(await readFile(pagefindEntry, 'utf8'))
  const indexed = entry.languages?.de?.page_count
  if (indexed !== recipePages.length) {
    failures.push(`pagefind: indexed ${indexed} page(s), expected the ${recipePages.length} recipe pages`)
  }
  const fragments = (await readdir(path.join(dist, 'pagefind', 'fragment'))).filter((file) =>
    file.endsWith('.pf_fragment')
  )
  if (fragments.length !== recipePages.length) {
    failures.push(`pagefind: ${fragments.length} fragment(s) for ${recipePages.length} recipe pages`)
  }
} catch (error) {
  failures.push(`pagefind: could not read the index (${error.message})`)
}

if (failures.length > 0) {
  console.error(`Built site check failed for ${failures.length} issue(s):`)
  for (const failure of failures) console.error(`  - ${failure}`)
  process.exit(1)
}

console.log(`Checked ${htmlFiles.length} pages: links, anchors, ids, nesting and the Pagefind index.`)

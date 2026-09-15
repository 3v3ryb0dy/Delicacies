/**
 * Small HTML checks used by `scripts/verify-built-site.mjs`.
 *
 * They read the built HTML as text: the output is generated, well-formed and
 * predictable, so a parser would be more machinery than these checks need.
 */

/** Positions of tags that open before the previous same-name tag closed. */
export function findNestedTags(html, tag) {
  const nested = []
  const pattern = new RegExp(`<${tag}\\b|</${tag}>`, 'g')
  let depth = 0

  for (const match of html.matchAll(pattern)) {
    if (match[0] === `</${tag}>`) {
      depth = Math.max(0, depth - 1)
      continue
    }
    depth += 1
    if (depth > 1) nested.push(match.index)
  }

  return nested
}

/** Ids used more than once in one document. */
export function duplicateIds(html) {
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1])
  return [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))]
}

/** Every `id` in the document, for anchor checks against other pages. */
export function pageIds(html) {
  return new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]))
}

/** True for anything a browser resolves without touching this site. */
export function isExternalUrl(url) {
  return /^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith('//') || url.startsWith('data:')
}

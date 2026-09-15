/**
 * GitHub Pages answers unknown paths without consulting the router, so the 404
 * page is the only place that can correct the case of a typed address.
 *
 * Everything after the deployment base is lowercased; the base itself keeps its
 * spelling, because that part is the repository name.
 *
 * Returns the corrected path, or undefined when it already matches.
 */
export function lowercasePathAfterBase(pathname: string, base: string): string | undefined {
  if (!pathname.startsWith(base)) return undefined
  const rest = pathname.slice(base.length)
  const lower = rest.toLowerCase()
  return lower === rest ? undefined : base + lower
}

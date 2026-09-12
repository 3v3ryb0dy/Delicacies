const normalizedBase = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`

/** Prefixes an internal path with the configured Astro `base`. */
export function withBase(path = ''): string {
  return `${normalizedBase}${path.replace(/^\//, '')}`
}

export const siteBase = normalizedBase

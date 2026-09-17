export const favoriteTextMinLength = 20
export const favoriteTextMaxLength = 40
export const defaultFavoriteTexts = [
  'Da könnte ich mich reinlegen.',
  'Davon nehme ich noch eine Portion.',
  'Könnte ich jeden Tag essen.',
  'Den letzten Bissen teile ich nicht.',
  'Das macht einfach glücklich.'
] as const
export const defaultFavoriteSymbols = ['♥', '★', '✨', '♦', '✧', '✺'] as const
export const defaultFavoriteText = `${defaultFavoriteTexts[0]} ${defaultFavoriteSymbols[0]}`

/** Choose uniformly among the remaining notes, avoiding an immediate repeat. */
export function nextFavoriteTextIndex(previous?: number, random = Math.random): number {
  const hasPrevious = previous !== undefined && previous >= 0 && previous < defaultFavoriteTexts.length
  const index = Math.floor(random() * (defaultFavoriteTexts.length - (hasPrevious ? 1 : 0)))
  return hasPrevious && index >= previous ? index + 1 : index
}

const favoriteSymbolByCharacter = {
  '♥': 'heart',
  '❤': 'heart',
  '♡': 'heart',
  '★': 'star',
  '☆': 'star',
  '⭐': 'star',
  '✨': 'sparkles',
  '♦': 'diamonds',
  '✧': 'twinkle',
  '✺': 'burst'
} as const
export type FavoriteSymbol = (typeof favoriteSymbolByCharacter)[keyof typeof favoriteSymbolByCharacter]
export type FavoriteToken = { kind: 'text'; text: string } | { kind: FavoriteSymbol }

const symbolPattern = /[♥❤♡★☆⭐✨♦✧✺]\uFE0F?/gu

export function normalizeFavoriteText(text: string): string {
  return text.normalize('NFC').replace(/\s+/gu, ' ').trim()
}

/** A Unicode doodle symbol counts once, including its optional emoji selector. */
export function favoriteTextLength(text: string): number {
  return Array.from(normalizeFavoriteText(text).replace(/\uFE0F/gu, '')).length
}

export function favoriteTokens(text?: string): FavoriteToken[] {
  const normalized = normalizeFavoriteText(text?.trim() || defaultFavoriteText)
  const parts = normalized.replace(symbolPattern, (symbol) => ` ${symbol} `).split(' ')
  const tokens: FavoriteToken[] = parts.filter(Boolean).map((part) => {
    const character = part.replace(/\uFE0F/gu, '')
    if (Object.hasOwn(favoriteSymbolByCharacter, character)) {
      return { kind: favoriteSymbolByCharacter[character as keyof typeof favoriteSymbolByCharacter] }
    }
    return { kind: 'text', text: part }
  })
  if (!tokens.some((token) => token.kind !== 'text')) tokens.push({ kind: 'heart' })
  return tokens
}

export const favoriteDoodleSize = {
  heart: { width: 25, height: 44 },
  star: { width: 34, height: 38 },
  sparkles: { width: 38, height: 40 },
  diamonds: { width: 34, height: 40 },
  twinkle: { width: 38, height: 40 },
  burst: { width: 40, height: 40 }
} as const

/** A conservative server fallback; the browser refines it with the loaded font. */
export function estimateFavoriteTextWidth(text: string): number {
  return Array.from(text).reduce((width, character) => {
    if (/[ilI.,!'’]/u.test(character)) return width + 6
    if (/[mwMW@]/u.test(character)) return width + 24
    return width + 15
  }, 0)
}

/**
 * Keep words together and favour a slightly longer first line, like the
 * original note. The symbol takes up real room when choosing the break.
 */
export function layoutFavoriteNote(tokens: FavoriteToken[], measure = estimateFavoriteTextWidth) {
  const widths = tokens.map((token) =>
    token.kind === 'text' ? measure(token.text) : favoriteDoodleSize[token.kind].width
  )
  const gap = (index: number) => (tokens[index].kind !== 'text' || tokens[index + 1]?.kind !== 'text' ? 10 : 6)
  const rowWidth = (start: number, end: number) =>
    widths
      .slice(start, end)
      .reduce((width, value, offset) => width + value + (start + offset < end - 1 ? gap(start + offset) : 0), 0)
  let split = Math.max(1, tokens.length - 1)
  let bestScore = Infinity
  for (let index = 1; index < tokens.length; index++) {
    if (
      !tokens.slice(0, index).some((token) => token.kind === 'text') ||
      !tokens.slice(index).some((token) => token.kind === 'text')
    )
      continue
    const score = Math.abs(rowWidth(0, index) - rowWidth(index, tokens.length) * 1.35)
    if (score < bestScore) {
      bestScore = score
      split = index
    }
  }
  const rowWidths = [rowWidth(0, split), rowWidth(split, tokens.length)]
  const width = Math.ceil(Math.max(...rowWidths) + 40)
  const textLength = tokens.reduce((sum, token) => sum + (token.kind === 'text' ? Array.from(token.text).length : 0), 0)
  const symbolCount = tokens.filter((token) => token.kind !== 'text').length
  let delay = 60
  const positions = tokens.map((token, index) => {
    const row = index < split ? 0 : 1
    const start = row === 0 ? 0 : split
    const x = (width - rowWidths[row]) / 2 + (index === start ? 0 : rowWidth(start, index) + gap(index - 1))
    const baseline = row === 0 ? 48 : 86
    const y = token.kind === 'text' ? baseline : baseline + 10 - favoriteDoodleSize[token.kind].height
    if (index === split) delay += 20
    const duration = token.kind === 'text' ? (620 * Array.from(token.text).length) / textLength : 180 / symbolCount
    const position = { x, y, delay: Math.round(delay), duration: Math.round(duration) }
    delay += duration
    return position
  })
  const topWidth = rowWidths[0] + 40
  const bottomWidth = rowWidths[1] + 40
  const bridgeWidth = Math.min(topWidth, bottomWidth) - 8
  const stripes = [
    {
      x: (width - topWidth) / 2,
      d: `M10 19Q${topWidth / 2} 8 ${topWidth - 7} 18L${topWidth - 14} 28L${topWidth} 32L${topWidth - 8} 55Q${topWidth / 2} 64 6 59L11 48L0 43L5 28Z`
    },
    {
      x: (width - bottomWidth) / 2,
      d: `M9 55Q${bottomWidth / 2} 48 ${bottomWidth - 8} 55L${bottomWidth - 15} 68L${bottomWidth} 71L${bottomWidth - 15} 98Q${bottomWidth / 2} 106 6 96L13 85L0 80Z`
    },
    {
      x: (width - bridgeWidth) / 2,
      d: `M3 50Q${bridgeWidth / 2} 44 ${bridgeWidth} 49L${bridgeWidth - 5} 63Q${bridgeWidth / 2} 58 0 68Z`
    }
  ]
  return { width, height: 120, positions, stripes }
}

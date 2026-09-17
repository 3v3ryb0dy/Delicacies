import { favoriteDoodleSize } from './favorite-note'

/** Anchors carry pen pressure; the filled silhouette varies continuously in width. */
type Point = [x: number, y: number, pressure: number]
type Drawing = { stroke: string; outline: string }
const number = (value: number) => Number(value.toFixed(2))
const pressureScale = 1.25

function pen(points: Point[], closed = false, tension: number | number[] = 0.8): Drawing {
  const samples: Point[] = []
  let stroke = `M${points[0][0]} ${points[0][1]}`
  const count = closed ? points.length : points.length - 1
  for (let index = 0; index < count; index++) {
    const a = points[index]
    const b = points[(index + 1) % points.length]
    const before = points[index - 1] ?? (closed ? points.at(-1)! : a)
    const after = points[index + 2] ?? (closed ? points[(index + 2) % points.length] : b)
    const startTension = typeof tension === 'number' ? tension : tension[index]
    const endTension = typeof tension === 'number' ? tension : tension[(index + 1) % points.length]
    const c = [a[0] + ((b[0] - before[0]) * startTension) / 6, a[1] + ((b[1] - before[1]) * startTension) / 6]
    const d = [b[0] - ((after[0] - a[0]) * endTension) / 6, b[1] - ((after[1] - a[1]) * endTension) / 6]
    stroke += `C${c.map(number).join(' ')} ${d.map(number).join(' ')} ${b[0]} ${b[1]}`
    for (let step = 0; step < 16; step++) {
      const t = step / 16,
        u = 1 - t
      samples.push([
        u ** 3 * a[0] + 3 * u * u * t * c[0] + 3 * u * t * t * d[0] + t ** 3 * b[0],
        u ** 3 * a[1] + 3 * u * u * t * c[1] + 3 * u * t * t * d[1] + t ** 3 * b[1],
        a[2] * u + b[2] * t
      ])
    }
  }
  if (!closed) samples.push(points.at(-1)!)
  const left: string[] = [],
    right: string[] = []
  samples.forEach(([x, y, pressure], index) => {
    const before = samples[index - 1] ?? (closed ? samples.at(-1)! : samples[0])
    const after = samples[index + 1] ?? (closed ? samples[0] : samples.at(-1)!)
    const dx = after[0] - before[0],
      dy = after[1] - before[1]
    const length = Math.hypot(dx, dy) || 1
    const nx = ((-dy / length) * pressure * pressureScale) / 2,
      ny = ((dx / length) * pressure * pressureScale) / 2
    left.push(`${number(x + nx)} ${number(y + ny)}`)
    right.push(`${number(x - nx)} ${number(y - ny)}`)
  })
  const cap = (endpoint: Point, neighbour: Point) => {
    const dx = endpoint[0] - neighbour[0],
      dy = endpoint[1] - neighbour[1]
    const length = Math.hypot(dx, dy) || 1
    return `${number(endpoint[0] + (dx / length) * endpoint[2] * pressureScale)} ${number(endpoint[1] + (dy / length) * endpoint[2] * pressureScale)}`
  }
  const outline = closed
    ? `M${left.join('L')}ZM${right.reverse().join('L')}Z`
    : `M${left.join('L')}Q${cap(samples.at(-1)!, samples.at(-2)!)} ${right.at(-1)}L${right.reverse().join('L')}Q${cap(samples[0], samples[1])} ${left[0]}Z`
  return { stroke: stroke + (closed ? 'Z' : ''), outline }
}

function sparkle(x: number, y: number, width: number, height: number, weight = 1, lean = 0.1): Drawing {
  // One unclosed pen gesture, with an uneven return past its starting point.
  const points: Point[] = [
    [-0.03, -1.05, 0.5],
    [0.19, -0.3, 4.4],
    [0.94, -0.13, 1],
    [0.32, 0.17, 1.9],
    [0.16, 1, 0.8],
    [-0.17, 0.3, 4.8],
    [-1, 0.1, 0.7],
    [-0.27, -0.16, 1.8],
    [0.02, -0.94, 0.35]
  ]
  // Tiny companions need a wider opening rather than four swollen corners.
  const localWeight = weight * (Math.min(width, height) < 25 ? 0.82 : 1)
  return pen(
    points.map(([px, py, p]) => [x + ((px + py * lean) * width) / 2, y + (py * height) / 2, p * localWeight]),
    false,
    [0.2, 1.6, 0.1, 1.3, 0.08, 1.65, 0.12, 1.4, 0.2]
  )
}

function ray(x: number, y: number, endX: number, endY: number, weight = 3): Drawing {
  const length = Math.hypot(endX - x, endY - y) || 1
  const bendX = (-(endY - y) / length) * 0.9
  const bendY = ((endX - x) / length) * 0.9
  return pen([
    [x, y, weight * 0.65],
    [x + (endX - x) * 0.3 + bendX, y + (endY - y) * 0.3 + bendY, weight * 1.05],
    [x + (endX - x) * 0.76 + bendX, y + (endY - y) * 0.76 + bendY, weight * 0.55],
    [endX, endY, weight * 0.12]
  ])
}

function diamond(x: number, y: number, width: number, height: number, weight = 1): Drawing {
  return pen(
    [
      [x - width * 0.08, y - height * 0.49, 0.5 * weight],
      [x + width * 0.24, y - height * 0.28, 2.2 * weight],
      [x + width * 0.5, y - 1, 4.5 * weight],
      [x + width * 0.06, y + height * 0.51, 1.8 * weight],
      [x - width * 0.49, y + height * 0.07, 3 * weight],
      [x - width * 0.28, y - height * 0.23, 1.6 * weight],
      [x + width * 0.02, y - height * 0.52, 0.4 * weight]
    ],
    false,
    [0.2, 0.75, 0.16, 0.12, 0.18, 0.7, 0.2]
  )
}

function drawing(kind: keyof typeof favoriteDoodleSize, parts: Drawing[]) {
  return {
    viewBox: '0 0 100 100',
    ...favoriteDoodleSize[kind],
    maskWidth: 12,
    stroke: parts.map((part) => part.stroke).join(''),
    outline: parts.map((part) => part.outline).join('')
  }
}

export const extraFavoriteDoodles = {
  // Reference: row 1, column 2.
  sparkles: drawing('sparkles', [
    sparkle(35, 57, 51, 67),
    sparkle(76, 24, 31, 39, 0.85, -0.18),
    sparkle(73, 83, 17, 23, 0.7, 0.24)
  ]),
  // Reference: row 3, column 4.
  diamonds: drawing('diamonds', [
    diamond(50, 46, 35, 60),
    diamond(76, 15, 13, 23, 0.65),
    diamond(24, 78, 17, 27, 0.85),
    diamond(74, 82, 16, 24, 0.8)
  ]),
  twinkle: drawing('twinkle', [
    sparkle(52, 52, 69, 88),
    sparkle(20, 22, 17, 23, 0.7, -0.2),
    sparkle(79, 82, 16, 24, 0.7, 0.25),
    ray(69, 29, 81, 19, 2.7),
    ray(30, 75, 17, 89, 3)
  ]),
  burst: drawing('burst', [
    pen(
      [
        [53, 25, 0.5],
        [59, 43, 3.8],
        [77, 35, 1],
        [69, 52, 1.6],
        [86, 57, 0.8],
        [66, 63, 3.9],
        [63, 83, 1],
        [49, 71, 1.8],
        [29, 81, 0.9],
        [36, 62, 4],
        [17, 53, 1],
        [39, 48, 1.6],
        [37, 32, 0.8],
        [49, 42, 3.2],
        [54, 27, 0.4]
      ],
      false,
      [0.2, 1.4, 0.15, 1.15, 0.1, 1.4, 0.18, 1.1, 0.15, 1.4, 0.1, 1.2, 0.2, 1.4, 0.2]
    ),
    sparkle(16, 17, 22, 29, 0.85, -0.22),
    sparkle(86, 23, 18, 25, 0.8, 0.17),
    sparkle(16, 88, 17, 20, 0.8, -0.14)
  ])
}

import type { ImageMetadata } from 'astro'
import { resolveRecipeImage } from './recipe-image'

const photos = Object.fromEntries(
  Object.entries(
    import.meta.glob<ImageMetadata>('../../recipes/images/*.{webp,png,jpg,jpeg}', {
      eager: true,
      import: 'default'
    })
  ).map(([path, photo]) => [path.replace('../../recipes/', ''), photo])
)

/** Resolve local strings left in the content store when a photo was added later. */
export function resolveRecipePhoto(image: ImageMetadata | undefined): ImageMetadata | undefined
export function resolveRecipePhoto(image: string): ImageMetadata | string
export function resolveRecipePhoto(image: ImageMetadata | string | undefined): ImageMetadata | string | undefined {
  if (typeof image !== 'string') return image
  return resolveRecipeImage(image, photos) ?? image
}

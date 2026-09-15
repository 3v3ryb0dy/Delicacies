import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'
import { categoryById, categoryIds, tagVocabulary } from './config/taxonomy'
import { resolveContentImageReference } from './lib/recipe-image'

// Track available filenames without importing image metadata into the content
// store; Astro's image() helper handles asset optimization for dev and build.
const photos = Object.fromEntries(
  Object.keys(import.meta.glob('../recipes/images/*.{webp,png,jpg,jpeg}')).map((path) => {
    const reference = path.replace('../recipes/', '')
    return [reference, reference]
  })
)

const recipes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './recipes' }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        category: z.enum(categoryIds),
        subcategory: z.string().optional(),
        tags: z.array(z.enum(tagVocabulary)).default([]),
        image: z.preprocess(
          (reference) => (typeof reference === 'string' ? resolveContentImageReference(reference, photos) : reference),
          image().optional()
        ),
        imageAlt: z.string().optional(),
        servings: z.string().optional(),
        source: z.url().optional(),
        note: z.string().optional(),
        wip: z.boolean().default(false),
        /** Marks a recipe whose preparation section is still a placeholder. */
        preparationPending: z.boolean().default(false)
      })
      // A mistyped `subcategory` would drop the recipe from every group on the
      // home page, so it must name a group declared by its own category.
      .superRefine((recipe, ctx) => {
        if (recipe.subcategory === undefined) return
        const declared = categoryById.get(recipe.category)?.subcategories ?? []
        if (declared.some((subcategory) => subcategory.id === recipe.subcategory)) return
        ctx.addIssue({
          code: 'custom',
          path: ['subcategory'],
          message:
            `"${recipe.subcategory}" is not a subcategory of "${recipe.category}". ` +
            `Allowed: ${declared.map((subcategory) => subcategory.id).join(', ') || 'none'}.`
        })
      })
})

/**
 * Long-form prose that is not a recipe: currently just the Vorwort, which is
 * rendered on the home page and reused verbatim by the README generator.
 */
const seiten = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content' }),
  schema: z.object({
    title: z.string().optional(),
    /** One-line summary used in the home page hero. */
    tagline: z.string().optional()
  })
})

export const collections = { recipes, seiten }

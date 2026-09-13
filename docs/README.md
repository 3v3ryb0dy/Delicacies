# Adding a Recipe

When asked to add a recipe, complete the whole workflow:

1. Create `recipes/<slug>.md` using the structure below. Use only categories and tags defined in
   [`src/config/taxonomy.ts`](../src/config/taxonomy.ts); follow an existing recipe for optional fields.
2. Keep the supplied recipe accurate. Use ingredient bullets, preparation blockquotes, and `###` headings for
   components such as dough or sauce. Inside a blockquote, prefix blank lines with `>` so markdownlint remains happy.
3. Create the photo with the canonical prompt template in
   [`image-generation.md`](image-generation.md): copy that template, replace its placeholders, and add only necessary
   dish-specific constraints. Do not substitute a generic or differently structured image prompt. Save the reviewed
   result under `recipes/images/`; for PNG or JPEG sources, run `npm run images:webp` to create the WebP. Then add
   `image` and a useful German `imageAlt`.
4. Save the exact prompt actually submitted, together with its slug and alt text, in
   [`recipe-image-prompts.json`](recipe-image-prompts.json).
5. Run `npm run build` and `npm run check`. The build generates the root `README.md` automatically; never edit its
   recipe count or list by hand.

```md
---
title: Rezeptname
category: hauptgerichte
image: images/rezeptname.webp
imageAlt: Kurze Beschreibung des fertigen Gerichts
tags: [vegetarisch]
---

## Zutaten

- Menge Zutat

## Zubereitung

> Erster Zubereitungsschritt.
>
> Nächster Zubereitungsschritt.
```

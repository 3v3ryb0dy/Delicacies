# Adding a Recipe

When asked to add a recipe, complete the whole workflow:

1. Create `recipes/<slug>.md` using the structure below. Use only categories and tags defined in
   [`src/config/taxonomy.ts`](../src/config/taxonomy.ts); follow an existing recipe for optional fields.
2. Follow the [writing guide](#recipe-writing-style) and keep the supplied recipe accurate. Use ingredient bullets, preparation blockquotes, and `###` headings for
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

## Recipe writing style

Write in German, like a short personal cooking note.

Ingredients:

- One bullet per ingredient, quantity first: `- 70 g Butter (weich)`. Use `g`, `ml`, `EL` and `TL`.
- Put short details in parentheses. Use `n.B.` for optional additions, or `### Optional` for a group.
- Group components under `### Teig`, `### Sauce`, etc. Keep supplied amounts and include ingredients used in the instructions.

Instructions:

- Use short, direct sentences: “Schalotte fein würfeln. Öl erhitzen.” No semicolons, rhetorical flourishes, promotional wording or chatty commentary.
- Give actions in cooking order. Keep useful times, temperatures and doneness cues. Avoid unnecessary explanations or invented details.
- Use `>` prose, not numbered steps or bold step labels. Join closely related instructions with a trailing `\`. Use a blank `>` line for a new stage.

Optional tip:

- Add `## Tipp` before `## Zutaten` only when it adds concrete value: a specific correction when something goes wrong, a non-obvious reason that prevents a mistake, or an optional variation not already explained in preparation.
- Do not repeat preparation steps, ingredient lists, generic serving advice or vague flavour descriptions. Put required actions in preparation. Preparation-ahead advice belongs in a tip only when it adds a concrete timing or storage distinction.
- Prefer one or two short sentences. Do not invent a tip to fill the box; most recipes do not need one.
- Use short blockquoted paragraphs, with a blank `>` line between paragraphs. Keep the text plain, as in preparation instructions.
- The page displays these paragraphs together in a “Tipp” box beneath the title and metadata, beside the photo on desktop. Tips are searchable and included in print.
- Omit the section when there is no tip. An empty section produces no box.

```md
## Tipp

> Das Öl auf 175–180 °C erhitzen.
>
> Nur kleine Portionen auf einmal frittieren.
```

## Alternative preparation methods

Keep one shared ingredient list and a complete normal method under `## Zubereitung`.
Add an optional `## Zubereitung (Thermomix)` section for a complete alternative procedure.
Within each method, use `###` component headings and blockquoted paragraphs as usual:

```md
## Zubereitung

### Creme

> Mit dem Handrührgerät verrühren.

## Zubereitung (Thermomix)

### Creme

> 20 Sek. / Stufe 4 verrühren.
```

The Normal / Thermomix selector appears only when both methods contain instructions.
Each visit starts in Normal mode; the method selection is not saved. Ingredients, tips,
pairings and notes are shared. Printing includes the selected method and its name.
Without JavaScript, both methods are shown with explicit labels. Search indexes both
methods as one recipe. Existing recipes require no changes.

Each method must include all steps, including assembly, cooling and serving; do not refer
readers to steps hidden in the other method. `preparationPending: true` continues to hide
preparation instructions until they are ready. Use `wip: true` for a complete but untested
recipe, such as the TM5/TM6 instructions in `cheesecake-im-glas.md`.

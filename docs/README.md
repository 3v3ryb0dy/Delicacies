# Adding a Recipe

When asked to add a recipe, complete the whole workflow:

1. Create `recipes/<slug>.md` using the structure below. Use only categories and tags defined in
   [`src/config/taxonomy.ts`](../src/config/taxonomy.ts); follow an existing recipe for optional fields.
2. Follow the [writing guide](#recipe-writing-style) and keep the supplied recipe accurate. Use ingredient bullets, preparation blockquotes, and `###` headings for
   components such as dough or sauce. Inside a blockquote, prefix blank lines with `>` so markdownlint remains happy.
3. Create the photo with the canonical prompt template in
   [`image-generation.md`](image-generation.md): copy that template, replace its placeholders, and add only necessary
   dish-specific constraints. Do not substitute a generic or differently structured image prompt. Save the reviewed
   result under `recipes/images/` and run `npm run images:webp` to create the WebP; only the WebP is committed, the
   PNG or JPEG source stays out of the repository. Then add `image` and a useful German `imageAlt`. Prefer
   `image: images/<slug>` without an extension, which uses whichever supported format exists; a named extension must
   match the file on disk.
4. Save the exact prompt actually submitted, together with its slug and alt text, in
   [`recipe-image-prompts.json`](recipe-image-prompts.json).
5. Run `npm run check` and `npm run build`. The build generates the root `README.md` automatically; never edit its
   recipe count or list by hand. `npm run check` fails on a recipe without `## Zutaten` or `## Zubereitung`, an
   unknown category or subcategory, a missing image and an unresolvable pairing link; `npm run build` then checks the
   built HTML (links, anchors, duplicate ids, nested anchors) and the Pagefind index.

## Local hooks

`npm install` activates the hooks in [`.githooks/`](../.githooks) by setting `core.hooksPath` for this clone; run
`npm run hooks:install` to do the same by hand. They keep a commit from turning into a red pipeline:

- **pre-commit** (about a second): formats the staged files and stages them again, regenerates `README.md` when it is
  behind the recipes, then runs the unit tests and the recipe/content check. It does not run `astro check` or the site
  build, so commits stay quick.
- **pre-push**: runs `npm run ci`, which is `npm run check` followed by `npm run build` — the same gate as CI. Deleting
  a remote branch runs nothing.

Use `git commit --no-verify` or `git push --no-verify` only when a check is knowingly wrong; CI still runs the full
gate on the pull request and on `master`.

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

Names, categories and tags:

- Use consistent German spelling for compound names, e.g. `Bohnen-Hummus` and `Maracuja-Limetten-Dressing`. Keep existing slugs stable when correcting a display title.
- Choose the category by the recipe's main use. Vegetable sides belong under `beilagen` / `gemuese`, even when they could also be served as a small main course.
- Tag the actual recipe, not every optional variation. Use `fisch` or `meeresfrüchte` when fish or seafood defines the dish, not merely for a little fish sauce. Use `ofen` for baking and `frittiert` for deep-frying, not ordinary pan-frying.
- Set dietary tags only when the ingredients support them. Keep `vegetarisch` alongside `vegan` so both filters find vegan dishes.

Pairings:

- Add a short line after preparation, e.g. `Passende Dips: [Bohnen-Hummus](bohnen-hummus.md).` Link existing recipes with their Markdown filename; use plain text when no recipe exists.
- Choose a few useful combinations. For dishes served together, a reverse link makes the combination discoverable from either recipe. Not every recipe needs pairings.
- Keep serving combinations out of the tip box and preserve personal serving traditions.

Ingredients:

- One bullet per ingredient, quantity first: `- 70 g Butter (weich)`. Use `g`, `ml`, `EL` and `TL`.
- Put short details in parentheses. Use `n.B.` for optional additions, or `### Optional` for a group.
- Group components under `### Teig`, `### Sauce`, etc. Keep supplied amounts and include ingredients used in the instructions.

Instructions:

- Use short, direct sentences: “Schalotte fein würfeln. Öl erhitzen.” No semicolons, rhetorical flourishes, promotional wording or chatty commentary.
- Give actions in cooking order. Keep useful times, temperatures and doneness cues. Avoid unnecessary explanations or invented details.
- Use `>` prose, not numbered steps or bold step labels. Join closely related instructions with a trailing `\`. Use a blank `>` line for a new stage.
- Consecutive quoted text lines do not create separate paragraphs. End the preceding line with `\` for a deliberate line break within the same stage; insert a line containing only `>` for a separate paragraph. Keep doneness cues and corrections with the action they explain. Do not force a break after every sentence or leave a trailing `\` before a blank line, heading or the end of a section.

Optional tip:

- Add `## Tipp` before `## Zutaten` only when it adds concrete value: a specific correction when something goes wrong, a non-obvious reason that prevents a mistake, or an optional variation not already explained in preparation.
- Do not repeat preparation steps, ingredient lists, generic serving advice or vague flavour descriptions. Put required actions in preparation. Preparation-ahead advice belongs in a tip only when it adds a concrete timing or storage distinction.
- Prefer one or two short sentences. Do not invent a tip to fill the box; most recipes do not need one.
- Use one blockquoted paragraph. For separate lines, end the preceding line with `\` and start the next with `>`. Do not insert blank `>` lines within tips. Keep the text plain, as in preparation instructions.
- The page displays the tip as one paragraph with `<br />` line breaks in a “Tipp” box beneath the title and metadata, beside the photo on desktop. Tips are searchable and included in print.
- Omit the section when there is no tip. An empty section produces no box.

```md
## Tipp

> Das Öl auf 175–180 °C erhitzen.\
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

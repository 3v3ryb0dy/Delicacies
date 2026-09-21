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

### Ronny's favorites

Set `isFavorite: true` in a recipe's front matter to award “Ronnys Favorit”.
Omit it (or use `false`) for other recipes. Favorites receive a muted orange
bookmark and a handwritten hover note on cards, including related recipes.
On recipe pages, the note is permanently visible at the bottom right of the
photo, with a round heart badge next to the category, styled like the WIP badge.
There is no extra box above
the title. Without a photo, a compact heart and quote appear below the title.

```yaml
isFavorite: true
favoriteText: "Das könnte ich jeden Tag essen. ★"
```

`favoriteText` is optional. An omitted, empty or whitespace-only value picks a
random note on each card hover or keyboard focus, without consecutive repeats:

- “Da könnte ich mich reinlegen.”
- “Davon nehme ich noch eine Portion.”
- “Könnte ich jeden Tag essen.”
- “Den letzten Bissen teile ich nicht.”
- “Das macht einfach glücklich.”

The hand-drawn doodle is chosen independently from six shapes with equal probability on
each hover or keyboard focus. The detail page and the card's fallback without
JavaScript use the first phrase with a heart. A custom
`favoriteText` stays fixed. Custom text must contain **20–40
characters**, including spaces, punctuation and symbols. Leading/trailing spaces
are removed and repeated whitespace becomes one space before counting. Emoji
variation selectors do not count as extra characters. Invalid lengths fail the
content build with a validation error; text is never silently truncated.

#### Doodle symbols

Copy a symbol into `favoriteText` to select its hand-drawn doodle:

```yaml
isFavorite: true
favoriteText: "Das macht einfach glücklich. ✨"
```

| Symbol | Drawing |
| --- | --- |
| `♥`, `♡`, `❤`, `❤️` | Heart |
| `★`, `☆`, `⭐` | Star |
| `✨` | Three curved sparkles |
| `♦`, `♦️` | Four diamonds |
| `✧` | Large sparkle with small companions |
| `✺` | Curved starburst with small sparkles |

Symbols can appear anywhere in the text and are replaced by variable-width pen
drawings; multiple symbols can be combined. Each symbol counts as one character
toward the 20–40 character limit. If no symbol is supplied, a heart is appended.
The bookmark always uses a heart, independently of the note's symbols. The same custom text and drawings
appear on the recipe detail page. Existing recipes need no changes.

The detail-page note is static, including its doodles, and uses the same paper
stripes and font as the cards. Its text, doodle and stripes scale together:
smaller on phones, gradually larger on desktop, with a maximum size and a width
limit to keep the note on the photo. Card notes retain their existing size.
Only the photo receives the desktop fade mask. The note sits slightly farther
down and right on desktop. The entire note, including text, doodle and paper
stripes, uses 75% opacity at every screen size. The heart badge and card notes keep
their existing opacity. In print, the overlays disappear
and a plain “Ronnys Favorit” label is shown above the title.

The note automatically splits into two lines, keeping words together. Each
background stripe fits its line's text and symbols. After the locally hosted
Caveat font loads, the browser measures the actual text to refine the layout;
without JavaScript, the server provides a conservative layout. Long notes scale
to fit narrow cards. Text and symbols draw in reading order in about 0.9 seconds
on mouse hover or keyboard focus. Reduced-motion preferences show the complete
note immediately. The overlay never intercepts clicks or introduces a tap step
on touchscreens.

The bookmark's “Ronnys Favorit” label remains available to screen readers and as
a tooltip. Favorites do not change categories, ordering or search. In print,
only the plain award label remains.

### Writing recipes

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
- When setting or scaling the number of servings, prefer quantities that use common package sizes sensibly and avoid awkward leftovers. Treat this as a soft preference: preserve the supplied recipe and its ratios, and do not force package use by introducing unusual serving counts or unnecessarily precise ingredient amounts.
- Put short details in parentheses. Use `n.B.` for optional additions within the relevant component; small optional additions do not need their own heading.
- Add `###` headings only for distinct components such as dough and sauce. Usually two or three components are enough; four can make sense for a more elaborate recipe. Keep simple recipes ungrouped.
- Use the same component headings in the same order for ingredients and every preparation method. The page numbers groups independently on each side, so do not add separate preparation, baking or serving groups. Include those actions as paragraphs in the relevant component, with final assembly at the end.
- Do not leave an untitled opening block before component headings: it also counts as a group. Put preparation directly in the appropriate component and describe parallel work explicitly without losing the cooking order.
- Keep supplied amounts and include ingredients used in the instructions. When merging groups, distinguish repeated ingredients by their use, such as butter for frying and finishing or egg for brushing. Preserve optional components and complete variant quantities.

Instructions:

- Use short, direct sentences: “Schalotte fein würfeln. Öl erhitzen.” No semicolons, rhetorical flourishes, promotional wording or chatty commentary.
- Repeat fixed amounts of pantry ingredients at each new addition so readers do not need to scroll back to the ingredient list: “1 TL Oregano zugeben”, “200 ml Gemüsebrühe angießen”. Include liquids, seasonings, fats, dairy, baking ingredients, rice, pasta, pulses and nuts, as well as measured herbs. Piece counts and fresh main ingredients such as meat, fish, fruit and vegetables need not be repeated. Treat whole packets and yeast cubes like pieces, but include measured portions of them.
- Omit repeated amounts for simple mixtures whose ingredients can all be weighed together in one bowl, mixer or cold pot, including clearly defined components such as a dressing, dry mixture or syrup. This also applies when the ingredients are named individually instead of “alle Zutaten”. Separate heating, melting, roasting and later additions after a processing step still need their amounts; adding several ingredients to a hot pan is not a shared weighing step.
- For split additions, state the amount needed at each step, not the full amount again. If later additions are variable, name the total before the first addition and draw subsequent portions from that measured supply. Do not invent an unclear split. Already measured ingredients or prepared mixtures need no repeated amounts when returned to the pan, folded in or portioned out.
- Repeat salt, pepper and sugar amounts only when the recipe gives a fixed quantity, including pinches. Preserve units, ranges, alternatives and optional additions. Keep unmeasured additions and seasoning to taste unmeasured.
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

## Ingredient-aware Küchenwissen

Reusable technique guides live in [`src/config/ingredient-tips.ts`](../src/config/ingredient-tips.ts).
Select them explicitly in a recipe's front matter:

```yaml
ingredientTips: [reis-waschen, knoblauch-braten]
```

Omit the field when no guide adds value. This is an editorial choice based on the
actual cooking method: a steak guide does not belong on a braise, and a fileting
guide is unnecessary when a recipe uses only juice. The initial catalog covers
rice washing, mushroom browning, avocado preparation, citrus fileting, steak
searing, tofu browning, garlic frying and citrus zest. `steak-braten` is available
for future recipes without being attached to a current dish.

Each guide has a stable ID, title, ingredient aliases, introduction, short points,
an optional closing note and editorial source links. Write concise German and
verify culinary claims against those sources. The sources stay in the catalog
for future editing; the cooking UI contains the guide itself.

Only guides selected by the recipe are matched, and only against ingredient
rows. Aliases are literal, case-insensitive phrases bounded by Unicode word
boundaries, not regular expressions. Add plural forms and compounds explicitly.
Use a qualified phrase when needed: `Zitrone (Abrieb` matches a zest ingredient,
whereas `Zitrone` would also match `½ Zitrone (Saft)`. A shorter alias never
matches inside a longer word, so `Reis` does not match `Reisbandnudeln`.

The content check and page build reject unknown IDs, duplicate selections and
selected guides without any matching ingredient. Errors name the recipe and
guide ID. Multiple aliases for the same guide still produce one guide per row.
If several guides match a row, one lightbulb opens them in frontmatter order.
Repeated ingredients in separate groups can each have a lightbulb.

**Keep required actions in the preparation.** For example, explicitly tell the
reader to rinse and drain the rice in the steps; the guide explains which other
varieties are treated differently. Keep recipe-specific corrections and
variations under `## Tipp`. Neither kind of tip should repeat the entire method.

The small lightbulb opens on click, tap or keyboard activation. It shows a
popover beside the ingredient on desktop, and a bottom sheet below 600px.
Escape, the close button or clicking outside dismisses it and returns focus to
the ingredient. Without JavaScript or native dialog support, the same advice is
available in expandable sections beneath the ingredient. There is no saved
selection or separate knowledge page. Shared guides and their controls are
excluded from print and recipe search; recipe-specific tips remain included.

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

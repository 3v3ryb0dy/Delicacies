# Recipe Image Generation

This guide describes how the recipe photos for this cookbook are created. The goal is a consistent,
calm look across all recipes: warm, natural, homemade, and without commercial or restaurant styling.

## Workflow

1. Copy the prompt below.
2. Replace the placeholders: `[DISH NAME]` and `[KEY INGREDIENTS / APPEARANCE]`.
3. Generate the image.
4. Review the result: are all ingredients plausible and recognizable? Does the portion look realistic?
5. Save the image as `recipes/images/<slug>.webp` and set `image` and `imageAlt` in the recipe frontmatter.

The `image` field accepts a filename or a path without an extension:

```yaml
image: images/pad-thai
imageAlt: Pad Thai in einer Keramikschale
```

An existing exact filename takes priority. Otherwise, the same name is tried with `.webp`, `.png`,
`.jpg`, then `.jpeg`. This keeps older recipe references working after converting an image to WebP.
Keep only the desired photo for each name to avoid ambiguity. If no matching file exists, the build
reports a missing image; recipes without an `image` field keep their placeholder.

The image must show the actual recipe. Do not invent ingredients, garnishes, or side dishes that are
not part of the recipe file.

## Prompt Template

```text
Create a realistic editorial food photograph of [DISH NAME].

The finished dish should accurately reflect these key ingredients and characteristics:
[KEY INGREDIENTS / APPEARANCE]

Presentation:
Serve the dish in/on [PLATE OR BOWL], styled naturally as homemade food rather than fine dining. The portion should look generous, appealing, and believable. Avoid unnecessary garnishes or ingredients that are not part of the recipe.

Photography style:
Warm modern European cookbook photography, understated and natural. Soft daylight coming from one side, gentle realistic shadows, slightly warm white balance, rich but believable food colors, subtle texture, and a calm editorial atmosphere.

Composition:
Photograph from a natural three-quarter angle, slightly above the dish. Keep the food clearly recognizable and make it the visual focus. Use an uncluttered composition with some negative space around the dish. Do not crop important parts of the food.

Setting:
Warm cream or light beige tabletop/background, simple handmade ceramic tableware, restrained natural materials such as linen or wood. Include at most one or two subtle props. A small muted burnt-orange accent may appear in a napkin, ceramic detail, or other unobtrusive element.

Aesthetic:
Personal cookbook, warm, timeless, slightly rustic, contemporary European, appetizing but not glossy or commercial. The image should feel like a beautifully photographed meal someone genuinely cooked at home.

Realism:
Natural food texture, realistic portions, plausible ingredient placement and cooking results. Avoid exaggerated perfection, excessive shine, artificial symmetry, oversaturated colors, impossible food structures, or obviously AI-generated details.

No text, labels, logos, people, hands, packaging, restaurant setting, elaborate tablescape, decorative flowers, or unrelated food.

Aspect ratio: 4:3.
```

## Placeholders

| Placeholder                      | Content                                                                 |
| -------------------------------- | ----------------------------------------------------------------------- |
| `[DISH NAME]`                    | Name of the dish, e.g. "creamy leek and cheese soup"                    |
| `[KEY INGREDIENTS / APPEARANCE]` | Main ingredients, consistency, color, and plating taken from the recipe |
| `[PLATE OR BOWL]`                | Specific tableware, e.g. "a shallow cream ceramic bowl"                 |

## Aspect Ratio

Always generate images in `4:3`. The aspect ratio is fixed in the prompt and must not be changed, so
all recipe photos share the same proportions and fit the recipe cards without cropping.

## Notes

- For dishes with unusual textures (soups, sauces, doughs), describe in the placeholder how the
  result actually looks instead of relying on the image model.
- Only save and reference the image after reviewing it; the `image` frontmatter field points to the
  path relative to the recipe file, i.e. the path under `recipes/images/`.
- The prompt intentionally avoids top-down table shots and unusual perspectives. The calm
  three-quarter view is part of the recognizable style.

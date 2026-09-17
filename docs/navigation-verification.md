# Recipe navigation verification

Verified in the Codex integrated browser on 2026-09-17 against the development server
(`http://localhost:4321/`) and the built site (`http://localhost:4322/`). Desktop and
390 × 844 layouts were checked. Browser checks below are a repeatable manual regression
suite; the controller/history tests run automatically with `npm test`.

## Before and after

| Before                                                                    | After                                                                                   |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Category links cleared search and tags.                                   | They navigate within the current results and preserve filters.                          |
| Fresh searches disappeared on reload.                                     | `q` and repeated `tag` parameters reconstruct the view.                                 |
| Recipe tags all linked to the recipe's category.                          | Each tag opens the corresponding filtered overview.                                     |
| The overview link created another history entry.                          | Known in-site journeys use `history.back()`; direct visits retain an overview fallback. |
| Returning to search exposed unavailable categories.                       | Categories are calculated from the current visible results.                             |
| Selected filters scrolled out of sight; the mobile switch lost its label. | Removable filters remain in the sticky bar and Versuchsküche stays labelled.            |
| Related recipes ignored the untested preference.                          | Suggestions select up to three eligible recipes.                                        |

## Browser regression journeys

Start in a fresh tab with Versuchsküche off. When comparing scroll positions, click a
visible card at its screen position: automated locator clicks may scroll the card into
view before activation, changing the position legitimately recorded by the application.

| Journey                                                                                                    | Expected / observed result                                                                                             |
| ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Scroll naturally, then click a category.                                                                   | Active category follows scrolling; the clicked heading clears the sticky controls. Scrolling does not rewrite the URL. |
| Search `kartoffel`, press Enter, click Suppen, Back, reload.                                               | Search and grouped results survive; Back restores the previous viewport.                                               |
| Search, open Pastinakensuppe, scroll, reload.                                                              | Recipe stays open at its reading position; both return controls say Zurück.                                            |
| Pastinakensuppe → related Käse-Lauch-Suppe → Zurück → Zurück.                                              | First returns to Pastinakensuppe, second to the original search.                                                       |
| Click vegetarisch on Pastinakensuppe.                                                                      | Opens `/?tag=vegetarisch`, showing 24 of the 35 tested recipes and a removable tag.                                    |
| Activate Suppen with Enter.                                                                                | The visible section receives keyboard focus below the sticky bar.                                                      |
| Search `quantum spaceship`, then reset.                                                                    | Shows Keine Treffer and Keine Rezepte gefunden; reset restores the overview and focuses search.                        |
| Open Pastinakensuppe directly in a fresh tab.                                                              | Both controls say Zur Übersicht and lead to `/#rezept-pastinakensuppe`.                                                |
| Phone width: scroll the category row using its arrow, choose Saucen during search, remove the search chip. | Overflow is discoverable; heading is visible; chip removal restores ordinary browsing with focus retained.             |
| Toggle Versuchsküche and inspect related suggestions.                                                      | Off excludes untested suggestions; on permits them.                                                                    |

Pagefind and the development fallback have different token matching/ranking. Compare
navigation and preservation of each engine's own results, rather than requiring identical
recipe matches. For example, Pagefind may match repeated `z` characters to an indexed
abbreviation; use `quantum spaceship` for the empty-result check.

## Automated coverage

- History provenance, recipe A/B Back behavior, reload/traversal, direct visits,
  modified/new-tab clicks, external referrers, stale handoffs, and blocked storage.
- Overview state before any recipe visit; URL-based query/tag initialization; search
  history coalescing; category Back restoration; reset behavior; category visibility.
- Asynchronous search cancellation, layout restoration, cancellation by user interaction,
  Pagefind failure fallback, and temporary reveal of directly linked untested cards.
- Related-suggestion filtering and re-synchronization when a cached page is restored.
- Full project checks, plus built HTML links, fragments, duplicate IDs, nesting, and
  Pagefind index coverage.

The implementation keeps ordinary anchors as progressive-enhancement fallbacks. When
session storage cannot prove a previous in-site entry, it deliberately uses Zur Übersicht.

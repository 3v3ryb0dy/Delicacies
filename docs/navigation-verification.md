# Recipe navigation verification

Verified in the Codex integrated browser on 2026-09-17 against the development server
(`http://localhost:4321/`) and the built site (`http://localhost:4322/`). Desktop and
390 × 844 layouts were checked. Browser checks below are a repeatable manual regression
suite; the controller/history tests run automatically with `npm test`.

Search grouping was checked again on 2026-09-27 in Arc against the built site
(`http://127.0.0.1:4322/`), on desktop and in the iPhone 16 viewport (393 × 852).
The checks covered field navigation, recipe opening/return and mobile layout.
The real generated Pagefind index was also queried for `Pfifferling`,
`Lachs Pfifferling`, `Pfifferling unbekannt` and `Kartoffel`.

## Before and after

| Before                                                                    | After                                                                                          |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Category links cleared search and tags.                                   | Search uses field links that navigate within results and preserve filters.                     |
| Search grouped results by cookbook category, obscuring relevance.         | Groups appear as Im Titel, In den Zutaten, Im Rezepttext, Passt dazu; empty groups are hidden. |
| Fresh searches disappeared on reload.                                     | `q` and repeated `tag` parameters reconstruct the view.                                        |
| Recipe tags all linked to the recipe's category.                          | Each tag opens the corresponding filtered overview.                                            |
| The overview link created another history entry.                          | Known in-site journeys use `history.back()`; direct visits retain an overview fallback.        |
| Returning to search exposed unavailable categories.                       | Only matching field groups are shown; clearing search restores categories.                     |
| Selected filters scrolled out of sight; the mobile switch lost its label. | Removable filters remain in the sticky bar and Versuchsküche stays labelled.                   |
| Related recipes ignored the untested preference.                          | Suggestions select up to three eligible recipes.                                               |

## Browser regression journeys

Start in a fresh tab with Versuchsküche off. When comparing scroll positions, click a
visible card at its screen position: automated locator clicks may scroll the card into
view before activation, changing the position legitimately recorded by the application.

| Journey                                                                                       | Expected / observed result                                                                                             |
| --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Scroll naturally, then click a category.                                                      | Active category follows scrolling; the clicked heading clears the sticky controls. Scrolling does not rewrite the URL. |
| Search `kartoffel`, press Enter, choose In den Zutaten, Back, reload.                         | Search and grouped results survive; Back restores the previous viewport.                                               |
| Search `Pfifferling` with Versuchsküche off.                                                  | The soup and filet appear under Im Titel; Kurz gebeizter Lachs appears last under Passt dazu.                          |
| Search `Lachs Pfifferling`, then `Pfifferling unbekannt`.                                     | Both matching recipes appear under Im Titel; adding an unknown required word returns no results.                       |
| Open `/?q=Kartoffel#suppen` or `/?q=Kartoffel#suche-suppen`.                                  | Legacy category anchors lead to the search results heading without clearing the query.                                 |
| Search, open Pastinakensuppe, scroll, reload.                                                 | Recipe stays open at its reading position; both return controls say Zurück.                                            |
| Pastinakensuppe → related Käse-Lauch-Suppe → Zurück → Zurück.                                 | First returns to Pastinakensuppe, second to the original search.                                                       |
| Click vegetarisch on Pastinakensuppe.                                                         | Opens `/?tag=vegetarisch`, showing matching recipes and a removable tag.                                               |
| Activate In den Zutaten with Enter during search, or Suppen without search.                   | The visible section receives keyboard focus below the sticky bar.                                                      |
| Search `quantum spaceship`, then reset.                                                       | Shows Keine Treffer and Keine Rezepte gefunden; reset restores the overview and focuses search.                        |
| Open Pastinakensuppe directly in a fresh tab.                                                 | Both controls say Zur Übersicht and lead to `/#rezept-pastinakensuppe`.                                                |
| Phone width: scroll the field row using its arrow, choose Passt dazu, remove the search chip. | Overflow is discoverable; heading is visible; chip removal restores ordinary browsing with focus retained.             |
| Toggle Versuchsküche and inspect related suggestions.                                         | Off excludes untested suggestions; on permits them.                                                                    |

Pagefind and the local fallback use the same four fields and group priorities. All query
terms must match somewhere in a recipe, but any matching title term puts it in Im Titel.
Pagefind keeps its relevance order within a group; the fallback uses German title order.
Their token matching still differs (German stemming versus case-insensitive substrings).
Pagefind 1.5 can return partial metadata matches for multiword queries, so the explorer
intersects per-term result IDs while retaining the full query's ordering and excerpts.
The fallback data is included on overview cards in both development and production,
including pairing labels without Markdown destinations, tips and notes.

Typing (including deletion and the one-character threshold) updates results without
requesting a scroll. The previous list and navigation remain visible until the new
results and their fragments are loaded; the new groups replace the old ones in one DOM
operation. Enter and explicit filter/group actions still scroll to their destination.
The navigation row keeps its height even when there are no matching groups.

## Automated coverage

- History provenance, recipe A/B Back behavior, reload/traversal, direct visits,
  modified/new-tab clicks, external referrers, stale handoffs, and blocked storage.
- Overview state before any recipe visit; URL-based query/tag initialization; search
  history coalescing; category Back restoration; reset behavior; category visibility.
- Asynchronous search cancellation, layout restoration, cancellation by user interaction,
  Pagefind failure fallback, and temporary reveal of directly linked untested cards.
- Debounced typing/deletion without scrolling, Enter scrolling, and retaining the current
  list/navigation through delayed searches and fragment loading before an atomic replacement.
- Search-field extraction and priority, multiword AND across fields, recipe deduplication,
  group counts/order, field navigation and legacy search anchors. A real in-memory Pagefind
  index checks metadata matches, German compounds/inflections and partial-match exclusion.
- Related-suggestion filtering and re-synchronization when a cached page is restored.
- Full project checks, plus built HTML links, fragments, duplicate IDs, nesting, and
  Pagefind index coverage.

The implementation keeps ordinary anchors as progressive-enhancement fallbacks. When
session storage cannot prove a previous in-site entry, it deliberately uses Zur Übersicht.

# Internal link audit

Method: a script (run via the project's own test runner against the real `GUIDES` array and `LIFE_AREAS` data, not a crawler against rendered HTML) checked every link relationship the codebase actually generates, against the actual route table (137 guide slugs, 8 area slugs, 9 published product slugs). Full raw output is in the PR's own history; this is the readable summary.

## What was checked, and the result for each

| Check | Result |
|---|---|
| Guides with `areaSlug: null` (the codebase's own definition of "orphan") | **0** |
| Guides belonging to an area but missing from that area's hub `startHere`/`clusters` (reachable from `/guides` but not from category-level browsing) | **0** |
| `startHere`/cluster entries pointing at a guide that doesn't exist, or belongs to a different area | **0** |
| Broken `related[]` references (curated pick pointing at a nonexistent slug) | **0** |
| Broken `next` references | **0** |
| `related[]` picks pointing outside the guide's own area (silently dropped by `relatedPicks()`, so dead weight even if not literally broken) | **0** |
| Broken inline body links (`/guides/...`, `/shop/...` pointing at a slug that doesn't resolve) | **0** |
| `primaryQuery` collisions between two guides | **0** |
| Guides with no `primaryQuery` at all | **0** |

## The one real signal found: inbound inline citations

11 of 137 guides are never cited by name inside another guide's prose (a `[text](/href)` link embedded in a paragraph, list item, or FAQ answer). Investigated each one individually:

**Every one of the 11 already has its own 3 curated `related` picks and its own `next` pick**, which render as real, prominent, crawlable HTML links via `NextSteps.tsx` on every guide that links to them — not a weaker signal than an inline citation, arguably a stronger one (it's the featured "do this next" card, not an incidental mention). Two representative checks:

- `how-to-start-homeschooling-first-month-paperwork`'s own `next` field already points at `homeschool-notice-of-intent-explained` with a hand-written reason. It did not need an inline link added on top of that.
- `winterize-your-house-checklist`'s `related` already includes the more specific `fall-home-maintenance-checklist` rather than the broader `home-maintenance-checklist-by-month` I initially guessed it should cite. The existing curation is better than my hypothesis; no change was made.

**Conclusion:** this finding is real but not a defect. It's reported because the brief asked for it, not because it needed fixing. No inline links were force-added purely to clear this list, per the brief's own rule against inserting links to hit a quota.

## Links added in this pass

One inline link, inside the one article that was substantively enriched (see deliverable 5): `named-executor-what-you-agreed-to-uk` now cites `what-to-do-when-a-parent-dies-uk` inline, in its opening section, pointing a reader also handling registration/certificates to the guide that covers that side of it. Natural fit, already existed as a `related` pick, now also reachable from the prose itself.

## What "canonical," "indexable," and "redirects" look like in this codebase

Worth stating plainly since the brief asks for these per-article: there is no separate redirect layer or canonicalization logic to audit for guides specifically. Every guide page is statically generated (`dynamicParams = false`, `generateStaticParams` enumerates all 137 slugs plus 8 area slugs at build time), so an "unindexable" or "soft 404" guide is not structurally possible; an unknown slug 404s outright rather than rendering a thin page. `generateMetadata` sets `alternates.canonical` to the guide's own self-referencing path on every guide, and `robots: { index: true, follow: true, ... }` is set explicitly (not defaulted) on every guide. The two locale-paired guides (US/UK) each declare `hreflang` alternates pointing at each other, reciprocally, via `localeAlternates()` — verified both pairs do so correctly (see `04-content-opportunity-map.md`).

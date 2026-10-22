# Draftpace SEO audit — Phase 1 (article SEO, search intent, internal linking)

Run against the repository at commit `bbf6828` (branch `claude/draftpace-rebuild`), using the Search Console export `draftpace.com-Performance-on-Search-2026-10-22.zip` (Sep 23 to Oct 20, 2026, Web text-based search, 327 impressions, 3 clicks).

**Read these in order:**

1. [`01-article-inventory.csv`](./01-article-inventory.csv) — all 137 guides, one row each: title, URL, category, metadata, primary query, related/next/inline links, GSC data where available, recommended action.
2. [`02-search-intent-research.md`](./02-search-intent-research.md) — what was actually researched, with sources, and what's confirmed vs. a small-sample hypothesis.
3. [`03-internal-link-audit.md`](./03-internal-link-audit.md) — the full link-graph check: orphans, broken links, hub coverage, inbound citations.
4. [`04-content-opportunity-map.md`](./04-content-opportunity-map.md) — the honest summary: what's genuinely KEEP, REFINE, or RESEARCH FURTHER, and why the numbers are smaller than a typical audit finds.
5. [`05-before-after-changes.md`](./05-before-after-changes.md) — the one article actually changed in this pass, in full.
6. [`06-remaining-roadmap.md`](./06-remaining-roadmap.md) — what's worth doing next, ranked by evidence.

## The headline finding, up front

**This guides layer does not have the structural SEO problems the brief anticipated.** A full automated audit of the link graph (every `related[]`, every `next`, every inline `[text](/href)` citation, every area hub's `startHere`/`clusters` coverage) found:

- **0 orphaned guides** (every guide has a resolved life area or is explicitly SERIES-tagged)
- **0 broken internal links** of any kind (related, next, or inline body citations)
- **0 guides missing from their own area hub's browse structure**
- **0 `primaryQuery` collisions** across all 137 guides
- **0 guides with no `primaryQuery`**
- **136 of 137 guides have a FAQ block, sources where factual claims need them, and 3+ curated related picks**

The one real structural outlier (`named-executor-what-you-agreed-to-uk`, 43% shorter than any other guide, the only one missing a FAQ block, the only one missing a sources array) has been fixed in this PR — see deliverable 5.

Given that, this report does not manufacture 8-12 rewrites to hit a quota the evidence does not support. It documents what was checked, what was found, the one genuine fix made, and a small number of pages worth watching with more Search Console data rather than acting on now. Per the brief's own instruction: "Do not automatically modify every article to improve a scoring metric" and "Where a different existing article demonstrates a clearer opportunity, use the evidence to prioritize it."

## Quality gates

```
npx tsc --noEmit     — clean
npx eslint .          — clean (2 pre-existing unrelated warnings)
npm run test          — all passing (see exact count in the PR description)
npm run build         — all 137 guide routes + 8 area hubs + /guides index build and are statically generated
```

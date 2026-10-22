# Content opportunity map

Full per-guide detail is in `01-article-inventory.csv` (137 rows, one `recommendedAction` each). This is the summary and the reasoning behind it.

## The distribution

| Status | Count | What it means here |
|---|---:|---|
| KEEP | 132 | No structural, accuracy, or linking defect found. Not re-read line by line beyond the structural scan; flagged if a future GSC export shows real traffic and a problem. |
| RESEARCH FURTHER | 4 | Real GSC impressions with an anomaly (zero clicks, or a very low average position) that doesn't yet have enough data to act on responsibly. |
| REFINE (done) | 1 | `named-executor-what-you-agreed-to-uk` — see deliverable 5. |

## Why 132 is "KEEP" and not something more exciting

Every guide in that 132 was checked for the objective, evidence-based signals this audit actually ran: does it have a FAQ block (136/137 do), does it have a `primaryQuery` (137/137 do), is it reachable from its area hub and the main index (137/137 are), does it cite real sources where it makes a checkable factual claim, does its `related`/`next` resolve to real guides (137/137 do). None of those checks found a second outlier beyond the one guide that was fixed.

The 12 guides the brief named as starting candidates were read in full, not just scanned structurally. All twelve were already answering the query directly in their opening paragraphs, already had FAQ blocks addressing the obvious follow-up questions, already cited real sources where they made a checkable claim, and in the three cases checked against live search results (symptom log, doctor questions, irregular income budgeting), already covered what competing results cover or had a documented, deliberate reason not to (see `02-search-intent-research.md` item 4).

## Content overlap check (Phase E)

The brief named several pairs to check for unjustified overlap. Checked by comparing `primaryQuery`, `dek`, and opening paragraph for genuine distinctness (not full re-reads of every pair, given none showed a collision in the automated `primaryQuery` uniqueness check, which would catch an exact-duplicate target):

- **`monthly-bills-list` vs. `how-to-budget-with-irregular-income`**: distinct. One is "list every bill and convert irregular-frequency ones to a monthly figure," the other is "budget from your lowest months when your income itself varies." Different inputs (bills vs. income), different primary queries, cross-linked appropriately (the bills list is cited from the irregular-income guide's own setup steps).
- **`available-balance-vs-current-balance` vs. `how-much-of-your money-is-actually-safe-to-spend`** (the guide both `available-balance` and `bank-statement-csv-to-budget` point their `next` at): distinct. One explains two numbers a bank shows; the other is the actual safe-to-spend calculation. The first explicitly hands off to the second rather than duplicating its content.
- **`homeschool-notice-of-intent-explained` vs. `homeschool-record-keeping-requirements-by-state`**: distinct and already cross-linked both directions (confirmed in the link audit). One is "what the one-time or annual filing is," the other is "what ongoing records your state wants you to hold."
- **`how-to-catch-up-on-homeschool-records` vs. `homeschool-record-keeping-for-multiple-children`**: distinct problems (a time gap vs. a multiple-children filing structure), not competing for the same intent.

No overlap requiring a merge, redirect, or canonicalization was found. None was created, consistent with the brief's instruction that any such action needs explicit review, which none of these cases warrant.

## Locale pairs (US/UK)

Both US/UK pairs checked for genuine parity:

- `what-to-do-when-a-parent-dies` (1,539 words) / `what-to-do-when-a-parent-dies-uk` (1,400 words) — comparable depth, both have FAQ and sources, both declare reciprocal hreflang. No action.
- `named-executor-what-you-agreed-to` (full-depth: FAQ, 5 sources, timeline, "you can be paid" section) / `named-executor-what-you-agreed-to-uk` (before this PR: 532 words, no FAQ, no sources, the shortest guide in the corpus by a 43% margin) — this was the real finding. Fixed in this PR; see deliverable 5.

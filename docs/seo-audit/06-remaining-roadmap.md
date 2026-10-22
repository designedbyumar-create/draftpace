# Remaining roadmap

Ranked by evidence strength, not by which Companion is easiest to promote, per the brief's own instruction.

## 1. Wait for more Search Console data before touching the 4 "research further" pages

`symptom-notes-for-a-doctor-visit`, `questions-to-bring-to-the-doctor`, `how-to-budget-with-irregular-income`, `homeschool-notice-of-intent-explained` all show a real pattern (reasonable position, real impressions, zero clicks, or a very low position despite strong exact-match content) worth watching. 28 days and a few dozen impressions is not enough to act on with confidence; the brief itself warns against this. **Action:** re-pull Search Console in 4-6 weeks and re-run this same comparison. If the zero-click pattern persists at a larger sample on the two doctor-visit pages specifically, that becomes a legitimate title/snippet test, not before.

## 2. Re-verify the "12 states require no notice of intent" claim periodically

This is the one claim in the 12 candidate guides not independently re-checked in this pass (the existing CRHE citation was trusted as already-sourced). State homeschool law changes over time and this exact count is the kind of fact that goes stale without anyone noticing. **Action:** add it to whatever periodic content-accuracy pass this team already runs, or re-check it the next time `homeschool-notice-of-intent-explained` is touched for any other reason.

## 3. The structural audit this PR ran is worth keeping as a real, repeatable check

The link-graph audit script (orphans, broken related/next, hub coverage gaps, broken inline links, `primaryQuery` collisions) found zero defects against the current corpus, which is a strong result, but it was written as a one-off script for this pass rather than committed as a permanent guard. Given `guides.test.ts` already enforces several of these properties individually (no broken inline links, no self-links, unique `primaryQuery` is not currently enforced as a test though it was checked here), the one real gap is: **there is no existing test asserting every guide has a FAQ block or a comparable depth signal**, which is exactly what caught the one real defect in this pass. Worth a real test, not just a one-off script, if the team wants this kind of outlier caught automatically going forward rather than by a future manual audit.

## 4. Nothing else in the 137-guide corpus met the evidence bar for a change in this pass

This is stated plainly rather than padded out into invented work. The next real opportunities will come from the next Search Console export showing which of the 137 guides actually start getting impressions and clicks as the site's domain authority builds, not from re-reading content that already checks out structurally and factually today.

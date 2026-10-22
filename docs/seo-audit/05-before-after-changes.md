# Before / after: the one article changed in this pass

## `named-executor-what-you-agreed-to-uk`

**Existing issue:** found via a corpus-wide structural scan, not a GSC signal (this page has 0 recorded impressions in the current export). It was the shortest guide in the entire 137-guide corpus by a wide margin (532 words; the next-shortest is 920), the only guide in the corpus missing a FAQ block, the only one missing a `sources` array despite making checkable legal claims (probate process, personal liability under the Trustee Act 1925), and had zero inline body citations to any other guide. Its own US-locale sibling, `named-executor-what-you-agreed-to`, covers the same topic at full depth: a "how long it takes" section, a "you can be paid for this" section, an "executor, administrator, and beneficiary" section, a 5-question FAQ, and 5 real IRS/court sources. The UK twin stopped roughly halfway through the equivalent structure.

**Evidence supporting the change:** a direct, like-for-like comparison against its own locale sibling (not an invented standard), plus the corpus-wide word-count/structure scan that confirmed this was a genuine outlier rather than a normal short topic (see `04-content-opportunity-map.md` for the full scan).

**Actual change made:**
1. Added a `sources` array citing three real, verified UK primary sources (GOV.UK's own "Applying for probate" guidance, HMRC's Inheritance Tax Manual on grant types, and the Trustee Act 2000 itself on legislation.gov.uk) — each fact in the new content is traceable to one of these.
2. Added a 5-question FAQ block covering what an executor does, how to decline (UK-specific: form PA15, or "power reserved" when a co-executor exists), executor vs. administrator (intestacy, letters of administration), executor-as-beneficiary, and whether you're entitled to be paid (the genuinely distinct UK fact: lay executors generally cannot charge for their own time, unlike the US version of this guide, where executor compensation is normal and expected).
3. Added one inline link to `what-to-do-when-a-parent-dies-uk` in the opening section, for a reader handling both at once.
4. Bumped `updatedAt` to the date of this change, per this codebase's own rule that the field is "set when the writing changes materially."

**Why it benefits readers:** a UK reader landed on a materially thinner answer than a US reader asking the identical question would get, on a topic (personal legal liability as an executor) where incompleteness has real consequences. The new FAQ answers the five questions a reader in this situation most obviously has, each with a real primary-source citation. The compensation question in particular is new, accurate, genuinely useful information that didn't exist on the page before, and is a real point of difference from the US version worth knowing (most people assume executor work is paid, because in the US version of this exact guide, it is).

**Relevant search intent:** informational/legal-process intent ("named executor what to do," the guide's own `primaryQuery`), one step past "what to do when a parent dies," for a reader who has just found out they have a legal role with real liability attached and no idea what it involves.

**Related article / product connection:** unchanged — `related[]` already pointed at the US sibling, `what-to-do-when-a-parent-dies-uk`, and `how-to-find-someones-accounts-after-they-die`; the closing callout already handed over to Personal Life Affairs Companion. No change was needed there; the gap was entirely in the body content.

## Everything else

No other article's content, title, meta description, or primary query was changed in this pass. See `04-content-opportunity-map.md` for why the other 11 candidate URLs and the rest of the 137-guide corpus did not meet the evidence bar for a change.

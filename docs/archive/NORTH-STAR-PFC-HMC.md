# PFC and Home Base: product North Star

**Status:** Draft for founder review, 21 August 2026. Sits one level below
`DRAFTPACE-NORTH-STAR.md`, which governs what Draftpace is. This governs
what these two products are.

**Full document:** published as an artifact. This file holds the parts
that must live beside the code and be updated when the code changes: the
North Stars, the principles, the decision register, and the open
questions. The narrative analysis, competitive research and market
findings live in the artifact and are not duplicated here, deliberately,
so the two cannot drift.

Compiled from the repository at commit `e37cf4c`: 29 migrations, 33
tables, 968 passing tests, plus live production responses.

## The correction that shaped the document

There is no Momentum Engine. The phrase appears nowhere in `src/`,
`docs/` or `supabase/`. What exists is `companion.momentum`, a registered
capability string, and `progressModel: { kind: "momentum" }`, a config
field whose only effect is printing one descriptive sentence on the
Progress page. Neither PFC nor Home Base uses it; both declare
`progressModel: { kind: "custom" }`.

The subsystems a shared engine would own (attention derivation, reminder
scheduling, import) exist twice, once per product, in near-identical
form. That duplication is the real finding, and extracting it is the
honest version of "build the engine".

## North Stars

### Personal Finance Companion

- **Statement:** every user has one number they trust more than their
  bank balance.
- **Metric:** users whose position is still accurate 60 days after setup,
  measured by recency of last meaningful update, not logins.
- **Anti-metrics:** session length, daily actives, records created. All
  three can rise while the product gets worse.

### Home Base

- **Statement:** nothing expensive in a user's home gets forgotten.
- **Metric:** high-consequence care items completed inside their due
  window.
- **Anti-metrics:** opens per week (should fall), items tracked,
  notifications sent.

Neither metric is instrumented today.

## Product principles

1. The product decides what matters. The user never navigates to find out.
2. Every number traces to something the user entered. Nothing is guessed.
3. Silence is a valid, correct output.
4. Never keep score against the user. No streaks, no shame, no "overdue".
5. A capability is either built and honestly labelled, or absent and
   honestly labelled. Never a badge for a thing that does not exist.
6. Deferring is first-class, not failure.
7. Acting records what actually happened. A checkbox is not a record.
8. The knowledge is ours to author. Do not push it onto the user.
9. Data is exportable and never deleted without explicit instruction.
10. No AI in the derivation path while determinism remains a
    differentiator.

## Design principles

1. One surface first. New destinations must justify their existence.
2. State the condition in a sentence before showing any list.
3. Vague quantifiers must still be true.
4. Empty states are honest, never fabricated activity.
5. Tap over type wherever the product can know the options.
6. Product accent carries identity. Semantic colour is reserved for real
   severity.
7. Narrative voice is serif, data is sans. Never mix the roles.
8. Mobile is primary for Home Base, desktop for PFC.

## Marketing principles

1. Never claim a capability that is not built.
2. Lead with the constraint: no bank linking, no subscription, no AI.
3. Name the alternative and beat it on a specific axis.
4. Show the knowledge, do not assert it. The printable is the proof.
5. No em dashes, ever.
6. Never use the word "overdue" in Home Base copy.
7. Price is stated plainly. "Contact for pricing" is not a strategy.

## What we will never do

- Link to a bank or ask for banking credentials.
- Store passwords, alarm codes, or anything that opens a house.
- Sell, share, or train on user data.
- Delete a paying user's data on shutdown without export. Centriq did
  exactly this in January 2025, which is why its users are available.
- Fabricate activity, metrics or social proof.
- Ship a subscription for a product that succeeds by being quiet.

## Decision register

| Decision | Reason | Status | Revisit when |
| --- | --- | --- | --- |
| Draftpace is an extensible product platform, not a Companion platform | Future families must fit without rewrite | Locked | Never |
| First-party only, no third-party sellers | Brand is the quality promise | Locked | Never |
| One Next.js app, no monorepo | Extraction should be mechanical | Locked | A second team or deploy target exists |
| Open validated strings for families and capabilities | New families self-register | Locked | Never |
| Theme modes are exactly system / light / dark | Prior three-way model caused drift | Locked | Never at platform level |
| No AI anywhere in the product | Determinism is trust and a differentiator | Locked | Determinism stops differentiating |
| No bank linking in PFC | Privacy, cost, positioning | Locked | Manual entry is proven to be the churn cause |
| Home Base: no user-facing generic noun ("Thing") | Speak in the user's terms | Locked, enforced | Never |
| Home Base: never say "overdue", no scorekeeping | A home that missed a filter is not failing | Locked, test-enforced | Never |
| Home Base v2: nine destinations collapsed to two | Users should not choose where to look | Implemented | Applied to PFC, or explicitly rejected |
| Action + Snooze, not "mark done" | A checkbox is not a record | Implemented | Never |
| Curated care knowledge, never AI-generated | Accuracy and defensibility | Implemented, 121 types | Never |
| No household sharing, no Monthly Home Reset, no AI layer | Scope discipline | Deferred by founder | After revenue |
| `hmc_appliances` retained, not dropped | Destructive, needs explicit approval | Deliberate residue | Founder confirms |
| `appliance_id` not renamed to `thing_id` | Migration risk exceeds confusion cost | Deferred, documented | Another schema change touches those tables |
| Prices deliberately unset (`TODO_SET_REAL_PRICE`) | Founder had not decided | **Blocking all revenue** | Immediately |
| PWA branding provisional for both paid products | Real artwork is a founder decision | Open | Before paid launch |
| Separate cron secrets per product | One pipeline's fault cannot reach the other | Implemented | Never |
| Legal pages carry "not reviewed by counsel" | Honesty over implied review | Open | Before taking payment |

## Known contradictions in the code

These are defects, not decisions.

1. **PFC declares `notifications: { supported: false }`** while shipping a
   full reminder subsystem, two migrations, and a live production cron
   route. Settings renders that flag as a "Not supported" badge.
2. **Monthly Money Reset declares `notifications: { supported: true }`**
   and has no reminder code, no reminders table and no cron job. It shows
   a "Supported" badge for a capability that does not exist, which
   violates the repo's own rule 8.
3. **PFC's tagline contains an em dash**, against the absolute content
   rule.
4. **PFC has 15 navigation destinations**; Home Base has 6 after a
   deliberate collapse justified by reasoning that applies equally to PFC.

## Open questions

| Rank | Area | Question |
| --- | --- | --- |
| Critical | Monetisation | What is the price of each product, one-time or subscription? |
| Critical | Technical | Do the Vault and Vercel cron secrets match? Unverifiable from outside. |
| Critical | Operations | What is `main` for? Production deploys from a feature branch; `main` predates both products. |
| High | Customer | Has any human other than the founder completed setup on either product? |
| High | Product | Does PFC adopt Home Base's one-surface model? |
| High | Market | Will anyone pay for a finance tool requiring manual entry? Untested. |
| High | Marketing | Does the Etsy listing exist? The funnel is built, the storefront is not confirmed. |
| Medium | UX | What is the retention mechanic for a product that should be opened rarely? |
| Medium | Product | Should Home Base support regions for seasonal timing? |
| Medium | Technical | Extract the shared attention/reminder engine, or is duplication cheaper? |
| Low | Brand | Is "Home Base" final? The slug still says `home-management-companion`. |
| Low | Product | Does Monthly Money Reset stay free forever as a funnel? |

## The uncomfortable conclusion

Both products are finished enough to sell. Neither can take a payment.
Both are publicly listed as paid with no price and a disabled checkout,
verified live on the Shop pages. Until that changes, positioning,
research and craft are all unmonetised, and no amount of strategy work
substitutes for setting a price.

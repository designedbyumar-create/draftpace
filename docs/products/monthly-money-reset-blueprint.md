---
slug: monthly-money-reset
title: Monthly Money Reset
family: companion
access: free
instanceType: monthly-cycle
setup: { required: true, skippable: false }
destinations: [start, setup, workspace, progress, history, printables, settings]
formats: [workspace, printable]
---

<!--
The Draftpace Product Blueprint. One practical Markdown file per product,
written before implementation begins. Small YAML frontmatter maps directly
to fields the runtime already requires (ProductDefinitionInput); everything
else is human-readable prose. No tooling, no validator, no generator reads
this file — it exists to be read by a person before they write code, and to
be checked against once the product is built.
-->

## Promise

See what's safe to spend right now, understand what changed, protect what
must be paid, and always know the next useful move.

## User and situation

Someone with irregular or tight cash flow who wants a real number, not a
budget spreadsheet, and who checks in on their own schedule, not daily.

## Outcome

Always knows, within a glance, whether their current Safe-to-Spend figure
is trustworthy and what to do if it isn't.

## First-use journey

Activate -> Start (orientation) -> Setup (5 steps, real completeness,
live preview) -> completion moment -> guided tour on first real Workspace.

## Setup and real completeness criteria

Step 1 (This month): complete once the starting balance has been explicitly
entered. Step 2 (Income): complete once explicitly acknowledged — zero
income sources is a valid, complete answer, not missing data. Step 3
(Bills & reserve): same reasoning, explicitly acknowledged is complete.
Step 4 (Spending): complete once at least one spending group is named.
Step 5 (Review): complete once reached, nothing further to confirm.

Each step should state what leaving it incomplete affects — for example,
without bills added, Safe-to-Spend won't protect anything, it will just be
the raw balance.

## Primary workspace

"This Month" — the `workspace` destination, labeled via `workspaceLabel`
rather than the generic default. Layout, top to bottom: since-last-here ->
hero Safe-to-Spend number -> next action -> Quick Add / check-in entry
points -> closer-look tabs (Activity, Spending Plan, Bills).

## Navigation and lifecycle

Primary (always visible once setup is complete): workspace, progress,
history. Secondary (contextual/lower emphasis): settings, printables, and
"Edit your plan" (Setup, demoted). `start` is hidden from navigation after
the first Setup visit; `setup` is primary only until `setup.completedAt` is
set, then demotes to secondary.

## Signals the product reacts to

Setup completeness (per field, not per step), balance freshness, time since
the last confirmed check-in, new income received, spending recorded, bill
status changes, protected versus unprotected bills, Safe-to-Spend movement,
proximity to month-end, the previous cycle's closing result, returning
after an absence, and the user's own chosen check-in day.

## Saved information

One state document per monthly instance: currency and cycle info, setup
progress, starting balance, income entries, bills, spending groups, the
activity ledger, protected reserve, savings transfers, check-ins, the
current next action, completion/carry-forward record, preferences
(check-in day, tone, privacy blur), and `lastConfirmedAt` — distinct from
the record's own `updatedAt`.

## Calculations and decision rules

`computeSafeToSpend` — the authoritative formula; every term is read from
its own authoritative list (income, bills, savings transfers, protected
reserve), never from the activity ledger, so nothing can be double-counted
by construction. `computeNextAction` — ordered rules, no fake urgency,
tiered by real severity; a protected bill is never flagged as needing
review. `weeklyGuideAmount` — presentation only, never the real monthly
answer. `computeSetupCompleteness` — per-step real completeness. `daysSince`
— shared freshness math.

## Next-action logic

Four states, checked in priority order: **critical** (Safe-to-Spend is
negative), **attention** (income expected but overdue, or an *unprotected*
bill due soon), **routine** (stale activity, a check-in is due), **all
clear** (nothing needs attention — states why, and names the next check-in
day from the user's own preference). A protected bill due soon is never a
next action; it's reassurance.

## Freshness and return behavior

`lastConfirmedAt` is written only by a completed check-in, distinct from
`updatedAt`, which changes on any edit. The since-last-here block is
suppressed entirely when nothing has changed since the same day. Data is
considered stale past 7 days since the last update, or immediately if
Safe-to-Spend is negative.

## Guided tour

Fires once, on the first real Workspace visit after setup completes.
Spotlights the real interface: the hero number, the next-action card, and
Quick Add. Skippable at every step, never repeats automatically once
finished or skipped, and is replayable on demand from secondary navigation.

## Completion/cycle behavior

Month close runs through the existing transactional close sequence — save
the closed state, mark the instance lifecycle "completed," start the next
cycle, apply carry-forward — each step confirmed before the next runs, and
the whole sequence safe to retry after a failure. Before the carry-forward
question, a brief closing summary is shown (closing Safe-to-Spend, check-ins
done, bills paid) so closing a month feels like a chapter ending. The
carry-forward choice offers a suggested amount (explicitly labeled an
estimate, never assumed equal to the user's real bank balance), a custom
amount, starting fresh, or entering the actual current balance — applied
exactly once even if the request is retried.

## History

Past, closed cycles only. Current-cycle metrics live in Progress, not here.

## Artifacts and printables

A one-page PDF snapshot, generated from live state at download time, that
links back into the app. A contextual action from Workspace or History, not
a permanent navigation destination.

## Error and recovery states

A failed read is never presented the same way as "not set up yet" — it is
recoverable, offers a retry, and never implies the product or its data is
gone. A failed save keeps whatever was entered locally and offers the same
action again as its own retry, rather than silently discarding progress.

## Desktop/mobile behavior

Modals (Quick Add, check-in) become bottom sheets below the `sm:` breakpoint
and centered dialogs above it. Setup's live-preview sidebar is `lg:`-only
and folds into the normal flow below that width.

## Accessibility

Every modal traps focus and closes on Escape. The guided tour is fully
keyboard-operable and respects `prefers-reduced-motion` (and the platform's
own explicit reduce-motion setting). Nothing here introduces a new pattern
beyond the shared design system's baseline.

## Acceptance tests

- `computeNextAction` never flags a protected bill as needing review
- an unprotected bill due soon still produces an attention-tier action
- a negative Safe-to-Spend always maps to critical, regardless of other rules
- overdue expected income maps to attention
- stale activity or an overdue check-in maps to routine
- the all-clear state names the next check-in day
- since-last-here is suppressed when nothing changed the same day
- `start` is absent from navigation once `setup.completedAt` is set
- a check-in's "yes" answers open the matching correction flow
- a retried carry-forward request applies exactly once

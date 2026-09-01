# Personal Finance Companion — visual system

How PFC applies Draftpace's one shared design system
(`src/design-system/`, tokens in `src/app/globals.css`, see
`docs/DESIGN-SYSTEM.md`). This document does not define a second token
set. It records the specific, repeatable choices PFC makes within the
existing one, so the seven direct sections plus Today/Companion/
Attention/Records read as one coherent product instead of independently
designed screens. Written at the end of Stage G, after the navigation,
Records, Attention, Companion, and import-review work landed and was
verified live in both themes and at both desktop and mobile widths.

## Product identity

- **Accent**: the shared `--primary` teal (`#0e6e75` light / `#4fc7c9`
  dark). PFC does not define a second accent. The product's own PWA
  identity (`definition.ts`'s `pwa.themeColor`) reuses the same teal for
  continuity between the installed app and the browser tab.
- **Typeface**: the shared UI sans throughout. PFC has no serif/display
  moment of its own — money is the thing that should carry visual
  weight, not a wordmark (see Money typography below).
- **What makes it read as PFC, not "Draftpace generically"**: the
  content, not a separate skin. Real dollar figures, specific area
  names (Bills, Debt, Savings...), and the Attention/Records vocabulary
  are what differentiate this product from Monthly Money Reset or any
  future family, not a bespoke palette.

## Money typography

The one type of value every screen in this product ultimately exists to
show. Three fixed weights, used consistently:

| Context | Class | Example |
|---|---|---|
| Hero figure (Today's Available Money, a Records card headline) | `text-[30px] font-semibold tabular-nums` / `text-[22px] font-semibold tabular-nums` | `$2,614.01` |
| Secondary figure (a capability tile, a per-record row) | `text-[20px] font-semibold tabular-nums` | `$1,585.99` |
| Inline figure inside a sentence or list row | `text-[13px]`–`text-[15px]`, no forced weight | "min $160.00" |

`tabular-nums` is load-bearing wherever more than one money figure sits
in a column (Records' area grid, a capability grid) — digits align
regardless of digit width. `formatCurrency` (`src/lib/currency.ts`) is
the only path to a displayed amount; no screen formats a number by hand.
A missing/not-yet-computable figure renders as a plain em dash glyph
(`—`) in its own table-cell-like slot — a deliberate typographic
placeholder convention, not prose, and the one place this product's
otherwise-absolute no-em-dash rule doesn't apply (see Copy voice below).

## Surfaces, spacing, structure

- `Surface` (`rounded-[var(--radius)]`, `border-[var(--border)]`,
  `bg-[var(--surface)]`) is the one card primitive. `elevated` marks the
  single focal card on a screen (Today's dominant-action card, a
  section's dominant-action banner) — never more than one elevated
  surface competing for attention at once.
- Layout is flex/grid + `gap`, never per-child margin. This is what
  keeps Records' 2-column area grid, Today's two-column split, and a
  section's `StatRow` all collapsing to a single mobile column
  correctly without special-casing each one.
- Micro-labels (`ACCOUNTS`, `WHAT TO DO NEXT`, `NEEDS A LOOK`) are
  always `text-[11px]`–`text-[12px] font-bold uppercase
  tracking-[0.08em]–[0.14em] text-[var(--faint)]` (or `--primary` for
  the one dominant label per screen). This is the single visual device
  that makes Records' seven differently-shaped cards still read as one
  family.

## Semantic and confidence states

Two independent systems, deliberately not merged into one color:

1. **Record status** (`STATUS_TONE`/`STATUS_LABEL`,
   `components/shared/lifecycle.ts`): `draft` / `confirmedIncomplete` /
   `ready` / `needsReview` / `archived`, always a `Badge` with visible
   text, never color alone.
2. **Attention urgency** (`attention.ts`): `needsResolution` vs
   `worthAWhile`. Rendered as an amber-vs-faint `WarningCircle` plus,
   on the Attention destination itself, an explicit text-labeled group
   heading ("Needs resolution" / "Worth a while") — urgency is never
   conveyed by icon color alone where it's the only signal on screen.

A capability or Records card in a `needsInfo`/incomplete state pairs a
`Badge` with a specific, real sentence (`describeDebtIncompleteness`,
etc.) — never a bare warning icon with no explanation.

## Dark mode

Token-level only: every color above is redefined under
`@media (prefers-color-scheme: dark)` and again under
`:root[data-theme="dark"]`/`[data-theme="light"]` for the explicit
toggle. No PFC component reaches for a raw color value or checks the
theme directly — this is why the Stage G screenshot pass (Today,
Attention, Records, Debt, Companion/import-review, Settings, plus a
form sheet, all in both themes) found zero dark-mode-specific defects.
The one thing dark mode changes beyond color: `--shadow-*` gets
stronger/darker rather than just re-tinted, so elevated surfaces still
read as lifted off a near-black background.

## Motion

Restrained and functional, never decorative. One easing curve
(`EASE_OUT`, `[0.22, 1, 0.36, 1]`, the same constant already used by
the marketing site and Monthly Money Reset) reused everywhere PFC
animates:

- Companion's area-to-area and landing/reviewing/reflecting transitions
  crossfade (`opacity` + small `y` shift, 200–300ms) instead of
  snapping, via `framer-motion`'s `AnimatePresence`.
- The guided tour's spotlight repositions with the same easing.

Every motion instance is gated by `useCombinedReducedMotion()` (OS-level
`prefers-reduced-motion` **and** Draftpace's own Settings toggle,
combined) — set `initial={false}` and no `exit` when either is on, so
the same UI is reachable with zero animation, not a degraded version of
it.

## Responsive rules

Mobile-first, verified at 375px specifically per the Stage G brief, not
just "shrunk desktop":

- The product shell's primary nav (`Today`/`Companion`/`Attention`/
  `Records`) scrolls horizontally on narrow screens rather than
  wrapping or truncating; the active tab auto-scrolls into view on
  every route change (a real bug found and fixed this stage — see the
  Stage G report).
- Every grid used in this product (`Records`' area cards, a section's
  `StatRow`, Today's capability grid) is `grid-cols-1` at the base
  breakpoint and only gains columns at `sm:`/`lg:` — desktop earns
  density, mobile never loses it.
- Form sheets (`RecordFormSheet`) become a bottom sheet below `lg:`
  instead of a small anchored popover, matching the platform-wide
  mobile pattern already established for the account menu.
- Snooze/dismiss actions on Attention and Today were widened this
  stage specifically because they measured under the 24×24px WCAG
  touch-target minimum at `~20×14px`; they now measure `~59×28px`,
  verified via `getBoundingClientRect` live, not just visually.

## Accessibility decisions made this stage

- `:focus-visible` gets a visible 2px ring globally
  (`globals.css`), layered under any component's own ring — every
  interactive element in this product is keyboard-reachable and
  visibly focused without PFC doing anything extra, but PFC's own
  custom buttons (Snooze, "Show snoozed") now also get an explicit
  `aria-label` since "Snooze" alone doesn't say what's being snoozed
  once a screen reader user isn't anchored to the visual row.
- Purely decorative icons that sit next to text already carrying the
  full meaning (`WarningCircle`, `CheckCircle2`, `ChevronRight`) are
  `aria-hidden`.
- Status is never color-only: every semantic/urgency state above pairs
  color with a `Badge` label, a group heading, or a full sentence.

## Copy voice

- No em dashes in any rendered sentence (an absolute Draftpace rule) —
  a comma, colon, or period instead, chosen by the relationship between
  the two clauses. The one exception is the `—` null-value glyph
  described under Money typography, which is a typographic placeholder,
  not prose.
- No generic SaaS language (audited for "leverage", "seamless",
  "empower", "unlock your potential", etc. — none found; this product
  was written in Draftpace's plain, specific voice from Stage C
  onward).
- Every empty/incomplete state names the actual gap
  ("Emergency savings doesn't have a target date yet.") rather than a
  generic "no data" message, and every dominant-action prompt states
  what's true, then offers the one next step — never a vague nudge.

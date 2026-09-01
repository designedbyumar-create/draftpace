# Draftpace: Product Identity Kit & Monthly Money Reset Premium Direction

**Design source of truth for the *expression* layer.** Defines how every
Draftpace product becomes its own premium world, and applies it to the first
product, Monthly Money Reset (MMR).

**Status:** Locked direction, living document. Sits under
[`DRAFTPACE-NORTH-STAR.md`](DRAFTPACE-NORTH-STAR.md) (pillars **P1-P6**) and
implements its §8 (two-layer system) and P3 ("each product is a world"). Resolves
audit findings **MMR-1..6, SHELL-1, DS-1..4**. This is *direction*, not an
instruction to start coding, implementation waits on founder approval per the
audit phase rules.

**The one sentence this document exists to make true:** *using a Draftpace
product should feel like using a boutique app someone lovingly made for exactly
this problem, not a themed panel inside a generic SaaS shell.*

---

# Part A: The Product Identity Kit (the reusable contract)

## A1. Why this exists (the mid → premium gap, concretely)

The current system reads as capable-wireframe for one structural reason: it has a
**Foundations** layer (tokens, primitives) but no **Expression** layer, and
"product identity" today means *one accent color* applied *only to module
bodies*, while the shell frame stays generic. Three symptoms:

- The forest/ivory MMR world lives inside `ThemeScope`-wrapped module bodies; the
  product's own header, tabs, and back-bar are generic platform chrome (MMR-1).
- One hairline border weight does all separation; type is compressed to 11-13px;
  depth is flat (DS-2, DS-3).
- Every screen re-hand-rolls layout, so "another bordered card" is the path of
  least resistance (DS-1).

Premium is not a coat of paint you add per screen. It's a **property of a system**
that (a) locks boring foundations and (b) gives each product a rich, bounded
vocabulary to express a distinct world. That vocabulary is the Product Identity
Kit.

## A2. The two-layer model, precisely

```
┌───────────────────────────── FOUNDATIONS (shared, locked, invisible) ─────────────────────────────┐
│  Grid & spatial rhythm · type ENGINE (families + optical sizing) · contrast/color math ·           │
│  elevation & MATERIAL primitives · motion primitives (curves, duration ramp) · focus ·             │
│  reduced-motion · text-scale · theme modes (system|light|dark) · Phosphor icon system ·            │
│  a11y guarantees. Every product inherits these. NONE of them carry identity.                       │
└────────────────────────────────────────────────────────────────────────────────────────────────────┘
        ▲ inherits, cannot override the guarantees
┌───────────────────────────── EXPRESSION KITS (distinct, visible, where identity lives) ────────────┐
│  STORE KIT , the marketing/store/platform-shell voice (calm, neutral canon so products pop).       │
│  PRODUCT IDENTITY KIT, shipped per product; defines its whole WORLD (A3). Applied at the product   │
│  SHELL ROOT, so frame + content share one identity (fixes MMR-1/SHELL-1).                            │
└────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**Reach rule (locked):** a Product Identity Kit applies to the **entire product
experience**, shell header, destination nav, back-affordance, cards, inputs,
buttons, empty states, modals, not just the content pane. When you're inside a
product, the platform recedes (P1) and the product's world is total and
continuous.

## A3. The Product Identity Kit: the contract

Each product ships these dimensions. This is deliberately **far beyond** today's
`themeExtension` (accent + palette + contentWidth). Think of it as the product's
"brand book," expressed as scoped, resolvable design tokens + a few declarative
choices.

**1. World concept**, the emotional target in one line ("the calm room where
money makes sense"). Everything below serves it. Not shipped as code; it's the
brief the kit is judged against.

**2. Color world**, full surfaces/ink/border/accent/semantic/data-viz sets, in
**light and dark**, bounded by the Foundations' contrast math:
- surfaces (base, raised, sunken, field), ink (primary/secondary/faint),
  borders (hairline/strong), one or two accents, semantic mapping (how
  success/warning/danger read *in this world*, not the platform defaults), and a
  data-viz palette.
- Constraint: every text/background pair must pass AA; the kit *cannot* ship an
  inaccessible combination (Foundations reject it).

**3. Type voice**, within the two-family engine: which family carries display/
figures, the display treatment (optical size, weight, tracking), the product's
**numeral style** (critical for data products, tabular/lining), and the scale
expression (how big the hero moment is allowed to be). Products don't add fonts;
they *express* the engine differently.

**4. Material & elevation**, how depth reads in this world: the number of planes
(2-3), shadow character (soft/diffuse vs. crisp), whether surfaces feel like
paper, glass, or ink. This replaces flat-hairline-everything with intentional
depth (DS-2).

**5. Shape language**, corner radii and their character (soft/organic vs.
precise), border weights, whether the world is rounded-and-warm or
squared-and-exact.

**6. Motion character**, a named personality (`calm` · `crisp` · `lively`),
resolved to concrete duration/easing choices from the Foundations' motion ramp,
always inside reduced-motion. Defines how the hero updates, how sheets enter, how
feedback feels.

**7. Iconography & imagery**, Phosphor weight/style choice (thin/light/regular),
any product-specific illustrative language, and how the product is *shown* (its
signature visual). No second icon library (Foundations rule).

**8. Component skins**, how the shared primitives are re-dressed in this world:
the **signature hero** (a product's one defining component, for a tracker a
trend, for MMR the Safe-to-Spend figure), plus cards, tabs, buttons, inputs,
badges, empty states, modals. Skins change *expression*, never *semantics* or
a11y.

**9. Voice & microcopy tone**, the product's writing personality (MMR: calm,
plain, non-judgmental), its word choices, and how it labels its own destinations
(e.g. "Workspace" → a product-appropriate name).

**10. Presence character** *(ties to P5, the living spectrum)*, where the product
sits on light↔deep, which determines whether/how it notifies, prompts, checks in.
Declared, not improvised, so "presence with restraint" is a property, not a mood.

**11. Aliveness cues**, the specific ways *this* product signals it's alive
(P4): how state updates are shown, how it welcomes a return, how it handles a
lapse. For a data product: how the hero figure reacts when inputs change.

**12. Sound/haptic** *(optional, progressive)*, reserved; only where it elevates
and degrades gracefully.

## A4. Guardrails: what a Kit can never do

- Override accessibility guarantees (focus, contrast floor, reduced-motion,
  text-scale).
- Touch platform/auth navigation or the platform shell outside the product.
- Inject global CSS or a second icon library.
- Ship an inaccessible color pair or a motion that ignores reduced-motion.
- Change a primitive's *semantics* (a skinned button is still a button).

Technically: scoped CSS custom properties applied at the product shell root
(extending `themeExtension.ts`), resolving against `system|light|dark`, never
global rules. This is the mechanism that already exists; the Kit widens *what*
it carries and *where* it reaches.

## A5. Governance: the two tests every Kit must pass

- **The distinctiveness test (P3):** cover the labels, could a user tell this
  product from another Draftpace product? If not, it's a recolored clone. Fail.
- **The canon test (P3):** do all products still feel like they belong to one
  studio? If a Kit is so loud it breaks the canon, it's over-expressed. Fail.
- **The accessibility gate (A4/§10 of marketing doc):** AA or it doesn't ship.
  Non-negotiable.

Distinct worlds, one canon, always accessible. That triangle is the whole game.

---

# Part B: Monthly Money Reset: the premium product direction

MMR is the proof case (North Star §10). If MMR feels like a boutique app, the
whole "alive, not a dead file" thesis is proven and the store becomes worth
building. If it feels like a themed dashboard, nothing downstream matters.

## B1. MMR's world concept

**"The calm room where your money makes sense."**

Not a budget. Not a finance dashboard. A quiet, trustworthy place that answers one
anxious question, *"am I okay to spend?"*, with one serene number, and tells you
the single next useful move. It serves Deen and Maya (§3 of the marketing doc):
money-anxious, budgeting-app-averse, burned by upkeep. The emotional target is
**calm authority**, the feeling of a wise, unshowy advisor, never a spreadsheet
and never a nag (presence character: *medium*, a gentle weekly check-in, nothing
more).

## B2. MMR's Product Identity Kit (filled in)

Building on the palette already mined from the prototype (`src/products/
monthly-money-reset/theme.ts`), good bones, now elevated and given full reach.

- **Color world:** deep **forest** fields, **sage** mid-tones, warm **ivory/paper**
  grounds, a single restrained **clay** accent for attention/negative states.
  Semantic mapping is *muted and dignified*, a negative Safe-to-Spend reads in
  clay, never alarm-red; "protected" reads in a calm forest, not a warning. Light
  and dark both defined (theme.ts already does this; extend to full surface/ink
  sets). This palette is warm, analog, and calm, deliberately unlike a fintech's
  cold blue, which is half the differentiation.
- **Type voice:** **Fraunces** (optical, high-contrast) carries the hero **figure**
  and key numbers, the large Safe-to-Spend number is the product's signature and
  should feel editorial and human, not monospace-financial. **Lining/tabular
  numerals** so figures align and don't jitter as they update. Inter for all
  supporting UI.
- **Material & elevation:** three planes, the **Safe-to-Spend field** sits
  forward as a rich, matte forest "card of authority"; the working surface is
  warm paper; secondary info is flat on the ground. Shadows soft and diffuse
  (calm), never crisp/techy.
- **Shape language:** soft but not toy-like, generous radii on the hero and
  sheets, restrained on controls. Warm, rounded, trustworthy.
- **Motion character: `calm`.** Everything settles rather than snaps. When the
  number changes it **transitions with dignity** (a brief, eased re-settle, a
  gentle count/cross-fade with reduced-motion falling back to an instant, clear
  change). Sheets rise softly. No bounce, no flash.
- **Iconography:** Phosphor *light/regular*, sparse, icons for recognition and
  status only, never decoration-per-card.
- **Signature hero component:** the **Safe-to-Spend figure** (spec in B4).
- **Voice:** calm, plain, blameless. "Know what's safe to spend." "Fallen behind?
  Just tell us what changed." Never "you overspent," never a lecture, never a
  streak.
- **Aliveness cues:** the figure reacts when you add something (it *feels* live);
  a quiet "updated just now / 3 days ago" whisper; a warm "welcome back, a few
  things may have changed?" on return after a gap; a negative figure held with
  composure, not alarm.

## B3. Experience redesign direction (screen by screen, at the premium bar)

Governing move: **one focal moment per screen, product identity total and
continuous, platform receded.** Fix the audit's structural drift toward a
6-card dashboard and double-tab confusion.

**Shell (frame), fixes MMR-1/SHELL-1.** The MMR world reaches the *whole* shell:
the header, the destination nav, the back-affordance, all in forest/paper, not
generic indigo chrome. Entering MMR should feel like stepping into the calm room, the platform disappears. Back-affordance reads "Back to Draftpace," context-aware
to where they came from (SHELL-2).

**Activation → first value, fixes MMR-3.** A freshly-activated user goes
**straight into Setup**, not through the Start Here explainer they just read on
the product page. Setup's own live preview delivers a Safe-to-Spend number
mid-flow, so value appears before setup even finishes. Start Here survives as a
calm **re-entry/overview** surface for returning users, never a first-run gate.

**Setup, keep progressive, elevate craft (MMR-4 = keep).** The 5 steps (This
month → Income → Bills & reserve → Spending → Review) with the running live
preview stay, that staging + "change anything later" reassurance is a genuine
strength and directly answers the upkeep/abandonment fear. Elevate: the live
preview becomes a *beautiful, breathing* forest figure in the rail (the hero,
previewed), the steps feel like a calm guided conversation, inputs are large and
friendly (thumb-first), and every step reassures.

**Workspace, the calm room, fixes MMR-2, MMR-5, DS-1/2.** This is the center.
- **One hero, decisively:** the **Safe-to-Spend figure + the single next move**
  own the screen, forward on their own plane. Everything else is quieter and
  lighter.
- **Kill the 6-equal-card dashboard.** "What's protected," "Upcoming bills,"
  "Recently changed," and "Weekly check-in" become **secondary, type-and-space
  separated** content below/aside the hero, mostly *not* bordered cards (the
  design system's own "not everything in a card" rule), so the hero clearly wins.
- **Resolve the double tab strip (MMR-2):** the four Workspace views (Overview /
  Activity / Plan / Bills) become a **quiet, nested control under the hero**,
  visibly subordinate to (and styled differently from) the product destination
  nav, a clear parent/child relationship, not two equal sibling tab rows. Or:
  reduce destination chrome while in the Workspace so only one nav reads as
  primary. Either way, one obvious center.
- **Quick Add** is one calm, ever-present action (thumb-reachable on mobile),
  low-friction capture, the antidote to Sam/Maya's upkeep-abandonment.

**Safe-to-Spend hero, the signature moment (B4 below).**

**Progress / History / month-close, premium direction.** Progress is a calm,
honest sense of "you're keeping the picture accurate" (momentum without streaks
or punishment, serves Sam directly). History and month-close feel like *closing
a chapter with dignity*, a quiet summary you're proud of, and a warm on-ramp into
next month ("start again without starting over"), never a lost-streak or overdue
wall. This is where the "falling behind isn't punishment" promise is kept.

**Mobile-first (RESP-3/4).** MMR is used on a phone in five spare minutes (Deen on
the bus). The hero figure and next move must be fully present above the fold on a
390-320px screen; the nested view control must not consume the viewport before
content; Quick Add is a thumb-zone action; sheets are bottom-sheets with safe-area
insets.

## B4. The Safe-to-Spend hero: full spec (the product's soul)

This one component carries the entire thesis. It must feel like a single word of
reassurance.

- **The number is the hero.** Large Fraunces optical display, tabular lining
  numerals, ivory ink on a matte forest field, forward on its own plane. It should
  read as *calm and authoritative*, the emotional opposite of a red-and-green
  budget chart.
- **One line of human context** beneath it ("about £X a week for the rest of the
  month"), turns a number into guidance.
- **The single next move** lives with the hero, not in a competing card, "Your
  next move" + one action.
- **Honesty folded, not hidden.** "How this is calculated" expands to the full
  seven-line breakdown (trust through transparency) but is *collapsed by default*
  (calm through hiding complexity). Progressive disclosure is the whole
  personality: trustworthy *and* serene.
- **Aliveness:** when inputs change, the figure re-settles with a brief, eased
  transition (reduced-motion → instant, clear change). This is the felt proof it's
  *alive*, not a static PDF.
- **Negative with dignity.** A negative Safe-to-Spend stays visible (never clamped
  to zero), rendered in composed clay with a calm, non-judgmental line, "you're
  over by £X; here's the one thing that helps," not alarm-red panic.
- **Staleness whisper.** A quiet "updated just now / 3 days ago"; if stale, a
  gentle "worth a quick update?", never a scolding.
- **Accessibility:** the figure and its change are announced to screen readers
  (live region); meaning never by color alone (negative is labeled, not just
  clay); AA contrast in both themes; the breakdown is a real semantic disclosure,
  keyboard-operable.

## B5. The premium bar: MMR's definition of done (test against this)

MMR is "at the bar" when:

1. **It feels like its own world, continuously**: frame and content share the
   calm-room identity; the platform is invisible while inside (P1, MMR-1).
2. **One serene focal moment**: Safe-to-Spend + next move own the Workspace; no
   6-card dashboard (MMR-5).
3. **It's unmistakably *alive***, the figure reacts, it remembers, it welcomes
   you back, it survives leaving and returning across devices (P4).
4. **It never judges or punishes**: no streaks, no overdue walls, recovery is
   warm (P5, Sam-safe).
5. **It's premium by craft, not decoration**: depth, type scale, material, motion
   with intent; distinctly Draftpace, cloning nothing (North Star §7).
6. **Mobile is a first-class citizen**, thumb-first, hero above the fold.
7. **Every state is accessible**: AA, keyboard, screen-reader, reduced-motion.
8. **A stranger would believe it's worth paying for**: it makes the free thesis
   obvious and the future paid products credible.

If any of these fail, it's not done, regardless of whether the routes work or
tests pass (the audit's quality bar).

## B6. Build sequence (when implementation is approved)

1. **Foundations split + Product Identity Kit contract** (A2/A3), extend
   `themeExtension.ts` into the full Kit, applied at the shell root; add the
   composition primitives (DS-1: PageHeader, FocalBlock, Figure, hero).
2. **MMR Kit + continuous shell identity** (B2, MMR-1), the calm room reaches the
   whole product.
3. **Safe-to-Spend hero** (B4), the signature moment, done to spec.
4. **Workspace refocus** (B3), one hero, quiet secondary, resolve double-tabs.
5. **Activation → straight to Setup** (MMR-3); Setup craft elevation.
6. **Progress / History / month-close** dignity pass.
7. **Mobile + accessibility verification** live (the currently-unverifiable gates).

Everything here is downstream of one hard dependency the audit flagged:
**activation must actually work** (the `?error=1` blocker) before any of this can
be seen or verified by a real user. That's step 0, and it needs your go (audit
§35.2).

## B7. How this proves the whole company

MMR done to this bar is the single artifact that makes every other document true:
it proves a Draftpace product is *alive* (North Star), gives the marketing side a
real product to *show* instead of describe (marketing §10, SHOP-2), and
instantiates the Product Identity Kit so the second product is a fill-in-the-Kit
exercise, not a reinvention. **Perfect this one thing, and the rest compounds.**

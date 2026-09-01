# Draftpace Product Experience Playbook

**Design source of truth for the *in-product* experience.** How a Draftpace
product behaves, guides, and feels once someone is inside it, across every kind
of product the shelf will ever hold.

**Status:** Locked direction, living document. Sits under
[`DRAFTPACE-NORTH-STAR.md`](DRAFTPACE-NORTH-STAR.md) (pillars **P1-P6**), beside
[`DRAFTPACE-PRODUCT-IDENTITY-KIT.md`](DRAFTPACE-PRODUCT-IDENTITY-KIT.md) (which
owns the *visual world*), and continues
[`DRAFTPACE-APP-EXPERIENCE-DESIGN.md`](DRAFTPACE-APP-EXPERIENCE-DESIGN.md) (which
ends at section 11, the hand-off into a product). The Identity Kit answers *what
a product looks and sounds like*. This answers *how it behaves and teaches*.

**The one sentence this document exists to make true:** *a first-time user
should never feel like they opened software; they should feel like a calm,
knowledgeable friend sat down next to them and started with the one thing that
matters.*

---

## Part 1: The feeling (what we are actually making)

A Draftpace product is a **mini installable app**, but "app" is the wrong mental
model for how it should feel. The right model is a **guide who already
understands your situation.** A good guide does five things software usually
does not:

1. **Starts where you are**, not at a blank canvas or a settings screen.
2. **Says one thing at a time**, and always the most useful thing.
3. **Does the hard part for you**, then shows its work if you want it.
4. **Remembers everything**, so you never re-explain yourself.
5. **Never makes you feel behind**, late, or wrong.

Everything in this playbook serves that feeling. The anti-patterns, stated once
so we can refer back to them:

- **Tab soup.** A row of five equal tabs (Dashboard, Reports, Settings,
  History, Insights) is software. It pushes the work of "figuring out where to
  go" onto the user. We refuse it.
- **The blank canvas.** "Here is a powerful tool, build your own system." That
  is the Notion trap every persona has already failed at (see the anti-persona
  in the marketing doc). We are opinionated, not a workspace to configure.
- **The dashboard.** A grid of equal cards with no clear focal point. It looks
  informative and feels like homework.
- **The config wall.** Making someone set preferences before they get value.
- **The disembodied tour.** A carousel of illustrated slides on first open,
  detached from the real interface, tapped through without reading. A real
  first-use tour is good and every product gets one (Part 4.3); this hollow
  version of it is what we refuse.

If a design decision moves toward any of these, it is wrong regardless of how
"powerful" it makes the product look.

---

## Part 2: The universal spine (so every product feels like one studio)

Every product, no matter its type, is composed from the same seven-beat spine.
Products differ in *which beats are heavy and which are light*, never in the
skeleton. This is what makes a calculator and a companion feel like siblings
(the canon test, Identity Kit A5) while behaving completely differently.

| Beat | What it is | The felt promise |
|---|---|---|
| **1. Threshold** | The first second inside. The platform recedes, the product's world is total (Identity Kit "reach rule"). | "I am somewhere specific and cared-for." |
| **2. Orient** | One line that says what this is and what the first move is. Never a manual. | "I know what this does and what to do." |
| **3. Setup as conversation** | A few situation questions that visibly change the outcome. Rough answers fine, anything skippable. Value appears mid-setup, not after. | "It is already about me, and I barely did anything." |
| **4. The room (the home surface)** | The single focal place the product lives. One hero moment plus the one next move. Everything else is quieter. | "There is one obvious thing, and it is calm." |
| **5. Do** | Low-friction capture or action, always thumb-reachable. The core loop. | "Adding to it is effortless." |
| **6. Continuity** | It saves without being asked, syncs, and welcomes you back to exactly where you were. | "I can leave and it will keep my place." |
| **7. Return and recovery** | After a gap: no broken streak, no overdue wall. It asks what changed and hands you one small step. | "Coming back is safe, even after a long time." |

The **room (beat 4)** is the heart. If a user can only ever see one screen of a
product, it is the room, and it must be enough to feel the whole promise.

---

## Part 3: Structure and navigation (killing tab soup)

This is the decision you flagged directly: products must not feel like complex
software with many tabs. Here is the model.

### 3.1 The surface spectrum

A product uses the **fewest surfaces that honestly serve it.** The six-
destination shell (Start, Setup, Workspace, Progress, History, Settings) from
the family defaults is a **ceiling, not a target.** Most products live at one or
two.

- **Single-surface (default aspiration).** One scrolling room. The next thing is
  always at the top; supporting detail lives below it, revealed by scroll, not by
  navigation. A calculator, a decision tool, a personalised-artifact product, and
  most trackers can be *one surface*. No tabs at all.
- **Room-plus (2 to 3 surfaces).** A primary room plus one or two secondary
  places that only exist because they answer a different question (History = "what
  happened before," Progress = "how am I doing over time"). These are **quiet,
  subordinate destinations**, never equal siblings to the room.
- **Deep (companion, learning, guided programs).** Up to the full set, but even
  here one surface is unmistakably home, and the rest are visibly secondary.

**The canonical structure (locked).** In practice a product reads as: first open
into a short guided **Setup**, then one primary **Workspace** (the room), with
supporting **Progress**, **History**, and **Printables** that appear only once
each has something to hold. Workspace is always the home; the rest are quiet and
deferred. "Printables" is the experience name for where an artifact-forward
product's generated files live (Part 7); a product without artifacts simply does
not have it.

### 3.2 Rules for when a surface is allowed to exist

A new surface must pass all three:

1. **Different question.** It answers a genuinely different user question than
   the room ("what is safe to spend now" vs "what did I close last month"). If it
   answers the same question differently, it is a view *inside* the room, not a
   destination.
2. **Earns its emptiness.** If it would be empty for the first days or weeks
   (History, Progress), it is **hidden or gently deferred** until there is
   something in it, not shown as an empty tab. An empty History tab on day one is
   a small act of user-shaming ("look how little you've done"). Reveal it when it
   has content.
3. **Never technical.** Settings exists, but it is the *last* surface, visually
   the quietest, and never the thing a first-timer meets. Configuration is not an
   experience.

### 3.3 Navigation as a calm control, not a tab bar

When a product does have more than one surface, the destination control is:

- **Product-voiced.** Named in the product's own words (Identity Kit dimension
  9), not "Workspace / Progress." MMR's "the calm room" would not label a tab
  "Workspace."
- **Subordinate to the room.** The room is the default and the visual center.
  Secondary destinations read as smaller, lighter, clearly a level down. Resolve
  any nested view-switching *inside* the room as a quiet control under the hero,
  never a second equal tab row (this is the MMR-2 "double tab strip" fix).
- **Progressive.** Destinations that are not yet useful are not yet shown.

The test: **cover the navigation. Can the user still do the one main thing?** If
the product collapses without its nav, the nav is doing too much work and the
room is doing too little.

---

## Part 4: First run and guidance (teaching without a manual)

The constraint: guiding, tutorial-like help for first-timers, especially where
something is technical, but *nothing complicated.* The resolution: **teach by
doing, in context, just in time**, wrapped in a short first-use tour anchored to
the real interface, never a carousel of slides. The first real action is part of
the tutorial, not separate from it.

### 4.1 The first-run philosophy: value before instruction

Ordered by priority:

1. **First value fast.** The user should reach a real, personal result before
   they have "learned" anything. MMR delivers a Safe-to-Spend number *during*
   setup, not after. A tracker registers the first logged thing immediately. A
   course gives a real win in lesson one. Value is the best teacher of value.
2. **Scaffold, then fade (I do, we do, you do).** The classic learning
   progression, applied to product moments:
   - *I do:* the product performs the action once, visibly, with the result. ("We
     worked out $84 a day for you.")
   - *We do:* the product invites the user to do the next one with a gentle
     prompt and a visible example still on screen.
   - *You do:* the prompt fades; the user does it unaided; the scaffold does not
     come back unless they stall.
3. **Progressive disclosure of complexity.** Show the simple version first. The
   full breakdown, the advanced options, the edge cases live behind a calm "show
   how this works" that is collapsed by default. Trustworthy *and* serene (Identity
   Kit B4).

### 4.2 Guidance mechanics, from lightest to heaviest

Use the lightest that works. Reach for a heavier one only when a real user would
genuinely be stuck.

- **Instructive empty states (default).** A surface with no data yet does not
  say "No data." It says what goes here, why, and offers the one action that
  fills it. Every empty state teaches its surface.
- **Inline first-use hints.** A single line of helper text next to a control the
  first time it appears, that does not return once used. ("Rough numbers are
  fine. You can change anything later.")
- **The one-time nudge.** After the first result, one contextual suggestion for
  the natural next move, dismissible, never stacked. Not a tour.
- **Just-in-time coach mark.** A single pointed callout, only on a genuinely
  non-obvious affordance, only when the user reaches the moment it matters. One
  at a time, never a sequence of five.
- **The gentle stall-catch.** If the user opens something and does nothing for a
  while, *then* offer help. Idleness earns guidance; arrival does not.

### 4.3 The first-use tour (every product gets one, done right)

Every product ships a first-use tour. It obeys four rules that separate it from
the disembodied carousel we refuse (Part 1):

- **Contextual.** It points at the real interface, the actual room, the actual
  capture control, not illustrated slides in a modal. Each step highlights
  something that is really on screen.
- **Short.** A few steps at most, covering only the room's one focal moment and
  the core loop. It never explains every control; the rest is discovered by use.
- **Skippable.** A visible skip at every step, and skipping is remembered. It
  never runs twice unless the user asks to see it again.
- **Tied to doing.** Where possible a step invites the real action rather than
  describing it, so the tour and the first real use are one motion.

The tour introduces the room and the loop, then gets out of the way. Everything
deeper is left to the just-in-time mechanics above (4.2).

### 4.4 Handling the genuinely technical moments

Some things are unavoidably technical: installing the PWA, enabling
notifications, exporting or downloading a file, granting a permission, resetting
or pausing. The rules:

- **Just in time, never up front.** Ask to install the app after the user has
  felt value, not on arrival. Ask for notification permission the first time
  there is something worth being reminded about, framed as the benefit ("want a
  nudge before your bills hit?"), never "Draftpace wants to send notifications."
- **Plain language and a reason.** Every technical step is one sentence a
  non-technical person understands, plus *why it helps them.* Never jargon
  (drawing on the persona lesson: they do not speak in system terms).
- **Optional and non-blocking.** The product must be fully usable if they say
  no. A declined permission is a valid state, handled gracefully, re-offerable
  later, never a nag.
- **Show the safety.** Anything destructive (reset, delete, pause) states
  plainly what will and will not happen, and confirms. Anything that leaves the
  product (export) says where it goes.

---

## Part 5: Personalisation (feeling made-for-you)

Personalisation is what turns "an app" into "my thing." It runs on four levels;
a product declares how far up it goes.

1. **Named and addressed.** It knows who they are and speaks to them, warmly and
   sparingly. "Welcome back" beats a logo. Never overdone into fake chumminess.
2. **Situation-shaped.** Setup answers change *what the product shows*, not just
   a stored value. Questions that would not change anything for this user never
   appear (the "no useless questions" promise). This is Priya's whole conversion.
3. **State-reactive.** The product's central moment reflects *their current
   reality* and visibly changes when they change an input. This is the felt proof
   of aliveness (P4): the number re-settles, the plan reshapes.
4. **History-aware.** Over time it references their own past ("you usually set
   aside more this week", "last month you closed on the 3rd") to feel like it has
   been paying attention. Highest level; reserved for products people return to
   often.

**Personalisation guardrails:**

- Personal, not surveillance. Reference only what the user gave the product, for
  the product's own purpose (Data Boundaries). Never imply we know more than we
  do.
- Warm, not cloying. One human touch per surface, not a personality performing.
- Honest. Never fabricate a personalised insight to seem smart (the North Star's
  "no fabricated data" rule reaches inside products too).

---

## Part 6: Motivation and gamification, done the Draftpace way

You asked for the gamification lens. Draftpace's North Star is explicit and it
constrains the toolkit hard: **momentum, never punishment; falling behind is
never penalised** (P5, and Sam is the conscience of every product). So we keep
the *intrinsic* motivators and refuse the *manipulative* ones.

**Locked ceiling: milestone feedback only.** A product may mark a genuinely
meaningful moment with a small celebratory motion, an optional sound, or a
satisfying completion state. That is the whole allowance. No points, no streak
pressure, no badge collections, no levels, no confetti on every tap, no
artificial engagement loops. Celebrate the moment that matters, once, then
recede.

### Use (intrinsic, dignified)

- **Momentum, not streaks.** Show recent meaningful action and its rhythm, in a
  way that a gap does not destroy. A missed week lowers momentum gently; it never
  shows a broken chain or a zero.
- **Progress that reflects reality.** Completion of a finite arc (a program, a
  course, a month) shown as honest, earned progress toward a real end.
- **Milestone moments.** A quiet, genuine celebration at real thresholds (first
  month closed, a course finished, a goal protected). Tasteful, once, then it
  gets out of the way.
- **Mastery signals (learning).** "You have got this" feedback tied to actual
  demonstrated understanding, not points.
- **Closure and pride.** Ending a chapter (month-close, program completion)
  feels like a dignified summary you are proud of, and a warm on-ramp to next,
  never a lost-streak wall.

### Refuse (extrinsic, shaming, or manipulative)

- Punishing streaks and "don't break the chain" pressure.
- Overdue walls, red counts, guilt states, urgency timers.
- Points, badges, or leaderboards for their own sake (extrinsic noise that
  cheapens a premium, personal product).
- Fake scarcity or engagement-bait notifications.
- Loss-aversion mechanics ("you'll lose your progress if...").

The line: a mechanic is allowed if it would still feel kind to **Sam after a
two-week lapse.** If it would make Sam feel behind, it is banned.

---

## Part 7: The living artifact (the downloadable-file case)

You raised products that produce a downloadable PDF. This is important, because a
dead PDF is the *enemy* in our own marketing. The resolution:

**The product is the living layer. The file is a personalised output of it,
generated from the user's data, always current, and re-downloadable, never the
product itself.**

- **The artifact is generated, not delivered.** The user does not buy a PDF.
  They use a living product that, from their answers and data, *produces* a
  tailored artifact (a personalised plan, a printable, a summary, a certificate).
- **It is always up to date.** Because it regenerates from live state, the
  download they take today reflects today. If their situation changes, they
  re-download and it is correct. This is precisely the opposite of the file that
  died on download.
- **The download is a moment, not the destination.** Framed as "take it with
  you," "print it for the fridge," "share this with your partner." The living
  product stays the home; the file is a portable snapshot for a context the
  browser cannot reach (a wall, a printer, an email to someone else).
- **The artifact is beautiful and personal.** It carries the product's Identity
  Kit (its world, type, voice), and it has the user's real content. It is not a
  generic template with their name merged in.
- **Export is a technical moment (Part 4.3 rules apply).** Plain language, states
  what it contains and where it goes, optional, never the only way to get value.

A product may be *artifact-forward* (its main output is the generated file, e.g.
a personalised meal plan you print weekly) or *artifact-optional* (a companion
that can also export a summary). Declared per product.

**Free and paid both make artifacts (locked: no hard rule).** A free product can
produce a small, genuinely useful artifact. Paid products can produce richer
ones: more personalised, repeatable on a cycle, or multi-format. Artifact depth
is a lever for value, never a gate that makes the free product feel like a trial
(which the North Star forbids). Generated files live on the product's
**Printables** surface (Part 3.1).

---

## Part 8: The product-type experience matrix

Each type below is one of the six families (plus the artifact and decision
patterns that cut across them). For each: the **core loop**, the **signature
moment** (its one defining component, Identity Kit dimension 8), the **first-run
move**, the **personalisation ceiling** (Part 5), and its **specific traps.**

### 8.1 Calculator / decision tool  *(workspace family)*

- **Core loop:** structured input → one clear answer → guidance → save the
  output → compare over time.
- **Signature moment:** the answer itself, rendered with authority (MMR's Safe-
  to-Spend figure; a decision tool's clear recommendation).
- **First run:** reach a real answer within the first minute, mid-input. The
  answer teaches the tool.
- **Personalisation ceiling:** state-reactive (level 3); history-aware if people
  return.
- **Traps:** turning into a spreadsheet; hiding the answer behind a full form;
  showing a dashboard of inputs instead of the one output. One answer, forward.

### 8.2 Tracker  *(tracker family)*

- **Core loop:** near-zero-friction capture → see it register → momentum view →
  gentle periodic review.
- **Signature moment:** the momentum or trend, shown so a gap does not read as
  failure.
- **First run:** log one thing and watch it land immediately. Capture must be one
  tap/one field, thumb-reachable.
- **Personalisation ceiling:** history-aware (level 4); this type earns it.
- **Traps:** streaks and chains (banned, Part 6); an empty chart on day one (Part
  3.2); making logging feel like data entry.

### 8.3 Guided program  *(guided-program family)*

- **Core loop:** orient to the arc → do the current stage's one task → check in →
  advance → reach a real ending.
- **Signature moment:** the current stage plus the single next task, with the arc
  visible but not looming.
- **First run:** show the shape of the whole journey (reassuring, finite), then
  drop them into step one. Priya's "guide me through *this*."
- **Personalisation ceiling:** situation-shaped (level 2) is the point; the arc
  adapts to their specifics and adjusts when a date moves.
- **Traps:** a rigid checklist that ignores their situation; no sense of an end
  (programs must complete with dignity); punishing a skipped day.

### 8.4 Learning product  *(learning family)*

- **Core loop:** lesson → practice → check for understanding → mastery signal →
  spaced return → completion.
- **Signature moment:** the lesson player plus an honest mastery/progress read.
- **First run:** a quick real win in lesson one; scaffold the first activity (I
  do, we do, you do, Part 4.1).
- **Personalisation ceiling:** history-aware and adaptive (level 4); pace and
  review adapt to demonstrated understanding, not a fixed drip.
- **Traps:** lecture-then-quiz with no doing; punishing wrong answers instead of
  teaching from them; a rigid schedule that shames a missed day; a certificate
  that means nothing.

### 8.5 Companion  *(companion family)*

- **Core loop:** a light daily/periodic check-in → the one next move → capture →
  it adapts → welcome back after gaps. The deepest, most "alive" type.
- **Signature moment:** the daily focal, "here is where you are and the one thing
  now."
- **First run:** setup as a warm conversation, then establish a gentle rhythm.
  Set presence expectations (Part 9): how often it will speak, always restrained.
- **Personalisation ceiling:** full (level 4), this is where it belongs.
- **Traps:** becoming needy (the "living does not mean needy" promise); notifying
  too much; a daily obligation that becomes another thing to keep up with.

### 8.6 Automation / utility  *(automation family)*

- **Core loop:** set it up once → it recedes and does the work → surfaces only
  run-health and exceptions → the user checks in rarely.
- **Signature moment:** a calm status, "this is handled; here is the state," and
  a clear, honest failure state when something needs them.
- **First run:** the setup is the product; make configuring the automation feel
  guided and safe, then reassure them they can walk away.
- **Personalisation ceiling:** situation-shaped (level 2); it is about their
  rules, not about them.
- **Traps:** demanding attention it does not need; hiding failures; feeling like
  infrastructure instead of a calm helper. This is the *quietest* presence on the
  spectrum (Part 9).

### 8.7 Interactive workspace / tool  *(workspace family, richer)*

- **Core loop:** structured making → live output → save named outputs → revisit
  and export.
- **Signature moment:** the output taking shape as they work.
- **First run:** a guided first output using a real starter, not a blank canvas
  (avoid the Notion trap).
- **Personalisation ceiling:** state-reactive (level 3).
- **Traps:** drifting into a configurable blank canvas; too many controls
  visible at once; no opinion.

### 8.8 Artifact-forward product  *(cross-cutting, Part 7)*

- **Core loop:** answer a few things → get a personalised artifact → refine → re-
  download as life changes.
- **Signature moment:** the living preview of the generated artifact, updating as
  they adjust inputs.
- **First run:** the fastest path to seeing *their* artifact, even partially,
  then refine.
- **Personalisation ceiling:** state-reactive to history-aware.
- **Traps:** feeling like a form-to-PDF generator; a static preview; an artifact
  that is a generic template with a name merged in.

---

## Part 9: Presence and voice (how a product speaks and how often)

Two product-level declarations (Identity Kit dimensions 9 and 10) govern this.

- **Presence character** (light ↔ deep) sets *whether and how often* a product
  reaches out. A calculator is silent until opened. A tracker whispers on a
  review cycle. A companion checks in daily, gently. This is declared, so
  "restraint" is a property, not a mood, and no product nags by default.
- **Locked: notifications are strictly opt-in.** No product notifies by default.
  A product first proves useful, then asks permission for one specific reminder
  with a clear benefit ("want a nudge before your bills hit?"). Permission is per
  reminder and per product, never a blanket grant, and a decline is a fine, final
  answer until the user changes it. Presence character sets the ceiling on what a
  product may *ask* for; it never grants itself anything.
- **Voice** is warm, plain, and blameless everywhere. Concretely:
  - Address the user as a capable adult, never a child to be motivated.
  - Name the next move as an offer, not a command ("want to..." over "you must").
  - Frame lapses as neutral facts with a way forward, never as failure.
  - Prefer their words over system words (persona lesson): "safe to spend," not
    "available balance calculation."
  - One human line per surface, not a personality performing across every label.
  - Absolute rule (project-wide): **no em dashes** in any product copy.

---

## Part 10: Accessibility and inclusivity of the guidance itself

Guidance is not exempt from the Foundations' a11y guarantees; it is often where
they are broken. Requirements:

- Every hint, coach mark, and nudge is reachable and dismissible by keyboard, and
  announced to assistive tech (live regions for the moments that matter, e.g. a
  changed hero figure).
- No guidance conveyed by color or motion alone; a nudge that relies on an
  animation must also read when motion is reduced.
- The stall-catch (Part 4.2) must not fire on someone using a screen reader or
  simply reading slowly; base it on interaction, not raw time where possible, and
  be generous.
- Text scale and reduced-motion (Foundations) never break a guided moment; test
  first-run at large text and reduced motion, not just the default.
- Reading level: guidance copy targets a broad reading level. Plain words win.

---

## Part 11: Worked examples (the variety, made concrete)

Four products across four types, to show the same spine flexing.

**A) Monthly Money Reset (calculator + light companion).** Threshold into the
calm room; setup is a five-step conversation that yields Safe-to-Spend mid-flow;
the room is the figure plus the one next move; Quick Add is the effortless loop;
momentum (not streaks) on Progress; month-close is a dignified chapter ending.
One room, two quiet secondary surfaces, medium presence. *(Full spec: Identity
Kit Part B.)*

**B) A habit tracker ("Keep It Going").** Single surface. The room is a gentle
momentum shape and today's one action. Capture is one tap. There is no chain to
break; a two-week gap shows a soft, low momentum and a warm "pick one small thing
today," never a zero or a red streak. History reveals only once there are weeks
to show. Light-to-medium presence: an optional weekly whisper, never daily
nagging. Serves Sam without ever shaming Sam.

**C) A "Moving House" guided program (situational, finite).** Orients Priya to
the whole arc (six weeks, five stages) so it feels contained, then drops her into
stage one's single task. Each stage adapts to her real constraints (kids, pets,
a moved date) and reshapes when something changes. It *ends* with a dignified
"you did it," not an open-ended tool she has to remember to close. Situation-
shaped personalisation is the entire value.

**D) A personalised meal-plan product (artifact-forward).** A few questions
produce a living preview of *her* week of meals that updates as she adjusts. The
signature moment is that preview. She can download or print this week's plan (a
technical moment, handled per Part 4.3), and because it regenerates from live
state, next week's download is correct without her rebuilding anything. The
living product is home; the printable is the portable snapshot. The exact
opposite of the dead meal-plan PDF in the homepage graveyard.

---

## Part 12: How to use this, and the open decisions for you

**How to use it.** When a new product is scoped, before any build:
1. Name its type (Part 8) and its beat weighting (Part 2).
2. Decide its surface count (Part 3) and defend every surface past the room.
3. Write its first-run value moment (Part 4.1) and its one signature moment.
4. Set its personalisation ceiling (Part 5) and presence character (Part 9).
5. Choose its gamification set, and check it against "kind to Sam after a lapse"
   (Part 6).
6. Fill its Product Identity Kit (the visual world) last, expression follows
   experience.

**Locked decisions (founder, 2026-08-03).** These set direction for every product.

1. **Canonical shape.** First open leads into a short guided Setup, then one
   primary Workspace (the room), with supporting Progress, History, and
   Printables revealed only as each earns content. One primary surface, always
   (Part 3.1).
2. **Gamification ceiling: milestone feedback only.** A small celebratory motion,
   an optional sound, or a satisfying completion state at a genuinely meaningful
   moment. Nothing else: no points, streaks, badges, levels, confetti-everywhere,
   or engagement loops (Part 6).
3. **Notifications: strictly opt-in.** Nothing notifies by default; a product
   proves useful first, then asks for one specific reminder with a clear benefit
   (Part 9).
4. **Artifacts: no hard free/paid rule.** Free products make small useful
   artifacts; paid products make richer, more personalised, repeatable, or
   multi-format ones. Depth is a value lever, not a trial gate (Part 7).
5. **First-use tour: every product gets one**, but contextual, short, skippable,
   and tied to the real interface, never a slide carousel (Part 4.3).

With these locked, the next move is one of two concrete things: a buildable
experience spec for the next product, or a reusable set of guidance primitives
(the first-use tour, empty states, first-use hints, the nudge, the stall-catch,
milestone feedback) that every product inherits, the same way the Identity Kit
made the visual world reusable.

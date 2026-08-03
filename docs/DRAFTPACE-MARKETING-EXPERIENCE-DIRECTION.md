# Draftpace: Marketing Experience & Design Direction

**Customer-facing source of truth.** Governs the whole public/marketing side:
who it's for, the journey they travel, and the complete direction across Design,
UX, UI, Copy, HCI, and Accessibility.

**Status:** Locked direction, living document. Sits under
[`DRAFTPACE-NORTH-STAR.md`](DRAFTPACE-NORTH-STAR.md), where this contradicts the
North Star, the North Star wins; where it contradicts older marketing choices,
this wins. Pillars referenced as **P1-P6** map to the North Star's six pillars.

**Honesty status of the research (read this first):** the personas below are
**evidence-informed synthesis**, built from well-established patterns in the
planner / digital-product buyer market (Etsy, Gumroad, Notion-template, GoodNotes
economies) and standard JTBD reasoning. They are **not** primary interviews.
Treat them as high-confidence hypotheses that direct design now and get validated
with real buyers before we bet heavily. §13 lists exactly what to validate.

---

## 1. Market context: why people buy planners, and why it fails them

People don't buy planners. They buy a **belief that this time they'll get on top
of it.** The purchase is an emotional act of hope at a moment of friction (a
dropped ball, a new year, a life change, a spike of anxiety). The product is a
proxy for a better-organized, calmer version of themselves.

Then it dies, three predictable ways:

1. **Upkeep is a second job.** A blank template offloads *all* the work onto the
   buyer. Maintenance requires willpower they bought the planner to compensate
   for. It lapses within weeks.
2. **It doesn't fit the actual situation.** A generic grid can't guide a specific
   mess (a move, irregular income, a new baby). The buyer has to design their own
   system on top of the thing they paid to avoid designing.
3. **Falling behind is punishing.** A week of gaps turns the tool into a monument
   to failure, blank pages, overdue piles, a broken streak. Shame closes the
   file for good.

**This is exactly the gap Draftpace is built for** (North Star §2). A *living*
product does the upkeep, fits the situation, and forgives the gap. The marketing
side's entire job is to make the right person **recognize their own story** in
that gap and believe Draftpace closes it, without over-promising.

---

## 2. Research method & how to read the personas

- **Lens:** Jobs-to-be-Done (the progress the person is trying to make) crossed
  with **emotional state** (planner buying is emotional, not utilitarian).
- **Each persona carries:** context, the job they're hiring a product for, the
  trigger that makes them buy, what they've already tried and why it failed, the
  objection that stops them, what would make them *believe*, and the anti-signals
  (when they're not our buyer).
- **Product mapping:** each persona notes which Draftpace product type serves
  them, with **Monthly Money Reset (MMR)**, the first product, called out,
  since §10 of the North Star makes it the proof case.

---

## 3. Personas

### Quick-scan table

| # | Persona | One line | Core job | Buys because | Believes when | First product fit |
|---|---|---|---|---|---|---|
| 1 | **Maya, the Overwhelmed Juggler** | Working parent, too much in her head | "Get it all out of my head into one place I trust" | She dropped a ball | Upkeep is done *for* her | Organizers, MMR |
| 2 | **Deen, the Aspirational Restarter** | Freelancer, irregular income, hopeful buyer | "Help me actually follow through this time" | A fresh-start moment | Falling behind isn't punished | **MMR**, guided programs |
| 3 | **Priya, the Situational Planner** | In a specific life transition | "Guide me through *this* situation" | A move/wedding/baby | It fits her exact situation | Guided programs, situational tools |
| 4 | **Sam, the Executive-Function Seeker** | Neurodivergent (ADHD), needs external structure | "Give me structure I can actually maintain" | Overwhelm / a missed deadline | It's low-friction and forgiving | All, the archetype the model serves best |
| 5 | **Grace, the Tablet Power-User** | iPad/GoodNotes devotee, buys hyperlinked PDFs | "Give me something that feels like a real app" | Frustration with static files | It's genuinely app-like & syncs | The PWA-vs-PDF wedge |

### Persona 1: Maya, the Overwhelmed Juggler *(the volume buyer)*

- **Context:** 34, marketing manager, two kids, dual-income. Competent at work,
  underwater at home-admin. Phone full of half-started notes and screenshots.
- **Job:** "Get everything out of my head and into one place I actually trust, so
  I stop dropping things."
- **Trigger:** a concrete miss, a late bill, a forgotten school form, a
  double-booked weekend. Buys within a day of the miss.
- **Tried & failed:** bullet journal (fell behind), Notion (built an elaborate
  system, never maintained it), 2-3 Etsy planners (beautiful, abandoned).
- **Objection:** *"I'll abandon this like all the others."* This is the master
  objection for our whole market.
- **Believes when:** the product **reduces** effort instead of adding a ritual:
  it remembers for her, resurfaces what matters, and doesn't require daily
  tending (P2, P4, P5).
- **Emotional arc we design for:** guilt → relief → trust.
- **Not our buyer when:** she wants a customizable system to tinker with. We're
  opinionated, not a canvas.
- **Voice:** *"I don't need another thing to keep up with. I need something that
  keeps up with me."*

### Persona 2: Deen, the Aspirational Restarter *(the MMR bullseye)*

- **Context:** 27, freelance designer, income arrives irregularly and unevenly.
  Money is a low hum of anxiety, some months flush, some months scraping.
- **Job:** "Tell me what's actually safe to spend, and help me follow through
  without a spreadsheet I'll abandon."
- **Trigger:** a fresh-start moment (month start, a good invoice landing, or a
  scary low balance). Buys on hope.
- **Tried & failed:** budgeting apps (too complex, judgmental, built for salaried
  people), a finance spreadsheet template (upkeep collapsed), a planner PDF.
- **Objection:** *"Budgeting apps make me feel worse and I quit."* Fear of being
  judged by the tool.
- **Believes when:** it's **one clear number**, not a budget; it doesn't shame a
  bad week; and falling behind means "update what changed," not "start over"
  (P4, P5). This is precisely MMR's Safe-to-Spend + recovery model.
- **Emotional arc:** anxiety → clarity → calm control.
- **Not our buyer when:** he wants full double-entry accounting or investment
  tracking. We do calm clarity, not power finance.
- **Voice:** *"I don't want a budget. I want to know I'm okay to spend this."*

### Persona 3: Priya, the Situational Planner

- **Context:** 31, in the middle of one big thing, moving cities, planning a
  wedding, or expecting a first child. Time-boxed, high-stakes, unfamiliar.
- **Job:** "Guide me through *this specific situation* so I don't miss something
  that matters."
- **Trigger:** the situation itself becomes real (offer accepted, date set).
- **Tried & failed:** generic checklists that don't fit her real constraints; a
  situation-specific Etsy PDF that was just a static list with no guidance.
- **Objection:** *"A template can't know my situation."*
- **Believes when:** the product **asks about her situation and adapts**, shows
  only what's relevant, tells her the next step, adjusts when a date moves (P3,
  P4). The homepage's "questions that wouldn't change anything never show up"
  moment is aimed straight at her.
- **Emotional arc:** overwhelm → orientation → confidence.
- **Not our buyer when:** the situation is over, she churns naturally, and that's
  fine; guided programs are finite by design.
- **Voice:** *"Just tell me what I actually need to do next, for my situation."*

### Persona 4: Sam, the Executive-Function Seeker *(the archetype the model serves best)*

- **Context:** 24, grad student, ADHD. Bright, capable, but initiation and
  consistency are the wall. Buys tools constantly looking for the one that
  "sticks."
- **Job:** "Give me external structure I can actually keep up, that doesn't punish
  me for being human."
- **Trigger:** a missed deadline or an overwhelm spike; also dopamine-buying new
  tools.
- **Tried & failed:** everything. The pattern: high-friction capture + punishing
  overdue states = abandonment within two weeks.
- **Objection:** *"I always fall off. Why would this be different?"*
- **Believes when:** capture is near-zero-friction; there's always **one** clear
  next action, not a wall; and returning after a lapse is welcoming, not a pile
  of red (P4, P5, and the North Star's "falling behind is not punishment").
- **Emotional arc:** shame/overwhelm → safety → momentum.
- **Not our buyer when:** never really, Sam is the conscience of the product. If
  it works for Sam, it works for everyone.
- **Voice:** *"I don't need motivation. I need it to be easy to come back to."*

### Persona 5: Grace, the Tablet Power-User *(the PWA-vs-PDF wedge)*

- **Context:** 29, nurse, iPad + Apple Pencil devotee, active in GoodNotes/planner
  communities, has bought many hyperlinked PDF planners.
- **Job:** "Give me the aesthetic and structure I love, but that behaves like a
  real app."
- **Trigger:** frustration that her beautiful PDF can't remind her, sync, or
  update itself; envy of real apps.
- **Tried & failed:** hyperlinked PDFs (static, siloed on one device, all manual),
  a few web tools (ugly, generic, didn't feel premium or *hers*).
- **Objection:** *"Web apps feel cheap and I lose them in a browser tab."*
- **Believes when:** it's installable, syncs across her devices, looks *premium*
  (as good as the PDFs she loves), and clearly does things a file never could
  (P1, P6, North Star §11). She's the person our whole "alive, not static" pitch
  is built to convert.
- **Emotional arc:** desire → skepticism-of-web-apps → delight.
- **Not our buyer when:** she only wants to hand-letter on a canvas, that's
  expression, not a system.
- **Voice:** *"I want it to feel like an app I'm proud to have installed."*

### The anti-persona (say no to this)

**The Systems Tinkerer / Notion power-user** who wants an infinitely
customizable canvas to build their own tool. Draftpace is **opinionated and
guided**, we make the decisions so the user doesn't have to. Designing for the
tinkerer would destroy the calm, guided quality every real persona above is
begging for. When a request would serve the tinkerer at the cost of Maya/Deen/
Sam, refuse it.

---

## 4. Cross-persona pain themes → design implications

The five personas converge on five pains. Each becomes a design mandate for the
marketing side.

| Shared pain | The feeling | Marketing design mandate |
|---|---|---|
| **"I'll abandon this like the others."** | Distrust born of repeated failure | Lead with **why this one sticks** (it's alive, it does the upkeep, it forgives lapses). Prove it, don't claim it. This is the #1 objection to design the whole funnel around. |
| **"A template can't fit my situation."** | Skepticism of generic tools | **Show adaptation**, don't describe it. Demonstrate the product asking about their situation and responding. |
| **"Tools punish me when I fall behind."** | Shame | Make **recovery a visible promise** on the marketing side ("start again without starting over"), because the fear of failure blocks the purchase. |
| **"Budgeting/planning apps judge me."** | Anxiety, defensiveness | **Calm, non-judgmental voice.** No hustle, no guilt, no gamified pressure. Especially for MMR. |
| **"Web apps feel cheap and disposable."** | Doubt about value/permanence | **Premium craft + owned framing** (P6). The marketing surface itself must feel high-end, because it's the first proof the product will be too. |

**Governing insight:** in this market, **the objection precedes the desire.**
People *want* to be organized; they've been burned. So the marketing side must
resolve distrust *as it* builds desire, not sell first and reassure later.

---

## 5. The marketing customer journey

Eight stages from arrival to activation-handoff. Each stage specifies, per your
request, **all six lenses: Design intent · UX · UI · Copy · HCI/interaction ·
Accessibility.** Personas are overlaid where a stage serves one especially.

> **North Star tie-in:** the platform is the stagehand (P1). The marketing side's
> job is to hand a *believing* buyer to the product as fast as honesty allows,
> then get out of the way.

### Stage 0: Trigger & arrival

- **User state:** arrives at a friction moment (dropped ball, fresh start,
  anxiety spike). Problem-aware, often solution-unaware. Skeptical from past
  failures. On mobile more often than not.
- **UX:** the first screen must earn 5 seconds. No cookie wall, no interstitial,
  no "choose your path" quiz before value. Instant, fast load.
- **UI/Design:** one confident focal composition above the fold; premium
  restraint signals quality before a word is read.
- **Copy:** none of our internal language. No "platform," "product families,"
  "capabilities." The first words are *their* problem in *their* words.
- **HCI:** page interactive < 2.5s on mid-tier mobile; no layout shift; the hero's
  interaction is discoverable but not required to understand the message.
- **Accessibility:** meaningful content in the DOM without JS for the core
  message; respects reduced-motion from the first frame.
- **Success signal:** they scroll / engage the hero instead of bouncing.

### Stage 1: Recognition ("this is about me")

- **Serves:** everyone, especially Maya & Sam.
- **User state:** scanning for whether this understands their specific mess.
- **UX:** recognition before explanation. Reflect the problem back before
  introducing the solution.
- **UI/Design:** their situation shown, not just stated, the messy-notes-to-one-
  step demonstration is exactly right and should be the emotional anchor.
- **Copy:** situational, in their voice ("There is too much to keep track of, and
  none of it is written down in the same place"). This is already strong; it is
  the *baseline*, not the ceiling, sharpen toward each persona's exact wording.
- **HCI:** demonstration over claim, one interaction that *shows* the mess
  becoming one clear thing beats three paragraphs describing it.
- **Accessibility:** the demo has a text-equivalent path; interaction is
  keyboard-operable and screen-reader-narratable; nothing critical is conveyed by
  color/animation alone.
- **Success signal:** "that's me", measured by scroll-depth past this section.

### Stage 2: Comprehension ("what *is* this, and why isn't it just another PDF?")

- **Serves:** Grace especially; everyone implicitly.
- **User state:** now curious, needs to grok the category. This is the make-or-
  break conceptual moment: **static file vs. living product.**
- **UX:** teach the difference through contrast, fast. The wedge, "you've bought
  the dead PDF; this one is alive", must land here.
- **UI/Design:** a before/after or dead-vs-alive contrast device (not an icon
  grid). Show the product *doing* something a file can't (remembering, reminding,
  adapting).
- **Copy:** name the enemy gently and the shift clearly. "Most planners are a file
  you forget. This one keeps up with you." Avoid jargon ("PWA," "cloud state" →
  "works like an app," "saved to your account, on every device").
- **HCI:** a small, honest interactive proof of "alive" (e.g. a mini "it
  remembers / it updates when something changes" moment).
- **Accessibility:** contrast device works in both themes and for color-blind
  users (form + label, not color alone); animations are decorative-only and
  reduced-motion-safe.
- **Success signal:** they understand it's not a download, measured by continued
  scroll and product-page click-through.

### Stage 3: Desire ("I can see myself using this")

- **Serves:** Grace, Maya.
- **User state:** interested; wants to *feel* the product before committing.
- **UX:** **show the actual product** (North Star §10 / audit SHOP-2). This is the
  current biggest gap, desire is built by seeing the real Safe-to-Spend
  interface and one real working moment, not by reading bullet lists.
- **UI/Design:** premium product imagery/renderings of the real UI in its own
  identity (MMR's forest/ivory world), framed like a boutique app store, not a
  feature list.
- **Copy:** outcome language, specific and calm ("Know what's safe to spend, in
  one number, updated as the month goes"). Concrete beats abstract.
- **HCI:** ideally a **live, sandboxed try** of the core moment (even a scripted
  one), feeling > telling. If not live yet, high-fidelity motion of the real UI.
- **Accessibility:** product media has alt/description; any autoplaying motion is
  pausable and reduced-motion-aware; captions on any narrated media.
- **Success signal:** reaches the product page / add action.

### Stage 4: Objection handling ("but I'll abandon it / it won't fit / it'll judge me")

- **Serves:** all, this is where the market's default distrust is resolved.
- **User state:** wants it, braced to be disappointed again.
- **UX:** meet the three master objections **head-on, near the decision**, not
  buried in an FAQ: *abandonment*, *fit*, *punishment/judgment*.
- **UI/Design:** a calm, confident objection-resolution moment, not defensive,
  not salesy. The "welcome back / start again without starting over" recovery
  framing belongs here.
- **Copy:** name the fear and answer it plainly. "Fallen behind? It doesn't show
  you a wall of overdue tasks. It asks what changed and gives you one small step."
  Honest limits build trust, say who it's *not* for (Stage-4 "maybe not if").
- **HCI:** progressive disclosure, objections expandable for those who need them,
  invisible to those who don't; no dark patterns, ever.
- **Accessibility:** disclosures are real `<button>`/`<details>` semantics,
  keyboard-operable, state announced; focus managed on expand.
- **Success signal:** proceeds to commit rather than bouncing to "think about it."

### Stage 5: The choice (store & product page)

- **Serves:** all; Deen at the money product.
- **User state:** comparing, checking price/trust, deciding.
- **UX:** the store is **product-forward and app-like** (North Star §9), no
  solutions-funnel nav. With few products, present the one(s) richly; don't fake
  a catalogue with category grids over empty space (audit SHOP-1).
- **UI/Design:** boutique-store feel; each product previewed with its own identity;
  the product page shows the product (Stage 3) with the **add action always within
  reach** (sticky/persistent), not buried mid-page.
- **Copy:** trustworthy pricing framing ("Free tools are complete, not stripped-
  down previews." / "Billed once, not a subscription."), already good, keep.
- **HCI:** decision-support, not pressure, no fake scarcity, countdowns, or
  urgency. A calm, reversible-feeling commit.
- **Accessibility:** price and CTA reachable and legible; product comparison works
  without color; structured data honest.
- **Success signal:** clicks "Add" / "Get".

### Stage 6: Commit → activation handoff

- **Serves:** all.
- **User state:** decided; momentum is fragile; must not be dropped.
- **UX:** the seam between marketing and product is invisible. Auth only when
  required, context preserved ("Sign in to add Monthly Money Reset"), then
  **straight into first value**, not an explainer gate (audit MMR-3).
- **UI/Design:** the confirmation and hand-in feel like part of one continuous
  premium experience, not a different app.
- **Copy:** reassurance at the moment of commit ("No payment now or later. Your
  progress saves automatically."). Already good on the activation card.
- **HCI:** the commit must actually *work* (the current `?error=1` is a
  trust-killer here, this stage is worthless until activation is real).
- **Accessibility:** auth forms fully labeled, error messaging clear and
  programmatically associated, focus moved to the next step.
- **Success signal:** lands in the product with first value visible.

### Stage 7: Return (the marketing side's role in continuity)

- **Serves:** all; the retention flywheel.
- **User state:** a returning visitor who already owns something.
- **UX:** for signed-in/returning users, the public front door should **defer to
  the product**, "continue" outranks "discover." Don't sell someone what they
  already own.
- **Copy:** state-aware, a returning user sees "pick up where you left off," not
  the first-time pitch.
- **Accessibility/HCI:** same standards; recognized state must never mislead
  (honest, not fabricated).

### Journey summary: the emotional spine

```
guilt/anxiety ─► "that's me" ─► "oh, it's alive" ─► "I can see myself using it"
   (arrival)     (recognition)   (comprehension)        (desire)
        ─► "…and it won't abandon/judge me" ─► calm decision ─► seamless start ─► it delivers
                (objection resolved)            (choice)         (handoff)        (first value)
```

Every stage moves one emotion. If a section doesn't move the emotion forward, cut
it (this is the fix for the audit's "11 same-tempo bands", sequence by emotional
job, not by feature list).

---

## 6. Messaging & copy framework

### Voice principles

1. **Human, in their words.** Write the way the persona talks (§3 voice lines),
   not the way we architect.
2. **Calm and sure.** Premium reads as unhurried and unhedged. No hype, no
   exclamation-driven energy, no hustle.
3. **Specific over abstract.** "Know what's safe to spend this month" beats
   "take control of your finances."
4. **Recognition before explanation.** Reflect the problem before pitching.
5. **Honest, including limits.** Say who it's not for. Honesty is a conversion
   asset in a burned market.
6. **Never judge.** Especially money and follow-through. No shame, no "you
   should."

### Message hierarchy (what to say, in order)

1. **The problem, in their voice** (recognition).
2. **The shift**: it's alive, not a file you forget (comprehension).
3. **The proof**: see it working (desire).
4. **The reassurance**: it won't abandon/judge/punish you (objection).
5. **The terms**: honest price, honest access (choice).

### Headline patterns (formulas, not final copy)

- Situation → relief: *"[Messy situation]. [One calm outcome]."*
- Contrast: *"Most [category] are a file you forget. This one keeps up with you."*
- Specific outcome: *"Know what's safe to spend this month, in one number."*
- Recovery: *"Fallen behind? Start again without starting over."*

### Objection → copy map

| Objection | Copy answer (direction) |
|---|---|
| "I'll abandon it" | "It does the keeping-up, so you don't have to." |
| "Won't fit my situation" | "It asks about your situation and shows only what matters." |
| "It'll punish me" | "No wall of overdue tasks. Just the next small step." |
| "It'll judge me" (money) | "Not a budget. Just a clear, calm picture, no lectures." |
| "Web apps feel cheap" | "Install it like a real app. It's yours, on every device." |

### Punctuation rule (absolute)

**No em dashes. Ever.** Not in customer-facing copy, not in these direction docs,
not anywhere that represents Draftpace. Use a comma, a colon, a period, or
parentheses instead, whichever the sentence actually wants. The em dash is a
banned character in Draftpace content. (Hyphens in compounds like "first-party"
and hyphenated ranges like "8-12" are fine; the ban is the long prose dash.)

### Words we use / words we ban

- **Use:** *alive, keeps up with you, one clear next step, safe to spend, saved to
  your account, on every device, yours, calm, in your words, this month, the next
  useful move.*
- **Ban (internal/jargon):** *platform, product family, capability, cloud state,
  entitlement, instance, workspace (as a category label to a newcomer),
  Momentum OS, dashboard (except to reject it), synergy/leverage/hustle,
  AI-cadence "unlock/elevate/supercharge."*
- **Ban (punctuation):** em dashes, per the absolute rule above.

### Microcopy standards

- Buttons name the outcome ("Know what's safe to spend"), not the mechanism
  ("Submit").
- Empty/first-run states **offer a step**, never describe the system.
- Errors are human and blameless ("Couldn't reach the account service" not "Error
  401").
- Never surface raw values (slugs, enums, `cycleKey`) to a customer.

---

## 7. Marketing UX architecture

### Navigation model: app-type, product-forward (retire the funnel)

The "What do you need help with?" solutions-funnel is **retired** (North Star §9).
The public nav is clean and store-like:

```
[Draftpace mark]        Store        (Categories*)        [ Sign in ]  [ Get started ]
                                                          * appears only when inventory warrants
```

- **Store is the front door**, essentially the homepage's destination, you *show*
  products, you don't interview the visitor.
- **Education (how-it-works, guides, trust, about)** moves to a secondary position
  (footer + contextual links), never competing with the store.
- **For returning/owned users**, primary CTA flips to "Open Draftpace / Continue"
  (Stage 7).

### Marketing sitemap (purpose-first)

| Surface | Single job | Notes |
|---|---|---|
| Home | Recognition → comprehension → desire → hand to store | The emotional spine (§5). Sequenced by emotion, not features. |
| Store | Show what we make, product-forward | Rich even at N=1; no fake catalogue grids. |
| Product page | Make one person *want* one product | Shows the real product; add-action always reachable. |
| How it works | Support comprehension for those who want depth | Secondary. |
| Guides / content | SEO + situational entry (Priya-style) | Route to the relevant product. |
| Trust / privacy | Resolve the "is this safe/permanent" objection | Calm, specific, honest. |
| About | The studio behind the products (P1/P6 trust) | Draftpace-as-maker credibility. |
| Auth | Frictionless commit seam | Context-preserving. |

### Flow principles

- **One dominant action per surface.** Never make the visitor choose between two
  equally-loud CTAs (audit PUB-3).
- **State-aware.** Signed-out sells; signed-in continues.
- **No dead-end CTAs.** "Open your library" must not bounce a first-timer to
  login as a *primary* action.

---

## 8. Marketing UI & visual direction

Within the North Star's rules: premium by synthesis, **clone nothing** (§7),
distinctly Draftpace, no decoration-as-crutch.

- **Layout:** editorial and confident. Deliberate rhythm, vary section pace,
  width, and ground (occasional inverted/tinted band) so the page has crescendo,
  not eleven identical bordered bands (audit PUB-1). Generous negative space is a
  premium signal, not wasted space.
- **Type:** a real, wide scale, display serif (Fraunces, optical sizing) for
  emotional/editorial moments; clean sans for everything else. Reclaim the middle
  and top of the scale; stop defaulting to 11-13px (audit A11Y-1). Type does the
  hierarchy work before any border does.
- **Color:** restrained, one confident accent, muted semantics, **no gradient
  crutches**. Let product *worlds* bring color (P3); keep the store canon calm and
  neutral so products pop against it.
- **Material & depth:** use real elevation/material to create 2-3 planes (focal
  forward, secondary flat), replacing the current one-hairline-does-everything
  flatness (audit DS-2). This is a primary lever from "wireframe" to "premium."
- **Imagery = the product itself.** The hero asset is the real product UI in its
  own identity, shot like a boutique app store. No stock illustration, no
  decorative blobs.
- **Motion:** feedback, not ornament. Purposeful, physical microinteractions;
  every motion has a reason and a reduced-motion fallback.
- **Components:** built from the future two-layer system (North Star §8), a Store
  Kit for marketing surfaces. Add **composition primitives** (PageHeader / focal
  block / product-showcase / figure) rather than more atoms (audit DS-1); this is
  what stops the drift back to card-stacking.

---

## 9. HCI & interaction principles (marketing)

- **Demonstration over explanation.** The strongest sections *show* the product
  behaving; interaction beats prose (the messy→clear demo is the model).
- **Progressive disclosure.** Depth (objections, how-it-works, FAQs) is available
  on demand, invisible by default, respects the scanner and the deep-reader
  both.
- **Feedback & affordance.** Every interactive element looks interactive, responds
  immediately (< 100ms perceived), and confirms state. Nothing ambiguous.
- **No dark patterns, ever.** No fake scarcity/urgency, no confirm-shaming, no
  disguised ads, no roach-motel flows. This market is defensive; a single
  manipulative move breaks trust permanently and contradicts P5/P6.
- **Performance is UX.** Fast is premium. Budget: interactive < 2.5s on mid-tier
  mobile, no cumulative layout shift, images/media lazy and right-sized.
- **Input-agnostic.** Designed for thumb (mobile-primary) and pointer and
  keyboard equally.

---

## 10. Accessibility standard (non-negotiable)

**Target: WCAG 2.2 AA across the entire marketing side**, with these specifics:

- **Contrast:** all text ≥ AA (4.5:1 body, 3:1 large). Audit and fix the faint
  muted eyebrows and 11-13px grays that currently risk failure (audit A11Y-1/2).
- **Type & zoom:** relative units; usable and unbroken at 200% zoom and at the
  large text-scale settings; comfortable default size (no sub-14px body).
- **Motion:** honor `prefers-reduced-motion`; no motion is required to understand
  or operate anything; nothing flashes > 3×/sec.
- **Keyboard:** every interaction fully keyboard-operable; visible focus
  everywhere; logical order; managed focus on disclosure/dialog open/close; skip-
  to-content link.
- **Screen readers:** semantic HTML first; real headings hierarchy; `<button>`/
  `<details>` not clickable `<div>`s; interactive demos have text-equivalent paths
  and live-region announcements where state changes.
- **Media:** alt text/descriptions for product imagery; captions + transcript for
  any narrated media; no autoplay with sound; pausable motion.
- **Forms (auth, contact):** programmatic labels, clear inline errors associated
  to fields, no color-only error signaling, no timeouts on input.
- **Color independence:** never encode meaning (free/paid, status, error) in color
  alone, always pair with text/shape.
- **Inclusive copy:** plain language, no idiom-dependence, gender-neutral defaults,
  no shame/ableist framing (critical for Sam and the whole "no punishment" ethos).
- **Test with, not just for:** validate with keyboard-only and screen-reader
  passes, and, before scale, with disabled and neurodivergent users.

Accessibility here is not compliance theater; it's **core to the value
proposition.** The people most failed by punishing, high-friction tools (Sam,
Maya) are exactly who accessible, forgiving design serves best.

---

## 11. Conversion & trust design

- **Objection-first funnel** (§4 governing insight): resolve distrust *as* desire
  builds, near the decision, not after.
- **Trust signals, honest only:** who makes it (Draftpace-the-studio, P1/P6),
  real privacy specifics (already good on the trust section), honest access terms,
  and, critically, **real product proof** over testimonials we don't have yet.
  Never fabricate reviews, counts, or activity (audit S5).
- **Pricing presentation:** calm and plain; free = complete, not a teaser; one-
  time over subscription framing where true; value implied by craft, not by
  discount theater.
- **Risk reversal:** the free first product *is* the risk reversal, lead with it;
  let the experience earn the paid ones.

---

## 12. Measurement: what "working" means

Per stage, the honest signal (instrument later; don't fabricate now):

| Stage | Leading signal | Guardrail |
|---|---|---|
| Arrival | bounce rate, time-to-interactive | speed budget met |
| Recognition | scroll-depth past the demo |, |
| Comprehension | product-page click-through | not just "engaged," but *understood* |
| Desire | product-media interaction / try |, |
| Objection | expansion of objection content → proceed | not increased hesitation |
| Choice | add/get click | no dark-pattern lift |
| Handoff | reaches first value | activation success ≠ 0 (currently failing) |
| Return | returning-user continuation | doesn't re-pitch owned products |

North-star outcome metric (not a vanity one): **first-value rate**, % of buyers
who reach a real, useful moment in the product. That's the only number that
proves the "alive, not a dead file" thesis.

---

## 13. What to validate with real buyers (before betting big)

The personas are strong hypotheses; confirm these five things with 8-12 real
planner/digital-product buyers:

1. **The master objection**: is "I'll abandon it like the others" really the #1
   blocker? (Prioritizes the whole funnel.)
2. **The "alive vs. dead file" wedge**: does it land as a meaningful difference,
   or as jargon? What words do *they* use for it?
3. **The recovery promise**: does "start again without starting over" actually
   reduce purchase anxiety, or sound too good to be true?
4. **Money-specific (Deen/MMR)**: does "not a budget, one safe-to-spend number"
   relieve the budgeting-app aversion?
5. **Premium/owned perception**: does the craft make it feel worth paying for vs.
   a $5 template, and does "installable/yours" matter to them?

---

## 14. How to use this document

Before shipping any marketing surface, section, or line of copy:

1. **Name the persona and stage** it serves (§3, §5). If it serves none, cut it.
2. **Name the emotion it moves** (§5 spine). If it doesn't move one, cut it.
3. **Run the six lenses**: Design, UX, UI, Copy, HCI, Accessibility, against
   that stage's spec. All six must pass; accessibility is a gate, not a
   nice-to-have.
4. **Test against the North Star pillars** (P1-P6). A pillar beats convenience,
   generic consistency, or "another card."

When in doubt about *what to say to a customer or how the marketing should feel*,
this document, under the North Star, is the answer.

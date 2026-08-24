# The fifth Companion: Phase 0 proposal

Status: **Phase 0 complete. No code, no migrations, no playbooks written.**
Founder brief of 23 August 2026, plus eight corrections of the same day,
all incorporated.

Two pieces of this document are research rather than design: section 4
(delivery) and section 11 (the name). Both were commissioned by the
corrections and both produced a finding that changes a recommendation.

---

## 1. The product, in one line

> When life becomes difficult to hold in your head, Draftpace holds it
> with you, and when it is time to deal with something, it helps you
> through it.

```
REMEMBER -> NOTICE -> ACCOMPANY -> ACT -> RECORD -> REMEMBER AGAIN
```

**External memory, derived attention, practical companion.** Not a
planner, not a reminder app, not a task manager, not a checklist.

### The stance

The user is capable. The product externalises a **procedure**, never
competence.

> A capable person should not have to hold every step, detail, question
> and piece of context in working memory while simultaneously executing
> the task.

That is a claim about working memory, not intelligence. It is why there
is no score, no streak, no percentage and no encouragement anywhere in
the product, and why the tone is that of a good assistant rather than a
coach.

## 2. The boundary: this product owns doing

The correction that most shapes the architecture.

| Product | Owns |
|---|---|
| Personal Finance Companion | financial facts |
| Home Base | home facts |
| Personal Life Affairs Companion | life-affairs facts |
| Homeschooling Companion | educational facts |
| **This one** | **the user's relationship with something they are trying to do** |

```
Personal Finance Companion   Electricity bill: provider, amount,
                             account number, due date

This product                 "I need to deal with a problem with my
                             electricity bill"
```

It may remember the thread, the context, the next action, the waiting
state and the outcome. It must **never** become the source of truth for
the bill.

### How that boundary is enforced, not just stated

**In the schema.** A Life item has a title, a note, dates and a history.
It has no amount, no account number, no provider, no policy number, no
address, no due-date-of-record. A later contributor adding one has to
delete a comment saying why it is not there, and a test asserts the
column set.

**In the UX.** There is no "add a bill" anywhere. Things arrive as *what
I am trying to do about* something.

**In the copy.** The listing and the in-product language say "deal with"
and "sort out", never "track" or "manage". Tracking is what the other
four do.

**The line for research and marketing:** the other Companions are about
a subject; this one is about doing.

## 3. The Life model: four shapes

Not eighteen nouns. One discriminated table, because **derived attention
has to reason across all of them in a single pass**, and four shapes
with one attention function beats eighteen tables with eighteen special
cases.

| Shape | What it is | What it can be waiting on |
|---|---|---|
| **Commitment** | Something I intend to do, often recurring | a date |
| **Waiting** | Blocked by another person or system | a person, an organisation, a date |
| **Thread** | Ongoing, likely several interactions | its own last-touched date |
| **Reference** | Information worth remembering | nothing, ever |

Reference is deliberately inert. It is the only shape that never
generates attention, which is what makes it safe to put things there.

**Thread, not project.** A project sounds like something with a plan.
Most of what belongs here is a thing that has happened twice and will
need to happen again.

Exact columns are Phase 1 work. The requirement Phase 0 fixes is that
the four shapes share one table and one attention pass.

## 4. Attention is a layer, and delivery is separate from it

The correction that most changes the build.

```
LIFE STATE
    |
    v
DERIVED ATTENTION        pure, on read, testable without a clock
    |
    v
DELIVERY                 adapters. In-app in v1. Others later,
                         without the engine changing.
```

The engine produces `AttentionSignal[]` and knows nothing about how a
signal reaches anybody. An adapter takes signals and does something with
them. In v1 there is one adapter and it renders a screen. Adding push or
email later adds an adapter and touches no attention logic.

### Six reasons, each tracing to a stored fact

| Reason | Trigger | Approved phrasing |
|---|---|---|
| Coming up | a commitment's date approaches | "Coming up in three weeks" |
| Worth checking | a waiting item past its check date | "Still waiting on this?" |
| Left off | a thread untouched past its interval | "You left off here" |
| You asked | the user set the date themselves | "You said you would come back to this" |
| Ready | a blocking waiting item resolved | "This is unblocked now" |
| Nothing | genuinely nothing | "Nothing needs you right now" |

That last row is a real state the product must be able to sit in. A
screen that always has something on it is a screen nobody believes, and
this is the audience least able to afford another false alarm.

**Never overdue.** Not in copy, not as a colour, not as a badge count.

### Research: is PWA push a viable primary delivery mechanism?

Commissioned by correction 2. The honest answer is **no, not as a
primary mechanism, and yes as a secondary one.**

**What this codebase already has.** More than I expected: `web-push` is
a real dependency, `push_subscriptions` is a real table with RLS,
`/api/notifications/subscribe` and `/unsubscribe` are real routes, two
cron evaluators exist and Home Base's runs against real data. The client
already detects standalone mode on both Chromium and iOS. This is not a
green field; it is a working pipeline that has never had a product
depending on it.

**The iOS constraint is the whole problem.** Push on iOS is available
only to a web app added to the Home Screen through Share, then Add to
Home Screen. A page open in a Safari tab has no `PushManager` at all,
and there is **no programmatic install prompt**: the user must perform a
manual, multi-step gesture that nothing in the page can trigger.
([MagicBell](https://www.magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide),
[Pushpad](https://pushpad.xyz/blog/ios-special-requirements-for-web-push-notifications))

**One thing I checked rather than repeated.** A current source states
that push is unavailable for iOS home screen web apps in the EU. That
was true of an iOS 17.4 beta and Apple reversed it before release in
March 2024 after the European Commission said the removal was neither
required nor justified. EU push works.
([AppleInsider](https://appleinsider.com/articles/24/03/01/apple-reverses-course-on-death-of-progressive-web-apps-in-eu),
[Notificare](https://notificare.com/blog/2024/03/08/apple-reverse-decision-to-remove-pwa/))

**Opt-in rates are low even where install is not required.** Reported
web push opt-in ranges from about 2.7% for retail up to 7 to 15% for
media sites with well-placed prompts, and a browser-native prompt
converts several times better than a custom one.
([PushOwl](https://docs.pushowl.com/en/articles/6361107-web-push-notification-benchmarks),
[Mobiloud](https://www.mobiloud.com/blog/push-notification-opt-in-rate))

**What that means for this product specifically.** Two funnels multiply
on iOS: install, then permit. Neither has a reliable prompt. A product
whose central promise is *you do not have to remember* cannot rest that
promise on a channel that most of its users will never switch on, and
this audience is the least likely of any to complete a five-step manual
install.

**Recommendation.**

1. **Build the attention engine and the in-app adapter in v1.** The
   engine is pure and adapter-agnostic from the first commit.
2. **Ship push as an explicit opt-in for the people who want it**, using
   the existing pipeline, and measure the two funnels rather than
   assuming them.
3. **Do not describe the product as notifying anybody** until the
   measured numbers justify it. The Shop listing says what it does: it
   remembers, and it shows you when you open it.
4. **Design one honest in-app pattern to compensate:** the product opens
   on what needs attention, so the cost of "remembering to open it" is
   one tap and never a hunt.

Email is not built, per the correction, and the adapter seam means it
costs nothing to leave out.

**This is the product's largest unresolved risk and it is now stated
rather than hidden.**

## 5. Companion Mode: the playbook engine

Direct reuse of the pattern Personal Life Affairs Companion proved
twice, extended in exactly one direction: branching.

```
Playbook
  key, title, situation, whenToUse, steps[]

PlaybookStep
  key
  kind: choose | write | prepare | wording | during | outcome
  prompt, why
  choices?           each may set a fact and route onward
  suggestedWording?  editable, never transmitted
  askIf?             gated on an earlier answer
  outcomes?          terminal steps only
```

Five kinds carry the whole brief. **choose** narrows the situation so
later steps show only what is relevant. **prepare** is a checklist
computed from earlier answers, so a cancellation and a complaint ask for
different things to hand. **wording** is authored suggested language,
always editable. **during** is short prompts, capped, because a wall of
text mid-call is worse than nothing. **outcome** branches back into
Life.

**Suggested wording is the one place this product could embarrass
somebody**, so it is authored, reviewed in a pull request, and scoped to
openings and structure, never to what to claim, threaten, negotiate or
accept.

No model provider, in this or anything else. These procedures touch the
real world and we need to know exactly what the product told somebody.

## 6. The closed loop

The integration that makes this a Companion rather than two features.

```
Life item --"do this with me"--> Playbook --outcome--> Life updated
                                                          ^
Direct start --> Playbook --outcome--> "Remember this?" ---+
```

| Outcome | Effect on Life |
|---|---|
| Resolved | Commitment rolls to its next date; thread closes |
| Made progress | Thread updates where you left off and the next step |
| Waiting for someone | **A waiting item is created**, with a check date |
| I need to do something | A next step is recorded |
| Did not get to it | **Nothing changes.** The item stays as it was |
| Something else | Free text kept, nothing derived |

"Did not get to it" writing nothing is deliberate and tested. Recording
an abandonment as an event turns the log into a record of failures, and
this is the audience for whom that is most corrosive.

## 7. Waiting, and externalised context

**Waiting is never actionable.** It must not appear in any list of
things to do. It surfaces on its own check date and asks rather than
instructs:

> You were waiting for Sarah to send the contract.
> Still waiting? · Follow up · It arrived · Change the date

"Follow up" opens playbook 4 with the context already filled in.

**A thread carries what a person would otherwise reconstruct:**

```
Portfolio
You last worked on this 11 days ago.
You stopped after: Finished the About page copy.
You wrote: Need to replace hero image before publishing.
[Resume]
```

Every line is a stored fact from the last session. "11 days ago" is
arithmetic on a date, not a judgement. `companion.recovery` and
`companion.context` already exist in the capability registry and were
not written for this product.

## 8. The eight playbooks

Fixed by correction 3. Authored in a later phase, not now.

| | Playbook | Why it earns a slot |
|---|---|---|
| 1 | Make a phone call | Highest avoidance, highest consequence |
| 2 | Make a difficult phone call | Same spine, different stakes |
| 3 | Send the email you have been putting off | Same shape, different medium, high volume |
| 4 | Follow up with someone | The direct partner of the waiting state |
| 5 | Resolve a billing problem | Long, branching, real money, most abandoned halfway |
| 6 | Book and prepare for an appointment | Covers medical and administrative at once |
| 7 | Resume something you abandoned | The most ADHD-specific item, and no competitor does it |
| 8 | Break down something too big to start | The task-initiation case |

No cleaning, no decluttering, no generic productivity coverage. The
engine makes a ninth cheap; looking large is not a reason to add one.

## 9. Language

The banned list, as a test over every user-facing string:

`lazy, irresponsible, failing, failed, behind, back on track, should
have, wasted, procrastinat, distracted, discipline, bad habits, fix
yourself, overcome, control your ADHD, get your life together, overdue`

Plus, per correction 6:

- **"just"**, which trivialises initiation difficulty and is the single
  most common way software condescends to this audience. Never "just
  send the email", "just make the call", "just get started".
- **No exclamation marks** in any attention string.

And a positive assertion, not only a ban: **every attention line must be
one of the six approved phrasings** in section 4, so the tone cannot
drift one string at a time.

Two more rules the brief implies:

- Never imply the user failed because they did not act.
- Never imply the product knows anything that happened outside
  Draftpace. It knows what is in Draftpace and what the user told it.

## 10. Not built, and not pretended

No AI, no model provider, no generated advice. **No surveillance of any
kind**: no browser, app, screen, phone, keyboard or activity monitoring,
and no inference about whether somebody was distracted, procrastinating
or hyperfocused.

No diagnosis, assessment, symptom tracking or medical claim, and **no
question anywhere asking whether the user has ADHD**.

No streaks, scores, percentages, rings or productivity metrics.

**No focus sessions.** Removed from MVP per correction 4: too
conventional, abundant and free elsewhere, and it invites the product to
be reviewed as a generic ADHD timer app. Nothing in the model precludes
adding it later.

## 11. Research: the name

Commissioned by correction 7. The research produced a finding that
changes the answer.

### Direction A, ADHD-forward

**For.** On Etsy the demand is explicitly keyed to the term. "ADHD
planner", "ADHD digital planner" and "ADHD-friendly" are the search
phrases carrying the traffic, and the category is described as high
demand with lower competition than generic planners.
([Analyzify](https://analyzify.com/hub/digital-products-to-sell-on-etsy),
[Outfy](https://www.outfy.com/blog/top-selling-digital-products-on-etsy/))
It is also an immediate signal to the people who need it, and
sanitising it has its own condescension.

**Against.** It asks a buyer to self-identify with a diagnosis in order
to purchase, and it appears on a receipt, a bank statement and a browser
history. It also excludes a large adjacent audience with the same
executive-function difficulty and no ADHD identity: post-concussion,
long covid, chronic illness, grief, new parenthood, menopause,
depression.

**And the finding that decides it.** Etsy ADHD planners sell in the
**$3 to $10** range. ([Analyzify](https://analyzify.com/hub/digital-products-to-sell-on-etsy))
That is the price anchor the category carries. A product named to sit
beside them will be compared with them, and this product is not a $7
planner: it is a memory layer, an attention engine and eight authored
interactive procedures. **The name that wins the search is the name that
loses the price.**

### Direction B, problem-forward

**For.** No diagnosis on the receipt, no price anchor inherited from a
commodity category, and it addresses everyone with the difficulty rather
than everyone with the label.

**Against.** Nobody searches for it. Discoverability has to come from
the listing rather than the name.

### Recommendation

**Split them.** The Shop schema already separates `title` from
`seo.title`, and the listing carries `audience` and `needGroups`
independently of both.

- **Product name: problem-forward.** No diagnosis, no planner
  comparison, no inherited price anchor.
- **ADHD carried explicitly in the SEO title, the listing copy, the
  audience section and any Etsy listing.** The people searching the term
  still find it; the receipt still says something a person is happy to
  have on it.

This is not a compromise between the two directions. It puts each in the
place where it is actually strong: the keyword belongs where search
happens, the name belongs where identity happens.

**Name candidates**, given the family already holds two descriptive
names and two evocative ones:

| Candidate | Reading |
|---|---|
| **Alongside** | The promise verbatim. Warm, names no deficit, and it is literally what Companion Mode does. My recommendation. |
| Hold This | The promise even more literally. Distinctive, slightly flippant. |
| In Hand | "Your life in hand." Pairs with the In Order lineage, possibly too closely. |
| ~~Follow Through~~ | **Rejected.** It names the deficit. "You do not follow through" is a criticism this audience hears constantly, and the brief forbids implying the user failed. |

**Recommended: Alongside**, with an SEO title along the lines of *"ADHD
and executive function: hold it all somewhere else"*.

Not decided by me. This is the one thing in Phase 0 I would not proceed
without your answer on, because the name reaches the schema, the slug
and the table prefix.

## 12. Shape of the build

| Phase | What | Gate |
|---|---|---|
| 0 | This document | Boundaries and research settled |
| 1 | Life: four shapes, capture, the item page | A thing can be remembered |
| 2 | Attention engine, in-app adapter, the Now surface | It surfaces when it matters |
| 3 | Playbook engine, two playbooks end to end | The engine is proven |
| 4 | The remaining six playbooks | The library is real |
| 5 | The closed loop: outcomes writing to Life | The loop closes |
| 6 | Waiting machinery and resume | The hardest state works |
| 7 | Push investigation, measured, opt-in | An honest answer on delivery |
| 8 | Shop listing, price, checkout | Sellable |

Phase 3 before 4 on purpose: authoring eight playbooks against an
unproven engine is how content gets written twice.

Phase 7 late on purpose: the measurement is only meaningful once there
is something worth being notified about.

## 13. Risks

**It becomes a to-do list.** Symptom: the most used screen is a list
with checkboxes. Guard: Now shows what wants attention and why, never
everything; Life is organised by shape rather than by due date.

**The playbooks are thin.** Six generic steps that would suit any
situation teach the user that Companion Mode is not worth entering.
Guard: eight, deep.

**The wording embarrasses somebody.** Guard: authored, reviewed, scoped
to openings and structure.

**It reads as condescending.** The fastest way to lose this audience.
Guard: the language test, and a rule that the product never explains a
step in terms of the user's difficulties.

**Attention nobody sees.** Section 4. The largest one, now stated.

## 14. What I need from you

1. **The name.** Section 11. It reaches the slug and the table prefix,
   so it is the one thing I cannot start Phase 1 without.
2. **Confirmation of the delivery recommendation:** in-app in v1, push
   investigated and measured at phase 7, described honestly until then.

Everything else in the corrections is incorporated and needs no further
decision.

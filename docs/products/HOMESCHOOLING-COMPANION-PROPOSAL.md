# Homeschooling Companion: product and technical proposal

Status: **approved, 22 August 2026.** No code written yet.
Written against the founder brief of 22 August 2026, corrected twice
and approved with three decisions recorded in section 20.

This document does what the brief asked for in its section 40, and it
challenges the brief where the brief is in tension with itself or with
the platform. The challenges are section 19 and the decisions that
settled them are section 20.

**Correction 2, 22 August 2026.** The first draft proposed a
hand-authored Maths item bank of six or seven hundred questions as the
v1 content strategy. Withdrawn. Assessment content is not the
Companion's content layer: the PDF is, and deep subject content belongs
to future subject products. The Companion supplies the structure around
a check, not the questions. Sections 9, 13, 14, 16, 17 and challenge 1
are rewritten.

**Correction 1, 22 August 2026.** The first draft of this document said
"Today is the hook, but Record and Test are the product". That was
wrong. It carved one Companion into two features and quietly demoted
everything else, which is the opposite of what this product is. Today,
Record and Test are features inside the Companion, and the Companion is
the product. Sections 1 and 2 are rewritten; section 15's navigation is
re-derived from the loop rather than from the discarded framing.

---

## 1. Product thesis

**The product is the Homeschooling Companion.** Today, Record and Test
are features inside it, not products of their own and not a hierarchy
with a winner.

> The parent remains in control of what their child learns. The
> Companion helps them organize it, remember it, check it, and keep a
> record of it.

What the Companion does, as one job rather than nine:

- Set up each child
- Understand their current situation
- Record what they are learning
- Organize what they need to do
- Give them useful daily tasks
- Remember what happened
- Let the parent check their child
- Surface useful observations
- Maintain a durable educational record
- Produce a printable Book

None of these is the product on its own. A daily task list without a
record is a planner. A record without a daily loop is a filing cabinet.
A check without either is a quiz app. **The Companion is the whole loop,
and the loop is what a parent is buying.**

### The core loop

Every design decision in this document is answerable against this, and
where a proposal does not serve a step of it, it does not belong.

```
SET UP CHILD
      |
      v
ESTABLISH WHAT THEY ARE LEARNING
      |
      v
TODAY
      |
      v
DO THE WORK
      |
      v
RECORD WHAT HAPPENED
      |
      v
OPTIONALLY CHECK UNDERSTANDING
      |
      v
ADJUST WHAT COMES NEXT
      |
      v
REPEAT
      |
      v
LONG-TERM RECORD
```

Two properties of this loop shape the whole build.

**It closes.** "Adjust what comes next" feeds back into Today, which is
why the daily engine reads completions (section 7) and why a check can
influence what is offered without ever changing the plan itself
(section 10). A loop that does not close is a set of screens.

**Every part of the loop is optional.** The Companion keeps whatever the
parent chooses to record and remains useful when parts of the loop are
skipped. A parent can skip Today for a fortnight, never run a check,
never write an observation, and still have something worth having.

The Record is not a step in that sequence and not a ritual anybody has
to perform: it is an output, the accumulated state of whatever was
recorded. Building it as a step would make it a chore, and a chore is
the thing this category loses people to.

## 2. User model

Three modes, from the brief, and the product must not push anybody
between them.

### A. We already have a curriculum

> We use Abeka Grade 4.

The Companion organizes and tracks what the parent is already doing. It
does not replace Abeka, does not restate Abeka, and does not evaluate
Abeka. It records position, keeps the history, and checks retention.

This is the mode with the most experienced and most sceptical parents in
it, and the mode where the product is most easily insulting. The test:
**could a parent who has taught for eight years use this without once
being told something they already know?**

### B. We have our own plan

> We teach Math, Reading, Science and History ourselves.

The parent defines subjects and what they are working on, adding and
changing as they go. The curriculum tree (section 5) is theirs to build,
in whatever order they build it, including mid-year.

### C. We do not know what to teach

The only mode where Draftpace suggests anything. Suggestions arrive as a
draft the parent edits, labelled as ours until they change it, at which
point it becomes theirs.

**Nobody is forced into mode C**, and the product must never treat A or
B as an incomplete version of it. A parent in mode B who has entered one
subject is not 25% set up. They are set up.

### What the modes share

They differ on exactly one question, asked once: *are you already
following a curriculum?* Everything after that point is identical, which
is what makes one product serve all three rather than three products
wearing the same name.

The child does not use this product. **The parent administers and the
parent records, in v1.** That is a deliberate constraint, and it removes
child accounts, child login, child-directed interface, and a consent
flow, none of which serve the loop above.

## 3. Trust model

Four rules, each one a line we do not cross.

1. **Source is always on screen.** Every task and every suggestion is
   labelled with where it came from: *Your curriculum*, *Your plan*, or
   *Draftpace suggestion*. A parent must never have to wonder whether
   the product invented something.
2. **We never change the plan.** The product can say a topic looks worth
   revisiting. It cannot move a child back a unit, cannot skip ahead,
   cannot alter a sequence. Every change is a parent action.
3. **We say what we do not know.** No checks for a subject means "we do
   not have checks for this yet", never a generic question set dressed
   up as relevant.
4. **We never grade a child.** See section 10. A check produces
   observations about topics, not a verdict about a person.

The banned vocabulary, in the manner of the other three products:
*behind*, *ahead*, *grade level*, *proficient*, *mastery*, *failing*,
*score*. Enforced by a test over user-facing strings, same as
`affairsKnowledge.test.ts` does for "estate" and "assets".

## 4. Setup flow

Progressive, and short. The brief is right that parents should not be
asked for educational information before they have a reason to give it.

**Household, once:**

1. How many children are you homeschooling? *(Adds that many, minimally.)*

**Per child, minimally:**

2. What is their name? *(First name or nickname is fine.)*
3. How old are they? *(Age in years. Not date of birth: see section 12.)*
4. What kind of schooling? *(Homeschool, hybrid, private, public. This
   decides whether we ask about a curriculum at all.)*

**Then the branch that defines the product:**

5. Are you already following a curriculum?

```
Yes, we have one
  -> Which one?            free text, e.g. "Abeka Grade 4 Math"
  -> Which subjects?       pick from a list, add your own
  -> Where are you now?    per subject: unit and lesson, or "just started"
  DONE. Today works from here.

No, we are building our own
  -> Which subjects?
  -> For each: what are you working on right now?   free text topic
  -> How often?                                     days per week
  DONE. Today works from here.

Not sure yet
  -> "Want some suggestions?"
     Yes -> a starting shape by age, offered as a draft the parent edits
     No  -> "Then tell us what you did this week, and we will keep
             the record. You can add a plan whenever you like."
  DONE. The product is still useful with no plan at all.
```

The third branch matters more than it looks. **A parent with no plan
must still get a working product on day one**, because the record and the
observation log work without any curriculum. Forcing a plan before the
product does anything is how planners lose the people who need them most.

Everything else (interests, notes, second subjects, schedule detail) is
asked later, at the moment it would be used.

## 5. Curriculum model

One shape holds all three sources. This is the core schema decision.

```
Curriculum   (source: publisher | parent | draftpace)
    |
    +-- Node (tree, self-referencing)
          kind: unit | topic | objective
          ordinal: position among siblings
          |
          +-- Node ...
```

A publisher curriculum, a parent-built one and a Draftpace suggestion are
**the same tree with a different `source` and a different level of
detail**. That is what makes the product curriculum-agnostic in fact and
not just in copy.

- **Publisher**: name, level, and a flat ordered list of lessons. Usually
  that is all we have, and it is all Today needs. A parent typing
  "Abeka Grade 4 Math, Lesson 12" has given us a complete working model.
- **Parent-built**: the parent creates units and topics as they go. Nodes
  can be added mid-year without restructuring anything.
- **Draftpace**: a small, hand-authored starting tree per subject and age
  band, marked `source: draftpace` everywhere it surfaces, and **fully
  editable the moment it is accepted**. It becomes theirs.

**Position** is separate from the tree: `hsc_positions` records where a
given child is in a given curriculum, per subject. Moving forward is a
position write, never a mutation of the curriculum.

Topics carry an optional `topic_key` into our own taxonomy. This is the
single hinge that makes testing possible without parsing anything: the
parent says "we are doing equivalent fractions", we match that to
`math.fractions.equivalent`, and the item bank keys off that.

## 6. Child model

`hsc_children` rows under the single product instance. Every other table
carries `child_id`.

Two-tier ownership has precedent: Home Base's `hmc_things` own
`hmc_thing_documents` and `hmc_maintenance_tasks`. This is the same shape
one level deeper, and RLS follows the same `_hsc_owns_instance` pattern.

Selecting a child is a route, not a filter: `/kids/[childId]`. Emma's
record and Noah's record never share a screen, which is the brief's
section 8 requirement and also the only way to keep the surface calm.

**Today is the one place they meet**, because "what are we doing today"
is a household question. Grouped by child, never interleaved.

## 7. Daily task engine

Deterministic, explainable, and boring on purpose. No scheduler, no cron.
Today is **derived on read** from four inputs, the same way Home Base
derives attention:

```
position + plan (days per week, subjects) + completions + today's date
      |
      v
  today's tasks, each carrying its source
```

Rules, in order:

1. A subject scheduled for today with a position produces one task:
   the node at that position.
2. A task completed and marked **Difficult** or **Not completed**
   produces, the next scheduled day, a *review* task on the same node
   rather than advancing. Advancing needs a completion that was not
   difficult.
3. Nothing scheduled today produces nothing. **The product must be able
   to say "nothing scheduled today" and mean it.** Weekends and holidays
   are not failures.
4. A child with no plan produces no tasks and one line: "Nothing planned.
   Record what you did instead?"

Completion is one tap. The follow-up ("How did it go?" / "How much
help?") is **optional and skippable, always**, and the product must work
perfectly for a parent who never answers it. The brief is right that this
must not become data entry. A parent who taps Done for a year and nothing
else should still get a real record and working checks.

## 8. Test system

The flow the brief asks for:

```
Kids -> Emma -> Test Emma
  |
  +-- What would you like to check?
        Recent learning      what she has been marked as doing lately
        A specific topic     picked from what her plan contains
        Earlier work         topics from previous months
  |
  +-- We assemble a check from the item bank
        8 to 12 items, drawn from the topics selected
        minimum 4 items per topic, or the topic is not included
  |
  +-- Parent administers on screen, child answers or parent records
  |
  +-- Results, per topic. Never a headline score.
```

The parent chooses. We never decide that a child needs testing, and there
is no reminder to test. A product that nags a parent to test their child
is a product about anxiety.

## 9. Test intelligence, without a model and without a content library

The Companion does not supply the questions in v1. **It supplies the
structure around them**, which is the part a parent cannot build for
themselves and the part that is worth paying for.

What the Companion contributes to a check:

| The Companion provides | The Companion does not provide |
|---|---|
| The topic taxonomy that makes a result mean something | The questions |
| Which topics this child has actually been working with | Subject expertise |
| Administration and recording | A curriculum |
| Scoring rules and the confidence floor | A grade |
| Per-topic interpretation, honestly bounded | A verdict about a child |
| History across months and years | A standardised comparison |

### One taxonomy, three sources of questions

```
                 Topic taxonomy
       (hand-authored, small, curriculum-neutral)
          ^               ^                ^
          |               |                |
   The parent's      Printable check    Future subject
   own questions     sheets in the      packs
   (they write,      PDF                (architected for,
    we keep and      (our first          not built)
    reuse)           content layer)
```

- **The topic taxonomy** is the only content the Companion itself must
  ship, and it is cheap: a list of curriculum-neutral topic keys such as
  `math.fractions.equivalent`. Publisher-independent on purpose, because
  every publisher teaches equivalent fractions and every one names the
  unit differently. It is a list, not a library.
- **The parent's own questions** are the v1 path that always works. An
  experienced homeschooling parent can write eight questions on
  fractions in five minutes. What they cannot do is keep those questions,
  tie them to topics, and hold three years of results. The Companion
  keeps every question the parent writes, so a family builds their own
  bank over a year, and it is genuinely theirs.
- **The curriculum's own tests** are the path most mode A parents will
  actually take, because commercial curricula already ship tests. Here
  the Companion records an existing check against topics rather than
  administering one.
- **Printable check sheets in the PDF** are our first content layer, and
  they are what makes the PDF and the Companion one product rather than
  two things sold together: the parent prints a check, administers it,
  and records the result in the Companion against the same topics.
- **Future subject packs** drop professionally authored items against
  the same taxonomy. That is section 13, and nothing about the Companion
  changes when they arrive.

### What this means for honesty on screen

The product must never imply it generated a question it did not. "Test
Emma" opens with what the parent has, not with a ready-made quiz:

```
CHECK EMMA

What would you like to check?
  Recent learning        the topics she has been working with
  A specific topic

Where are the questions coming from?
  Write them now         we will keep them for next time
  From your curriculum   record the result of a check you ran
  From the printed book  the check sheets in your PDF
```

**Selection is deterministic.** Given a child, a topic set and a seed,
the same check is assembled from the same pool. No model, no randomness
that cannot be reproduced in a test.

What connects a parent's "Abeka Unit 3" to `math.fractions.equivalent`
is **the parent, once**, when they set up or advance a subject. We offer
a short list of likely topics for the subject and age; they tick what
they are actually covering. Five seconds, and it replaces an entire
document-parsing pipeline.

**The key architectural claim of this proposal: you do not need to parse
a curriculum, and you do not need to own a question bank, to help a
parent find out whether their child understood something. You need the
topic named, the result recorded, and the interpretation bounded.**

## 10. Result interpretation

Three per-topic standings, and a fourth that is the important one:

| Standing | Condition | What we say |
|---|---|---|
| Looked solid | most items right, at or above the topic's confidence floor | "Equivalent fractions looked solid." |
| Worth another look | several missed | "Worth another look at equivalent fractions." |
| Mixed | genuinely split | "Mixed on equivalent fractions." |
| **Not enough to say** | fewer than 4 items on the topic | **"Not enough here to say anything about long division."** |

That last row is what makes the feature trustworthy. **A check with two
questions on a topic tells you nothing, and the product must say so
rather than producing a confident-looking result from thin evidence.**
Every other assessment tool in this category fails exactly here.

No headline score. **The brief's example leads with "7 / 8" and I would
drop it.** A fraction is a grade; a grade invites comparison; comparison
is the thing a homeschooling parent is already anxious about. Lead with
the topics. The number of items is available, quietly, for a parent who
wants it.

Recommendations, and their exact limits:

- Solid across a topic, twice: *"You may want to move on when you are
  ready."* We do not move anything.
- Worth another look, twice on the same topic: *"This has come up twice.
  You might want to spend more time here."*
- Repeated difficulty across a whole subject: *"It might be worth
  thinking about whether this is the right fit."* This is the strongest
  thing the product ever says, it is said rarely, and it names no
  alternative.

Every one of these is prefixed *This check suggests*, never *Emma is*.

## 11. Record model

One source of truth, four views, following what Personal Life Affairs
Companion just proved:

| Surface | Question |
|---|---|
| **Today** | What are we doing today? |
| **Kids** | What do we know about this child? |
| **Record** | What has happened, and what would I show someone? |
| **Book** | What does that look like on paper? |

The Book, **My Homeschool Record**, is generated in the browser from the
same rows, exactly like *My Affairs*: the assembled picture of a child's
education never reaches a server. Per child, not per household, because
that is the unit anybody would ever ask for.

Contents: the child's details as the parent chose to share them, the
curriculum followed, subjects, a dated log of completed work,
observations the parent marked shareable, and check history summarised by
topic and date. Nothing invented, and gaps stated as gaps.

## 12. Privacy and sharing

This product holds personal data about minors, which no other Draftpace
product does. Three positions:

1. **Do not collect date of birth. Collect age.** DOB is a high-value
   identity field and nothing in this product needs it. Age drives
   suggestions; a birthday does nothing. Collecting it would be storing
   risk for no product gain.
2. **Per-record visibility**, defaulting to private for anything free
   text. `record_visibility: private | shareable`. The Book includes
   `shareable` only. A parent's note that a child cried during maths is
   useful to the parent and belongs nowhere else.
3. **Check results are the most sensitive rows in the product** and
   default to private. A parent opts them into the Book deliberately.

RLS mirrors the `_pla_owns_instance` pattern exactly: select and insert
and update scoped to `auth.uid() = user_id`, ownership proven on insert,
and no delete policy anywhere.

## 13. Future library architecture

The brief is right to want the seam and right not to want the content.
The seam is two things and nothing else:

1. **`source` on a curriculum**, already in the model. A purchased Math
   Grade 5 pack registers as a curriculum with `source: draftpace` and a
   `pack_id`. Nothing else in the product changes.
2. **`pack_id` on `hsc_items`.** Pack questions arrive as rows with a
   `pack_id`, filtered by what the family is entitled to. The existing
   entitlement machinery already answers "does this user own this", so a
   pack is an entitlement row and a filter, not a system.

The taxonomy is the contract between the two. A Maths pack is written
against `math.fractions.equivalent` and the Companion already knows what
that means, which is why the taxonomy has to exist in v1 even though the
questions do not. **Build the socket now, and the plug fits later
without touching the Companion.**

A family that has written their own questions and then buys a pack keeps
both: their items and the pack's items sit in the same table against the
same topics, and history spans them.

That is the whole integration. Grade 4 history survives a Grade 5
purchase because history hangs off `child_id` and `topic_key`, neither of
which a pack owns.

Nothing else is built now. No Library destination until there is
something in it, per the platform's own rule against shipping a
destination with nothing behind it.

## 14. Database changes

Smallest set that supports the above. Prefix `hsc_`, additive only.

```
hsc_children              child_id, name, age, schooling_type, notes,
                          record_visibility
hsc_curricula             child_id, source, title, publisher, subject
hsc_curriculum_nodes      curriculum_id, parent_id, kind, title, ordinal,
                          topic_key
hsc_positions             child_id, curriculum_id, node_id, moved_at
hsc_plan                  child_id, subject, days_per_week, active
hsc_task_events           child_id, node_id, date, state, difficulty,
                          help_needed, source
hsc_observations          child_id, date, note, record_visibility
hsc_items                 topic_key, prompt, answer, kind, source,
                          pack_id, child_id nullable, reusable
hsc_checks                child_id, kind, topic_keys[], created_at
hsc_check_items           check_id, item_id, topic_key, ordinal
hsc_check_answers         check_id, item_id, response, correct,
                          scored_by
hsc_check_results         check_id, topic_key, standing, items_seen
```

Twelve tables.

**`hsc_items` is the family's own question bank**, and it exists because
in v1 the questions are the parent's rather than ours. A question the
parent writes is their data, so it is a row and not code. `source`
distinguishes `parent`, `curriculum` (recording a check they ran
elsewhere) and `pack` (section 13). `child_id` is nullable because a
question about equivalent fractions is reusable across children.

The topic taxonomy is the opposite: **it lives in code**, like
`affairsKnowledge.ts` and `homeKnowledge.ts`, because it is identical for
every family, must be reviewable in a pull request, and is the contract
future packs are written against.

Two things deliberately absent:

- **No `daily_tasks` table.** Today is derived on read. Materialising it
  creates a second source of truth that goes stale the moment a parent
  changes the plan.
- **No `subjects` table.** A subject is a string on the plan and the
  curriculum. A table would buy nothing and force a join everywhere.

## 15. Routes and screens

```
/today                     everything today, grouped by child
/kids                      the children, minimal
/kids/[childId]            one child: what they are learning, actions
/kids/[childId]/plan       curriculum and schedule for this child
/kids/[childId]/check      the check flow
/kids/[childId]/record     this child's history
/record                    the household record and the Book
/settings                  under More
```

**Three primary destinations: Today, Kids, Record.** Not five.

Derived from the loop in section 1, which has exactly three scopes:

| Loop step | Scope | Destination |
|---|---|---|
| Set up child, establish learning | one child | **Kids** |
| Today, do the work | the household, this morning | **Today** |
| Record what happened, check, adjust | one child | **Kids** |
| Long-term record, the Book | across time | **Record** |

The two per-child steps collapse into one destination because they are
the same question asked at different moments: *what is going on with
this child*. Splitting them would put the same child on two screens.

- **PLAN belongs to a child, not to the household.** A curriculum
  without a child is nothing. At the top level it forces the parent to
  hold "which child is this plan for" in their head, which is exactly
  what section 8 of the brief says to avoid.
- **LIBRARY is not built and must not be a destination.** An empty
  destination is a promise the product does not keep, and CLAUDE.md's
  rule 8 forbids it outright.
- **RECORD stays top level** even though records are per child. The
  parent buys the Companion as a whole system, not a document, but the
  Book is one of its most valuable durable outputs and two taps deep is
  where valuable outputs go to be forgotten. It opens on the household
  and filters to a child.

The child page carries **Check Emma** as a primary action, at the top,
not in a menu. Checking is a feature of the Companion, reached where the
parent is already looking at that child, and never a separate mode.

Chrome: the rail shell introduced for Personal Life Affairs Companion
(`navigationStyle: "rail"`), because these are parallel questions rather
than steps.

Family: **`learning`**, which already exists in the registry with
`learning.lesson`, `learning.activity`, `learning.assessment` and
`learning.mastery` and has been waiting for a product. This would be the
first product in a second family, which is what the platform was built
for. Note the constraint: a `learning` product cannot declare
`companion.next-action`, so "today's next thing" is expressed as
`learning.activity`. That is honest rather than a workaround.

## 16. Product tests

The ones that would catch a real failure:

- **Never grades a child.** Every user-facing string scanned for
  *behind*, *ahead*, *grade level*, *proficient*, *failing*, *score*.
- **Never claims from thin evidence.** A topic with three items always
  returns `not enough to say`, whatever the answers were.
- **Source always shown.** Every task carries a source; no task renders
  without one.
- **Determinism.** Same child, same topics, same seed, same check.
- **Never implies it wrote the question.** Every check states where its
  questions came from, and no check renders without a source.
- **Taxonomy integrity.** Every item points at a topic that exists; a
  topic with no items available says so rather than offering an empty
  check.
- **Nothing scheduled is a valid day.** Today renders a calm empty state,
  not a prompt to do something.
- **Children never leak.** A check for Emma can only draw on Emma's
  topics; a Book for Emma contains no row belonging to Noah.
- **Private stays private.** Nothing marked private appears in the Book.
- **RLS**, cross-user, per the existing structural proof pattern.

## 17. Implementation sequence

| Phase | What | Gate |
|---|---|---|
| 0 | Definition, catalog, `learning` family registration, empty modules routed | Reachable end to end |
| 1 | Children and setup: add a child, the curriculum branch, plan | A parent can finish setup |
| 2 | Today: derivation, completion, the optional follow-up | The daily loop works |
| 3 | Record: history, observations | A real record exists |
| 4 | **Topic taxonomy, plus the parent question bank** | Topics mean something |
| 5 | Check: sources, flow, scoring, standings, history | Check Emma works |
| 6 | The Book, browser-generated, visibility respected | Paper output |
| 7 | Shop listing, mockups, checkout wiring | Sellable |

**Phase 4 is small now, and that is the point of the correction.** The
taxonomy is a list, not a library. The real content commitment for v1 is
the PDF, which is scoped separately and is the product's first content
layer rather than an assessment bank hiding inside the Companion.

## 18. Risks

**It becomes a generic planner.** Symptom: the parent's most used screen
is a calendar. Guard: Today is derived, never edited as a schedule, and
the product's value claim is the record and the check.

**It becomes an LMS.** Symptom: content types, a resource library, a
gradebook. Guard: no content in v1 beyond the item bank, and no score
anywhere.

**It becomes an untrustworthy assessment tool.** The real risk, and the
one that would damage Draftpace rather than just this product. A parent
acts on a result that eight questions cannot support. Guards: the
minimum-items floor, `not enough to say`, no headline score, no
comparison to other children or to any standard, and *This check
suggests* on everything.

**The item bank is too thin to be worth anything.** Guard: ship one
subject properly rather than six subjects badly, and say plainly which
subjects have checks.

**Daily cadence sets a bar the product cannot clear.** A daily product
that is not worth opening daily gets abandoned in three weeks. Guard:
accept that many parents will use it weekly, make weekly use feel
correct, and never punish a gap.

---

## 19. Challenges to the brief

Six, ordered by how much they change the plan.

### 1. Where a check's questions come from has to be settled, and it is

Section 15 wants a check "specifically based on what she has been
learning", section 26 forbids a model, and section 37 forbids building
content libraries. An earlier draft of this document resolved that by
proposing a hand-authored Maths item bank of six or seven hundred
questions. **That is withdrawn.** It made assessment content the
Companion's v1 content strategy, which is not the agreed direction and
would have buried a Companion under a subject product.

The resolution is smaller and better: **the Companion supplies the
structure, not the questions** (section 9). Questions come from the
parent, from the curriculum they already own, or from the printable
check sheets in the PDF. The Companion supplies the taxonomy, the
recording, the confidence floor and the interpretation, which is the
part that is actually hard and the part a parent cannot do alone.

The taxonomy is a list of topic keys. It is a day of work, not a
quarter.

What this leaves genuinely open is **the PDF's scope**, because the PDF
is now the first content layer and the check sheets in it are what give
Check Emma something to work with on day one. That is challenge 5, and
it is where the content question actually lives.

### 2. Do not build curriculum upload, and do not build the interfaces for it either

Section 6 asks for interfaces and a data model for future document
ingestion. I would build the data model, which the curriculum tree
already is, and **not** the ingestion interfaces.

Extracting text from a PDF is easy. Turning an arbitrary publisher's
layout into units, topics, objectives and sequence is not, and without a
model it is not possible at all across publishers. An upload button
attached to a pipeline that cannot deliver is worse than no button.

More importantly it is unnecessary: **"Abeka Grade 4 Math, Lesson 12" is
a complete working model for everything Today does.** Thirty seconds of
typing replaces the entire pipeline. Personal Finance Companion learned
the same lesson: its import is regex and paste, presented as exactly
that.

### 3. Drop "7 / 8"

Section 16's own example leads with a fraction. A fraction is a grade,
and the brief spends section 27 explaining why we are not in the grading
business. Lead with topics.

### 4. Three destinations, not five

Section 29 proposes Today, Kids, Plan, Record, Library. Plan belongs
inside a child. Library has nothing behind it and shipping an empty
destination violates the platform's own honesty rule. Today, Kids,
Record.

### 5. The PDF as specified contradicts sections 4 and 27 (resolved)

Section 23 wanted the PDF to contain "grade-level educational
expectations", "subject frameworks" and "learning milestones". **That is
a curriculum position.** A document telling a parent what a nine year old
should be able to do is exactly the "we know better than you" stance
section 27 forbids.

**Resolved: method plus printable check sheets. Not a standards
authority.** See section 20.

### 6. This product holds data about children, which changes the risk profile

No other Draftpace product does. Specifically: do not collect date of
birth, default check results to private, generate the Book in the
browser, and get the RLS proof done in the same phase as the tables
rather than at the end.

---

## 20. Decisions taken

Recorded here because this document is the decision record for the
product, and because each of these closes something the earlier drafts
left open.

### 1. The PDF is method plus printable check sheets

**Not a standards or curriculum authority.** No grade-level
expectations, no milestones presented as what a child should be able to
do, because publishing those would be the "we know better than you"
stance the whole product exists without.

What it carries instead:

- **Method.** How to run a homeschooling week. How to keep records that
  satisfy what your state asks of you. How to read a check result. How
  to notice a child is struggling without concluding something you
  cannot support.
- **Printable check sheets**, tied to the topic taxonomy.

The check sheets are the load-bearing half. **They are what make the PDF
and the Companion one product rather than two things sold together**,
and they give Check Emma something to work with on day one without the
Companion pretending to be an assessment library.

The loop they close:

```
learn or work
      |
      v
use the printable material
      |
      v
administer a check
      |
      v
record it in the Companion
      |
      v
interpret the result, bounded (section 10)
      |
      v
history
      |
      v
what comes next
```

The parent can enter this loop at "administer a check" with their own
curriculum's test, or at "record it" with a check they ran last week on
paper. **The printed sheets are one way in, never the only one**, and
the product must not degrade for a parent who never opens the PDF.

### 2. Price: premium, not yet fixed

Designed as a premium paid product. The exact figure waits on the final
PDF and resource scope and the shape of the complete offer.

**Nothing in this architecture depends on the number.** Price lives in
the Shop listing (`TODO_SET_REAL_PRICE`, the convention all three
existing paid products already use) and in one checkout env var. It
touches no table, no module and no route, so pricing cannot block the
build and must not be allowed to.

### 3. Children do not log in

**The parent owns the account. Children are entities within it.**

Consequences, all of them simplifying:

- No child accounts, no child credentials, no child-directed interface,
  no consent flow, no second permission model.
- Every row in every `hsc_` table is owned by the parent's `user_id` and
  scoped by `child_id`. RLS is the existing `_pla_owns_instance` shape
  with one extra layer, not a new posture.
- The child appears in the product only as a subject: a name, an age, a
  record. Nothing in the product is addressed to them.

Revisiting this later would be a genuine product change rather than a
setting, and the schema should not pretend otherwise. No `child_user_id`
column, no nullable auth reference, no scaffolding for a thing that is
not being built.

---

## Open at implementation time

Nothing blocking. Two things to settle inside their own phases rather
than now:

- **The taxonomy's first subjects.** A list, decided when Phase 4
  starts, sized to what the PDF's check sheets actually cover.
- **The PDF's page-level contents.** Scoped as its own piece of work
  alongside Phase 6, in the way the Home Survey and My Affairs were.

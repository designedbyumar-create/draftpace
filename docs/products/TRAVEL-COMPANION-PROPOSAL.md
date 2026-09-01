# Travel Companion: Phase 0 proposal

Status: **Proposal only. No code, no migrations, no routes, no playbooks
written.** This document is the whole deliverable for this pass.

Working title / product name: **Travel Companion**. Proposed slug
`travel-companion`, table prefix `trv_`, family `companion` (existing,
no new family needed; see section 5). No naming ambiguity here the way
Alongside had: the brief names the product directly.

This is the sixth product in the `companion` family (after Monthly
Money Reset, Personal Finance Companion, Home Base, Personal Life
Affairs Companion, Alongside) and Draftpace's seventh real product
overall (Homeschooling Companion is family `learning`, not `companion`,
despite the name).

---

## 0. How to read this document

The brief is unusually complete: most Phase 0 documents in this repo
exist to resolve ambiguity the brief left open; this one mostly needs
formalizing against what the codebase actually supports. Where I agree
with the brief, I say so briefly and move to specifics. Where I think a
part of the brief needs a decision it doesn't make, or would cause a
real problem if built literally as written, I flag it clearly, under
**CHALLENGE**, and give a recommendation. There are five of these, and
they matter more than the rest of the document:

1. **Documents: registry or vault?** The brief says a document can be
   "attached" to a booking. This codebase stores zero file bytes
   anywhere, by policy, for every existing product. I recommend v1
   stays a document *registry* (what exists, where it's kept), not a
   vault, and flag file storage as a distinct, later decision.
2. **Money: how far does "financial context" go?** Left unbounded,
   this is a second Personal Finance Companion wearing a suitcase. I
   recommend a hard boundary: notes and threads may *mention* money,
   nothing computes a balance.
3. **The trip graph: a tree, not a graph.** A general many-to-many graph
   is the "visual spaghetti" the brief explicitly warns against. I
   recommend a strict one-parent tree (`depends_on_booking_id`), which
   covers every example in the brief and cannot become spagheti by
   construction.
4. **The Companion engine: build it twice, or extract it once?**
   Alongside already proved this exact engine shape. This is the second
   consumer. I recommend extracting a shared, generic runtime now
   rather than forking ~600 lines of near-identical code, and lay out
   what that costs.
5. **Setup: none, per Alongside's own lesson.** The brief's core loop
   opens with "SET UP TRIP" as a step; I recommend that not become a
   dedicated `setup` destination, for the same reason Alongside dropped
   one.

Sections 1–19 below formalize the brief in the codebase's own terms.
Section 20 answers the 22 numbered questions directly, mostly by
pointing back into 1–19 rather than repeating them.

---

## 1. Product thesis, restated precisely

**Travel is easy to plan. Travel is hard to coordinate.** The product
is not a planner: Draftpace already turned down "PDF-to-planner" as a
category the whole platform avoids (`docs/DECISIONS.md`). It is
**operational memory for one trip**: it holds the objects a trip is
made of, the real relationships between them, and derives what matters
right now from that structure, never from a generic "day one, ask
everything" form and never from an invented urgency.

The one-line test for every feature in this document, taken directly
from the brief and applied literally throughout:

> Does this help a traveller manage the complexity and changing state
> of a real trip? If not, it does not belong.

## 2. Exact target user

Not "people who travel." Specifically: **the person who holds a
multi-part trip together in their head**: the one who knows that the
transfer has to be booked around the flight, that the child's stroller
needs to fit in the rental car, that the friend still hasn't paid their
share of the Kyoto hotel. Concretely:

- Traveling with at least one other person whose logistics depend on
  theirs (a partner, children, a group).
- A trip with more than one place, or more than one mode of transport,
  or more than a handful of bookings.
- International, or otherwise carrying documents (passport, visa,
  insurance) that matter to the trip's success.
- Not a single-hotel weekend. That trip has no graph, and this product
  has nothing to derive.

## 3. Jobs-to-be-done

1. "Let me put everything about this trip somewhere that understands
   how the pieces connect, once, instead of a hotel confirmation email,
   a flight PDF, a shared note, and a spreadsheet."
2. "Tell me what today actually looks like, without me reconstructing
   it from four different bookings."
3. "When something changes, tell me what else it touches, so I don't
   find out at the hotel desk that the transfer was never rebooked."
4. "Help me deal with the annoying provider conversation, without
   pretending to have that conversation for me."
5. "Let me hand a printed version to my mother-in-law, or read it with
   no signal, without the printed thing lying about what's confirmed."
6. "When I plan the next trip, let me use what I actually learned from
   the last one, without digging through old messages."

## 4. Core product loop

Formalizing the brief's section 18 loop against this codebase's actual
building blocks:

```
create a trip (trv_trips row, minimal: title, rough dates)
  → add people, places, bookings, each one strengthens the graph
    → link bookings that depend on each other (depends_on_booking_id)
      → the trip is now the source of truth
        → Today derives the operational state, read-only, every time
          → something changes (a time moves) or breaks (a thread opens)
            → Companion Mode helps deal with it, one situation at a time
              → the outcome updates the trip and/or resolves the thread
                → Record accumulates what happened, dated, in the user's words
                  → the trip ends, becomes history
                    → the PDF can be generated any time along this whole loop
                      → a later trip's Record surfaces prior, place-matched entries
```

Nothing in this loop is decorative. Every arrow is a real, buildable
mechanism specified in sections 8–16.

## 5. Family, capabilities, theme

Reuse `family: "companion"`: Alongside's own doc comment already
states the criterion: `companion.context`, `companion.next-action`,
`companion.recovery`, `companion.outcomes` are all directly applicable
here and none is finance/companion-specific in a way that would exclude
this product:

- `companion.context`: the trip graph itself (people, places, bookings,
  documents, links).
- `companion.next-action`: Today.
- `companion.recovery`: open threads and the "what changed" flow,
  exactly the same shape as Alongside's "picking up something
  abandoned."
- `companion.outcomes`: Companion Mode's outcome recording.

No new capability string is needed. **No new family is needed.** This
also settles a question the brief doesn't ask but the codebase requires
an answer to: this is not a `learning` product (no mastery, no
curriculum) and not a `workspace` product (no calculator/output shape),
so `companion` is the only correct fit among the six registered
families, matching four of its five siblings.

Theme: a sixth accent, distinct from teal (PFC), clay (Home Base), sage
(PLA), plum (HSC) and mulberry (ADHD Life Companion). A warm, saturated
amber/ochre (`#a86a2c`-family) reads as "in motion, somewhere new"
without tipping into a tourist-brochure palette: the brief's own
"never a generic travel-guide feel" principle applies to color choices
too. Exact hex to be picked at build time against the other five for
contrast, not decided here.

## 6. Navigation architecture

The brief's five names map onto the platform's existing mechanics with
**zero new shell features required**:

| Brief's name | `ProductDefinition` field | Notes |
|---|---|---|
| Today | `workspace`, relabeled | Same pattern as Alongside ("Now") and Homeschooling Companion (already labeled "Today", direct precedent, same word) |
| Trip | `trip` (custom destination) | The master connected view |
| People | `people` (custom destination) | |
| Record | `record` (custom destination) | Same destination *name* as Homeschooling Companion's, same meaning: a dated log, not a task list |
| More | *not a destination* | This is the rail shell's existing overflow menu ("More product options"), already built and live on Alongside today. Nothing to build. |

```
navigation: ["workspace", "trip", "people", "record", "settings"]
primaryNavigation: ["workspace", "trip", "people"]
workspaceLabel: "Today"
navigationStyle: "rail"
```

**Why only three in the primary bar, with Record and Settings behind
More:** every rail product shipped so far (Alongside) uses exactly
three primary destinations; Record is genuinely a during-and-after
surface rather than a moment-to-moment one (see section 13), so it
belongs one tap deeper, the same way Alongside's Settings does. This is
a direct, mechanical reuse of an existing pattern, not a new design.

**No `setup` destination.** See the Phase 0 challenge at the top: a
trip needs a name and rough dates to exist, and that's a three-field
inline form reachable from an empty Trip screen (see section 8's
"Setup" note), not a gated wizard. Declaring `setup: { required: false
}` follows Alongside's own precedent and its own stated reason
(`resolveLifecycleNavigation`'s first-state trap, hit once already by
Personal Finance Companion).

## 7. Full screen inventory

| Destination | Screen | What it is |
|---|---|---|
| Today | Today | Derived operational state for the current trip, "right now" (section 8) |
| Trip | Trip overview | Trip Brief card, timeline, sections for stays/reservations/documents/preparation/threads (section 9) |
| Trip → | Trip list / switcher | Shown when more than one trip exists and none is obviously "current" (planning + past); lets the user pick which trip Today/Trip/People/Record operate on |
| Trip → | Booking detail | One booking: its fields, its participants, its upstream/downstream dependency chain, its documents |
| Trip → | Place detail | One destination: arrival/departure, the bookings anchored there |
| People | People list | Every traveller on the current trip |
| People → | Person detail | One traveller: their documents, their bookings, requirements, relationship notes |
| Record | Record | Dated log: resolved threads, user notes, past-trip retrospective (section 14) |
| (from Trip or Today) | Companion run | The situation-first entry point + step-by-step run (section 11) |
| (from Trip) | "What changed?" | The change-impact walk (section 12) |
| (from Trip) | Trip Brief (expanded) | Full-screen, shareable/printable version of the Trip Brief card (section 13) |
| More → Settings | Settings | Privacy, notification prefs (honestly "not built yet" in v1, same as every sibling) |
| (from Trip) | Generate My Trip Book | The PDF (section 15) |

No screen here exists without a destination-column job stated in
section 6 of the brief. Nothing was added because "travel apps usually
have this."

## 8. Data model

### The consolidation, and why

The brief lists nine categories (people, places, transport, stays,
reservations, documents, plans, preparation, money, threads) as if each
needs its own table. Two precedents already in this codebase argue
against that: `als_items` (Alongside) and `pla_items` (Personal Life
Affairs Companion) each collapse several conceptually-different "kinds
of thing" into **one table with a `kind` discriminator and a shared
column shape**, specifically to avoid the duplicated CRUD, duplicated
RLS policies, and duplicated repository code that N nearly-identical
tables would produce. Transport, stays, and reservations (flights,
trains, cars, transfers, hotels, rentals, activities, restaurants,
events) share the same real shape, a provider, a reference, a
date/time, a place, participants, a status, a note, so they become one
`trv_bookings` table with `kind`, not seven.

"Plans" from the brief's section 3 list isn't a separate table at all:
a plan *is* the graph of places, bookings and their links, viewed as a
timeline. Building a separate `trv_plans` table would create the
"second manual task system" the brief explicitly forbids in section 5.

### Tables

```
trv_trips
  id, user_id, product_instance_id
  title                    text                 "Japan"
  destination_summary      text null            "Tokyo · Kyoto · Osaka" (user-entered, not derived from places on create; refreshed from trv_places once any exist)
  starts_at, ends_at        date null            rough dates; exact per-booking times live on bookings
  status                    text                 'planning' | 'active' | 'past' | 'archived'
  created_at, updated_at

trv_people
  id, trip_id, user_id, product_instance_id
  name                      text
  is_child                  boolean default false
  relationship_note         text null            free text, e.g. "Umar and Roha's daughter", no closed relationship enum
  requirements              text null            free text, e.g. "vegetarian meals, aisle seat"
  created_at, updated_at
  -- children never get a user_id / auth link; same three-line rule as
  -- Homeschooling Companion's children

trv_places
  id, trip_id, user_id, product_instance_id
  name                      text                 "Kyoto"
  ordinal                   integer              sequence within the trip
  arrives_at, departs_at    date null
  created_at, updated_at

trv_bookings
  id, trip_id, place_id null, user_id, product_instance_id
  kind                      text    check in ('flight','train','car','transfer','hotel','rental','activity','restaurant','event','other')
  title                     text                 "Flight PK123" / "Kyoto National Museum"
  provider                  text null
  reference                 text null            confirmation number
  starts_at                 timestamptz null
  ends_at                   timestamptz null      spans for stays/rentals
  location                  text null
  status                    text    check in ('confirmed','waiting','cancelled') default 'confirmed'
  depends_on_booking_id     uuid null references trv_bookings(id)   -- see §11/§12; a tree, not a graph
  notes                     text null
  created_at, updated_at

trv_booking_people   (join: many participants per booking, many bookings per person)
  booking_id, person_id, user_id, product_instance_id

trv_documents
  id, trip_id, person_id null, booking_id null, user_id, product_instance_id
  kind                      text    check in ('passport','visa','insurance','confirmation','ticket','agreement','other')
  label                     text                 "Minha's passport"
  kept_where                text null            "Photo in Umar's phone" / "Printed in the front pocket", see §9 challenge
  created_at, updated_at

trv_preparation
  id, trip_id, user_id, product_instance_id
  category                  text    check in ('documents','packing','transport','money','home','people','bookings')
  title                     text                 user-defined, no seeded content
  status                    text    check in ('open','done') default 'open'
  notes                     text null
  created_at, updated_at

trv_threads
  id, trip_id, booking_id null, person_id null, user_id, product_instance_id
  title                     text                 "Hotel has not confirmed late arrival"
  who_is_involved           text null            free text
  expected_by               date null            user-chosen only, never invented (house rule, §19.5)
  status                    text    check in ('open','resolved') default 'open'
  created_at, resolved_at null, updated_at

trv_thread_events    (append-only, mirrors als_item_events)
  id, thread_id, run_id null, user_id, product_instance_id
  line                      text                 snapshot, past tense
  outcome                   text null
  occurred_at

trv_record_entries
  id, trip_id, user_id, product_instance_id
  category                  text    check in ('destination','stay','transport','reservation','note','lesson')
  place_name                text null            for the deterministic future-trip matching in §14
  body                      text                 the user's own words
  created_at
```

Every table: `user_id`, `product_instance_id`, RLS on, `select`/`insert`
scoped to `auth.uid() = user_id`, insert additionally proven via a
`_trv_owns_instance` function (same pattern as every sibling's
`_pfc_owns_instance` / `_als_owns_instance`), **no delete policy on any
table**. Rows leave via `status`, never `DELETE`. This is not a new
posture, it is the posture every product in this repo already has,
applied here without exception, including for `trv_documents`, which
holds the single most sensitive category of data (passport/visa
references) of any product on the platform.

## 9. Documents, the flagged challenge, in full

**CHALLENGE.** The brief's section 9 says a document "can belong to a
person, a booking, or the trip" and section 8 says a booking can have
"an attached document." Read literally, this means file upload and
storage: a passport scan, a visa PDF, a boarding pass image. Nothing in
this codebase does that today. There is no Supabase Storage bucket, no
upload UI, no RLS-on-storage-objects pattern, anywhere in any of the
six products already shipped, and Personal Life Affairs Companion
made this an explicit, load-bearing design decision, not an oversight:
*"This is deliberately not a vault... it records what exists, where it
is, and who knows about it, and never the thing itself."*

I recommend Travel Companion follow the identical rule in v1, for two
independent reasons: it matches an established platform-wide privacy
posture, and it avoids taking on real, unbudgeted infrastructure
(upload, storage RLS, file-type/size limits, a credible answer to "what
happens to a photo of my child's passport if this product is breached")
inside a Phase 0 pass that was scoped to product definition, not
security architecture.

`trv_documents` above therefore stores `kept_where`, a **registry**
entry ("kept in Apple Wallet," "photo in Umar's phone," "printed in the
folder"), never a file. This still fully answers the brief's own test
question for this section: *"What is this document for?"* A registry
answers that. It just doesn't also answer "show it to me," which real
file storage would need to.

**If the founder wants real file attachment in v1**, that's a distinct,
larger decision this document does not make for you, it needs its own
short proposal (storage bucket RLS, retention, an answer to the
passport-photo question above) before it's built, not folded silently
into this one.

## 10. Money, the flagged boundary

**CHALLENGE.** Section 3 lists "money/financial context" as part of the
graph; section 10's own example, *"Friend has not transferred their
share"*, is financial. Left unbounded, "financial context" is Personal
Finance Companion's entire subject, and Alongside's founding lesson
this session (`definition.ts`'s own doc comment) is exactly this
mistake in miniature: a product that starts recording amounts and
providers "just this once" becomes a worse version of a product already
sold.

Recommendation: Travel Companion may **mention** money, inside a
thread's free-text title ("Sarah still owes her share of the Kyoto
hotel"), inside a preparation item's category (`money`), inside a
Record entry, but **stores no amount, no currency, no running balance,
no split calculation anywhere in the schema.** There is no `amount`
column above, on purpose, in `trv_threads`, `trv_bookings`, or anywhere
else. If a real expense-splitting feature is wanted later, it is a
distinct capability on top of this data model, not a field quietly
added to it.

## 11. Attention / Today derivation rules

Formalizing the brief's own principle 5 ("no invented urgency; derived
attention must come from actual trip state and user-defined dates")
against Alongside's now-proven `deriveAttention` shape, same
discipline, new inputs:

Today, for the trip currently in view, computed fresh on every read
from `trv_bookings`, `trv_threads`, and `trv_places`, never stored:

| Section | Rule |
|---|---|
| **Now/next** | Bookings whose `starts_at` falls within the current day, ordered by time. Each line states only what is stored: title, time, location, reference status. |
| **Important** | A booking starting *tomorrow* whose `kind` is one a traveller would otherwise miss preparing for (check-in windows, `starts_at` on a `hotel`/`rental` row), but the line itself is the stored fact ("Hotel check-in begins at 3 PM"), never an invented imperative ("Don't forget..."). This is the brief's own explicit ban in section 1, enforced the same way Alongside's `APPROVED_PHRASINGS` regex list enforces its tone: a small, fixed set of sentence shapes, tested. |
| **Waiting** | Open `trv_threads` rows linked to a booking happening within the horizon, shown with whatever the user recorded ("Awaiting confirmation"), never a guess at status. |
| **Later** | The next 1–2 days' bookings, collapsed to a line each, this is the brief's own example ("Tomorrow: Return rental car · 11:00"), and it stops there; Today is not a second calendar. |
| **Quiet** | A day with nothing stored says so plainly, same as Alongside's "Nothing needs you right now", quiet is a real, honest answer here too, not a placeholder waiting to be filled with generic travel tips. |

No AI summarization. No "smart" reordering beyond chronological. Every
line traces to a column.

## 12. Companion Mode architecture

**Reuses the architecture Alongside proved**, not its code (different
schema, different domain). The engine is generic; content is
per-product. See the Phase 0 challenge at the top of this document:
whether to extract the shared parts now is a real decision, not a
detail, and is addressed there and in section 20.11.

- **Front door**: "What are you dealing with?", free text optional,
  then eight situations, matching the brief's own list in section 11
  exactly: booking problem, flight problem, hotel problem, transport
  problem, something changed, reorganize the trip, contact someone,
  something went wrong. (Note: the brief lists these as prose, not as a
  locked count, eight is my own count of them, and it is not a
  coincidence that it matches Alongside's own "eight, and eight is the
  number" convention. I'd recommend locking it the same way, for the
  same reason: a library that grows until it needs a search box has
  become a different product.)
- **Step kinds**: identical six-kind vocabulary proven in Alongside:
  `choose`, `write`, `prepare`, `wording`, `during`, `outcome`. Nothing
  travel-specific belongs in the engine; everything travel-specific is
  content inside one situation's step list (e.g. the "hotel problem"
  situation's `prepare` step lists "your confirmation reference,"
  "the dates of your stay," pulled from the linked booking's own
  columns wherever context exists, see next bullet).
- **Context pull, not re-asking**: opening Companion Mode *on* a
  booking or a thread pre-fills what's already known (the reference,
  the dates, the provider) into the run's visible context, and the
  `write`/`choose` steps only ask for what is genuinely missing, this
  is the brief's own instruction in section 11 ("ask only for missing
  information"), and it is the same discipline Alongside's
  `resumeContext` already implements for threads.
- **Never invents, never pretends to contact anyone, never makes
  claims on the traveller's behalf.** Suggested wording is always
  editable and, per the platform-wide rule already enforced by test in
  Alongside, never stored once used.
- **Resume is P0 again, from day one**, not retrofitted. Alongside's
  own history this session is the reason: a run created as a mount-effect
  side effect produced a real orphaned run in production-adjacent
  testing. Travel Companion's engine, extracted or forked, must create
  a run at the moment a situation is chosen, never inside a component's
  mount effect. This is not a nice-to-have; it is now a documented
  failure mode with a known fix, and repeating the mistake here would be
  building the bug back in with full knowledge of it.
- **Outcome → trip update**: an outcome can (a) resolve an open thread,
  (b) open a new thread, (c) update a booking's `status` or `notes`, or
  (d) do nothing (the "did not get to it" equivalent, "still
  unresolved", writes nothing new, same non-punitive principle as
  Alongside's outcome model, applied here because the brief's own
  principle 5 and 7 ask for the same tone, not because it was copied
  reflexively).

## 13. Change-impact model ("what changed?")

**This is the product's real differentiator**, and the brief is
explicit that it must not become a generic dependency-graph feature
("without becoming a visual spaghetti diagram"). See the Phase 0
challenge: I recommend `depends_on_booking_id` as a single nullable
self-referential FK, each booking depends on **at most one** upstream
booking, forming a **tree** (technically a forest, one per trip), not a
general graph.

This is sufficient for every example the brief itself gives (flight →
arrival → transfer → hotel check-in → dinner reservation is a straight
line; a booking with two children, say, both the airport transfer
*and* the dinner reservation depending on the same flight, is a
one-to-many fan-out, which a tree handles natively). It is
**structurally incapable** of becoming spagheti, because a tree cannot
have a diagram in which node A's importance to node B is unclear, there
is exactly one path.

**The flow:**

1. User (or a Companion run) records a change to a booking, most
   commonly its `starts_at`/`ends_at`, via an explicit "record a
   change" action, never inferred.
2. The system walks `depends_on_booking_id` downward from that booking
   (a plain recursive query, bounded by trip size, no external call).
3. Every descendant booking is shown as "potentially affected," in the
   brief's own words, with its own current stored time/status,
   **never auto-edited.**
4. For each one, the user can open Companion Mode's "something changed"
   situation, scoped to that specific booking, one at a time, the
   brief's own instruction, "help the user deal with those consequences
   one at a time."
5. Nothing is walked *upward*: a hotel check-in changing does not
   imply the flight changed. The tree's direction encodes real-world
   causality (later things depend on earlier things), so the walk only
   ever needs to go one way.

Linking two bookings (`depends_on_booking_id`) is always an explicit
user action, a "this depends on" picker when creating or editing a
booking, **never inferred from time proximity or place matching**.
Two bookings on the same day are not automatically linked; the user
says a transfer follows a flight because they know that, not because
the system guessed it from timestamps. This is the same discipline as
section 16's history-matching rule: deterministic, structural,
explicit, never a heuristic dressed up as intelligence.

## 14. Trip Brief model

A **derived**, read-only assembly of already-stored state, never a
generative summary, never AI-authored prose. Every line in the brief's
own section 13 example maps directly to a query:

| Brief's line | Source |
|---|---|
| Where we are | The `trv_places` row whose `arrives_at`/`departs_at` span today, for the current trip |
| Today | Today's `trv_bookings`, same query Today's screen uses, **one function, two callers**, so the two screens cannot silently disagree |
| Next | The next `trv_places` row by `ordinal` |
| Open | Open `trv_threads`, count and titles |
| Bookings | Count of `trv_bookings` by `status` |
| Important | Any `trv_documents`/`trv_people` row the user has flagged as brief-worthy (a boolean, `surface_in_brief`, on documents, the one column added specifically so "Minha's passport is stored with her travel documents" can appear without the brief silently trying to guess what's important) |

Rendered in two places from the one query: a compact card at the top of
the Trip screen (always visible) and an expandable full view (the
brief's own example is exactly this full view). This is also the
natural cover-adjacent content for the PDF (section 15), one more
reason it must be a real query, not a one-off screen composition.

## 15. PDF model

Same discipline as every existing printable in this repo: generated
client-side from the live Companion's own data (`@react-pdf/renderer`,
dynamic-imported so it never reaches the main bundle), never uploaded,
never touching a server with the assembled trip. **My Trip Book**,
sectioned per the brief's own list: cover, trip overview (the Trip
Brief, effectively), travellers, transport, stays, reservations,
documents (the registry entries, not files, see section 9), important
information, daily plan (the timeline), open threads, trip notes (from
`trv_record_entries`).

Same "print at any point, never gated on completeness" rule Personal
Life Affairs Companion established: a trip three weeks from departure
with two bookings prints a two-booking book, honestly, not a book with
blank pages implying more should exist.

**Etsy framing** (brief section 15, "the printable travel book +
interactive travel companion"): the PDF must independently justify a
purchase, the same way Homeschooling Companion's 30-page book does. In
practice this argues for the PDF including something genuinely
premium beyond a printout of the app's data, a method section (how to
use a trip book while travelling, what to do with it at each stage),
mirroring Homeschooling Companion's own "method + printable, not just a
printable" structure. Exact page count and content is a build-time
decision, not a Phase 0 one.

## 16. Record / history model

During a trip: a dated, append-mostly log, resolved threads land here
automatically (their final `trv_thread_events` line), and the user can
add a note by hand at any time. This is *not* a duplicate of Today; it
is retrospective, not operational.

After a trip (`trv_trips.status = 'past'`): the same table, now the
primary reason to open the product again, exactly the brief's own
framing in section 16.

**Future-trip surfacing (section 16's last requirement), made
concrete and non-AI:** when a new trip's `trv_places.name` matches
(case-insensitive, exact or simple substring, no fuzzy matching, no
embeddings, no model call) a `place_name` already recorded on some
past trip's `trv_record_entries`, those entries are offered, visibly
labeled with which past trip they're from, with an explicit "add to
this trip's preparation" action per entry. **Nothing is copied without
that click.** This is the same deterministic-matching discipline used
throughout every product in this codebase; there is no AI provider
anywhere in this repository and this feature is not the exception.

## 17. Privacy model

- RLS on every table, per section 8, no exceptions, no delete policy
  anywhere.
- `trv_documents` never stores a file, see section 9's challenge. This
  is the single largest privacy decision in this document, and it is
  made explicitly, not by omission.
- No amount/balance data anywhere, see section 10's challenge.
- Children (`trv_people.is_child = true`) never get an auth-linked
  `user_id`; same rule as Homeschooling Companion, for the same reason.
- No AI model reads any trip data, ever, this document contains no
  feature that requires one, by construction (sections 12, 13, and 16
  are all explicitly deterministic).
- A person's `requirements` field (allergies, medical notes typed by
  the traveller) is exactly the kind of sensitive free text Personal
  Life Affairs Companion already has a posture for (private by
  default, visible in the printed book only if the user says so), the
  same `*_visibility` column pattern PLA and Homeschooling Companion
  both already use should apply to anything a person enters about
  another traveller here, particularly a child.

## 18. What belongs in v1

Everything specified in sections 6–16 above: trip/people/places/
bookings/documents(registry)/preparation/threads, Today, Trip, People,
Record, Companion Mode with eight situations, the change-impact walk,
the Trip Brief, the PDF, and deterministic Record-reuse across trips.

## 19. What explicitly does not belong in v1

Every item in the brief's own section 17, verbatim (flight/hotel APIs,
maps, live tracking, automatic booking, price comparison, AI itinerary
generation, restaurant discovery, tourist recommendations, a social
feed, a generic task manager, a generic notes app), **plus, from this
document's own analysis**:

- Real file storage for documents (section 9).
- Any structured money/expense feature (section 10).
- A general many-to-many dependency graph, or any UI that visualizes
  one (section 13), the tree is not a scoped-down version of this to
  be expanded later; it is the permanent design, chosen because it
  cannot become spaghetti, not because building the general version was
  too much for v1.
- Inferred booking links (time-proximity or place-matching auto-linking
 , section 13).
- Fuzzy/semantic matching for history-reuse (section 16), the matching
  stays exact/substring, permanently, for the same never-AI reason
  every other product in this repo holds that line.
- A `setup` destination (section 6).

## 20. The 22 questions, directly

Most of these are fully answered by sections above; this section is the
map, not a repeat.

1. **North star**, §1.
2. **Target user**, §2.
3. **Jobs-to-be-done**, §3.
4. **Core loop**, §4.
5. **Navigation**, §6.
6. **Screen inventory**, §7.
7. **Data model**, §8.
8. **Entity relationships**, §8 (`depends_on_booking_id`), §13.
9. **Attention/Today rules**, §11.
10. **Companion Mode architecture**, §12.
11. **Change-impact model**, §13.
   *(Extraction question, since it isn't asked elsewhere: build the
   shared six-step-kind Companion runtime as a genuinely reusable
   module now that a second real consumer exists, or fork Alongside's
   ~600 lines and accept the two copies will drift. I recommend
   extraction, the shape is proven, not hypothetical, and the
   "written twice" risk this document keeps citing from this
   codebase's own conventions applies to the engine exactly as much as
   it applies to playbook content. This is a real scope decision for
   whoever approves Phase 1, not something to default silently either
   way.)*
12. **Trip Brief model**, §14.
13. **PDF model**, §15.
14. **Record/history model**, §16.
15. **Privacy model**, §17.
16. **V1 scope**, §18.
17. **Explicitly not v1**, §19.
18. **Etsy/product positioning**, §15's framing note; same "printable
    genuinely stands alone" bar Homeschooling Companion already cleared.
19. **How this differs from a normal planner**, §1: a planner outputs
    an itinerary; this holds relationships and derives state from them
    after the itinerary exists. The itinerary is an input, not the
    product.
20. **How this differs from TripIt / Google Travel / Notion**, those
    products either parse confirmation emails (an inference layer this
    product deliberately has none of), or hold flat, disconnected notes
    (a Notion database has no `depends_on_booking_id`; a change to one
    row cannot tell you what it affects). Neither has an open-threads
    concept, a Companion, or a deterministic history-reuse mechanism.
    The differentiator is the graph plus what it's used for (§13, §16),
    not a better UI on the same idea.
21. **Future expansion**, flight-status integration behind the same
    kind of adapter seam Alongside's attention layer already uses for
    push (build the derivation first, add a live data source later
    without changing it); real document storage (§9), scoped and
    proposed separately; a proper expense-split feature, scoped and
    proposed separately, never silently grown from §10's boundary;
    shared/multi-editor trips (every product in this repo is
    single-account today; this would be the first to need real
    sharing, and deserves its own proposal, not a footnote here).
22. **Phased implementation plan**, below.

### Phased implementation plan

Following the same discipline as every prior Phase 0 in this repo:
engine before content, resume before breadth, foundation before
polish.

| Phase | What | Gate |
|---|---|---|
| 0 | This document | Boundaries and the five challenges resolved with the founder |
| 1 | Trips, people, places, bookings, links, schema and domain layer only | A trip can hold real, connected data |
| 2 | Today derivation, Trip screen, People screen | It shows what matters, un-invented |
| 3 | Companion engine, extracted or forked per §20.11, proven with **one** situation end to end, resume included from the start | The engine is proven, not just written |
| 4 | The remaining seven situations | The library is real |
| 5 | Change-impact walk | The differentiator works |
| 6 | Threads, Record, deterministic history-reuse | The loop closes and remembers |
| 7 | Trip Brief, PDF | Sellable as a printable in its own right |
| 8 | Shop listing, price, checkout | Sellable at all |

Phase 3 before 4 for the reason Homeschooling Companion's own Phase 0
already stated and Alongside's build then proved by finding a real bug
because of it: authoring content against an unproven engine is how
content, or in this case, an engine, gets built twice.

---

## What I need from you before Phase 1

The five challenges in section 0, as explicit decisions:

1. Documents: registry only in v1 (recommended), or do you want real
   file storage scoped now as its own decision?
2. Money: hard boundary, no amount/balance data ever (recommended), or
   do you want a bounded expense-tracking feature in v1?
3. The dependency tree: one-parent tree (recommended), or do you
   specifically need a booking to depend on more than one upstream
   thing in v1?
4. The Companion engine: extract a shared runtime now (recommended), or
   fork Alongside's implementation and accept drift?
5. Confirm the eight Companion Mode situations as locked, matching
   Alongside's "eight, and eight is the number" convention, or leave
   the count open.

I would not start Phase 1 without your answer on all five, the schema
in section 8 and the engine work in section 12 both depend directly on
how they're decided.

/**
 * My Trip Book.
 *
 * One document, two ways to receive it: called with a real trip's data
 * it is a personalised companion to the app; called with no trip at all
 * (trip: null) every "your trip" section renders its blank, ruled,
 * write-in form instead, which is exactly what gets exported once and
 * sold as a standalone, undated planner. One function, two callers, the
 * same discipline the live app's own Today/Trip-Brief query uses, so
 * the printed and the sold version can never quietly drift apart.
 *
 * WHAT MAKES THIS WORTH BUYING ON ITS OWN
 *
 * Part one is method, not a printout of app data: six chapters on
 * travelling with less held in your head, written by a person, with no
 * model involved anywhere in this product. Part two is the same working
 * pages whether they are blank or filled in, so a trip that starts on
 * paper and finishes in the app, or the other way round, never has to
 * choose.
 *
 * PRINT AT ANY POINT, NEVER GATED ON COMPLETENESS
 *
 * A trip three weeks out with two bookings prints a two-booking book,
 * honestly, not a book with blank pages implying more should exist.
 * Real rows are always followed by a few blank ruled ones, an
 * invitation to keep writing, never a fabricated fact: a blank line
 * cannot be mistaken for a stored one.
 *
 * Amber and ink, matching the product. No em dashes.
 */
import { Document, Page, View, Text, StyleSheet, type DocumentProps } from "@react-pdf/renderer";
import {
  METHOD,
  BOOK_TITLE,
  BOOK_SUBTITLE,
  PREPARATION_CATEGORY_LABELS,
  BOOKING_KIND_LABELS,
  type Chapter,
} from "./bookContent";
import { byStartTime, type Booking, type Person, type Place, type PreparationItem, type RecordEntry, type Thread, type TravelDocument, type Trip } from "../trip";

const C = {
  paper: "#fbfaf7",
  ink: "#1a1d24",
  body: "#3b3f49",
  muted: "#666b77",
  faint: "#9a9186",
  rule: "#ded5c4",
  ruleSoft: "#ede6d8",
  write: "#d8c9ac",
  amber: "#a8611f",
  amberMid: "#c17f3e",
  amberSoft: "#f7ead9",
  cream: "#f5efe3",
};

const HEAD = "Newsreader";
const BODY = "PlexSans";
const M = { top: 62, bottom: 56, side: 58 };

type Size = "LETTER" | "A4";

const s = StyleSheet.create({
  page: {
    paddingTop: M.top,
    paddingBottom: M.bottom,
    paddingHorizontal: M.side,
    backgroundColor: C.paper,
    color: C.body,
    fontFamily: BODY,
    fontSize: 9.6,
    lineHeight: 1.6,
  },
  bare: { backgroundColor: C.paper, fontFamily: BODY },
  spine: { position: "absolute", top: 0, left: 0, right: 0, height: 3.5, backgroundColor: C.amber },
  runningHead: {
    position: "absolute",
    top: 30,
    left: M.side,
    right: M.side,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 6.8,
    letterSpacing: 1.2,
    color: C.faint,
    textTransform: "uppercase",
  },
  folioRule: { position: "absolute", bottom: 40, left: M.side, right: M.side, height: 0.5, backgroundColor: C.ruleSoft },
  folio: { position: "absolute", bottom: 25, right: M.side, fontSize: 7.5, color: C.faint },

  eyebrow: { fontSize: 6.8, letterSpacing: 1.5, color: C.amber, textTransform: "uppercase" },
  h1: { fontFamily: HEAD, fontSize: 26, color: C.ink, marginTop: 8, lineHeight: 1.15 },
  standfirst: { fontFamily: HEAD, fontSize: 12, color: C.body, marginTop: 12, lineHeight: 1.5 },
  headRule: { height: 1.2, backgroundColor: C.ink, marginTop: 18, marginBottom: 20 },
  h2: { fontFamily: HEAD, fontSize: 13.5, color: C.ink, marginTop: 18, marginBottom: 6 },
  p: { fontSize: 9.6, color: C.body, marginBottom: 9, lineHeight: 1.65 },

  bullet: { flexDirection: "row", marginBottom: 6 },
  bulletMark: { width: 14 },
  bulletText: { flex: 1, fontSize: 9.6, color: C.body, lineHeight: 1.6 },

  writeLine: { borderBottomWidth: 0.7, borderBottomColor: C.write, height: 26 },
  writeLabel: { fontSize: 7.4, letterSpacing: 0.7, color: C.faint, textTransform: "uppercase", marginTop: 12 },
  tocLabel: { fontSize: 7.4, letterSpacing: 0.7, color: C.amber, textTransform: "uppercase", marginTop: 15, marginBottom: 3 },

  boxLabel: { fontSize: 6.8, letterSpacing: 1.3, color: C.amber, textTransform: "uppercase" },
  box: { borderLeftWidth: 2.5, borderLeftColor: C.amber, backgroundColor: C.amberSoft, paddingVertical: 12, paddingHorizontal: 15 },

  tableHead: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: C.ink, paddingBottom: 5 },
  th: { fontSize: 6.8, letterSpacing: 1, color: C.ink, textTransform: "uppercase" },
  tr: { flexDirection: "row", borderBottomWidth: 0.6, borderBottomColor: C.write, minHeight: 26, alignItems: "center", paddingVertical: 4 },
  td: { fontSize: 9, color: C.ink },
  tdMuted: { fontSize: 8.4, color: C.muted },
});

function Sheet({ section, children }: { section: string; children: React.ReactNode }) {
  return (
    <>
      <View style={s.spine} fixed />
      <View style={s.runningHead} fixed>
        <Text>{BOOK_TITLE}</Text>
        <Text>{section}</Text>
      </View>
      {children}
      <View style={s.folioRule} fixed />
      <Text style={s.folio} fixed render={({ pageNumber }) => String(pageNumber)} />
    </>
  );
}

/** Ruled space to write in. */
function Lines({ count, label }: { count: number; label?: string }) {
  return (
    <View>
      {label && <Text style={s.writeLabel}>{label}</Text>}
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={s.writeLine} />
      ))}
    </View>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <View style={{ marginTop: 4 }}>
      {items.map((item, i) => (
        <View key={i} style={s.bullet} wrap={false}>
          <View style={s.bulletMark}>
            <View style={{ width: 7, height: 1, backgroundColor: C.amberMid, marginTop: 7 }} />
          </View>
          <Text style={s.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

/** A part divider. The one place in the book that spends ink. */
function Divider({ part, title, blurb, size }: { part: string; title: string; blurb: string; size: Size }) {
  return (
    <Page size={size} style={s.bare}>
      <View style={{ flex: 1, backgroundColor: C.amber, paddingHorizontal: M.side, paddingTop: 150 }}>
        <Text style={{ fontSize: 7, letterSpacing: 2.4, color: "#f2ddc4", textTransform: "uppercase" }}>Part {part}</Text>
        <Text style={{ fontFamily: HEAD, fontSize: 40, color: "#ffffff", marginTop: 16, lineHeight: 1.1 }}>{title}</Text>
        <View style={{ width: 90, height: 1.5, backgroundColor: "#e0bb8f", marginTop: 26 }} />
        <Text style={{ fontFamily: HEAD, fontSize: 12.5, color: "#f7e9d6", marginTop: 22, lineHeight: 1.55, maxWidth: 330 }}>
          {blurb}
        </Text>
      </View>
    </Page>
  );
}

function MethodChapter({ chapter, size }: { chapter: Chapter; size: Size }) {
  return (
    <Page size={size} style={s.page}>
      <Sheet section={chapter.title}>
        <Text style={s.eyebrow}>Chapter {chapter.number}</Text>
        <Text style={s.h1}>{chapter.title}</Text>
        <Text style={s.standfirst}>{chapter.standfirst}</Text>
        <View style={s.headRule} />
        {chapter.sections.map((section) => (
          <View key={section.heading} wrap={false}>
            <Text style={s.h2}>{section.heading}</Text>
            {section.paragraphs.map((paragraph, i) => (
              <Text key={i} style={s.p}>
                {paragraph}
              </Text>
            ))}
            {section.list && <Bullets items={section.list} />}
          </View>
        ))}
      </Sheet>
    </Page>
  );
}

// ---------------------------------------------------------------- tables

interface Column {
  label: string;
  width?: number;
  flex?: number;
}

function TableHeader({ columns }: { columns: Column[] }) {
  return (
    <View style={s.tableHead}>
      {columns.map((c) => (
        <Text key={c.label} style={[s.th, c.flex ? { flex: c.flex } : { width: c.width }]}>
          {c.label}
        </Text>
      ))}
    </View>
  );
}

function DataRow({ columns, cells }: { columns: Column[]; cells: (string | null)[] }) {
  return (
    <View style={s.tr} wrap={false}>
      {columns.map((c, i) => (
        <View key={c.label} style={c.flex ? { flex: c.flex, paddingRight: 6 } : { width: c.width, paddingRight: 6 }}>
          <Text style={i === 0 ? s.td : s.tdMuted}>{cells[i] ?? ""}</Text>
        </View>
      ))}
    </View>
  );
}

function BlankRows({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={[s.tr, { minHeight: 24 }]} />
      ))}
    </>
  );
}

/** A filled-or-blank table: real rows, always followed by a few ruled blank ones to keep writing in. */
function WorkingTable({ columns, rows, blankCount = 3 }: { columns: Column[]; rows: (string | null)[][]; blankCount?: number }) {
  return (
    <View style={{ marginTop: 10 }}>
      <TableHeader columns={columns} />
      {rows.map((cells, i) => (
        <DataRow key={i} columns={columns} cells={cells} />
      ))}
      <BlankRows count={blankCount} />
    </View>
  );
}

function dateLabel(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC" });
}

// -------------------------------------------------------------- document

export interface TripBookInputs {
  /** null renders every "your trip" section as its blank, sellable template. */
  trip: Trip | null;
  people: Person[];
  places: Place[];
  bookings: Booking[];
  documents: TravelDocument[];
  preparation: PreparationItem[];
  threads: Thread[];
  recordEntries: RecordEntry[];
  generatedAt: Date;
  size: Size;
}

export function TripBookDocument({
  trip,
  people,
  places,
  bookings,
  documents,
  preparation,
  threads,
  recordEntries,
  generatedAt,
  size,
}: TripBookInputs): React.ReactElement<DocumentProps> {
  const printed = generatedAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const activeBookings = byStartTime(bookings.filter((b) => b.status === "active"));
  const openThreads = threads.filter((t) => t.status === "open");
  const placeById = new Map(places.map((p) => [p.id, p.name]));

  const days = new Map<string, Booking[]>();
  for (const booking of activeBookings) {
    if (!booking.startsAt) continue;
    const key = booking.startsAt.slice(0, 10);
    const list = days.get(key) ?? [];
    list.push(booking);
    days.set(key, list);
  }

  return (
    <Document
      title={BOOK_TITLE}
      author="Draftpace"
      subject={trip ? `${BOOK_TITLE}: ${trip.title}` : BOOK_TITLE}
      creator="Travel Companion by Draftpace"
      producer="Travel Companion by Draftpace"
    >
      {/* ------------------------------------------------------- cover */}
      <Page size={size} style={s.bare}>
        <View style={{ flex: 1, backgroundColor: C.cream, paddingHorizontal: 58, paddingTop: 64, paddingBottom: 56 }}>
          <View style={s.spine} fixed />
          <Text style={{ fontSize: 7, letterSpacing: 2.2, color: C.amber, textTransform: "uppercase" }}>Draftpace</Text>

          {/* The mark: a route of waypoints, one of them arrived at. */}
          <View style={{ marginTop: 74, flexDirection: "row", alignItems: "center" }}>
            {Array.from({ length: 9 }, (_, i) => (
              <View key={i} style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: i === 4 ? 11 : 7,
                    height: i === 4 ? 11 : 7,
                    borderRadius: i === 4 ? 5.5 : 3.5,
                    borderWidth: i === 4 ? 0 : 0.9,
                    borderColor: C.amber,
                    opacity: i === 4 ? 1 : 0.35,
                    backgroundColor: i === 4 ? C.amber : "transparent",
                  }}
                />
                {i < 8 && <View style={{ width: 26, height: 0.8, backgroundColor: C.amber, opacity: 0.3 }} />}
              </View>
            ))}
          </View>

          <View style={{ flex: 1, justifyContent: "flex-end" }}>
            <View style={{ height: 1.5, backgroundColor: C.ink, marginBottom: 20 }} />
            <Text style={{ fontFamily: HEAD, fontSize: 52, lineHeight: 1.02, color: C.ink }}>
              My Trip{"\n"}Book
            </Text>
            {trip ? (
              <Text style={{ fontFamily: HEAD, fontSize: 15, color: C.body, marginTop: 14 }}>{trip.title}</Text>
            ) : (
              <Text style={{ fontFamily: HEAD, fontSize: 13, color: C.body, marginTop: 14, lineHeight: 1.5, maxWidth: 320 }}>
                {BOOK_SUBTITLE}
              </Text>
            )}
            {trip?.startsAt && trip?.endsAt && (
              <Text style={{ fontSize: 10, color: C.muted, marginTop: 8 }}>
                {trip.startsAt} to {trip.endsAt}
              </Text>
            )}
            <Text style={{ fontSize: 9, color: C.muted, marginTop: trip ? 8 : 26 }}>
              {trip ? `Printed ${printed}` : "Undated, so it starts whenever you do."}
            </Text>
          </View>
        </View>
      </Page>

      {/* ------------------------------------------------ how to use it */}
      <Page size={size} style={s.page}>
        <Sheet section="How to use this">
          <Text style={s.eyebrow}>Before anything else</Text>
          <Text style={s.h1}>Two halves, used differently.</Text>
          <View style={s.headRule} />
          <Text style={s.p}>
            The first half of this book is meant to be read once, before you go, probably in an evening. It is about
            travelling with less held in your head: what one change touches next, what is actually worth planning, and
            what to do on the day something goes wrong. It contains no itinerary and tells you nothing about what your
            trip should include.
          </Text>
          <Text style={s.p}>
            The second half is meant to be carried, written in, and referred back to mid-trip. Real bookings, if this
            copy has any, are followed by a few ruled blank lines, so the same page keeps working the moment your plans
            change.
          </Text>

          <Text style={s.h2}>What this book will not do</Text>
          <Text style={s.p}>
            It will not tell you where to go, what to book, or how long to stay. That is entirely your decision. Where
            it suggests anything at all, it says so plainly and gives you a way to ignore it.
          </Text>
          <Text style={s.p}>
            It will not invent a schedule for you. Every blank in the working pages stays blank until you write in it,
            and every filled line in a personalised copy came from something you actually recorded.
          </Text>

          <View style={[s.box, { marginTop: 20 }]}>
            <Text style={s.boxLabel}>If you also have the Companion</Text>
            <Text style={{ fontSize: 9.6, color: C.ink, marginTop: 6, lineHeight: 1.6 }}>
              Everything in the second half of this book has a place in the app: bookings, travellers, documents, and
              the record of what changed. Use whichever suits the moment. A change written here and typed up that
              evening is exactly as good as one entered live, and on some days paper is the only thing that will
              happen.
            </Text>
          </View>
        </Sheet>
      </Page>

      {/* ---------------------------------------------------- contents */}
      <Page size={size} style={s.page}>
        <Sheet section="Contents">
          <Text style={s.eyebrow}>Contents</Text>
          <Text style={s.h1}>What is in here.</Text>
          <View style={s.headRule} />

          <Text style={s.tocLabel}>Part one, the method</Text>
          {METHOD.map((chapter) => (
            <View key={chapter.number} style={{ paddingVertical: 4.5, borderBottomWidth: 0.5, borderBottomColor: C.ruleSoft }}>
              <Text style={{ fontSize: 10, color: C.ink }}>
                {chapter.number}   {chapter.title}
              </Text>
            </View>
          ))}

          <Text style={s.tocLabel}>Part two, your trip</Text>
          {[
            "Trip brief",
            "Travellers",
            "Destinations",
            "Transport, stays and reservations",
            "Documents",
            "Preparation",
            "The daily plan",
            "Notes and lessons",
            "Things left hanging",
          ].map((line) => (
            <View key={line} style={{ paddingVertical: 4.5, borderBottomWidth: 0.5, borderBottomColor: C.ruleSoft }}>
              <Text style={{ fontSize: 10, color: C.ink }}>{line}</Text>
            </View>
          ))}
        </Sheet>
      </Page>

      <Divider
        part="one"
        title="The method"
        blurb="Six short chapters on travelling with less held in your head, what one change touches next, and what to do on the day something goes wrong."
        size={size}
      />

      {METHOD.map((chapter) => (
        <MethodChapter key={chapter.number} chapter={chapter} size={size} />
      ))}

      <Divider
        part="two"
        title="Your trip"
        blurb={trip ? `Everything recorded for ${trip.title}, followed by room to keep writing.` : "Blank and undated, so it works for any trip. Real copies from the Companion look exactly like this, filled in."}
        size={size}
      />

      {/* -------------------------------------------------- trip brief */}
      <Page size={size} style={s.page}>
        <Sheet section="Trip brief">
          <Text style={s.eyebrow}>Working page</Text>
          <Text style={s.h1}>Trip brief</Text>
          <View style={s.headRule} />
          <View style={{ flexDirection: "row", marginBottom: 6 }}>
            <View style={{ flex: 1 }}>
              <Text style={s.writeLabel}>Trip name</Text>
              {trip ? <Text style={{ fontSize: 13, color: C.ink, marginTop: 8 }}>{trip.title}</Text> : <View style={s.writeLine} />}
            </View>
            <View style={{ flex: 1, marginLeft: 18 }}>
              <Text style={s.writeLabel}>Dates</Text>
              {trip?.startsAt || trip?.endsAt ? (
                <Text style={{ fontSize: 13, color: C.ink, marginTop: 8 }}>
                  {trip.startsAt ?? "?"} to {trip.endsAt ?? "?"}
                </Text>
              ) : (
                <View style={s.writeLine} />
              )}
            </View>
          </View>
          <Lines count={1} label="Where we are, right now" />
          <Lines count={1} label="What's next" />
          <Lines count={2} label="Important to remember" />
        </Sheet>
      </Page>

      {/* --------------------------------------------------- travellers */}
      <Page size={size} style={s.page}>
        <Sheet section="Travellers">
          <Text style={s.eyebrow}>Working page</Text>
          <Text style={s.h1}>Travellers</Text>
          <View style={s.headRule} />
          <Text style={s.p}>Who is on this trip, and anything worth knowing before you need it.</Text>
          <WorkingTable
            columns={[{ label: "Name", flex: 1.2 }, { label: "Relationship", flex: 1 }, { label: "Requirements", flex: 1.4 }]}
            rows={people.map((p) => [p.name, p.relationshipNote ?? (p.isChild ? "Child" : ""), p.requirements ?? ""])}
            blankCount={people.length > 0 ? 3 : 6}
          />
        </Sheet>
      </Page>

      {/* -------------------------------------------------- destinations */}
      <Page size={size} style={s.page}>
        <Sheet section="Destinations">
          <Text style={s.eyebrow}>Working page</Text>
          <Text style={s.h1}>Destinations</Text>
          <View style={s.headRule} />
          <WorkingTable
            columns={[{ label: "Place", flex: 1.4 }, { label: "Arrives", flex: 1 }, { label: "Departs", flex: 1 }]}
            rows={places.map((p) => [p.name, p.arrivesAt ?? "", p.departsAt ?? ""])}
            blankCount={places.length > 0 ? 3 : 6}
          />
        </Sheet>
      </Page>

      {/* ------------------------------------------------------ bookings */}
      <Page size={size} style={s.page}>
        <Sheet section="Transport, stays and reservations">
          <Text style={s.eyebrow}>Working page</Text>
          <Text style={s.h1}>Transport, stays and reservations</Text>
          <View style={s.headRule} />
          <Text style={s.p}>Every flight, stay and reservation, one row each, with room to add what comes up.</Text>
          <WorkingTable
            columns={[
              { label: "Kind", width: 62 },
              { label: "Title", flex: 1.3 },
              { label: "Reference", flex: 0.9 },
              { label: "Date", flex: 0.9 },
            ]}
            rows={activeBookings.map((b) => [
              BOOKING_KIND_LABELS[b.kind] ?? b.kind,
              b.title,
              b.reference ?? "",
              b.startsAt ? timeLabel(b.startsAt) : "",
            ])}
            blankCount={activeBookings.length > 0 ? 4 : 10}
          />
        </Sheet>
      </Page>

      {/* ----------------------------------------------------- documents */}
      <Page size={size} style={s.page}>
        <Sheet section="Documents">
          <Text style={s.eyebrow}>Working page, a registry, never a copy of the document itself</Text>
          <Text style={s.h1}>Documents</Text>
          <View style={s.headRule} />
          <Text style={s.p}>What exists, and where it actually is. Not the documents themselves, just enough to find them fast.</Text>
          <WorkingTable
            columns={[{ label: "Document", flex: 1 }, { label: "Belongs to", flex: 0.8 }, { label: "Where it's kept", flex: 1.4 }]}
            rows={documents.map((d) => [d.label, people.find((p) => p.id === d.personId)?.name ?? "", d.keptWhere ?? ""])}
            blankCount={documents.length > 0 ? 3 : 6}
          />
        </Sheet>
      </Page>

      {/* --------------------------------------------------- preparation */}
      <Page size={size} style={s.page}>
        <Sheet section="Preparation">
          <Text style={s.eyebrow}>Working page</Text>
          <Text style={s.h1}>Preparation</Text>
          <View style={s.headRule} />
          <Text style={s.p}>What needs doing before you go, by category. Tick it off, or write your own under any heading.</Text>
          {Object.entries(PREPARATION_CATEGORY_LABELS).map(([key, label]) => {
            const items = preparation.filter((p) => p.category === key);
            return (
              <View key={key} wrap={false} style={{ marginTop: 12 }}>
                <Text style={{ fontSize: 8.6, letterSpacing: 0.8, color: C.amber, textTransform: "uppercase" }}>{label}</Text>
                {items.map((item) => (
                  <View key={item.id} style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        borderWidth: 0.9,
                        borderColor: C.amberMid,
                        backgroundColor: item.completionStatus === "done" ? C.amberMid : "transparent",
                        marginRight: 8,
                      }}
                    />
                    <Text style={{ fontSize: 9.4, color: item.completionStatus === "done" ? C.muted : C.ink }}>{item.title}</Text>
                  </View>
                ))}
                {Array.from({ length: items.length > 0 ? 1 : 2 }, (_, i) => (
                  <View key={i} style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
                    <View style={{ width: 10, height: 10, borderWidth: 0.9, borderColor: C.write, marginRight: 8 }} />
                    <View style={{ flex: 1, borderBottomWidth: 0.7, borderBottomColor: C.write, height: 12 }} />
                  </View>
                ))}
              </View>
            );
          })}
        </Sheet>
      </Page>

      {/* ---------------------------------------------------- daily plan */}
      <Page size={size} style={s.page}>
        <Sheet section="The daily plan">
          <Text style={s.eyebrow}>Working page, print as many as you need</Text>
          <Text style={s.h1}>The daily plan</Text>
          <View style={s.headRule} />
          {days.size > 0 ? (
            Array.from(days.entries()).map(([date, dayBookings]) => (
              <View key={date} wrap={false} style={{ marginBottom: 10 }}>
                <Text style={{ fontSize: 9, color: C.ink, marginTop: 8, marginBottom: 3 }}>{dateLabel(date)}</Text>
                {dayBookings.map((b) => (
                  <Text key={b.id} style={{ fontSize: 9, color: C.body, marginBottom: 1.5, paddingLeft: 10 }}>
                    {timeLabel(b.startsAt as string)}   {b.title}
                    {b.placeId && placeById.get(b.placeId) ? `, ${placeById.get(b.placeId)}` : ""}
                  </Text>
                ))}
              </View>
            ))
          ) : (
            <>
              <Text style={s.p}>One block per day. Write the shape of it as you go, not all at once before you leave.</Text>
              {Array.from({ length: 6 }, (_, i) => (
                <View key={i} wrap={false} style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: "row", alignItems: "flex-end", marginBottom: 4 }}>
                    <Text style={{ fontSize: 8.4, color: C.faint, textTransform: "uppercase", letterSpacing: 0.7 }}>Day</Text>
                    <View style={{ width: 90, borderBottomWidth: 0.7, borderBottomColor: C.write, height: 16, marginLeft: 6 }} />
                  </View>
                  <View style={s.writeLine} />
                  <View style={s.writeLine} />
                </View>
              ))}
            </>
          )}
        </Sheet>
      </Page>

      {/* ------------------------------------------------ notes/lessons */}
      <Page size={size} style={s.page}>
        <Sheet section="Notes and lessons">
          <Text style={s.eyebrow}>Working page, the one you will reread</Text>
          <Text style={s.h1}>Notes and lessons</Text>
          <View style={s.headRule} />
          <Text style={s.p}>
            What happened, and what is worth knowing next time. Write these the day they happen; nobody has ever
            successfully reconstructed one from memory a month later.
          </Text>
          {recordEntries.length > 0 && (
            <View style={{ marginTop: 8 }}>
              {recordEntries.map((entry) => (
                <View key={entry.id} wrap={false} style={{ marginBottom: 8 }}>
                  <Text style={{ fontSize: 7.6, letterSpacing: 0.6, color: C.faint, textTransform: "uppercase" }}>
                    {entry.category}
                    {entry.placeName ? `, ${entry.placeName}` : ""}
                  </Text>
                  <Text style={{ fontSize: 9.4, color: C.ink, marginTop: 2 }}>{entry.body}</Text>
                </View>
              ))}
            </View>
          )}
          <View style={{ marginTop: 10 }}>
            {Array.from({ length: recordEntries.length > 0 ? 4 : 9 }, (_, i) => (
              <View key={i} wrap={false} style={{ marginBottom: 12 }}>
                <View style={s.writeLine} />
              </View>
            ))}
          </View>
        </Sheet>
      </Page>

      {/* ------------------------------------------------ open threads */}
      <Page size={size} style={s.page}>
        <Sheet section="Things left hanging">
          <Text style={s.eyebrow}>Working page</Text>
          <Text style={s.h1}>Things left hanging</Text>
          <View style={s.headRule} />
          <Text style={s.p}>
            Anything you are waiting to hear back on. The moment it is sorted, cross it off, it does not need to survive
            past the trip.
          </Text>
          {openThreads.length > 0 && (
            <View style={{ marginTop: 6 }}>
              {openThreads.map((t) => (
                <View key={t.id} style={{ flexDirection: "row", alignItems: "flex-start", marginTop: 8 }} wrap={false}>
                  <View style={{ width: 10, height: 10, borderWidth: 0.9, borderColor: C.amberMid, marginRight: 8, marginTop: 2 }} />
                  <Text style={{ fontSize: 9.4, color: C.ink, flex: 1 }}>{t.title}</Text>
                </View>
              ))}
            </View>
          )}
          <View style={{ marginTop: 10 }}>
            {Array.from({ length: openThreads.length > 0 ? 3 : 8 }, (_, i) => (
              <View key={i} style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                <View style={{ width: 10, height: 10, borderWidth: 0.9, borderColor: C.write, marginRight: 8 }} />
                <View style={{ flex: 1, borderBottomWidth: 0.7, borderBottomColor: C.write, height: 14 }} />
              </View>
            ))}
          </View>
        </Sheet>
      </Page>

      {/* -------------------------------------------------- colophon */}
      <Page size={size} style={s.page}>
        <Sheet section="About this book">
          <Text style={s.eyebrow}>Last page</Text>
          <Text style={s.h1}>About this book.</Text>
          <View style={s.headRule} />
          <Text style={s.p}>
            My Trip Book is one half of Travel Companion. The other half is an app that remembers what you booked, what
            changed, and what still needs a look, and can turn any trip in it into a personalised copy of exactly this
            book, filled in.
          </Text>
          <Text style={s.p}>
            Neither half needs the other. This book works with a pen and nothing else, and the app works if you never
            print a page. Most trips end up using both, on different days, for different reasons.
          </Text>
          <Text style={s.p}>
            Nothing in this book was generated. Every sentence in the method chapters was written by a person, and
            there is no model involved anywhere in this product.
          </Text>
          <View style={[s.box, { marginTop: 18 }]}>
            <Text style={s.boxLabel}>One thing to remember</Text>
            <Text style={{ fontFamily: HEAD, fontSize: 13, color: C.ink, marginTop: 7, lineHeight: 1.5 }}>
              Nothing in a trip stands alone. The moment you know what depends on what, most of what goes wrong stops
              being a crisis and starts being a list.
            </Text>
          </View>
          <Text style={{ fontSize: 8.4, color: C.faint, marginTop: 24 }}>My Trip Book. Draftpace. Undated by design.</Text>
        </Sheet>
      </Page>
    </Document>
  );
}

/**
 * My Homeschool Record.
 *
 * One child, on paper, generated in the parent's own browser so the
 * assembled picture of a child's education never exists on a server.
 * Same discipline as Personal Life Affairs Companion's own document and
 * for a stronger reason: this one is about a minor.
 *
 * WHAT THIS DOCUMENT IS, AND SAYS IT IS
 *
 * A record of what was done, kept by a parent. Not an assessment, not a
 * transcript, and it makes no claim about how any of it went. That
 * sentence is on the cover, because the person receiving it may well
 * expect a school report and should find out in the first three seconds
 * that this is a different kind of thing.
 *
 * There is no score anywhere, no percentage, no comparison, and no
 * summary of the child. What it contains is dates, subjects, and the
 * parent's own words.
 *
 * Plum and ink, matching the product. No em dashes, per the repo rule.
 */
import { Document, Page, View, Text, StyleSheet, type DocumentProps } from "@react-pdf/renderer";
import { BOOK_DISCLAIMER, describeBook, describePeriod, SOURCE_ON_PAPER, stateComplianceRows, type Book } from "../book";

const C = {
  paper: "#fbfaf7",
  ink: "#1a1d24",
  body: "#3b3f49",
  muted: "#666b77",
  faint: "#949aa6",
  rule: "#e3e0d8",
  ruleSoft: "#efece5",
  plum: "#6a4a72",
  plumSoft: "#f0eaf1",
};

const HEAD = "Newsreader";
const BODY = "PlexSans";
const M = { top: 56, bottom: 52, side: 54 };

const s = StyleSheet.create({
  page: {
    paddingTop: M.top,
    paddingBottom: M.bottom,
    paddingHorizontal: M.side,
    backgroundColor: C.paper,
    color: C.body,
    fontFamily: BODY,
    fontSize: 9.5,
    lineHeight: 1.55,
  },
  cover: { backgroundColor: C.paper, fontFamily: BODY },
  spine: { position: "absolute", top: 0, left: 0, right: 0, height: 3, backgroundColor: C.plum },
  runningHead: {
    position: "absolute",
    top: 26,
    left: M.side,
    right: M.side,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
    letterSpacing: 1.1,
    color: C.faint,
    textTransform: "uppercase",
  },
  folio: { position: "absolute", bottom: 24, right: M.side, fontSize: 7.5, color: C.faint },
  folioRule: { position: "absolute", bottom: 38, left: M.side, right: M.side, height: 0.5, backgroundColor: C.ruleSoft },
  eyebrow: { fontSize: 7, letterSpacing: 1.4, color: C.plum, textTransform: "uppercase" },
  h1: { fontFamily: HEAD, fontSize: 22, color: C.ink, marginTop: 6 },
  headRule: { height: 1, backgroundColor: C.ink, marginTop: 10, marginBottom: 16 },
  p: { fontSize: 9.5, color: C.body, marginBottom: 8, lineHeight: 1.6 },
  sectionLabel: { fontSize: 7, letterSpacing: 1.2, color: C.faint, textTransform: "uppercase", marginTop: 16 },
  row: { paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: C.ruleSoft },
  rowTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  rowTitle: { fontSize: 10.5, color: C.ink, flex: 1, paddingRight: 12 },
  tag: { fontSize: 6.6, letterSpacing: 0.7, textTransform: "uppercase", color: C.plum, fontWeight: 700 },
  note: { fontSize: 8.6, color: C.muted, marginTop: 2.5 },
  dayLabel: { fontSize: 9, color: C.ink, marginTop: 12, marginBottom: 3 },
  entry: { fontSize: 9, color: C.body, marginBottom: 1.5, paddingLeft: 10 },
  quote: { fontSize: 9.2, color: C.body, marginTop: 5, paddingLeft: 10, borderLeftWidth: 1.2, borderLeftColor: C.plumSoft },
});

function formatDay(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function Sheet({ section, children }: { section: string; children: React.ReactNode }) {
  return (
    <>
      <View style={s.spine} fixed />
      <View style={s.runningHead} fixed>
        <Text>My Homeschool Record</Text>
        <Text>{section}</Text>
      </View>
      {children}
      <View style={s.folioRule} fixed />
      <Text style={s.folio} fixed render={({ pageNumber }) => String(pageNumber)} />
    </>
  );
}

export interface DocumentInputs {
  book: Book;
  size: "LETTER" | "A4";
}

export function HomeschoolRecordDocument({ book, size }: DocumentInputs): React.ReactElement<DocumentProps> {
  const period = describePeriod(book);
  const printed = book.generatedAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const title = book.name ? `${book.name}'s homeschool record` : "My Homeschool Record";

  return (
    <Document title="My Homeschool Record" author={book.name ?? "Homeschooling Companion"} subject={title}>
      <Page size={size} style={s.cover}>
        <View style={{ flex: 1, paddingTop: 58, paddingBottom: 52, paddingHorizontal: 54 }}>
          <View style={s.spine} fixed />
          <Text style={{ fontSize: 6.8, letterSpacing: 1.6, color: C.plum, textTransform: "uppercase" }}>
            Homeschooling Companion
          </Text>

          <View style={{ marginTop: 66 }}>
            {[168, 214, 190, 146, 232, 176, 204].map((width, i) => (
              <View
                key={width}
                style={{
                  width,
                  height: i === 3 ? 1.6 : 0.8,
                  backgroundColor: C.plum,
                  opacity: i === 3 ? 1 : 0.3,
                  marginBottom: 13,
                }}
              />
            ))}
          </View>

          <View style={{ flex: 1, justifyContent: "flex-end", paddingBottom: 30 }}>
            <View style={{ height: 1.5, backgroundColor: C.ink, marginBottom: 18 }} />
            {/* The document's own name. It came off the Personal Life
                Affairs Companion's cover in a copy and paste and said
                "My Affairs" for about four minutes. */}
            <Text style={{ fontFamily: HEAD, fontSize: 40, lineHeight: 1.05, color: C.ink }}>
              My Homeschool{"\n"}Record
            </Text>
            {book.name && (
              <Text style={{ fontFamily: HEAD, fontSize: 15, color: C.body, marginTop: 12 }}>For {book.name}</Text>
            )}
            {period && <Text style={{ fontSize: 10, color: C.muted, marginTop: 12 }}>{period}</Text>}
            <Text style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>Printed {printed}</Text>
          </View>

          <View
            style={{
              borderLeftWidth: 2.5,
              borderLeftColor: C.plum,
              backgroundColor: C.plumSoft,
              paddingVertical: 12,
              paddingHorizontal: 15,
            }}
          >
            <Text style={{ fontSize: 6.8, letterSpacing: 1.3, color: C.plum, textTransform: "uppercase" }}>
              About this record
            </Text>
            <Text style={{ fontSize: 9.5, color: C.ink, marginTop: 5, lineHeight: 1.55 }}>{BOOK_DISCLAIMER}</Text>
            <Text style={{ fontSize: 8.5, color: C.muted, marginTop: 5 }}>{describeBook(book)}</Text>
          </View>
        </View>
      </Page>

      {book.stateRequirement?.checklist && (
        <Page size={size} style={s.page}>
          <Sheet section="What your state asks for">
            <Text style={s.eyebrow}>{book.stateRequirement.state}, {book.stateRequirement.level} regulation</Text>
            <Text style={s.h1}>What your state asks for.</Text>
            <View style={s.headRule} />
            <Text style={s.p}>{book.stateRequirement.note}.</Text>
            <Text style={{ fontSize: 8.4, color: C.faint, marginTop: -4, marginBottom: 8 }}>
              Laws change. Confirm with your state before relying on this.
            </Text>
            {stateComplianceRows(book).map((row) => (
              <View key={row.label} style={s.row} wrap={false}>
                <View style={s.rowTop}>
                  <Text style={s.rowTitle}>{row.label}</Text>
                  <Text style={row.recorded ? s.tag : [s.tag, { color: C.faint }]}>
                    {row.recorded ?? "Nothing recorded yet"}
                  </Text>
                </View>
              </View>
            ))}
            {book.stateRequirement.checklist.otherNotes.length > 0 && (
              <Text style={{ fontSize: 8.6, color: C.muted, marginTop: 10, lineHeight: 1.55 }}>
                {book.stateRequirement.checklist.otherNotes.join(" ")}
              </Text>
            )}
            <Text style={{ fontSize: 8.4, color: C.faint, marginTop: 12, lineHeight: 1.5 }}>
              This says what is recorded, not whether it is enough. What your state actually requires is worth
              confirming at the source.
            </Text>
          </Sheet>
        </Page>
      )}

      {book.subjects.length > 0 && (
        <Page size={size} style={s.page}>
          <Sheet section="What was being learned">
            <Text style={s.eyebrow}>What was being learned</Text>
            <Text style={s.h1}>Subjects</Text>
            <View style={s.headRule} />
            {book.subjects.map((subject) => (
              <View key={subject.subject} style={s.row} wrap={false}>
                <View style={s.rowTop}>
                  <Text style={s.rowTitle}>{subject.subject}</Text>
                  {/* Where it came from, in words a stranger can read.
                      "Draftpace suggestion" is right on screen for the
                      parent who chose it and means nothing here. */}
                  <Text style={s.tag}>{SOURCE_ON_PAPER[subject.source]}</Text>
                </View>
                {subject.curriculumTitle && <Text style={s.note}>{subject.curriculumTitle}</Text>}
                {subject.position && <Text style={s.note}>At {subject.position}</Text>}
                {subject.topics.length > 0 ? (
                  <Text style={s.note}>Covering: {subject.topics.join(", ")}</Text>
                ) : (
                  !subject.curriculumTitle && (
                    <Text style={s.note}>No topics recorded against this one.</Text>
                  )
                )}
              </View>
            ))}
          </Sheet>
        </Page>
      )}

      {book.days.length > 0 && (
        <Page size={size} style={s.page}>
          <Sheet section="What was done">
            <Text style={s.eyebrow}>What was done</Text>
            <Text style={s.h1}>The log</Text>
            <View style={s.headRule} />
            {book.days.map((day) => (
              <View key={day.date} wrap={false}>
                <Text style={s.dayLabel}>{formatDay(day.date)}</Text>
                {day.entries.map((entry, index) => (
                  <Text key={`${day.date}-${index}`} style={s.entry}>
                    {entry.title}
                    {entry.detail ? `  ${entry.detail}` : ""}
                  </Text>
                ))}
              </View>
            ))}
          </Sheet>
        </Page>
      )}

      {book.observations.length > 0 && (
        <Page size={size} style={s.page}>
          <Sheet section="Notes">
            <Text style={s.eyebrow}>Written at the time</Text>
            <Text style={s.h1}>Notes</Text>
            <View style={s.headRule} />
            <Text style={s.p}>
              Only the notes the parent chose to include. Anything they kept private is not here and never was.
            </Text>
            {book.observations.map((observation, index) => (
              <View key={`${observation.date}-${index}`} wrap={false}>
                <Text style={s.dayLabel}>{formatDay(observation.date)}</Text>
                <Text style={s.quote}>{observation.note}</Text>
              </View>
            ))}
          </Sheet>
        </Page>
      )}

      {book.checks.length > 0 && (
        <Page size={size} style={s.page}>
          <Sheet section="Checks">
            <Text style={s.eyebrow}>Short checks run at home</Text>
            <Text style={s.h1}>Checks</Text>
            <View style={s.headRule} />
            <Text style={s.p}>
              These were short checks a parent ran at home, using their own questions. They are not tests, they were not
              marked to any standard, and they say what came back on one day about one topic. Where there was not
              enough to say anything, that is what they say.
            </Text>
            {book.checks.map((check, index) => (
              <View key={`${check.date}-${index}`} style={s.row} wrap={false}>
                <View style={s.rowTop}>
                  <Text style={s.rowTitle}>{check.label}</Text>
                  <Text style={s.tag}>{check.standing}</Text>
                </View>
                <Text style={s.note}>
                  {formatDay(check.date)}
                  {check.answered > 0 ? `, ${check.answered} questions answered` : ""}
                </Text>
              </View>
            ))}
          </Sheet>
        </Page>
      )}
    </Document>
  );
}

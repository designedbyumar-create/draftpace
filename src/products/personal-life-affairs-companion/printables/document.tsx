/**
 * The Personal Life Affairs Companion's printed book.
 *
 * Three variants from one generator, driven by real state:
 *
 *   blank        Only the sections that apply to this person, empty. The
 *                paper path, and the thing no 300-page binder can do.
 *   inProgress   What is settled and what is not, gaps still visible.
 *   verified     The handover copy, with confirmation dates.
 *
 * The variant is not a mode switch: it falls out of what is passed in.
 * An empty records array is a blank; a full one is a handover copy. That
 * keeps the three from drifting apart, which is what happens when a
 * "blank template" and a "filled export" are written separately.
 *
 * THE RULE THIS FILE EXISTS TO KEEP: the document never overstates
 * itself. It is downloadable at any moment, so somebody could hand over
 * a copy at 40% and the family must be able to tell. Every section
 * carries its standing, and confirmed sections carry the date the person
 * last said the fact was still true.
 *
 * Ink and brass, matching the product. Brass marks confirmation and
 * nothing else, so on paper it becomes the colour of what you can rely
 * on.
 *
 * WHAT THE DOCUMENT CALLS ITSELF
 *
 * "My Affairs", and never the name of the software that made it. A
 * person hands this to somebody at a moment when it is the only thing
 * they have, and a product name across the top of every page would make
 * it read as an export from an app rather than as their own document.
 * The Companion is named once, quietly, on the cover and in the
 * colophon: enough to say where it came from and how to keep it current,
 * not enough to put a brand between the reader and the contents.
 *
 * "In Order" survives as the slug and the pla_ table prefix. It appears
 * nowhere a person can see.
 *
 * No em dashes anywhere, per the repo content rule.
 */
import { Document, Page, View, Text, StyleSheet, type DocumentProps } from "@react-pdf/renderer";
import { AFFAIR_AREA_LABEL, AFFAIR_AREA_ORDER, type AffairArea } from "../affairsKnowledge";
import { BOOK_ATTRIBUTION, BOOK_NAME, isBlankCopy } from "../completion";
import { findableHandoffScenarios } from "../handoff";
import { captureFor } from "../capture";
import type { Readiness, StandingRow, StepStanding } from "../completion";
import type { AffairItem } from "../lifeAffairs";

const C = {
  paper: "#fbfaf7",
  ink: "#1a1d24",
  body: "#3b3f49",
  muted: "#666b77",
  faint: "#949aa6",
  rule: "#e3e0d8",
  ruleSoft: "#efece5",
  deep: "#26374f",
  deepSoft: "#e6eaf0",
  brass: "#9a7b3f",
  brassSoft: "#f6efe0",
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
  cover: { backgroundColor: C.paper, color: C.body, fontFamily: BODY },
  spine: { position: "absolute", top: 0, left: 0, right: 0, height: 3, backgroundColor: C.deep },
  runningHead: {
    position: "absolute",
    top: 24,
    left: M.side,
    right: M.side,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 6.8,
    letterSpacing: 1.1,
    color: C.faint,
    textTransform: "uppercase",
  },
  folio: { position: "absolute", bottom: 24, right: M.side, fontSize: 7.5, color: C.faint },
  folioRule: { position: "absolute", bottom: 38, left: M.side, right: M.side, height: 0.5, backgroundColor: C.ruleSoft },

  eyebrow: { fontSize: 6.8, letterSpacing: 1.6, color: C.deep, textTransform: "uppercase" },
  h1: { fontFamily: HEAD, fontSize: 25, lineHeight: 1.14, marginTop: 6, marginBottom: 9, color: C.ink },
  lede: { fontFamily: HEAD, fontSize: 11.5, lineHeight: 1.55, color: C.body, marginBottom: 15 },
  headRule: { height: 1.25, backgroundColor: C.ink, marginBottom: 13 },
  p: { marginBottom: 7 },

  row: { paddingVertical: 18 },
  rowRule: { borderBottomWidth: 0.5, borderBottomColor: C.ruleSoft },
  rowTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  instruction: { fontSize: 10.5, color: C.ink, flex: 1, paddingRight: 12 },
  standing: { fontSize: 6.6, letterSpacing: 0.7, textTransform: "uppercase", fontWeight: 700 },
  answerLine: { borderBottomWidth: 0.7, borderBottomColor: C.rule, height: 16, marginTop: 1 },
  note: { fontSize: 8.4, color: C.muted, marginTop: 3 },
  // A record, set as a small block rather than a table row: what it is,
  // then who or where, then what somebody should do about it.
  record: { marginTop: 6, paddingLeft: 10, borderLeftWidth: 1.2, borderLeftColor: C.deepSoft },
  recordLabel: { fontSize: 10, color: C.ink },
  recordDetail: { fontSize: 9, color: C.body, marginTop: 1.5 },
  recordNote: { fontSize: 8.8, color: C.muted, marginTop: 2.5 },
  recordMeta: { fontSize: 7.6, color: C.faint, marginTop: 3 },
  fieldLabel: { fontSize: 7.4, letterSpacing: 0.5, textTransform: "uppercase", color: C.faint, marginTop: 4 },
  promptLine: { fontSize: 8.4, color: C.muted, marginTop: 26 },
  missingNote: {
    fontSize: 8.4,
    color: C.faint,
    lineHeight: 1.55,
    marginTop: 18,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: C.ruleSoft,
  },
  doneLine: { flexDirection: "row", alignItems: "flex-end", marginTop: 9 },
});

const STANDING_LABEL: Record<StepStanding, string> = {
  established: "Recorded",
  done: "Done",
  recordedWithoutDetail: "No detail kept",
  worthRechecking: "Worth checking",
  notApplicable: "Not applicable",
  leftOpen: "Left open",
  unsure: "Not settled",
  notAddressed: "Nothing recorded",
};

const STANDING_COLOR: Record<StepStanding, string> = {
  established: C.brass,
  done: C.brass,
  recordedWithoutDetail: C.muted,
  worthRechecking: C.deep,
  notApplicable: C.faint,
  leftOpen: C.muted,
  unsure: C.muted,
  notAddressed: C.faint,
};

/**
 * How a field name reads on paper. The open fields bag holds keys chosen
 * for code; the person reading this has never seen them.
 */
const FIELD_LABEL: Record<string, string> = {
  relationship: "Relationship",
  role: "What they do",
  provider: "Provider",
  purpose: "What it is for",
  renewalMonth: "Renews",
  animals: "Animals",
  tenure: "Owned or rented",
  exists: "In place",
  usesOne: "In use",
  prepaid: "Already arranged",
  copyHeldBy: "Copy also held by",
  openableBy: "Can be opened by",
  namedToReceive: "Named to receive it",
  shouldGoTo: "Should go to",
  writtenFor: "Written for",
  otherCarers: "Others involved in their care",
  discussed: "Talked about it",
};

function fieldLabel(key: string): string {
  return FIELD_LABEL[key] ?? key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}

/** "a, b and c", so a closing line reads as a sentence rather than a list. */
function listSentence(parts: string[]): string {
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

// Imported rather than restated, so a new domain cannot be added to the
// knowledge base and silently omitted from the printed book.
const AREA_ORDER: AffairArea[] = AFFAIR_AREA_ORDER;

function Sheet({ section, children }: { section: string; children: React.ReactNode }) {
  return (
    <>
      <View style={s.spine} fixed />
      <View style={s.runningHead} fixed>
        <Text>{BOOK_NAME}</Text>
        <Text>{section}</Text>
      </View>
      {children}
      <View style={s.folioRule} fixed />
      <Text style={s.folio} fixed render={({ pageNumber }) => String(pageNumber)} />
    </>
  );
}

/**
 * One established record, printed as knowledge.
 *
 * This is the reason the rewrite happened. The previous version printed
 * an instruction, the word CONFIRMED and a date, which told a family
 * that somebody had pressed a button and nothing whatsoever about where
 * anything was. Everything below is the person's own words.
 */
function RecordBlock({ item }: { item: AffairItem }) {
  const contact = item.personContact;
  const extras = Object.entries(item.fields).filter(([, value]) => value.trim().length > 0);
  const confirmed = formatDate(item.lastConfirmedAt ?? item.establishedAt);

  return (
    <View style={s.record} wrap={false}>
      <Text style={s.recordLabel}>{item.label}</Text>
      {item.personName && item.personName !== item.label && (
        <Text style={s.recordDetail}>{item.personName}</Text>
      )}
      {extras.map(([key, value]) => (
        <Text key={key} style={s.recordDetail}>
          {fieldLabel(key)}: {value}
        </Text>
      ))}
      {contact && <Text style={s.recordDetail}>Contact: {contact}</Text>}
      {item.whereabouts && <Text style={s.recordDetail}>Where: {item.whereabouts}</Text>}
      {item.notes && <Text style={s.recordNote}>{item.notes}</Text>}
      <Text style={s.recordMeta}>
        {item.status === "incomplete" ? "Partly recorded. " : ""}
        {confirmed ? `Last confirmed ${confirmed}` : "No date recorded"}
      </Text>
    </View>
  );
}

/**
 * One step. In a blank copy it is the question the app would ask, with a
 * line to write on. In a filled one it is whatever the person actually
 * told us, and where they told us nothing, it says so rather than
 * pretending.
 */
function StepRow({ row, blank }: { row: StandingRow; blank: boolean }) {
  const spec = captureFor(row.step.key);

  if (blank) {
    // The blank copy asks the same questions the companion asks, drawn
    // from the same specs, so a person who fills in the paper and a
    // person who uses the app end up having answered the same things.
    const prompts = spec ? spec.prompts.filter((p) => !p.askIf) : [];
    return (
      <View style={s.row} wrap={false}>
        <View style={s.rowTop}>
          <Text style={s.instruction}>{row.step.instruction}</Text>
        </View>
        <Text style={s.note}>{row.step.why}</Text>
        {prompts.length > 0 ? (
          prompts.map((prompt) => (
            <View key={prompt.field} wrap={false}>
              <Text style={s.promptLine}>{prompt.prompt}</Text>
              <View style={s.answerLine} />
            </View>
          ))
        ) : (
          /*
            An action step has nothing to write down, because it happens
            somewhere else. A blank ruled line under it invites an answer
            that does not exist. What a person actually wants on paper is
            somewhere to note that they did it.
          */
          <View style={s.doneLine}>
            <Text style={{ fontSize: 8.4, color: C.muted, paddingRight: 8 }}>Done on</Text>
            <View style={{ flex: 1, borderBottomWidth: 0.7, borderBottomColor: C.rule, height: 14 }} />
          </View>
        )}
      </View>
    );
  }

  const date = formatDate(row.confirmedAt);
  return (
    <View style={[s.row, s.rowRule]} wrap={false}>
      <View style={s.rowTop}>
        {/*
          The fact, not the instruction that produced it. A stranger
          reading "Write down who should be called first" above a name
          reads it as a job they have been given, which turns a handoff
          document back into somebody else's to-do list.
        */}
        <Text style={s.instruction}>{row.step.bookLabel}</Text>
        <Text style={[s.standing, { color: STANDING_COLOR[row.standing] }]}>{STANDING_LABEL[row.standing]}</Text>
      </View>
      {row.items.length > 0 ? (
        row.items.map((item) => <RecordBlock key={item.id} item={item} />)
      ) : row.standing === "recordedWithoutDetail" ? (
        <Text style={s.note}>
          Confirmed{date ? ` ${date}` : ""}, before the details were being kept. Nothing was written down.
        </Text>
      ) : row.standing === "done" ? (
        <Text style={s.note}>Confirmed{date ? ` on ${date}` : ""}.</Text>
      ) : row.standing === "unsure" ? (
        <Text style={s.note}>They were not sure yet, and said so rather than guessing.</Text>
      ) : null}
    </View>
  );
}

export interface DocumentInputs {
  size: "LETTER" | "A4";
  /** The person's name, printed on the cover. Empty is allowed and simply omitted. */
  preparedBy: string;
  readiness: Readiness;
  generatedAt: Date;
}

export function InOrderDocument({
  size,
  preparedBy,
  readiness,
  generatedAt,
}: DocumentInputs): React.ReactElement<DocumentProps> {
  const blank = isBlankCopy(readiness);
  const generated = formatDate(generatedAt.toISOString());
  const oldest = formatDate(readiness.oldestConfirmedAt);

  const byArea = AREA_ORDER.map((area) => {
    const rows = readiness.rows.filter((r) => r.step.area === area);
    return {
      area,
      // Rows carrying something: a record, or a decision the person made
      // deliberately. These are what the reader can actually use.
      rows: blank ? rows : rows.filter((r) => r.standing !== "notAddressed"),
      // The rest, named once in a closing line rather than listed.
      missing: blank ? [] : rows.filter((r) => r.standing === "notAddressed"),
    };
  }).filter((group) => group.rows.length > 0);

  /**
   * The standings this copy actually prints, for the legend. Built from
   * the rows that survive the filter above rather than from all of them,
   * so the legend can never explain a mark the reader will not find.
   */
  const present = new Set(byArea.flatMap((group) => group.rows).map((r) => r.standing));

  /**
   * Which of the Handoff Check's real-world scenarios this copy can
   * actually answer. A scenario's requirements all sit in one area (the
   * shared key prefix, e.g. "people.emergency-contact"), so the area a
   * scenario points to is read straight off its first requirement rather
   * than duplicated as separate data.
   *
   * Deliberately not a re-implementation of deriveHandoff's clarity
   * check: that would risk drifting from the in-app Handoff Check over
   * time. Instead this asks a narrower, purely structural question that
   * cannot drift, because it is answered from the same byArea this page
   * already prints from: did this section survive into this copy at
   * all. A thin or missing section is its own honest answer once the
   * reader turns to it.
   */
  const printedAreas = new Set(byArea.map((group) => group.area));
  const findableScenarios = findableHandoffScenarios(printedAreas).map((entry) => ({
    need: entry.need,
    sectionLabel: AFFAIR_AREA_LABEL[entry.area],
  }));

  return (
    <Document
      /*
        The title is what a file manager, a print dialogue and a screen
        reader announce. It is the document's name, not the software's.
      */
      title={BOOK_NAME}
      author={preparedBy.trim().length > 0 ? preparedBy.trim() : BOOK_ATTRIBUTION}
      subject="Everything the people you love would need to find"
      creator={`${BOOK_ATTRIBUTION} by Draftpace`}
      producer={`${BOOK_ATTRIBUTION} by Draftpace`}
    >
      <Page size={size} style={s.cover}>
        <View style={{ flex: 1, paddingTop: 58, paddingBottom: 52, paddingHorizontal: 54 }}>
          <View style={s.spine} fixed />
          <Text style={{ fontSize: 6.8, letterSpacing: 1.6, color: C.deep, textTransform: "uppercase" }}>
            {BOOK_ATTRIBUTION}
          </Text>

          {/*
            The mark. A column of rules with one picked out in brass:
            a list, and the one thing that matters next. That is the
            product in a single figure, and it says "written down, in
            order" without being literal about anything heavier.
          */}
          <View style={{ marginTop: 66 }}>
            {[168, 214, 190, 146, 232, 176, 204, 158, 186].map((width, i) => (
              <View
                key={width}
                style={{
                  width,
                  height: i === 3 ? 1.6 : 0.8,
                  backgroundColor: i === 3 ? C.brass : C.deep,
                  opacity: i === 3 ? 1 : 0.3,
                  marginBottom: 13,
                }}
              />
            ))}
          </View>

          <View style={{ flex: 1, justifyContent: "flex-end", paddingBottom: 30 }}>
            <View style={{ height: 1.5, backgroundColor: C.ink, marginBottom: 18 }} />
            <Text style={{ fontFamily: HEAD, fontSize: 52, lineHeight: 1.02, color: C.ink }}>{BOOK_NAME}</Text>
            <Text style={{ fontFamily: HEAD, fontSize: 13, color: C.body, marginTop: 14, lineHeight: 1.5 }}>
              Everything the people you love{"\n"}would need to find.
            </Text>

            {preparedBy.trim().length > 0 && (
              <Text style={{ fontSize: 10, color: C.muted, marginTop: 26 }}>Prepared by {preparedBy.trim()}</Text>
            )}
            {generated && <Text style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>Printed {generated}</Text>}
          </View>

          {/* The honesty block. Identical to what the app showed before generating. */}
          <View
            style={{
              borderLeftWidth: 2.5,
              borderLeftColor: blank ? C.deep : C.brass,
              backgroundColor: blank ? C.deepSoft : C.brassSoft,
              paddingVertical: 12,
              paddingHorizontal: 15,
            }}
          >
            <Text style={{ fontSize: 6.8, letterSpacing: 1.3, color: blank ? C.deep : C.brass, textTransform: "uppercase" }}>
              {blank ? "A blank copy" : "About this copy"}
            </Text>
            {/*
              Deliberately no count of any kind. The person holding this
              is not here to judge how far along somebody got, and a
              number of things not yet recorded turns their affairs into
              a score for a stranger to mark. They receive what was
              actually written down, and the date it was true.
            */}
            <Text style={{ fontSize: 10, color: C.ink, marginTop: 5, lineHeight: 1.5 }}>
              {blank
                ? "Nothing has been filled in yet. Every page here applies to you."
                : "This is a current copy of the information recorded in the Companion."}
            </Text>
            {!blank && oldest && (
              <Text style={{ fontSize: 8.5, color: C.muted, marginTop: 5 }}>
                Oldest confirmation still standing: {oldest}.
              </Text>
            )}
          </View>
        </View>
      </Page>

      {!blank && findableScenarios.length > 0 && (
        <Page size={size} style={s.page}>
          <Sheet section="If you need to">
            <Text style={s.eyebrow}>Start here</Text>
            <Text style={s.h1}>If you need to.</Text>
            <View style={s.headRule} />
            <Text style={s.p}>
              Whichever of these brought you to this copy, most urgent first. Each points to the section that answers
              it, so there is no need to read the whole book before finding the one page that matters right now.
            </Text>
            <View style={{ marginTop: 8 }}>
              {findableScenarios.map(({ need, sectionLabel }) => (
                <View key={need} style={{ flexDirection: "row", marginBottom: 10, alignItems: "flex-start" }} wrap={false}>
                  <Text style={{ fontSize: 10, color: C.body, flex: 1, lineHeight: 1.55 }}>{need}</Text>
                  <Text style={{ fontSize: 9, color: C.deep, width: 150, textAlign: "right", lineHeight: 1.55 }}>
                    {sectionLabel}
                  </Text>
                </View>
              ))}
            </View>
          </Sheet>
        </Page>
      )}

      <Page size={size} style={s.page}>
        <Sheet section="Read first">
          <Text style={s.eyebrow}>Read first</Text>
          <Text style={s.h1}>What this is, and what it is not.</Text>
          <View style={s.headRule} />
          <Text style={s.p}>
            This is a map, not a vault. It says where things are and who to speak to. It deliberately holds no account
            numbers, no passwords, and no documents, because a piece of paper that travels around a house is the wrong
            place for any of those.
          </Text>
          <Text style={s.p}>
            Nothing here has been checked by a lawyer, and none of it is legal advice. Where a professional is genuinely
            the answer, the page says so plainly rather than pretending otherwise.
          </Text>
          <Text style={s.p}>
            {blank
              ? "Every section printed here applies to the person who generated it. Anything that did not apply was left out entirely, rather than printed and crossed through."
              : "Each entry carries its own standing, and what is written under it is in their own words. Anything absent from this copy never applied to them at all."}
          </Text>

          <View style={{ height: 0.5, backgroundColor: C.rule, marginVertical: 16 }} />

          <Text style={{ fontFamily: HEAD, fontSize: 14, color: C.ink, marginBottom: 6 }}>
            {blank ? "How to use this" : "What the marks mean"}
          </Text>

          {blank ? (
            <View>
              {[
                ["Start anywhere.", "The order here is roughly the order that matters, but nothing depends on doing it top to bottom."],
                ["Skip freely.", "Anything that does not apply to you can stay blank. A short finished copy is better than a long half-filled one."],
                ["Say where, not what.", "\u201CWith Smith and Co, top drawer\u201D is the useful answer. The document itself should stay where it is."],
                ["Come back to it.", "This is not a form to finish in one sitting. Most people do it over a few weeks."],
              ].map(([title, body]) => (
                <View key={title} style={{ flexDirection: "row", marginBottom: 9 }} wrap={false}>
                  <View style={{ width: 3, backgroundColor: C.deep, marginRight: 11 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 10, color: C.ink }}>{title}</Text>
                    <Text style={{ fontSize: 8.6, color: C.muted, marginTop: 1.5, lineHeight: 1.5 }}>{body}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View>
              {/*
                Only the marks that actually appear in this copy. A legend
                explaining five standings when the pages contain two is
                the kind of padding that makes a reader trust the whole
                document less.
              */}
              {(
                [
                  ["established", "Written down here, in their words, and true when last confirmed."],
                  ["done", "Something they dealt with elsewhere, and confirmed on the date shown."],
                  ["worthRechecking", "Recorded once, but long enough ago to be worth asking again."],
                  ["recordedWithoutDetail", "Dealt with on the date shown, before the details were being kept."],
                  ["leftOpen", "Deliberately unfinished. Do not rely on it."],
                  ["unsure", "They did not know yet, and said so rather than guessing."],
                  ["notApplicable", "Considered, and decided it does not apply."],
                  ["notAddressed", "Nothing was written down about this."],
                ] as [StepStanding, string][]
              )
                .filter(([standing]) => present.has(standing))
                .map(([standing, meaning]) => (
                <View key={standing} style={{ flexDirection: "row", marginBottom: 7, alignItems: "flex-start" }} wrap={false}>
                  <Text style={[s.standing, { color: STANDING_COLOR[standing], width: 92, paddingTop: 1.5 }]}>
                    {STANDING_LABEL[standing]}
                  </Text>
                  <Text style={{ fontSize: 9, color: C.muted, flex: 1, lineHeight: 1.5 }}>{meaning}</Text>
                  </View>
                ))}
            </View>
          )}

          <View style={{ height: 0.5, backgroundColor: C.rule, marginVertical: 16 }} />
          <Text style={{ fontSize: 8.6, color: C.muted, lineHeight: 1.55 }}>
            Keep this somewhere private. Filled in, it says where things are and who to speak to, which is useful to the
            people who need it and useful to somebody who should not have it.
          </Text>
          <Text style={{ fontSize: 8, color: C.faint, lineHeight: 1.55, marginTop: 10 }}>
            Prepared with the {BOOK_ATTRIBUTION} by Draftpace. A newer copy may exist: the person who made this can
            print an up to date one at any time.
          </Text>
        </Sheet>
      </Page>

      {byArea.map(({ area, rows, missing }) => (
        <Page key={area} size={size} style={s.page}>
          <Sheet section={AFFAIR_AREA_LABEL[area]}>
            {/* Not "your answers": the person holding a filled copy
                answered none of it. */}
            <Text style={s.eyebrow}>{blank ? "Fill this in" : "What is recorded"}</Text>
            <Text style={s.h1}>{AFFAIR_AREA_LABEL[area]}</Text>
            <View style={s.headRule} />
            {rows.map((row) => (
              <StepRow key={row.step.key} row={row} blank={blank} />
            ))}
            {missing.length > 0 && (
              /*
                Said plainly and once. A reader who knows nothing was
                recorded about the pensions knows to go looking, which is
                useful; a page of identical "not yet started" rows tells
                them the same thing in a way nobody reads.
              */
              <Text style={s.missingNote}>
                Nothing was recorded about {listSentence(missing.map((r) => r.step.bookLabel.toLowerCase()))}.
              </Text>
            )}
          </Sheet>
        </Page>
      ))}
    </Document>
  );
}

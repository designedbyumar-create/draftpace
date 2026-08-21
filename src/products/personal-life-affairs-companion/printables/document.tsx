/**
 * The In Order document.
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
 * No em dashes anywhere, per the repo content rule.
 */
import { Document, Page, View, Text, StyleSheet, type DocumentProps } from "@react-pdf/renderer";
import { AFFAIR_AREA_LABEL, AFFAIR_AREA_ORDER, type AffairArea } from "../affairsKnowledge";
import { isBlankCopy } from "../completion";
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
  notAddressed: "Not yet started",
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
        <Text>In Order</Text>
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
        <Text style={s.instruction}>{row.step.instruction}</Text>
        <Text style={[s.standing, { color: STANDING_COLOR[row.standing] }]}>{STANDING_LABEL[row.standing]}</Text>
      </View>
      {row.items.length > 0 ? (
        row.items.map((item) => <RecordBlock key={item.id} item={item} />)
      ) : row.standing === "recordedWithoutDetail" ? (
        <Text style={s.note}>
          Confirmed{date ? ` ${date}` : ""}, before the details were being kept. Nothing was written down.
        </Text>
      ) : row.standing === "done" ? (
        <Text style={s.note}>Done{date ? `, ${date}` : ""}.</Text>
      ) : row.standing === "unsure" ? (
        <Text style={s.note}>Not settled. This one was left open on purpose.</Text>
      ) : null}
    </View>
  );
}

export interface DocumentInputs {
  size: "LETTER" | "A4";
  /** The person's name, printed on the cover. Empty is allowed and simply omitted. */
  preparedBy: string;
  readiness: Readiness;
  /** The honest one-line summary, generated by describeReadiness. */
  summary: string;
  generatedAt: Date;
}

export function InOrderDocument({
  size,
  preparedBy,
  readiness,
  summary,
  generatedAt,
}: DocumentInputs): React.ReactElement<DocumentProps> {
  const blank = isBlankCopy(readiness);
  const generated = formatDate(generatedAt.toISOString());
  const oldest = formatDate(readiness.oldestConfirmedAt);

  /** The standings this particular copy actually uses, for the legend. */
  const present = new Set(readiness.rows.map((r) => r.standing));

  const byArea = AREA_ORDER.map((area) => ({
    area,
    rows: readiness.rows.filter((r) => r.step.area === area),
  })).filter((group) => group.rows.length > 0);

  return (
    <Document
      title="In Order"
      author="Draftpace"
      subject="Everything the people you love would need to find"
      creator="Draftpace"
      producer="Draftpace"
    >
      <Page size={size} style={s.cover}>
        <View style={{ flex: 1, paddingTop: 58, paddingBottom: 52, paddingHorizontal: 54 }}>
          <View style={s.spine} fixed />
          <Text style={{ fontSize: 7.5, letterSpacing: 2.6, color: C.deep, textTransform: "uppercase" }}>Draftpace</Text>

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
            <Text style={{ fontFamily: HEAD, fontSize: 52, lineHeight: 1.02, color: C.ink }}>In Order</Text>
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
              {blank ? "A blank copy" : "What this copy contains"}
            </Text>
            <Text style={{ fontSize: 10, color: C.ink, marginTop: 5, lineHeight: 1.5 }}>
              {blank ? "Nothing has been filled in yet. Every page here applies to you." : summary}
            </Text>
            {!blank && oldest && (
              <Text style={{ fontSize: 8.5, color: C.muted, marginTop: 5 }}>
                Oldest confirmation still standing: {oldest}.
              </Text>
            )}
          </View>
        </View>
      </Page>

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
                  ["established", "Written down here, and true when it was last confirmed."],
                  ["done", "Something they did elsewhere and told us about."],
                  ["worthRechecking", "Recorded once, but long enough ago to be worth asking again."],
                  ["recordedWithoutDetail", "Dealt with on the date shown, before the details were being kept."],
                  ["leftOpen", "Deliberately unfinished. Do not rely on it."],
                  ["unsure", "They did not know yet, and said so rather than guessing."],
                  ["notApplicable", "Considered, and decided it does not apply."],
                  ["notAddressed", "Never started."],
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
        </Sheet>
      </Page>

      {byArea.map(({ area, rows }) => (
        <Page key={area} size={size} style={s.page}>
          <Sheet section={AFFAIR_AREA_LABEL[area]}>
            <Text style={s.eyebrow}>{blank ? "Fill this in" : "Your answers"}</Text>
            <Text style={s.h1}>{AFFAIR_AREA_LABEL[area]}</Text>
            <View style={s.headRule} />
            {rows.map((row) => (
              <StepRow key={row.step.key} row={row} blank={blank} />
            ))}
          </Sheet>
        </Page>
      ))}
    </Document>
  );
}

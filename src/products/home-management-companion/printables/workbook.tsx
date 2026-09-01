/**
 * The Printable Home Survey.
 *
 * Home Base's paper counterpart, and the artifact that fronts the Etsy
 * listing. It exists because of one fact about home information: you
 * cannot gather it from a chair. Model numbers are on a sticker behind
 * the fridge, the filter size is printed on the filter, the water shutoff
 * is in the basement behind something heavy. A phone in one hand while
 * crouching behind an appliance is worse than a clipboard.
 *
 * The division of labour is the one the Printable Finance Companion also
 * states: paper gathers, the app remembers. This book is what somebody
 * carries around their house; Home Base is what stops them having to
 * remember any of it afterwards.
 *
 * VISUAL IDENTITY
 *
 * The book is set in the language of a surveyor's drawing set, because
 * that is literally what it is: a survey of a building. Thin precise
 * rules, plate numbers, registration ticks at the corners of every
 * capture field, and grid paper wherever somebody might reasonably want
 * to sketch rather than write. That last one is not decoration: a small
 * plan drawing is by far the best way to record where a stopcock is.
 *
 * Newsreader for anything the book says, IBM Plex Sans for anything it
 * asks, which is the same split the live product uses between its
 * narrative voice and its data. Sage carries the whole book; ochre
 * appears only against genuine safety, so that it still means something
 * when it does.
 *
 * Everything in the care and seasonal sections is generated from
 * homeKnowledge.ts rather than typed out here, so the book cannot drift
 * from what the live product knows.
 *
 * No em dashes anywhere, per the Draftpace content rule.
 */
import { Document, Page, View, Text, StyleSheet, Svg, Line, Rect, Path, type DocumentProps } from "@react-pdf/renderer";
import {
  HOME_ITEM_TYPES,
  HOME_ITEM_CATEGORY_LABEL,
  type HomeItemCategory,
  type HomeItemTypeDefinition,
} from "../homeKnowledge";

const C = {
  paper: "#fbfaf6",
  ink: "#1a2420",
  inkSoft: "#414b46",
  muted: "#6b7570",
  faint: "#9aa29c",
  rule: "#d6d3c8",
  ruleSoft: "#e9e6dc",
  grid: "#e8e5db",
  sage: "#4f7a5c",
  sageDeep: "#34513e",
  sageSoft: "#e7ede4",
  ochre: "#8a5a11",
  ochreSoft: "#f6edda",
};

const HEAD = "Newsreader";
const BODY = "PlexSans";

const M = { top: 58, bottom: 54, side: 56 };

const s = StyleSheet.create({
  page: {
    paddingTop: M.top,
    paddingBottom: M.bottom,
    paddingHorizontal: M.side,
    backgroundColor: C.paper,
    color: C.ink,
    fontFamily: BODY,
    fontSize: 9.5,
    lineHeight: 1.55,
  },
  bleedPage: { backgroundColor: C.paper, color: C.ink, fontFamily: BODY },

  spine: { position: "absolute", top: 0, left: 0, right: 0, height: 3, backgroundColor: C.sage },

  runningHead: {
    position: "absolute",
    top: 26,
    left: M.side,
    right: M.side,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 6.8,
    letterSpacing: 1.1,
    color: C.faint,
    textTransform: "uppercase",
  },
  folio: {
    position: "absolute",
    bottom: 26,
    right: M.side,
    fontSize: 7.5,
    color: C.faint,
    letterSpacing: 0.6,
  },
  folioRule: { position: "absolute", bottom: 40, left: M.side, right: M.side, height: 0.5, backgroundColor: C.ruleSoft },

  plate: { fontSize: 6.8, letterSpacing: 1.6, color: C.sage, textTransform: "uppercase" },
  h1: { fontFamily: HEAD, fontSize: 26, lineHeight: 1.12, marginTop: 6, marginBottom: 10 },
  h2: { fontFamily: HEAD, fontSize: 14, marginTop: 16, marginBottom: 5 },
  lede: { fontFamily: HEAD, fontSize: 11.5, lineHeight: 1.55, color: C.inkSoft, marginBottom: 16 },
  p: { marginBottom: 7 },
  pMuted: { marginBottom: 7, color: C.muted },
  caption: { fontSize: 8, color: C.muted, lineHeight: 1.5 },

  label: { fontSize: 6.8, letterSpacing: 1.3, color: C.sage, textTransform: "uppercase", marginBottom: 7 },

  headRule: { height: 1.25, backgroundColor: C.ink, marginBottom: 14 },
  thinRule: { height: 0.5, backgroundColor: C.rule, marginVertical: 14 },

  fieldRow: { flexDirection: "row", alignItems: "flex-end", marginBottom: 10 },
  fieldLabel: { width: 96, fontSize: 7.6, color: C.muted, letterSpacing: 0.2, paddingBottom: 3 },
  fieldLine: { flex: 1, borderBottomWidth: 0.6, borderBottomColor: C.rule, height: 14 },

  tableHead: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: C.ink, paddingBottom: 4 },
  th: { fontSize: 6.6, letterSpacing: 1, color: C.muted, textTransform: "uppercase" },
  tr: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: C.ruleSoft, paddingVertical: 4.4 },
  td: { fontSize: 8.6 },

  checkRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 7, width: "33.33%", paddingRight: 10 },
  checkBox: { width: 8, height: 8, borderWidth: 0.7, borderColor: C.sage, marginRight: 6, marginTop: 2.4 },
  checkLabel: { fontSize: 8.2, flex: 1 },
});

/** The live text column, so drawn elements can match the typeset ones. */
const COLUMN = { LETTER: 612 - M.side * 2, A4: 595.28 - M.side * 2 } as const;
const COLUMN_HEIGHT = { LETTER: 792 - M.top - M.bottom, A4: 841.89 - M.top - M.bottom } as const;

/**
 * A category plate has to be exactly one sheet. The number of things to
 * tick varies from three (laundry) to seventeen (structure), so the
 * number of capture cards underneath has to be worked out per plate
 * rather than fixed, or a card falls onto a page of its own and the book
 * reads like it was assembled carelessly.
 *
 * These are measured from rendered output, not derived from the styles.
 * Anything that changes the card or the checklist row needs measuring
 * again, which is why the plates are proofed visually every time.
 */
const CARD_H = 132;
const CHECK_ROW_H = 22;
const PLATE_CHROME_H = 155;
const RULED_LINE_H = 21;

function plateBudget(size: "LETTER" | "A4", typeCount: number) {
  const rows = Math.ceil(typeCount / 3);
  const free = COLUMN_HEIGHT[size] - PLATE_CHROME_H - rows * CHECK_ROW_H;
  const cards = Math.max(2, Math.min(4, Math.floor(free / CARD_H)));
  const leftover = free - cards * CARD_H - 24;
  return { cards, ruledLines: Math.max(0, Math.floor(leftover / RULED_LINE_H)) };
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function intervalWords(days: number): string {
  if (days <= 7) return "weekly";
  if (days <= 31) return "monthly";
  if (days <= 95) return "every 3 months";
  if (days <= 190) return "every 6 months";
  if (days <= 400) return "yearly";
  if (days <= 800) return "every 2 years";
  if (days <= 1500) return "every 3 to 4 years";
  if (days <= 2000) return "every 5 years";
  return `every ${Math.round(days / 365)} years`;
}

/* ---------------------------------------------------------------- parts */

/** Registration ticks, the corner marks of a drawing sheet. The book's one recurring device. */
function Ticks({ inset = 0 }: { inset?: number }) {
  const L = 7;
  const corner = (top: boolean, left: boolean) => ({
    position: "absolute" as const,
    [top ? "top" : "bottom"]: inset,
    [left ? "left" : "right"]: inset,
    width: L,
    height: L,
    [top ? "borderTopWidth" : "borderBottomWidth"]: 0.9,
    [left ? "borderLeftWidth" : "borderRightWidth"]: 0.9,
    borderColor: C.sage,
  });
  return (
    <>
      <View style={corner(true, true)} />
      <View style={corner(true, false)} />
      <View style={corner(false, true)} />
      <View style={corner(false, false)} />
    </>
  );
}

/** Squared paper. Somebody sketching where a valve is beats somebody describing it. */
function GridField({ height, width, note }: { height: number; width: number; note?: string }) {
  const step = 11;
  const cols = Math.ceil(width / step) - 1;
  const rows = Math.ceil(height / step) - 1;
  return (
    <View style={{ marginBottom: 10 }} wrap={false}>
      <View style={{ height, borderWidth: 0.6, borderColor: C.rule, position: "relative" }}>
        <Svg style={{ position: "absolute", top: 0, left: 0 }} width={width} height={height}>
          {Array.from({ length: cols }).map((_, i) => (
            <Line key={`v${i}`} x1={(i + 1) * step} y1={0} x2={(i + 1) * step} y2={height} strokeWidth={0.4} stroke={C.grid} />
          ))}
          {Array.from({ length: rows }).map((_, i) => (
            <Line key={`h${i}`} x1={0} y1={(i + 1) * step} x2={width} y2={(i + 1) * step} strokeWidth={0.4} stroke={C.grid} />
          ))}
        </Svg>
      </View>
      {note && <Text style={[s.caption, { marginTop: 4 }]}>{note}</Text>}
    </View>
  );
}

function Field({ label, width }: { label: string; width?: string }) {
  return (
    <View style={[s.fieldRow, width ? { width } : {}]}>
      <Text style={s.fieldLabel}>{label}</Text>
      <View style={s.fieldLine} />
    </View>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <View style={{ flexDirection: "row", gap: 18 }}>{children}</View>;
}

function Check({ label }: { label: string }) {
  return (
    <View style={s.checkRow}>
      <View style={s.checkBox} />
      <Text style={s.checkLabel}>{label}</Text>
    </View>
  );
}

/** A capture card: ticked corners, a plate-style caption, and room to write. */
function Card({ caption, children, tint }: { caption?: string; children: React.ReactNode; tint?: boolean }) {
  return (
    <View
      style={{
        position: "relative",
        borderWidth: 0.6,
        borderColor: C.rule,
        backgroundColor: tint ? C.sageSoft : undefined,
        paddingVertical: 13,
        paddingHorizontal: 15,
        marginBottom: 11,
      }}
      wrap={false}
    >
      <Ticks inset={3} />
      {caption && <Text style={s.label}>{caption}</Text>}
      {children}
    </View>
  );
}

function Note({ title, body, tone = "sage" }: { title: string; body: string; tone?: "sage" | "ochre" }) {
  const bg = tone === "ochre" ? C.ochreSoft : C.sageSoft;
  const bar = tone === "ochre" ? C.ochre : C.sage;
  return (
    <View style={{ flexDirection: "row", marginBottom: 13 }} wrap={false}>
      <View style={{ width: 2.5, backgroundColor: bar }} />
      <View style={{ flex: 1, backgroundColor: bg, paddingVertical: 11, paddingHorizontal: 14 }}>
        <Text style={{ fontFamily: HEAD, fontSize: 11, marginBottom: 3 }}>{title}</Text>
        <Text style={{ fontSize: 8.6, color: C.inkSoft, lineHeight: 1.55 }}>{body}</Text>
      </View>
    </View>
  );
}

function Sheet({ section, plate, children }: { section: string; plate?: string; children: React.ReactNode }) {
  return (
    <>
      <View style={s.spine} fixed />
      <View style={s.runningHead} fixed>
        <Text>The Home Survey</Text>
        <Text>{plate ? `${plate} · ${section}` : section}</Text>
      </View>
      {children}
      <View style={s.folioRule} fixed />
      <Text style={s.folio} fixed render={({ pageNumber }) => String(pageNumber)} />
    </>
  );
}

/* ---------------------------------------------------------------- cover */

/**
 * A plan view, not a picture of a house. Rooms, walls, a door swing and a
 * stair run, drawn the way a survey drawing would, because the book is a
 * survey and a cartoon house would promise something softer than what is
 * inside.
 */
function PlanDrawing({ w = 300, h = 200 }: { w?: number; h?: number }) {
  const t = 1.1;
  return (
    <Svg width={w} height={h}>
      <Rect x={2} y={2} width={w - 4} height={h - 4} strokeWidth={t} stroke={C.sage} fill="none" />
      <Line x1={w * 0.42} y1={2} x2={w * 0.42} y2={h * 0.62} strokeWidth={t} stroke={C.sage} />
      <Line x1={w * 0.42} y1={h * 0.62} x2={w - 2} y2={h * 0.62} strokeWidth={t} stroke={C.sage} />
      <Line x1={2} y1={h * 0.38} x2={w * 0.42} y2={h * 0.38} strokeWidth={t} stroke={C.sage} />
      <Line x1={w * 0.72} y1={h * 0.62} x2={w * 0.72} y2={h - 2} strokeWidth={t} stroke={C.sage} />
      {/* door swing */}
      <Path d={`M ${w * 0.42} ${h * 0.5} L ${w * 0.42 + 26} ${h * 0.5}`} strokeWidth={0.7} stroke={C.sage} />
      <Path
        d={`M ${w * 0.42 + 26} ${h * 0.5} A 26 26 0 0 0 ${w * 0.42} ${h * 0.5 - 26}`}
        strokeWidth={0.6}
        stroke={C.sage}
        fill="none"
      />
      {/* stair run */}
      {Array.from({ length: 7 }).map((_, i) => (
        <Line
          key={i}
          x1={w * 0.74}
          y1={h * 0.66 + i * 9}
          x2={w - 12}
          y2={h * 0.66 + i * 9}
          strokeWidth={0.5}
          stroke={C.sage}
        />
      ))}
      {/* dimension line along the base */}
      <Line x1={2} y1={h - 12} x2={w * 0.42} y2={h - 12} strokeWidth={0.5} stroke={C.faint} />
    </Svg>
  );
}

function Cover() {
  return (
    <View style={{ flex: 1, paddingTop: 64, paddingBottom: 52, paddingHorizontal: 56, position: "relative" }}>
      <Ticks inset={22} />
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Text style={{ fontSize: 7.5, letterSpacing: 2.6, color: C.sage, textTransform: "uppercase" }}>Draftpace</Text>
        <Text style={{ fontSize: 7.5, letterSpacing: 1.4, color: C.faint, textTransform: "uppercase" }}>First edition</Text>
      </View>

      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", marginVertical: 26 }}>
        <PlanDrawing />
      </View>

      <View>
        <View style={{ height: 1.5, backgroundColor: C.ink, marginBottom: 16 }} />
        <Text style={{ fontFamily: HEAD, fontSize: 50, lineHeight: 1.02 }}>The Home</Text>
        <Text style={{ fontFamily: HEAD, fontSize: 50, lineHeight: 1.02, color: C.sage }}>Survey</Text>
        <Text style={{ fontFamily: HEAD, fontSize: 13, color: C.inkSoft, marginTop: 14, lineHeight: 1.5 }}>
          Walk your house once, write it all down,{"\n"}and never have to remember it again.
        </Text>
        <View style={{ height: 0.6, backgroundColor: C.rule, marginTop: 22, marginBottom: 14 }} />
        <Row>
          <Field label="This home" width="50%" />
          <Field label="Surveyed by" width="50%" />
        </Row>
        <Text style={[s.caption, { marginTop: 6 }]}>
          The paper companion to Home Base. Twelve areas of a home, the care each one needs, and the handful of facts
          you will want at two in the morning.
        </Text>
      </View>
    </View>
  );
}

function PartDivider({
  number,
  title,
  blurb,
  contents,
}: {
  number: string;
  title: string;
  blurb: string;
  contents: string[];
}) {
  return (
    <View style={{ flex: 1, paddingTop: 84, paddingBottom: 56, paddingHorizontal: 56, position: "relative" }}>
      <View style={s.spine} fixed />
      <Text style={{ fontSize: 7, letterSpacing: 2, color: C.sage, textTransform: "uppercase" }}>{`Part ${number}`}</Text>
      <Text style={{ fontFamily: HEAD, fontSize: 104, color: C.sage, opacity: 0.16, lineHeight: 1, marginTop: 4 }}>
        {number}
      </Text>
      <View style={{ height: 1.5, backgroundColor: C.ink, marginTop: 10, marginBottom: 16 }} />
      <Text style={{ fontFamily: HEAD, fontSize: 30, lineHeight: 1.15 }}>{title}</Text>
      <Text style={{ fontFamily: HEAD, fontSize: 12, color: C.muted, marginTop: 12, lineHeight: 1.55, maxWidth: 340 }}>
        {blurb}
      </Text>

      <View style={{ flex: 1 }} />

      <Text style={s.label}>In this part</Text>
      {contents.map((entry) => (
        <View key={entry} style={{ flexDirection: "row", alignItems: "center", marginBottom: 5 }}>
          <View style={{ width: 14, height: 0.6, backgroundColor: C.sage, marginRight: 10 }} />
          <Text style={{ fontSize: 9, color: C.inkSoft }}>{entry}</Text>
        </View>
      ))}
    </View>
  );
}

/* ---------------------------------------------------------------- pages */

function Contents({ plates }: { plates: { plate: string; title: string }[] }) {
  return (
    <>
      <Text style={s.plate}>Contents</Text>
      <Text style={s.h1}>What is in this book.</Text>
      <View style={s.headRule} />
      {plates.map(({ plate, title }) => (
        <View
          key={plate + title}
          style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 4.5, borderBottomWidth: 0.5, borderBottomColor: C.ruleSoft }}
        >
          <Text style={{ fontSize: 9 }}>{title}</Text>
          <Text style={{ fontSize: 7.5, color: C.faint, letterSpacing: 0.8 }}>{plate}</Text>
        </View>
      ))}
    </>
  );
}

function ReadFirst() {
  return (
    <>
      <Text style={s.plate}>Read first</Text>
      <Text style={s.h1}>Before you write anything in here.</Text>

      <Note
        tone="ochre"
        title="This book will know where things are."
        body="Filled in, it lists what you own, what it would cost to replace, and where your water and gas shut off. That is useful to you and useful to somebody who should not have it. Keep it somewhere private, and think twice before leaving it out during a viewing, a party, or building work."
      />

      <Text style={s.h2}>What this is</Text>
      <Text style={s.p}>
        A survey you carry. Home information is scattered around the building: the model number is on a sticker behind
        the fridge, the filter size is printed on the filter, the shutoff is behind something heavy. None of it can be
        gathered from a chair, and none of it is worth gathering twice.
      </Text>

      <Text style={s.h2}>What it is not</Text>
      <Text style={s.p}>
        Not a valuation, not an insurance schedule, and not a survey in the professional sense. Nothing written here has
        been inspected by anybody. The intervals printed later are ordinary guidance for a typical home rather than
        advice about yours, and anything involving gas, electricity, structure or water is a job for somebody qualified.
      </Text>

      <Text style={s.h2}>The division of labour</Text>
      <Text style={s.pMuted}>
        Paper gathers. It is better than a screen for walking, crouching, and squinting at a label in bad light. Home
        Base remembers: it holds the dates, works out what is due, surfaces the few things that deserve
        attention, and keeps the record of who fixed what and what it cost.
      </Text>

      <View style={s.thinRule} />

      <Row>
        <View style={{ flex: 1 }}>
          <Text style={s.label}>On paper</Text>
          <Text style={s.caption}>Walking. Finding. Reading labels. Sketching where a valve is. Writing a number down once.</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.label}>In Home Base</Text>
          <Text style={s.caption}>Dates. Intervals. What is due. What is wrong. Who came out, when, and what they charged.</Text>
        </View>
      </Row>
    </>
  );
}

function HowItWorks() {
  const steps: [string, string][] = [
    ["Walk", "One lap with this book and a torch. An hour, or three visits of twenty minutes each."],
    ["Write", "Names, model numbers, dates, and where things live. Skip anything you cannot find."],
    ["Enter", "Into Home Base once. These pages are ordered the way the app asks."],
    ["Forget", "The point of the exercise. Home Base raises each thing when it is due and stays quiet otherwise."],
  ];
  return (
    <>
      <Text style={s.plate}>How this works</Text>
      <Text style={s.h1}>Four steps, and only one of them is work.</Text>
      <View style={s.headRule} />
      {steps.map(([title, body], i) => (
        <View key={title} style={{ flexDirection: "row", marginBottom: 15 }} wrap={false}>
          <View style={{ width: 40 }}>
            <Text style={{ fontFamily: HEAD, fontSize: 26, color: C.sage, lineHeight: 1 }}>{i + 1}</Text>
          </View>
          <View style={{ flex: 1, borderLeftWidth: 0.6, borderLeftColor: C.rule, paddingLeft: 14 }}>
            <Text style={{ fontFamily: HEAD, fontSize: 14, marginBottom: 2 }}>{title}</Text>
            <Text style={{ fontSize: 9, color: C.muted, lineHeight: 1.55 }}>{body}</Text>
          </View>
        </View>
      ))}

      <View style={s.thinRule} />
      <Text style={s.h2}>You do not have to finish it</Text>
      <Text style={s.p}>
        One water heater with a date on it is worth more than forty blank rows. Fill in what you find, leave the rest,
        and add to it whenever you happen to be standing in front of something with a label on it.
      </Text>
      <Note
        title="Photograph every sticker as you go."
        body="It takes a second, it is far more reliable than copying a long serial number by hand in a dark cupboard, and you can read it off the photo when you are sitting down."
      />
      <Card caption="What to bring">
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {["A torch", "A phone camera", "A cloth", "This book", "A pen", "Half an hour"].map((item) => (
            <Check key={item} label={item} />
          ))}
        </View>
      </Card>

      <Text style={s.h2}>A sensible order</Text>
      <Text style={s.pMuted}>
        Start where the machinery is, because that is where the labels and the dates are, and finish outside. Most
        people run out of enthusiasm before they run out of house, so spend it on the parts that fail expensively.
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
        {["Kitchen", "Utility", "Basement", "Attic", "Outside"].map((stop, i, all) => (
          <View key={stop} style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ width: 4, height: 4, backgroundColor: C.sage }} />
            <Text style={{ fontSize: 8, color: C.inkSoft, marginLeft: 5 }}>{stop}</Text>
            {i < all.length - 1 && <View style={{ width: 22, height: 0.6, backgroundColor: C.rule, marginHorizontal: 7 }} />}
          </View>
        ))}
      </View>
    </>
  );
}

function TonightPage({ column }: { column: number }) {
  return (
    <>
      <Text style={s.plate}>Plate 01 · Fill this one in first</Text>
      <Text style={s.h1}>If something goes wrong tonight.</Text>
      <Text style={s.lede}>
        Water coming through a ceiling at two in the morning is the wrong moment to start looking for a stopcock. This
        is the most useful page in the book. It takes ten minutes, and almost nobody does it.
      </Text>

      <Card caption="Water">
        <Row>
          <Field label="Main shutoff" width="60%" />
          <Field label="Turns" width="40%" />
        </Row>
        <Field label="Tool needed" />
      </Card>

      <Row>
        <View style={{ flex: 1 }}>
          <Card caption="Gas">
            <Field label="Shutoff" />
            <Field label="Emergency" />
          </Card>
        </View>
        <View style={{ flex: 1 }}>
          <Card caption="Electricity">
            <Field label="Panel" />
            <Field label="Main breaker" />
          </Card>
        </View>
      </Row>

      <Text style={s.label}>Draw where they are</Text>
      <GridField
        height={150}
        width={column}
        note="A rough plan beats a paragraph. Mark the water shutoff W, the gas G, and the panel E."
      />

      <Card caption="The first call">
        <Row>
          <Field label="Plumber" width="50%" />
          <Field label="Electrician" width="50%" />
        </Row>
        <Row>
          <Field label="Insurance" width="50%" />
          <Field label="Policy number" width="50%" />
        </Row>
      </Card>
    </>
  );
}

function CategoryPage({
  category,
  types,
  plate,
  size,
}: {
  category: HomeItemCategory;
  types: HomeItemTypeDefinition[];
  plate: string;
  size: "LETTER" | "A4";
}) {
  const label = HOME_ITEM_CATEGORY_LABEL[category];
  const { cards, ruledLines } = plateBudget(size, types.length);
  return (
    <>
      <Text style={s.plate}>{`${plate} · The walk`}</Text>
      <Text style={s.h1}>{label}</Text>
      <View style={s.headRule} />

      <Text style={s.label}>What is here</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 6 }}>
        {types.map((type) => (
          <Check key={type.id} label={type.label} />
        ))}
      </View>

      <View style={s.thinRule} />
      <Text style={s.label}>Worth the detail</Text>

      {Array.from({ length: cards }).map((_, n) => (
        <Card key={n}>
          <Row>
            <Field label="What it is" width="58%" />
            <Field label="Where" width="42%" />
          </Row>
          <Row>
            <Field label="Make and model" width="58%" />
            <Field label="Installed" width="42%" />
          </Row>
          <Field label="Notes, filter size, warranty" />
        </Card>
      ))}

      {ruledLines > 0 && (
        <View wrap={false}>
          <Text style={[s.label, { marginTop: 4 }]}>Anything else here</Text>
          {Array.from({ length: ruledLines }).map((_, n) => (
            <View key={n} style={{ height: RULED_LINE_H, borderBottomWidth: 0.5, borderBottomColor: C.ruleSoft }} />
          ))}
        </View>
      )}
    </>
  );
}

/**
 * One long table that react-pdf paginates itself, with the column head
 * marked fixed so it repeats. Slicing the rows into hand-counted pages
 * was the earlier approach and it produced a spill page after every
 * full one, because the count that fits is a function of the rendered
 * row height rather than anything knowable here.
 */
function CareTable({ rows }: { rows: { task: string; thing: string; when: string; why: string }[] }) {
  return (
    <>
      <Text style={s.plate}>Plate 14 · What a home needs</Text>
      <Text style={s.h1}>The jobs, and how often.</Text>
      <Text style={s.lede}>
        The same list Home Base works from. You do not have to learn any of it, because the app raises each one when it
        is due. It is printed here so you can see exactly what you are handing over.
      </Text>
      <View style={s.tableHead} fixed>
        <Text style={[s.th, { width: "38%" }]}>Job</Text>
        <Text style={[s.th, { width: "24%" }]}>On what</Text>
        <Text style={[s.th, { width: "26%" }]}>How often</Text>
        <Text style={[s.th, { width: "12%", textAlign: "right" }]}>Matters</Text>
      </View>
      {rows.map((row, i) => (
        <View key={`${row.thing}-${row.task}-${i}`} style={s.tr} wrap={false}>
          <Text style={[s.td, { width: "38%" }]}>{row.task}</Text>
          <Text style={[s.td, { width: "24%", color: C.muted }]}>{row.thing}</Text>
          <Text style={[s.td, { width: "26%", color: C.muted }]}>{row.when}</Text>
          <View style={{ width: "12%", flexDirection: "row", justifyContent: "flex-end", alignItems: "center" }}>
            {row.why === "Safety" ? (
              <>
                <View style={{ width: 5, height: 5, backgroundColor: C.ochre, marginRight: 4 }} />
                <Text style={{ fontSize: 7, color: C.ochre, letterSpacing: 0.4 }}>SAFETY</Text>
              </>
            ) : row.why === "Costly" ? (
              <>
                <View style={{ width: 5, height: 5, backgroundColor: C.sage, marginRight: 4 }} />
                <Text style={{ fontSize: 7, color: C.sage, letterSpacing: 0.4 }}>COSTLY</Text>
              </>
            ) : null}
          </View>
        </View>
      ))}

      <View style={{ marginTop: 22 }} wrap={false}>
        <Text style={s.label}>Jobs of your own</Text>
        <Text style={[s.caption, { marginBottom: 9 }]}>
          Every home has a few the list cannot know about. The well, the boat lift, the thing the last owner built.
          Write them here, then add them to Home Base with a cadence and it will treat them exactly like the rest.
        </Text>
        <View style={s.tableHead}>
          <Text style={[s.th, { width: "38%" }]}>Job</Text>
          <Text style={[s.th, { width: "24%" }]}>On what</Text>
          <Text style={[s.th, { width: "38%" }]}>How often</Text>
        </View>
        {Array.from({ length: 8 }).map((_, n) => (
          <View key={n} style={{ flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: C.ruleSoft, height: 22 }} />
        ))}
      </View>
    </>
  );
}

function SeasonalPage({ byMonth }: { byMonth: { month: string; jobs: string[] }[] }) {
  return (
    <>
      <Text style={s.plate}>Plate 15 · The year</Text>
      <Text style={s.h1}>What belongs to which month.</Text>
      <Text style={s.lede}>
        Some jobs are not on a timer, they are on a season. Draining an outside tap belongs before the first freeze, not
        three hundred and sixty five days after you last thought about it.
      </Text>
      {byMonth.map(({ month, jobs }) => (
        <View
          key={month}
          style={{ flexDirection: "row", borderTopWidth: 0.6, borderTopColor: C.rule, paddingTop: 8, marginBottom: 11 }}
          wrap={false}
        >
          <View style={{ width: 96, paddingRight: 12 }}>
            <Text style={{ fontFamily: HEAD, fontSize: 15, lineHeight: 1.1 }}>{month}</Text>
            <Text style={{ fontSize: 6.6, letterSpacing: 0.9, color: C.faint, textTransform: "uppercase", marginTop: 2 }}>
              {jobs.length === 0 ? "Clear" : jobs.length === 1 ? "1 job" : `${jobs.length} jobs`}
            </Text>
          </View>
          <View style={{ flex: 1, paddingTop: 2 }}>
            {jobs.length === 0 ? (
              <Text style={{ fontSize: 8.4, color: C.faint }}>Nothing seasonal. A good month.</Text>
            ) : (
              jobs.map((job) => (
                <View key={job} style={{ flexDirection: "row", marginBottom: 2.5 }}>
                  <View style={{ width: 3, height: 3, backgroundColor: C.sage, marginTop: 4.5, marginRight: 7 }} />
                  <Text style={{ fontSize: 8.4, color: C.inkSoft, flex: 1 }}>{job}</Text>
                </View>
              ))
            )}
          </View>
        </View>
      ))}
    </>
  );
}

function QuickReference() {
  return (
    <>
      <Text style={s.plate}>Plate 16 · Quick reference</Text>
      <Text style={s.h1}>The numbers you look up every time.</Text>
      <Text style={s.lede}>
        Written down once, these save a trip to the loft with a tape measure and a torch, every single time thereafter.
      </Text>
      <Card caption="Filter sizes">
        <Row>
          <Field label="Furnace" width="50%" />
          <Field label="Fridge" width="50%" />
        </Row>
        <Row>
          <Field label="Humidifier" width="50%" />
          <Field label="Range hood" width="50%" />
        </Row>
      </Card>
      <Card caption="Paint">
        {[0, 1, 2, 3].map((n) => (
          <Row key={n}>
            <Field label="Room" width="40%" />
            <Field label="Colour and code" width="60%" />
          </Row>
        ))}
      </Card>
      <Card caption="Odds and ends">
        <Row>
          <Field label="Bulb types" width="50%" />
          <Field label="Bin day" width="50%" />
        </Row>
        <Row>
          <Field label="Meter numbers" width="50%" />
          <Field label="Recycling day" width="50%" />
        </Row>
      </Card>

      <Card caption="Where things live">
        <Row>
          <Field label="Spare keys" width="50%" />
          <Field label="Loft hatch" width="50%" />
        </Row>
        <Row>
          <Field label="Fuse box" width="50%" />
          <Field label="Water meter" width="50%" />
        </Row>
      </Card>

      <Text style={s.caption}>
        Not passwords, alarm codes, or anything that opens the house. This book travels around the building and sits on
        worktops while trades are in it, so it is the wrong place for the things that would matter if it went missing.
      </Text>
    </>
  );
}

function PeoplePage() {
  return (
    <>
      <Text style={s.plate}>Plate 17 · Who to call</Text>
      <Text style={s.h1}>The number you cannot find when you need it.</Text>
      <Text style={s.lede}>
        The plumber who was good, and the one who was not. Write down both. Home Base keeps this beside what each person
        actually did and what they charged.
      </Text>

      <Card caption="The four you will need first" tint>
        <View style={{ flexDirection: "row", marginBottom: 4 }}>
          <View style={{ width: 116 }} />
          <Text style={[s.th, { flex: 1 }]}>Name</Text>
          <Text style={[s.th, { width: 116 }]}>Phone</Text>
        </View>
        {["Plumber", "Electrician", "Heating and cooling", "Roofer"].map((trade) => (
          <View key={trade} style={{ flexDirection: "row", alignItems: "flex-end", marginBottom: 9 }}>
            <Text style={{ width: 116, fontSize: 8.6, paddingBottom: 3 }}>{trade}</Text>
            <View style={{ flex: 1, borderBottomWidth: 0.6, borderBottomColor: C.rule, height: 15, marginRight: 12 }} />
            <View style={{ width: 116, borderBottomWidth: 0.6, borderBottomColor: C.rule, height: 15 }} />
          </View>
        ))}
      </Card>

      <Text style={[s.label, { marginTop: 6 }]}>Everybody else</Text>
      <View style={s.tableHead}>
        <Text style={[s.th, { width: "30%" }]}>Name</Text>
        <Text style={[s.th, { width: "26%" }]}>For what</Text>
        <Text style={[s.th, { width: "26%" }]}>Phone</Text>
        <Text style={[s.th, { width: "18%" }]}>Again?</Text>
      </View>
      {Array.from({ length: 14 }).map((_, n) => (
        <View key={n} style={{ flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: C.ruleSoft, height: 23 }} />
      ))}
    </>
  );
}

function LogPage() {
  return (
    <>
      <Text style={s.plate}>Plate 18 · What has been done</Text>
      <Text style={s.h1}>The home&apos;s memory.</Text>
      <Text style={s.lede}>
        This is the page you will be glad of in three years, when something fails and the questions are whether it is
        still under warranty and who touched it last.
      </Text>
      <View style={s.tableHead} fixed>
        <Text style={[s.th, { width: "16%" }]}>Date</Text>
        <Text style={[s.th, { width: "36%" }]}>What was done</Text>
        <Text style={[s.th, { width: "20%" }]}>On what</Text>
        <Text style={[s.th, { width: "18%" }]}>By whom</Text>
        <Text style={[s.th, { width: "10%", textAlign: "right" }]}>Cost</Text>
      </View>
      {Array.from({ length: 52 }).map((_, n) => (
        <View key={n} style={{ flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: C.ruleSoft, height: 23 }} />
      ))}
    </>
  );
}

function RentingPage() {
  return (
    <>
      <Text style={s.plate}>Plate 19 · If you rent</Text>
      <Text style={s.h1}>The dates that cost money to miss.</Text>
      <Text style={s.lede}>
        Renting has a short list of its own, and most of it is deadlines. The notice date matters more than the renewal
        date, because that is the one that passes quietly.
      </Text>
      <Row>
        <View style={{ flex: 1 }}>
          <Card caption="The lease">
            <Field label="Started" />
            <Field label="Renews on" />
            <Field label="Notice by" />
          </Card>
        </View>
        <View style={{ flex: 1 }}>
          <Card caption="The deposit">
            <Field label="Amount" />
            <Field label="Held by" />
            <Field label="Returned in" />
          </Card>
        </View>
      </Row>
      <Note
        title="Photograph everything on day one."
        body="Every wall, every worktop, every mark that was already there, with the date visible. A deposit dispute comes down to what you can show, and nobody has ever regretted taking too many photographs on moving day."
      />
      <Card caption="Reported to the landlord">
        <View style={s.tableHead}>
          <Text style={[s.th, { width: "20%" }]}>Date</Text>
          <Text style={[s.th, { width: "48%" }]}>What you reported</Text>
          <Text style={[s.th, { width: "32%" }]}>What happened</Text>
        </View>
        {Array.from({ length: 10 }).map((_, n) => (
          <View key={n} style={{ flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: C.ruleSoft, height: 21 }} />
        ))}
      </Card>

      <Text style={[s.caption, { marginTop: 2 }]}>
        Report anything structural, anything involving water, and anything that stops working in writing, even when you
        also said it out loud. A dated message is the whole difference between a repair the landlord owes you and a
        deduction from the deposit.
      </Text>
    </>
  );
}

function ActivatePage({ code }: { code: string }) {
  return (
    <>
      <Text style={s.plate}>Included with this book</Text>
      <Text style={s.h1}>Activate your digital Home Base.</Text>
      <Text style={s.lede}>
        Everything you have written down goes in once, and then stops being your job to remember. Home Base works out
        what is due, surfaces the few things worth doing, and keeps the record of who did what.
      </Text>

      {[
        ["Go to draftpace.com and sign in", "Create an account with your email, or continue with Google."],
        ["Open draftpace.com/app/redeem", "Or choose Redeem a code from your library."],
        ["Enter the code below", "It unlocks Home Base on your account permanently. One use only, so keep it somewhere safe."],
      ].map(([title, body], i) => (
        <View key={title} style={{ flexDirection: "row", marginBottom: 12 }} wrap={false}>
          <View style={{ width: 32 }}>
            <Text style={{ fontFamily: HEAD, fontSize: 19, color: C.sage, lineHeight: 1 }}>{i + 1}</Text>
          </View>
          <View style={{ flex: 1, borderLeftWidth: 0.6, borderLeftColor: C.rule, paddingLeft: 13 }}>
            <Text style={{ fontSize: 10, marginBottom: 1 }}>{title}</Text>
            <Text style={{ fontSize: 8.5, color: C.muted }}>{body}</Text>
          </View>
        </View>
      ))}

      <View
        style={{ position: "relative", borderWidth: 1, borderColor: C.sage, paddingVertical: 26, alignItems: "center", marginTop: 8, marginBottom: 14 }}
      >
        <Ticks inset={4} />
        <Text style={{ fontSize: 6.8, letterSpacing: 1.8, color: C.sage, textTransform: "uppercase", marginBottom: 10 }}>
          Your activation code
        </Text>
        <Text style={{ fontFamily: HEAD, fontSize: 30, letterSpacing: 4 }}>{code}</Text>
      </View>

      <Text style={s.h2}>What it does that paper cannot</Text>
      <Row>
        {[
          ["It does the arithmetic", "Every date in this book becomes a due date it works out for you, including the seasonal jobs that move with the year."],
          ["It picks", "Not a list of everything. One or two things worth your attention now, and silence when there is genuinely nothing."],
          ["It remembers", "Who came out, what they did, what it cost, and whether it is still under warranty three years later."],
        ].map(([title, body]) => (
          <View key={title} style={{ flex: 1, borderTopWidth: 0.6, borderTopColor: C.rule, paddingTop: 9 }}>
            <Text style={{ fontFamily: HEAD, fontSize: 11.5, marginBottom: 3 }}>{title}</Text>
            <Text style={{ fontSize: 8.2, color: C.muted, lineHeight: 1.5 }}>{body}</Text>
          </View>
        ))}
      </Row>

      <View style={s.thinRule} />

      <Text style={s.caption}>
        Home Base does not connect to your bank, your utilities, or your appliances. It holds what you tell it and works
        out the timing. Trouble redeeming: draftpace.com/support.
      </Text>

      <View style={{ flex: 1 }} />

      <View style={{ alignItems: "center", paddingBottom: 6 }}>
        <PlanDrawing w={150} h={100} />
        <Text style={{ fontSize: 7, letterSpacing: 2.4, color: C.sage, textTransform: "uppercase", marginTop: 18 }}>
          The Home Survey
        </Text>
        <Text style={{ fontSize: 7.5, color: C.faint, marginTop: 5 }}>Draftpace · First edition</Text>
      </View>
    </>
  );
}

/* ---------------------------------------------------------------- data */

const CATEGORY_ORDER: HomeItemCategory[] = [
  "kitchen",
  "laundry",
  "climate",
  "water",
  "power",
  "safety",
  "structure",
  "grounds",
  "pests",
  "everyday",
  "records",
  "renting",
];

function careRows() {
  const rows: { task: string; thing: string; when: string; why: string }[] = [];
  for (const category of CATEGORY_ORDER) {
    for (const type of HOME_ITEM_TYPES.filter((t) => t.category === category)) {
      for (const care of type.care) {
        rows.push({
          task: care.taskName,
          thing: type.label,
          when: care.months?.length ? care.months.map((m) => MONTHS[m - 1]).join(", ") : intervalWords(care.intervalDays),
          why: care.consequence === 2 ? "Safety" : care.consequence === 1 ? "Costly" : "",
        });
      }
    }
  }
  return rows;
}

function seasonalByMonth() {
  return MONTHS.map((month, index) => {
    const jobs: string[] = [];
    for (const type of HOME_ITEM_TYPES) {
      for (const care of type.care) {
        if (care.months?.includes(index + 1)) jobs.push(`${care.taskName} (${type.label.toLowerCase()})`);
      }
    }
    return { month, jobs };
  });
}

export function HomeSurveyWorkbook({
  size,
  code,
}: {
  size: "LETTER" | "A4";
  code: string;
}): React.ReactElement<DocumentProps> {
  const rows = careRows();
  const column = COLUMN[size];
  const walkPlates = CATEGORY_ORDER.filter((c) => HOME_ITEM_TYPES.some((t) => t.category === c));
  const contents = [
    { plate: "Part one", title: "Before you walk" },
    { plate: "Plate 01", title: "If something goes wrong tonight" },
    { plate: "Part two", title: "The walk" },
    ...walkPlates.map((c, i) => ({
      plate: `Plate ${String(i + 2).padStart(2, "0")}`,
      title: HOME_ITEM_CATEGORY_LABEL[c],
    })),
    { plate: "Part three", title: "What it needs" },
    { plate: "Plate 14", title: "The jobs, and how often" },
    { plate: "Plate 15", title: "The year, month by month" },
    { plate: "Plate 16", title: "Quick reference" },
    { plate: "Part four", title: "The record" },
    { plate: "Plate 17", title: "Who to call" },
    { plate: "Plate 18", title: "What has been done" },
    { plate: "Plate 19", title: "If you rent" },
    { plate: "Included", title: "Activate your digital Home Base" },
  ];

  return (
    <Document
      title="The Home Survey"
      author="Draftpace"
      subject="The paper companion to Home Base by Draftpace"
      creator="Draftpace"
      producer="Draftpace"
    >
      <Page size={size} style={s.bleedPage}>
        <Cover />
      </Page>

      <Page size={size} style={s.page}>
        <Sheet section="Contents">
          <Contents plates={contents} />
        </Sheet>
      </Page>

      <Page size={size} style={s.bleedPage}>
        <PartDivider
          number="One"
          title="Before you walk."
          blurb="What this book is for, what it deliberately is not, and the one page worth filling in tonight."
          contents={["Read first", "How this works", "Plate 01 · If something goes wrong tonight"]}
        />
      </Page>

      <Page size={size} style={s.page}>
        <Sheet section="Read first">
          <ReadFirst />
        </Sheet>
      </Page>

      <Page size={size} style={s.page}>
        <Sheet section="How this works">
          <HowItWorks />
        </Sheet>
      </Page>

      <Page size={size} style={s.page}>
        <Sheet section="Tonight" plate="Plate 01">
          <TonightPage column={column} />
        </Sheet>
      </Page>

      <Page size={size} style={s.bleedPage}>
        <PartDivider
          number="Two"
          title="The walk."
          blurb="Twelve areas of a home, in roughly the order you meet them. Tick what is there, then write down whatever is worth the detail."
          contents={walkPlates.map(
            (c, i) => `Plate ${String(i + 2).padStart(2, "0")} · ${HOME_ITEM_CATEGORY_LABEL[c]}`
          )}
        />
      </Page>

      {walkPlates.map((category, i) => {
        const plate = `Plate ${String(i + 2).padStart(2, "0")}`;
        return (
          <Page key={category} size={size} style={s.page}>
            <Sheet section={HOME_ITEM_CATEGORY_LABEL[category]} plate={plate}>
              <CategoryPage
                category={category}
                types={HOME_ITEM_TYPES.filter((t) => t.category === category)}
                plate={plate}
                size={size}
              />
            </Sheet>
          </Page>
        );
      })}

      <Page size={size} style={s.bleedPage}>
        <PartDivider
          number="Three"
          title="What it needs."
          blurb="Every job Home Base knows about, how often it comes round, and which months belong to which work."
          contents={[
            "Plate 14 · The jobs, and how often",
            "Plate 15 · The year, month by month",
            "Plate 16 · Quick reference",
          ]}
        />
      </Page>

      <Page size={size} style={s.page}>
        <Sheet section="What a home needs" plate="Plate 14">
          <CareTable rows={rows} />
        </Sheet>
      </Page>

      <Page size={size} style={s.page}>
        <Sheet section="The year" plate="Plate 15">
          <SeasonalPage byMonth={seasonalByMonth()} />
        </Sheet>
      </Page>

      <Page size={size} style={s.page}>
        <Sheet section="Quick reference" plate="Plate 16">
          <QuickReference />
        </Sheet>
      </Page>

      <Page size={size} style={s.bleedPage}>
        <PartDivider
          number="Four"
          title="The record."
          blurb="Who came out, what they did, what it cost, and the paperwork that turns out to matter later."
          contents={[
            "Plate 17 · Who to call",
            "Plate 18 · What has been done",
            "Plate 19 · If you rent",
            "Activate your digital Home Base",
          ]}
        />
      </Page>

      <Page size={size} style={s.page}>
        <Sheet section="Who to call" plate="Plate 17">
          <PeoplePage />
        </Sheet>
      </Page>

      <Page size={size} style={s.page}>
        <Sheet section="What has been done" plate="Plate 18">
          <LogPage />
        </Sheet>
      </Page>

      <Page size={size} style={s.page}>
        <Sheet section="If you rent" plate="Plate 19">
          <RentingPage />
        </Sheet>
      </Page>

      <Page size={size} style={s.page}>
        <Sheet section="Activate">
          <ActivatePage code={code} />
        </Sheet>
      </Page>
    </Document>
  );
}

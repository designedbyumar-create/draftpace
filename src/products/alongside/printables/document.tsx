/**
 * The Alongside Book.
 *
 * A standalone, structured place to put down what a person is holding
 * in their head: what they mean to do, who they're waiting on, what's
 * still open, and what's worth having to hand. Every page is blank
 * until filled in by hand, same discipline as every other flagship
 * book on this platform. No sample entry, no suggested task, nothing
 * generated. This is the printed product on its own terms, sellable to
 * someone who has never heard of Alongside.
 *
 * DELIBERATELY THE SHORTEST OF THE EIGHT
 *
 * Alongside's own data model is the simplest on the platform, one
 * shape with four kinds (see life.ts), and the audience benefits most
 * from this being obvious at a glance rather than substantial. Short
 * on purpose, not thin.
 *
 * Mulberry and ink, matching the product's own accent. No em dashes.
 */
import { Document, Page, View, Text, StyleSheet, type DocumentProps } from "@react-pdf/renderer";
import { KIND_LABEL, KIND_PROMPT } from "../life";
import { alongsideDefinition } from "../definition";

const accent = alongsideDefinition.theme?.accentScale;
if (!accent) throw new Error("Alongside must declare its accent scale.");

const BOOK_TITLE = "The Alongside Book";
const BOOK_SUBTITLE = "Somewhere to put it down, so your head doesn't have to hold it.";

const C = {
  paper: "#fcfafb",
  ink: "#1d1719",
  body: "#3a3237",
  muted: "#6c6167",
  faint: "#9c8f95",
  rule: "#e8dde2",
  ruleSoft: "#f2eaed",
  write: "#dcc9d1",
  accent: accent.base,
  accentSoft: accent.soft,
  cream: "#f6eef1",
};

const HEAD = "Newsreader";
const BODY = "PlexSans";
const M = { top: 60, bottom: 54, side: 56 };

export type Size = "LETTER" | "A4";

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
  spine: { position: "absolute", top: 0, left: 0, right: 0, height: 3.5, backgroundColor: C.accent },
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

  eyebrow: { fontSize: 6.8, letterSpacing: 1.5, color: C.accent, textTransform: "uppercase" },
  h1: { fontFamily: HEAD, fontSize: 24, color: C.ink, marginTop: 8, lineHeight: 1.15 },
  headRule: { height: 1.2, backgroundColor: C.ink, marginTop: 16, marginBottom: 18 },
  p: { fontSize: 9.2, color: C.body, marginBottom: 8, lineHeight: 1.6 },

  writeLine: { borderBottomWidth: 0.7, borderBottomColor: C.write, height: 22 },
  writeLabel: { fontSize: 7.2, letterSpacing: 0.6, color: C.faint, textTransform: "uppercase", marginBottom: 3 },

  boxLabel: { fontSize: 6.8, letterSpacing: 1.3, color: C.accent, textTransform: "uppercase" },
  box: { borderLeftWidth: 2.5, borderLeftColor: C.accent, backgroundColor: C.accentSoft, paddingVertical: 11, paddingHorizontal: 14 },

  tableHead: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: C.ink, paddingBottom: 5 },
  th: { fontSize: 6.6, letterSpacing: 0.9, color: C.ink, textTransform: "uppercase" },
  tr: { flexDirection: "row", borderBottomWidth: 0.6, borderBottomColor: C.write, minHeight: 24 },
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

function Field({ label }: { label: string }) {
  return (
    <View style={{ marginBottom: 11 }}>
      <Text style={s.writeLabel}>{label}</Text>
      <View style={s.writeLine} />
    </View>
  );
}

function FieldRow({ fields }: { fields: string[] }) {
  return (
    <View style={{ flexDirection: "row", marginBottom: 11 }}>
      {fields.map((label, i) => (
        <View key={label} style={{ flex: 1, marginLeft: i === 0 ? 0 : 18 }}>
          <Text style={s.writeLabel}>{label}</Text>
          <View style={s.writeLine} />
        </View>
      ))}
    </View>
  );
}

function Notes({ label = "Notes", count = 3 }: { label?: string; count?: number }) {
  return (
    <View style={{ marginTop: 4 }}>
      <Text style={s.writeLabel}>{label}</Text>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={s.writeLine} />
      ))}
    </View>
  );
}

interface Column {
  label: string;
  flex?: number;
  width?: number;
}

function RegisterTable({ columns, rows = 14 }: { columns: Column[]; rows?: number }) {
  return (
    <View style={{ marginTop: 10 }}>
      <View style={s.tableHead}>
        {columns.map((c) => (
          <Text key={c.label} style={[s.th, c.flex ? { flex: c.flex } : { width: c.width }]}>
            {c.label}
          </Text>
        ))}
      </View>
      {Array.from({ length: rows }, (_, i) => (
        <View key={i} style={s.tr} />
      ))}
    </View>
  );
}

function RecordPage({
  section,
  eyebrow,
  title,
  children,
  size,
}: {
  section: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  size: Size;
}) {
  return (
    <Page size={size} style={s.page}>
      <Sheet section={section}>
        <Text style={s.eyebrow}>{eyebrow}</Text>
        <Text style={s.h1}>{title}</Text>
        <View style={s.headRule} />
        {children}
      </Sheet>
    </Page>
  );
}

// ---------------------------------------------------------------- manifest

export interface AlongsideBookManifest {
  threads: number;
  weeklyReviews: number;
  size: Size;
}

export const DEFAULT_MANIFEST: AlongsideBookManifest = {
  threads: 3,
  weeklyReviews: 4,
  size: "LETTER",
};

// ------------------------------------------------------------------ pages

function CoverPage({ size }: { size: Size }) {
  return (
    <Page size={size} style={s.bare}>
      <View style={{ flex: 1, backgroundColor: C.cream, paddingHorizontal: 58, paddingTop: 64, paddingBottom: 56 }}>
        <View style={s.spine} fixed />
        <Text style={{ fontSize: 7, letterSpacing: 2.2, color: C.accent, textTransform: "uppercase" }}>Draftpace</Text>
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <View style={{ height: 1.5, backgroundColor: C.ink, marginBottom: 20 }} />
          <Text style={{ fontFamily: HEAD, fontSize: 42, lineHeight: 1.06, color: C.ink }}>
            The{"\n"}Alongside{"\n"}Book
          </Text>
          <Text style={{ fontFamily: HEAD, fontSize: 13, color: C.body, marginTop: 16, lineHeight: 1.5, maxWidth: 320 }}>
            {BOOK_SUBTITLE}
          </Text>
          <Text style={{ fontSize: 9, color: C.muted, marginTop: 24 }}>Undated. Print what you need.</Text>
        </View>
      </View>
    </Page>
  );
}

function HowThisWorksPage({ size }: { size: Size }) {
  return (
    <RecordPage section="How this works" eyebrow="Before you start" title="How this book works" size={size}>
      <Text style={s.p}>Four kinds of page, nothing more:</Text>
      {(Object.keys(KIND_LABEL) as (keyof typeof KIND_LABEL)[]).map((kind) => (
        <View key={kind} style={{ marginBottom: 8 }}>
          <Text style={{ fontSize: 9.6, color: C.ink }}>{KIND_LABEL[kind]}</Text>
          <Text style={{ fontSize: 8.2, color: C.muted, marginTop: 1 }}>{KIND_PROMPT[kind]}</Text>
        </View>
      ))}
      <View style={[s.box, { marginTop: 14 }]}>
        <Text style={s.boxLabel}>That's it</Text>
        <Text style={{ fontSize: 9, color: C.ink, marginTop: 5, lineHeight: 1.55 }}>
          No scoring, no streaks, nothing to keep up. Write it down when it's on your mind, cross it off when it's
          done, and leave a page blank when there's nothing there. A blank page is a fine week.
        </Text>
      </View>
    </RecordPage>
  );
}

function CommitmentsPage({ size }: { size: Size }) {
  return (
    <RecordPage section="Something to do" eyebrow="Register" title="Commitments" size={size}>
      <RegisterTable columns={[{ label: "What", flex: 1.6 }, { label: "Due", flex: 0.7 }, { label: "Note", flex: 1.3 }]} rows={20} />
    </RecordPage>
  );
}

function WaitingPage({ size }: { size: Size }) {
  return (
    <RecordPage section="Waiting on someone" eyebrow="Register" title="Waiting on someone" size={size}>
      <RegisterTable
        columns={[
          { label: "What", flex: 1.4 },
          { label: "Waiting on", flex: 1 },
          { label: "Check back on", flex: 0.8 },
          { label: "Note", flex: 1 },
        ]}
        rows={16}
      />
    </RecordPage>
  );
}

function ThreadPage({ size, index, total }: { size: Size; index: number; total: number }) {
  return (
    <RecordPage section="Something ongoing" eyebrow={`Thread ${index} of ${total}`} title="Ongoing thread" size={size}>
      <Field label="What is it?" />
      <FieldRow fields={["Last touched", "Check back on"]} />
      <Notes label="Where you left off" count={3} />
      <Field label="Next step" />
    </RecordPage>
  );
}

function ReferencePage({ size }: { size: Size }) {
  return (
    <RecordPage section="Worth having to hand" eyebrow="Register" title="Reference" size={size}>
      <Text style={s.p}>
        A claim number, an appointment reference, a phone number: the detail that makes dealing with a specific
        thing possible. Not a notes page.
      </Text>
      <RegisterTable columns={[{ label: "What", flex: 1.2 }, { label: "Detail", flex: 1.8 }]} rows={16} />
    </RecordPage>
  );
}

function WeeklyReviewPage({ size, index, total }: { size: Size; index: number; total: number }) {
  return (
    <RecordPage section="Weekly review" eyebrow={`Review ${index} of ${total}, undated`} title="Weekly review" size={size}>
      <Field label="Week of" />
      <Notes label="What's still open" count={3} />
      <Notes label="What moved" count={3} />
      <Notes label="What's stuck, and what it needs" count={3} />
    </RecordPage>
  );
}

function AboutPage({ size }: { size: Size }) {
  return (
    <RecordPage section="About this book" eyebrow="Last page" title="About this book." size={size}>
      <Text style={s.p}>
        The Alongside Book is one half of the digital Alongside. The other half is an app that surfaces what's
        waiting on you without you having to reread every page, and picks a thread back up with what you left
        yourself instead of starting cold.
      </Text>
      <Text style={s.p}>
        Neither half needs the other. This book works with a pen and nothing else, and the app works if you never
        print a page.
      </Text>
      <Text style={s.p}>
        Nothing in this book was generated. Every sentence was written by a person, and there is no model involved
        anywhere in this product.
      </Text>
      <Text style={{ fontSize: 8.4, color: C.faint, marginTop: 24 }}>The Alongside Book. Draftpace. Undated by design.</Text>
    </RecordPage>
  );
}

/** The one page that isn't part of the book itself: how it connects to the app. Only rendered when a code is supplied. */
function ActivatePage({ size, code }: { size: Size; code: string }) {
  return (
    <Page size={size} style={s.page}>
      <Sheet section="Activate">
        <Text style={s.eyebrow}>Included with this book</Text>
        <Text style={s.h1}>Activate your digital Alongside.</Text>
        <View style={s.headRule} />
        <Text style={s.p}>
          The book works with a pen and nothing else. The app is the other half: it surfaces what's waiting on you
          without a reread, and picks a thread back up with what you left yourself.
        </Text>

        {[
          ["Go to draftpace.com and sign in", "Create an account with your email, or continue with Google."],
          ["Open draftpace.com/app/redeem", "Or choose Redeem a code from your library once signed in."],
          ["Enter the code below", "It unlocks Alongside on your account for good. One use per account, so keep it somewhere safe."],
        ].map(([title, body], i) => (
          <View key={title} style={{ flexDirection: "row", marginTop: 14, marginBottom: i === 2 ? 0 : 12 }} wrap={false}>
            <View style={{ width: 30 }}>
              <Text style={{ fontFamily: HEAD, fontSize: 18, color: C.accent, lineHeight: 1 }}>{i + 1}</Text>
            </View>
            <View style={{ flex: 1, borderLeftWidth: 0.7, borderLeftColor: C.rule, paddingLeft: 13 }}>
              <Text style={{ fontSize: 9.6, color: C.ink }}>{title}</Text>
              <Text style={{ fontSize: 8.2, color: C.muted, marginTop: 1 }}>{body}</Text>
            </View>
          </View>
        ))}

        <View
          style={{
            position: "relative",
            borderWidth: 1,
            borderColor: C.accent,
            paddingVertical: 24,
            alignItems: "center",
            marginTop: 22,
            marginBottom: 18,
          }}
        >
          <Text style={{ fontSize: 6.8, letterSpacing: 1.8, color: C.accent, textTransform: "uppercase", marginBottom: 9 }}>
            Your activation code
          </Text>
          <Text style={{ fontFamily: HEAD, fontSize: 28, letterSpacing: 3.5, color: C.ink }}>{code}</Text>
        </View>

        <Text style={s.boxLabel}>What the app does that the book cannot</Text>
        <View style={[s.box, { marginTop: 6, flexDirection: "row" }]}>
          {[
            ["It surfaces, not stores", "What's waiting on you shows up without you having to reread every page."],
            ["It resumes threads", "Reopen one and see exactly what you left yourself, not a blank page again."],
            ["Nothing generated", "No model anywhere in it, the same rule this book itself follows."],
          ].map(([title, body], i) => (
            <View key={title} style={{ flex: 1, marginLeft: i === 0 ? 0 : 14, paddingLeft: i === 0 ? 0 : 14, borderLeftWidth: i === 0 ? 0 : 0.6, borderLeftColor: C.rule }}>
              <Text style={{ fontFamily: HEAD, fontSize: 10.5, color: C.ink, marginBottom: 3 }}>{title}</Text>
              <Text style={{ fontSize: 7.8, color: C.body, lineHeight: 1.5 }}>{body}</Text>
            </View>
          ))}
        </View>

        <Text style={[s.p, { marginTop: 18, fontSize: 8, color: C.faint }]}>
          Trouble redeeming: draftpace.com/support.
        </Text>
      </Sheet>
    </Page>
  );
}

// -------------------------------------------------------------- document

export function AlongsideBookDocument({
  manifest = DEFAULT_MANIFEST,
  code,
}: {
  manifest?: AlongsideBookManifest;
  /** An Etsy print-run's activation code. Omitted entirely for a customer downloading their own copy from inside the app. */
  code?: string;
}): React.ReactElement<DocumentProps> {
  const { size } = manifest;
  const repeat = <T,>(count: number, render: (index: number, total: number) => T): T[] =>
    Array.from({ length: count }, (_, i) => render(i + 1, count));

  return (
    <Document title={BOOK_TITLE} author="Draftpace" subject={BOOK_TITLE} creator="Alongside by Draftpace" producer="Alongside by Draftpace">
      <CoverPage size={size} />
      <HowThisWorksPage size={size} />

      <CommitmentsPage size={size} />
      <WaitingPage size={size} />
      {repeat(manifest.threads, (i, t) => <ThreadPage key={`th${i}`} size={size} index={i} total={t} />)}
      <ReferencePage size={size} />

      {repeat(manifest.weeklyReviews, (i, t) => <WeeklyReviewPage key={`wr${i}`} size={size} index={i} total={t} />)}

      <AboutPage size={size} />
      {code && <ActivatePage size={size} code={code} />}
    </Document>
  );
}

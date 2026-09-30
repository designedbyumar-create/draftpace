/**
 * The Glove Box Book.
 *
 * A standalone, structured maintenance record: every page is blank
 * until a person fills it in by hand, same discipline as every other
 * flagship book on this platform. No sample data, no make/model
 * suggestions, no invented interval. This is the printed product on
 * its own terms, sellable to someone who has never heard of Vehicle
 * Maintenance Companion.
 *
 * THE SERVICE BOUNDARY IS THE SIGNATURE PAGE
 *
 * Every other page here is a well-organised glove box binder any
 * product could print. This one is not: a page that states, in
 * writing, what is authorized today and what is not without a call
 * first is this product's own way of thinking, done by hand instead
 * of by the app. See the live product's own printables/
 * generateServiceBoundary.tsx, which calls it "this product's
 * signature document."
 *
 * Amber and graphite, matching the product's own accent. No em dashes.
 */
import { Document, Page, View, Text, StyleSheet, type DocumentProps } from "@react-pdf/renderer";
import { RENEWAL_KINDS } from "../state";
import { vehicleMaintenanceCompanionDefinition } from "../definition";

const accent = vehicleMaintenanceCompanionDefinition.theme?.accentScale;
if (!accent) throw new Error("Vehicle Maintenance Companion must declare its accent scale.");

const BOOK_TITLE = "The Glove Box Book";
const BOOK_SUBTITLE = "For the glove box, for the driveway, for whoever's driving it next.";

const C = {
  paper: "#fdfbf8",
  ink: "#211f1a",
  body: "#3d3a33",
  muted: "#6f6c62",
  faint: "#9a9587",
  rule: "#e2ddd0",
  ruleSoft: "#eee9dd",
  write: "#dcd2ba",
  accent: accent.base,
  accentSoft: accent.soft,
  cream: "#f6f1e6",
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

function TypesNote({ label, items }: { label: string; items: readonly string[] }) {
  return (
    <Text style={{ fontSize: 7.8, color: C.faint, marginTop: 12, lineHeight: 1.5 }}>
      {label}: {items.join(", ")}.
    </Text>
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

export interface GloveBoxBookManifest {
  vehicles: number;
  serviceHistoryRows: number;
  serviceBoundaries: number;
  size: Size;
}

export const DEFAULT_MANIFEST: GloveBoxBookManifest = {
  vehicles: 2,
  serviceHistoryRows: 16,
  serviceBoundaries: 2,
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
          <Text style={{ fontFamily: HEAD, fontSize: 46, lineHeight: 1.04, color: C.ink }}>
            The Glove{"\n"}Box Book
          </Text>
          <Text style={{ fontFamily: HEAD, fontSize: 13, color: C.body, marginTop: 16, lineHeight: 1.5, maxWidth: 330 }}>
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
      <Text style={s.p}>
        A vehicle profile page for each car, then the registers: a maintenance schedule, a service history log and a
        renewals tracker. Every field is blank. Nothing here was filled in for you, and no interval, make or model was
        suggested.
      </Text>
      <View style={[s.box, { marginTop: 12 }]}>
        <Text style={s.boxLabel}>The Service Boundary</Text>
        <Text style={{ fontSize: 9, color: C.ink, marginTop: 5, lineHeight: 1.55 }}>
          Worth using even if you skip every other page. A dated, mileage-stamped statement of what you are
          authorizing today and what a shop should call first before doing, handed over before anyone touches the
          car. "While we had it up on the lift" is how a routine oil change becomes a much larger bill; a boundary
          stated in writing, in advance, is worth more at the counter than a memory of what was agreed on the phone.
        </Text>
      </View>
    </RecordPage>
  );
}

function VehicleProfilePage({ size, index, total }: { size: Size; index: number; total: number }) {
  return (
    <RecordPage section="Vehicle profile" eyebrow={`Vehicle ${index} of ${total}`} title="Vehicle profile" size={size}>
      <FieldRow fields={["Year, make, model", "What you call it"]} />
      <FieldRow fields={["Plate", "VIN"]} />
      <FieldRow fields={["Tyre size", "Oil specification"]} />
      <FieldRow fields={["Insurer", "Policy number"]} />
      <Field label="Roadside assistance number" />
      <Notes label="Anything else worth having to hand" count={2} />
    </RecordPage>
  );
}

function MaintenanceSchedulePage({ size }: { size: Size }) {
  return (
    <RecordPage section="Maintenance schedule" eyebrow="Register" title="Maintenance schedule" size={size}>
      <RegisterTable
        columns={[
          { label: "Task", flex: 1.3 },
          { label: "Interval, miles", flex: 0.8 },
          { label: "Interval, months", flex: 0.8 },
          { label: "Severe duty", flex: 0.7 },
          { label: "Last done", flex: 0.9 },
        ]}
        rows={16}
      />
      <Text style={{ fontSize: 7.8, color: C.faint, marginTop: 12, lineHeight: 1.5 }}>
        Severe duty: short trips, towing, dust, heat or cold. Marking a task shortens its own interval, nothing
        else's.
      </Text>
    </RecordPage>
  );
}

function ServiceHistoryPage({ size, rows }: { size: Size; rows: number }) {
  return (
    <RecordPage section="Service history" eyebrow="Register, oldest first" title="Service history log" size={size}>
      <Text style={s.p}>
        What was actually done, in the order it happened. This is the record a buyer reads, dates, mileages and who
        did the work, written down at the time rather than remembered later.
      </Text>
      <RegisterTable
        columns={[
          { label: "Date", flex: 0.7 },
          { label: "Mileage", flex: 0.7 },
          { label: "Work done", flex: 1.4 },
          { label: "Shop", flex: 1 },
          { label: "Cost", flex: 0.7 },
        ]}
        rows={rows}
      />
    </RecordPage>
  );
}

function RenewalsPage({ size }: { size: Size }) {
  return (
    <RecordPage section="Renewals" eyebrow="Register" title="Renewals and paperwork" size={size}>
      <RegisterTable
        columns={[
          { label: "Kind", flex: 1 },
          { label: "Due date", flex: 0.8 },
          { label: "Where it's kept", flex: 1.4 },
          { label: "Notes", flex: 1 },
        ]}
        rows={14}
      />
      <TypesNote label="Kinds" items={RENEWAL_KINDS} />
    </RecordPage>
  );
}

function ServiceBoundaryPage({ size, index, total }: { size: Size; index: number; total: number }) {
  return (
    <RecordPage section="Service Boundary" eyebrow={`Boundary ${index} of ${total}, dated`} title="The Service Boundary" size={size}>
      <FieldRow fields={["Date", "Mileage"]} />
      <FieldRow fields={["Shop", "Reason for this visit"]} />
      <Notes label="Authorized today" count={4} />
      <Notes label="Not authorized without a call first" count={4} />
      <Field label="Phone number to call" />
    </RecordPage>
  );
}

function AboutPage({ size }: { size: Size }) {
  return (
    <RecordPage section="About this book" eyebrow="Last page" title="About this book." size={size}>
      <Text style={s.p}>
        The Glove Box Book is one half of Vehicle Maintenance Companion. The other half is an app that works out
        what is due from the dates and mileages you give it, and remembers every service so it never has to be
        rebuilt from memory at trade-in time.
      </Text>
      <Text style={s.p}>
        Neither half needs the other. This book works with a pen and nothing else, and the app works if you never
        print a page.
      </Text>
      <Text style={s.p}>
        Nothing in this book was generated. Every sentence was written by a person, and there is no model involved
        anywhere in this product. No interval on the maintenance schedule was suggested or looked up; every one is
        yours to fill in.
      </Text>
      <Text style={{ fontSize: 8.4, color: C.faint, marginTop: 24 }}>The Glove Box Book. Draftpace. Undated by design.</Text>
    </RecordPage>
  );
}

/** The one page that isn't part of the book itself: how it connects to the app. Only rendered when a code is supplied. */
function ActivatePage({ size, code }: { size: Size; code: string }) {
  return (
    <Page size={size} style={s.page}>
      <Sheet section="Activate">
        <Text style={s.eyebrow}>Included with this book</Text>
        <Text style={s.h1}>Activate your digital Vehicle Maintenance Companion.</Text>
        <View style={s.headRule} />
        <Text style={s.p}>
          The book works with a pen and nothing else. The app is the other half: it works out what is due from what
          you give it, and remembers every service so the history is never rebuilt from memory at trade-in time.
        </Text>

        {[
          ["Go to draftpace.com and sign in", "Create an account with your email, or continue with Google."],
          ["Open draftpace.com/app/redeem", "Or choose Redeem a code from your library once signed in."],
          [
            "Enter the code below",
            "It unlocks Vehicle Maintenance Companion on your account for good. One use per account, so keep it somewhere safe.",
          ],
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
            ["It does the arithmetic", "Every interval becomes a due date, worked out from your own mileage and dates."],
            ["It's per vehicle", "As many cars as you own, each with its own schedule and history."],
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

export function GloveBoxBookDocument({
  manifest = DEFAULT_MANIFEST,
  code,
}: {
  manifest?: GloveBoxBookManifest;
  /** An Etsy print-run's activation code. Omitted entirely for a customer downloading their own copy from inside the app. */
  code?: string;
}): React.ReactElement<DocumentProps> {
  const { size } = manifest;
  const repeat = <T,>(count: number, render: (index: number, total: number) => T): T[] =>
    Array.from({ length: count }, (_, i) => render(i + 1, count));

  return (
    <Document title={BOOK_TITLE} author="Draftpace" subject={BOOK_TITLE} creator="Vehicle Maintenance Companion by Draftpace" producer="Vehicle Maintenance Companion by Draftpace">
      <CoverPage size={size} />
      <HowThisWorksPage size={size} />

      {repeat(manifest.vehicles, (i, t) => <VehicleProfilePage key={`v${i}`} size={size} index={i} total={t} />)}

      <MaintenanceSchedulePage size={size} />
      <ServiceHistoryPage size={size} rows={manifest.serviceHistoryRows} />
      <RenewalsPage size={size} />

      {repeat(manifest.serviceBoundaries, (i, t) => <ServiceBoundaryPage key={`sb${i}`} size={size} index={i} total={t} />)}

      <AboutPage size={size} />
      {code && <ActivatePage size={size} code={code} />}
    </Document>
  );
}

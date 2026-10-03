/**
 * The Family Health Binder.
 *
 * A standalone, structured health record: every page is blank until a
 * person fills it in by hand, same discipline as every other flagship
 * book on this platform. No sample data, no medical advice, no
 * suggested medication or dose. This is the printed product on its
 * own terms, sellable to someone who has never heard of Family Health
 * Binder.
 *
 * A FEW CORE PAGES, THEN A LIBRARY OF REPEATABLE RECORDS
 *
 * A family member page repeats per person; medical facts, immunizations
 * and providers are registers a family fills as they go. Three of the
 * pages here (the emergency card, the caregiver sheet and the visit
 * page) already exist in the live product as populated snapshots, see
 * printables/generateEmergencyCard.tsx, generateCaregiverSheet.tsx and
 * generateVisitPrep.tsx; this book gives each the same shape, blank.
 *
 * Rose and ink, matching the product's own accent. No em dashes.
 */
import { Document, Page, View, Text, StyleSheet, type DocumentProps } from "@react-pdf/renderer";
import { familyHealthBinderDefinition } from "../definition";

const accent = familyHealthBinderDefinition.theme?.accentScale;
if (!accent) throw new Error("Family Health Binder must declare its accent scale.");

const BOOK_TITLE = "The Family Health Binder";
const BOOK_SUBTITLE = "One place for what each of you needs a doctor, a sitter or an ER to know.";

const RELATIONSHIPS = ["self", "spouse", "child", "parent", "other"] as const;
const PROVIDER_KINDS = ["doctor", "specialist", "dentist", "pharmacy", "other"] as const;

const C = {
  paper: "#fdfaf9",
  ink: "#221a1d",
  body: "#3f3439",
  muted: "#6f6167",
  faint: "#a1919a",
  rule: "#ecdee3",
  ruleSoft: "#f4e9ec",
  write: "#e3c9d2",
  accent: accent.base,
  accentSoft: accent.soft,
  cream: "#f7eef1",
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

/** One template page is printed per repeatable record, not a fixed run of blank copies. */
function MoreCue({ text }: { text: string }) {
  return (
    <View style={{ marginTop: 16, paddingTop: 10, borderTopWidth: 0.6, borderTopColor: C.ruleSoft }}>
      <Text style={{ fontSize: 7.8, color: C.faint, lineHeight: 1.5 }}>{text}</Text>
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

export interface FamilyHealthBinderManifest {
  members: number;
  size: Size;
}

export const DEFAULT_MANIFEST: FamilyHealthBinderManifest = {
  members: 2,
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
          <Text style={{ fontFamily: HEAD, fontSize: 44, lineHeight: 1.05, color: C.ink }}>
            The Family{"\n"}Health Binder
          </Text>
          <Text style={{ fontFamily: HEAD, fontSize: 13, color: C.body, marginTop: 16, lineHeight: 1.5, maxWidth: 340 }}>
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
        A profile page for each person, then registers for medical facts, immunizations and the care team, plus five
        situational pages: a symptom log, a visit page, an emergency card, a caregiver sheet. Print one family
        member's pages or all of them; every field is blank until you write in it.
      </Text>
      <View style={[s.box, { marginTop: 12 }]}>
        <Text style={s.boxLabel}>Private stays private</Text>
        <Text style={{ fontSize: 9, color: C.ink, marginTop: 5, lineHeight: 1.55 }}>
          In the live product, a fact can be marked private, kept off the caregiver sheet and the forms sheet by
          default. On paper that choice is yours: keep this binder wherever only the people who should see it can.
        </Text>
      </View>
    </RecordPage>
  );
}

function MemberProfilePage({ size, index, total }: { size: Size; index: number; total: number }) {
  return (
    <RecordPage section="Family member" eyebrow={`Person ${index} of ${total}`} title="Family member" size={size}>
      <FieldRow fields={["Name", "Relationship"]} />
      <FieldRow fields={["Date of birth", "Insurer"]} />
      <FieldRow fields={["Insurance member ID", "Insurance group"]} />
      <FieldRow fields={["Emergency contact name", "Emergency contact phone"]} />
      <Notes label="Care notes (routines, comforts, fears)" count={3} />
      <TypesNote label="Relationships" items={RELATIONSHIPS} />
      {index === total && (
        <MoreCue text="Bigger family than this? Photocopy this page for each additional person, or add them in the app instead." />
      )}
    </RecordPage>
  );
}

function MedicalFactsPage({ size, index, total }: { size: Size; index: number; total: number }) {
  return (
    <RecordPage section="Medical facts" eyebrow={`Person ${index} of ${total}`} title="Medical facts" size={size}>
      <Text style={{ fontSize: 8.6, letterSpacing: 0.8, color: C.accent, textTransform: "uppercase", marginBottom: 4 }}>Medications</Text>
      <RegisterTable columns={[{ label: "Name", flex: 1.2 }, { label: "Dosage", flex: 0.8 }, { label: "Frequency", flex: 0.8 }, { label: "Started", flex: 0.7 }]} rows={4} />
      <Text style={{ fontSize: 8.6, letterSpacing: 0.8, color: C.accent, textTransform: "uppercase", marginTop: 14, marginBottom: 4 }}>Allergies</Text>
      <RegisterTable columns={[{ label: "Allergy", flex: 1.4 }, { label: "Reaction", flex: 1.6 }]} rows={3} />
      <Text style={{ fontSize: 8.6, letterSpacing: 0.8, color: C.accent, textTransform: "uppercase", marginTop: 14, marginBottom: 4 }}>Conditions and history</Text>
      <RegisterTable columns={[{ label: "Detail", flex: 2.2 }, { label: "Noted", flex: 0.8 }]} rows={4} />
      {index === total && (
        <MoreCue text="One more page needed per person? Photocopy this page, or keep medical facts current in the app instead, one place to update instead of finding every page a fact appears on." />
      )}
    </RecordPage>
  );
}

function SymptomLogPage({ size }: { size: Size }) {
  return (
    <RecordPage section="Symptom log" eyebrow="Register" title="Symptom log" size={size}>
      <RegisterTable
        columns={[
          { label: "Who", flex: 0.8 },
          { label: "What happened", flex: 1.4 },
          { label: "Onset", flex: 0.7 },
          { label: "Duration", flex: 0.7 },
          { label: "Severity", flex: 0.6 },
          { label: "What helped", flex: 1.2 },
        ]}
        rows={16}
      />
      <TypesNote label="Severity" items={["mild", "moderate", "severe"]} />
    </RecordPage>
  );
}

function ProvidersPage({ size }: { size: Size }) {
  return (
    <RecordPage section="Care team" eyebrow="Register" title="Care team and providers" size={size}>
      <RegisterTable
        columns={[
          { label: "Name", flex: 1.2 },
          { label: "Kind", flex: 0.9 },
          { label: "For whom", flex: 1 },
          { label: "Phone", flex: 1 },
          { label: "Notes", flex: 1 },
        ]}
        rows={16}
      />
      <TypesNote label="Kinds" items={PROVIDER_KINDS} />
    </RecordPage>
  );
}

function ImmunizationPage({ size }: { size: Size }) {
  return (
    <RecordPage section="Immunizations" eyebrow="Register" title="Immunization record" size={size}>
      <RegisterTable
        columns={[
          { label: "Who", flex: 0.9 },
          { label: "Vaccine", flex: 1.3 },
          { label: "Date given", flex: 0.9 },
          { label: "Notes", flex: 1.3 },
        ]}
        rows={18}
      />
    </RecordPage>
  );
}

function VisitPage({ size, index, total }: { size: Size; index: number; total: number }) {
  return (
    <RecordPage section="Visit" eyebrow={`Visit ${index} of ${total}`} title="Visit" size={size}>
      <FieldRow fields={["Who", "Date"]} />
      <FieldRow fields={["With whom / where", "Reason for this visit"]} />
      <Notes label="Questions to ask" count={4} />
      <Notes label="What's been happening" count={2} />
      <Notes label="What was said or decided" count={4} />
      {index === total && <MoreCue text="Another visit coming up? Photocopy this page, or prep for it in the app instead." />}
    </RecordPage>
  );
}

function EmergencyCardPage({ size }: { size: Size }) {
  return (
    <RecordPage section="Emergency card" eyebrow="For a wallet, a bag or the fridge" title="Emergency card" size={size}>
      <Text style={s.p}>
        Short by design: names and numbers only, so it can be read at a glance by someone who does not know the
        family. Fill one per person, or one shared card for the household.
      </Text>
      <FieldRow fields={["Name", "Date of birth"]} />
      <FieldRow fields={["Allergies", "Conditions"]} />
      <FieldRow fields={["Emergency contact", "Phone"]} />
      <Field label="Insurer and member ID" />
      <Text style={{ fontSize: 8.6, color: C.faint, marginTop: 6 }}>In a true emergency, call 911 first.</Text>
    </RecordPage>
  );
}

function CaregiverSheetPage({ size }: { size: Size }) {
  return (
    <RecordPage section="Caregiver sheet" eyebrow="For a sitter, a grandparent or respite care" title="Caregiver sheet" size={size}>
      <Notes label="What to avoid" count={3} />
      <Notes label="What is taken, and when" count={3} />
      <FieldRow fields={["Who to call first", "Phone"]} />
      <Notes label="Routines and comforts" count={3} />
      <Text style={{ fontSize: 8.6, color: C.faint, marginTop: 6 }}>In a true emergency, call 911 first.</Text>
    </RecordPage>
  );
}

function AboutPage({ size }: { size: Size }) {
  return (
    <RecordPage section="About this book" eyebrow="Last page" title="About this book." size={size}>
      <Text style={s.p}>
        The Family Health Binder is one half of the digital Family Health Binder. The other half is an app that
        keeps this current: a fact recorded once is on every page it belongs on, and a private fact stays off the
        pages meant to be handed to someone else.
      </Text>
      <Text style={s.p}>
        Neither half needs the other. This book works with a pen and nothing else, and the app works if you never
        print a page.
      </Text>
      <Text style={s.p}>
        Nothing in this book was generated. Every sentence was written by a person, and there is no model involved
        anywhere in this product. It contains no medical advice: what to record is yours to decide, and what it
        means is a question for the people on your care team page.
      </Text>
      <Text style={{ fontSize: 8.4, color: C.faint, marginTop: 24 }}>The Family Health Binder. Draftpace. Undated by design.</Text>
    </RecordPage>
  );
}

/** The one page that isn't part of the book itself: how it connects to the app. Only rendered when a code is supplied. */
function ActivatePage({ size, code }: { size: Size; code: string }) {
  return (
    <Page size={size} style={s.page}>
      <Sheet section="Activate">
        <Text style={s.eyebrow}>Included with this book</Text>
        <Text style={s.h1}>Activate your digital Family Health Binder.</Text>
        <View style={s.headRule} />
        <Text style={s.p}>
          The book works with a pen and nothing else. The app is where you keep it current: a fact recorded once
          shows up everywhere it belongs, and a private fact stays private by default.
        </Text>

        {[
          ["Go to draftpace.com and sign in", "Create an account with your email, or continue with Google."],
          ["Open draftpace.com/app/redeem", "Or choose Redeem a code from your account once signed in."],
          [
            "Enter the code below",
            "It unlocks the Family Health Binder on your account for good. One use per account, so keep it somewhere safe.",
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
            ["It's private by default", "Mark a fact private and it leaves the pages meant for someone else, automatically."],
            ["It stays current", "One place to update, instead of finding every page a fact appears on."],
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

export function FamilyHealthBinderDocument({
  manifest = DEFAULT_MANIFEST,
  code,
}: {
  manifest?: FamilyHealthBinderManifest;
  /** An Etsy print-run's activation code. Omitted entirely for a customer downloading their own copy from inside the app. */
  code?: string;
}): React.ReactElement<DocumentProps> {
  const { size } = manifest;
  const repeat = <T,>(count: number, render: (index: number, total: number) => T): T[] =>
    Array.from({ length: count }, (_, i) => render(i + 1, count));

  return (
    <Document title={BOOK_TITLE} author="Draftpace" subject={BOOK_TITLE} creator="Family Health Binder by Draftpace" producer="Family Health Binder by Draftpace">
      <CoverPage size={size} />
      <HowThisWorksPage size={size} />

      {repeat(manifest.members, (i, t) => <MemberProfilePage key={`m${i}`} size={size} index={i} total={t} />)}
      {repeat(manifest.members, (i, t) => <MedicalFactsPage key={`mf${i}`} size={size} index={i} total={t} />)}

      <SymptomLogPage size={size} />
      <ProvidersPage size={size} />
      <ImmunizationPage size={size} />

      {repeat(1, (i, t) => <VisitPage key={`vp${i}`} size={size} index={i} total={t} />)}

      <EmergencyCardPage size={size} />
      <CaregiverSheetPage size={size} />

      <AboutPage size={size} />
      {code && <ActivatePage size={size} code={code} />}
    </Document>
  );
}

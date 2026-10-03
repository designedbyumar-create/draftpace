/**
 * The Money Book.
 *
 * A standalone, structured money record: every page is blank until a
 * person fills it in by hand, same discipline as every other flagship
 * book on this platform. No sample balance, no suggested budget
 * category, no invented interest rate. This is the printed product on
 * its own terms, sellable to someone who has never heard of Personal
 * Finance Companion.
 *
 * Separate from printableFinanceCompanionLetter.base64.ts, the
 * existing pre-made flagship supplied from outside this codebase: that
 * file has no editable source, so it cannot carry an activation page.
 * This is a second, source-controlled flagship built specifically so
 * an Etsy edition can exist at all, matching the internal consistency
 * every other product's own book already has. Nothing about the
 * existing file changes.
 *
 * Forest and ink, matching the product's own accent. No em dashes.
 */
import { Document, Page, View, Text, StyleSheet, type DocumentProps } from "@react-pdf/renderer";
import { personalFinanceCompanionDefinition } from "../definition";

const accent = personalFinanceCompanionDefinition.theme?.accentScale;
if (!accent) throw new Error("Personal Finance Companion must declare its accent scale.");

const BOOK_TITLE = "The Money Book";
const BOOK_SUBTITLE = "Everything your money depends on, written down once, in one place.";

const ACCOUNT_TYPES = ["checking", "savings", "cash", "digital wallet", "other"] as const;
const DEBT_TYPES = ["credit card", "personal loan", "student loan", "auto loan", "mortgage", "other"] as const;
const SAVINGS_TYPES = ["emergency fund", "general goal", "sinking fund"] as const;

const C = {
  paper: "#fafbf9",
  ink: "#161d1a",
  body: "#333c37",
  muted: "#646f68",
  faint: "#96a099",
  rule: "#dde5e0",
  ruleSoft: "#eaeeeb",
  write: "#c8d6cd",
  accent: accent.base,
  accentSoft: accent.soft,
  cream: "#eef4f1",
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

export interface MoneyBookManifest {
  monthlyLedgers: number;
  size: Size;
}

export const DEFAULT_MANIFEST: MoneyBookManifest = {
  monthlyLedgers: 1,
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
          <Text style={{ fontFamily: HEAD, fontSize: 48, lineHeight: 1.04, color: C.ink }}>
            The Money{"\n"}Book
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
        Registers for accounts, income, bills and subscriptions, debts and savings goals, then monthly ledger pages
        for the ongoing record. Every field is blank. Nothing here was filled in for you, and no category, budget or
        interest rate was suggested.
      </Text>
      <View style={[s.box, { marginTop: 12 }]}>
        <Text style={s.boxLabel}>No advice on these pages</Text>
        <Text style={{ fontSize: 9, color: C.ink, marginTop: 5, lineHeight: 1.55 }}>
          This book records what is true about your money. It has no opinion about what you should do with it: no
          suggested budget, no recommended split, nothing computed for you. That is yours to decide.
        </Text>
      </View>
    </RecordPage>
  );
}

function AccountsPage({ size }: { size: Size }) {
  return (
    <RecordPage section="Accounts" eyebrow="Register" title="Accounts" size={size}>
      <RegisterTable
        columns={[
          { label: "Account", flex: 1.2 },
          { label: "Type", flex: 0.9 },
          { label: "Balance", flex: 0.8 },
          { label: "As of", flex: 0.7 },
          { label: "Notes", flex: 1 },
        ]}
        rows={12}
      />
      <TypesNote label="Types" items={ACCOUNT_TYPES} />
    </RecordPage>
  );
}

function IncomePage({ size }: { size: Size }) {
  return (
    <RecordPage section="Income" eyebrow="Register" title="Income sources" size={size}>
      <RegisterTable
        columns={[
          { label: "Source", flex: 1.2 },
          { label: "Amount", flex: 0.8 },
          { label: "Frequency", flex: 0.9 },
          { label: "Next expected", flex: 0.9 },
          { label: "Gross / net", flex: 0.7 },
        ]}
        rows={10}
      />
    </RecordPage>
  );
}

function BillsPage({ size }: { size: Size }) {
  return (
    <RecordPage section="Bills" eyebrow="Register" title="Bills and subscriptions" size={size}>
      <RegisterTable
        columns={[
          { label: "Name", flex: 1.2 },
          { label: "Category", flex: 0.9 },
          { label: "Amount", flex: 0.7 },
          { label: "Due", flex: 0.7 },
          { label: "Essential", flex: 0.6 },
          { label: "Funded", flex: 0.6 },
        ]}
        rows={18}
      />
    </RecordPage>
  );
}

function DebtsPage({ size }: { size: Size }) {
  return (
    <RecordPage section="Debts" eyebrow="Register" title="Debts" size={size}>
      <RegisterTable
        columns={[
          { label: "Debt", flex: 1.1 },
          { label: "Type", flex: 0.9 },
          { label: "Balance", flex: 0.7 },
          { label: "Rate", flex: 0.5 },
          { label: "Minimum", flex: 0.7 },
          { label: "Due", flex: 0.6 },
        ]}
        rows={10}
      />
      <TypesNote label="Types" items={DEBT_TYPES} />
    </RecordPage>
  );
}

function SavingsGoalsPage({ size }: { size: Size }) {
  return (
    <RecordPage section="Savings" eyebrow="Register" title="Savings goals" size={size}>
      <RegisterTable
        columns={[
          { label: "Goal", flex: 1.2 },
          { label: "Type", flex: 0.9 },
          { label: "Target", flex: 0.8 },
          { label: "Saved so far", flex: 0.8 },
          { label: "Target date", flex: 0.8 },
        ]}
        rows={10}
      />
      <TypesNote label="Types" items={SAVINGS_TYPES} />
    </RecordPage>
  );
}

function MonthlyLedgerPage({ size, index, total }: { size: Size; index: number; total: number }) {
  return (
    <RecordPage section="Monthly ledger" eyebrow={`Ledger ${index} of ${total}, undated`} title="Monthly ledger" size={size}>
      <Text style={s.p}>One month, whichever you're on. Write the month in above the first row if it helps.</Text>
      <RegisterTable
        columns={[
          { label: "Date", flex: 0.6 },
          { label: "Description", flex: 1.6 },
          { label: "Account", flex: 0.9 },
          { label: "Category", flex: 0.9 },
          { label: "Amount", flex: 0.7 },
        ]}
        rows={20}
      />
      {index === total && (
        <MoreCue text="Next month? Photocopy this page, undated on purpose so any copy works, or let the app keep your ledger going automatically, no rewriting the account and category columns by hand." />
      )}
    </RecordPage>
  );
}

function BillPaymentLogPage({ size }: { size: Size }) {
  return (
    <RecordPage section="Bill payments" eyebrow="Register" title="Bill payment log" size={size}>
      <RegisterTable
        columns={[
          { label: "Bill", flex: 1.3 },
          { label: "Period", flex: 0.8 },
          { label: "Paid on", flex: 0.8 },
          { label: "Notes", flex: 1.1 },
        ]}
        rows={20}
      />
    </RecordPage>
  );
}

function AboutPage({ size }: { size: Size }) {
  return (
    <RecordPage section="About this book" eyebrow="Last page" title="About this book." size={size}>
      <Text style={s.p}>
        The Money Book is one half of Personal Finance Companion. The other half is an app that holds the same
        registers, connected: a bill marked paid updates what is actually due next, and a transaction logged against
        an account keeps its balance honest without you re-adding the same figure twice.
      </Text>
      <Text style={s.p}>
        Neither half needs the other. This book works with a pen and nothing else, and the app works if you never
        print a page.
      </Text>
      <Text style={s.p}>
        Nothing in this book was generated. Every sentence was written by a person, and there is no model involved
        anywhere in this product. No amount, category or rate on any page is a suggestion; every one is yours to
        fill in.
      </Text>
      <Notes label="Anything else worth having to hand" count={3} />
      <Text style={{ fontSize: 8.4, color: C.faint, marginTop: 16 }}>The Money Book. Draftpace. Undated by design.</Text>
    </RecordPage>
  );
}

/** The one page that isn't part of the book itself: how it connects to the app. Only rendered when a code is supplied. */
function ActivatePage({ size, code }: { size: Size; code: string }) {
  return (
    <Page size={size} style={s.page}>
      <Sheet section="Activate">
        <Text style={s.eyebrow}>Included with this book</Text>
        <Text style={s.h1}>Activate your digital Personal Finance Companion.</Text>
        <View style={s.headRule} />
        <Text style={s.p}>
          The book works with a pen and nothing else. The app is the other half: the same registers, connected, so a
          bill marked paid and a transaction logged both update what is actually true without re-adding a figure
          twice.
        </Text>

        {[
          ["Go to draftpace.com and sign in", "Create an account with your email, or continue with Google."],
          ["Open draftpace.com/app/redeem", "Or choose Redeem a code from your account once signed in."],
          [
            "Enter the code below",
            "It unlocks Personal Finance Companion on your account for good. One use per account, so keep it somewhere safe.",
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
            ["It stays connected", "Mark a bill paid and what's next updates, without a second entry."],
            ["It shows what's coming", "The next 30 days of bills and income, worked out from what you gave it."],
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

export function MoneyBookDocument({
  manifest = DEFAULT_MANIFEST,
  code,
}: {
  manifest?: MoneyBookManifest;
  /** An Etsy print-run's activation code. Never used for anything else; this document has no other caller today. */
  code?: string;
}): React.ReactElement<DocumentProps> {
  const { size } = manifest;
  const repeat = <T,>(count: number, render: (index: number, total: number) => T): T[] =>
    Array.from({ length: count }, (_, i) => render(i + 1, count));

  return (
    <Document title={BOOK_TITLE} author="Draftpace" subject={BOOK_TITLE} creator="Personal Finance Companion by Draftpace" producer="Personal Finance Companion by Draftpace">
      <CoverPage size={size} />
      <HowThisWorksPage size={size} />

      <AccountsPage size={size} />
      <IncomePage size={size} />
      <BillsPage size={size} />
      <DebtsPage size={size} />
      <SavingsGoalsPage size={size} />

      {repeat(manifest.monthlyLedgers, (i, t) => <MonthlyLedgerPage key={`ml${i}`} size={size} index={i} total={t} />)}
      <BillPaymentLogPage size={size} />

      <AboutPage size={size} />
      {code && <ActivatePage size={size} code={code} />}
    </Document>
  );
}

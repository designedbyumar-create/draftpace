/**
 * The living Printable: a personalised Monthly Money Reset snapshot, generated
 * from the user's current state and hyperlinked back into the app so the file
 * always points home to the living product. This module imports
 * @react-pdf/renderer and is therefore only ever loaded on demand (dynamic
 * import from PrintablesModule), never in the main bundle.
 *
 * The document is a fixed "paper" artifact in MMR's own forest/ivory/clay world.
 * No em dashes anywhere, per the Draftpace content rule.
 */
import { Document, Page, View, Text, Link, StyleSheet, pdf } from "@react-pdf/renderer";
import { formatCurrency } from "../currency";

export type MoneyResetPdfData = {
  monthLabel: string;
  monthSlug: string;
  generatedLabel: string;
  currency: string;
  safeToSpend: number;
  weekly: number;
  breakdownLines: { label: string; sign: string; value: number }[];
  protectedUnpaidBills: number;
  protectedReserveHeld: number;
  upcomingBills: { name: string; amount: number }[];
  nextMove: string | null;
  origin: string;
  slug: string;
};

const C = {
  forest: "#173c32",
  forestDeep: "#102a24",
  ivory: "#f5f0e8",
  ivoryDim: "#c9d2c8",
  paper: "#fffdf9",
  ink: "#18231f",
  muted: "#6e776f",
  clay: "#b86f4a",
  claySoft: "#f2e2d8",
  line: "#ded8cd",
  sage: "#4a5f52",
};

const styles = StyleSheet.create({
  page: { paddingVertical: 44, paddingHorizontal: 48, backgroundColor: C.paper, color: C.ink, fontFamily: "Helvetica", fontSize: 10, lineHeight: 1.5 },
  topbar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  brand: { fontSize: 8, letterSpacing: 1.4, color: C.sage, fontFamily: "Helvetica-Bold" },
  wordmark: { fontSize: 9, color: C.muted, fontFamily: "Times-Bold" },
  rule: { height: 1, backgroundColor: C.line, marginTop: 10, marginBottom: 24 },
  month: { fontFamily: "Times-Bold", fontSize: 26, color: C.forest },
  subtitle: { fontSize: 10, color: C.muted, marginTop: 3 },
  hero: { marginTop: 22, backgroundColor: C.forest, borderRadius: 14, paddingVertical: 24, paddingHorizontal: 26 },
  heroLabel: { fontSize: 8, letterSpacing: 1.4, color: C.ivoryDim, fontFamily: "Helvetica-Bold" },
  heroNumber: { fontFamily: "Times-Bold", fontSize: 46, color: C.ivory, marginTop: 8 },
  heroNumberNeg: { color: "#e6a884" },
  heroContext: { fontSize: 10, color: C.ivoryDim, marginTop: 8 },
  next: { marginTop: 16, backgroundColor: C.claySoft, borderRadius: 12, padding: 16, borderLeft: 3, borderColor: C.clay, borderStyle: "solid" },
  nextLabel: { fontSize: 8, letterSpacing: 1.2, color: C.clay, fontFamily: "Helvetica-Bold" },
  nextText: { fontSize: 12, color: C.ink, marginTop: 5, fontFamily: "Helvetica-Bold" },
  cols: { flexDirection: "row", gap: 16, marginTop: 20 },
  col: { flex: 1 },
  colLabel: { fontSize: 8, letterSpacing: 1.2, color: C.sage, fontFamily: "Helvetica-Bold", marginBottom: 8 },
  lineRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderBottom: 0.7, borderColor: C.line, borderStyle: "solid" },
  lineLabel: { fontSize: 9.5, color: C.muted, flex: 1, marginRight: 8 },
  lineValue: { fontSize: 9.5, color: C.ink, fontFamily: "Helvetica-Bold" },
  calcWrap: { marginTop: 22 },
  footer: { marginTop: 26, paddingTop: 16, borderTop: 1, borderColor: C.line, borderStyle: "solid" },
  continueLabel: { fontSize: 8, letterSpacing: 1.2, color: C.sage, fontFamily: "Helvetica-Bold", marginBottom: 8 },
  linkRow: { flexDirection: "row", gap: 18, marginBottom: 14, flexWrap: "wrap" },
  link: { fontSize: 10, color: C.forest, fontFamily: "Helvetica-Bold", textDecoration: "underline" },
  fine: { fontSize: 8.5, color: C.muted, lineHeight: 1.5 },
});

function Row({ label, value, sign, currency }: { label: string; value: number; sign?: string; currency: string }) {
  return (
    <View style={styles.lineRow}>
      <Text style={styles.lineLabel}>{sign && sign !== "=" ? `${sign} ` : ""}{label}</Text>
      <Text style={styles.lineValue}>{formatCurrency(value, currency)}</Text>
    </View>
  );
}

function MoneyResetDocument({ data }: { data: MoneyResetPdfData }) {
  const productUrl = (dest: string) => `${data.origin}/app/products/${data.slug}/${dest}`;
  return (
    <Document title={`Monthly Money Reset: ${data.monthLabel}`} author="Draftpace" subject="Your money snapshot">
      <Page size="A4" style={styles.page}>
        <View style={styles.topbar}>
          <Text style={styles.brand}>MONTHLY MONEY RESET</Text>
          <Text style={styles.wordmark}>Draftpace</Text>
        </View>
        <View style={styles.rule} />

        <Text style={styles.month}>{data.monthLabel}</Text>
        <Text style={styles.subtitle}>Your money snapshot, as of {data.generatedLabel}.</Text>

        <View style={styles.hero}>
          <Text style={styles.heroLabel}>SAFE TO SPEND NOW</Text>
          <Text style={[styles.heroNumber, data.safeToSpend < 0 ? styles.heroNumberNeg : {}]}>
            {formatCurrency(data.safeToSpend, data.currency)}
          </Text>
          <Text style={styles.heroContext}>
            About {formatCurrency(data.weekly, data.currency)} a week for the rest of the month.
          </Text>
        </View>

        {data.nextMove ? (
          <View style={styles.next}>
            <Text style={styles.nextLabel}>YOUR NEXT MOVE</Text>
            <Text style={styles.nextText}>{data.nextMove}</Text>
          </View>
        ) : null}

        <View style={styles.cols}>
          <View style={styles.col}>
            <Text style={styles.colLabel}>WHAT IS PROTECTED</Text>
            <Row label="Bills not yet paid" value={data.protectedUnpaidBills} currency={data.currency} />
            <Row label="Reserve still held" value={data.protectedReserveHeld} currency={data.currency} />
          </View>
          <View style={styles.col}>
            <Text style={styles.colLabel}>UPCOMING BILLS</Text>
            {data.upcomingBills.length === 0 ? (
              <Text style={styles.lineLabel}>Every bill is handled this month.</Text>
            ) : (
              data.upcomingBills.map((bill, i) => (
                <Row key={i} label={bill.name} value={bill.amount} currency={data.currency} />
              ))
            )}
          </View>
        </View>

        <View style={styles.calcWrap}>
          <Text style={styles.colLabel}>HOW THIS IS CALCULATED</Text>
          {data.breakdownLines.map((line, i) => (
            <Row key={i} label={line.label} sign={line.sign} value={line.value} currency={data.currency} />
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.continueLabel}>CONTINUE IN THE APP</Text>
          <View style={styles.linkRow}>
            <Link style={styles.link} src={productUrl("workspace")}>Open your workspace</Link>
            <Link style={styles.link} src={productUrl("setup")}>Update your setup</Link>
            <Link style={styles.link} src={productUrl("history")}>See your history</Link>
          </View>
          <Text style={styles.fine}>
            This is a snapshot from {data.generatedLabel}. Your Monthly Money Reset keeps updating as the month
            changes, so open it any time and it reflects the latest. This is not financial advice.
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export async function downloadMoneyResetPdf(data: MoneyResetPdfData): Promise<void> {
  const blob = await pdf(<MoneyResetDocument data={data} />).toBlob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `monthly-money-reset-${data.monthSlug}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

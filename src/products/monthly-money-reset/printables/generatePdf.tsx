/**
 * The living Printable: a personalised Monthly Money Reset snapshot, generated
 * from the user's current state and hyperlinked back into the app so the file
 * always points home to the living product. This module imports
 * @react-pdf/renderer and is therefore only ever loaded on demand (dynamic
 * import from PrintablesModule), never in the main bundle.
 *
 * The document is a fixed "paper" artifact in MMR's own forest/ivory/clay world,
 * built on the shared PrintableDocument shell (src/design-system/PrintableDocument.tsx)
 * for its header, footer, and pagination, only the hero/next-move/breakdown
 * content between them is bespoke to this product.
 * No em dashes anywhere, per the Draftpace content rule.
 */
import { View, Text, StyleSheet, pdf } from "@react-pdf/renderer";
import {
  PrintableDocument,
  PrintablePage,
  PrintableHeader,
  PrintableSectionLabel,
  PrintableRow,
  PrintableContinueFooter,
  type PrintablePalette,
} from "@/design-system/PrintableDocument";
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
  ivory: "#f5f0e8",
  ivoryDim: "#c9d2c8",
  paper: "#fffdf9",
  ink: "#18231f",
  muted: "#6e776f",
  clay: "#b86f4a",
  claySoft: "#f2e2d8",
  line: "#ded8cd",
};

/** MMR's own accent is forest: the hero background, the month heading, and every link already use it, so the shared shell's header/labels/links render in it too rather than introducing a second identity colour. */
const PALETTE: PrintablePalette = { accent: C.forest, ink: C.ink, muted: C.muted, line: C.line, paper: C.paper };

const styles = StyleSheet.create({
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
  calcWrap: { marginTop: 22 },
  emptyLine: { fontSize: 9.5, color: C.muted },
});

function MoneyResetDocument({ data }: { data: MoneyResetPdfData }) {
  const productUrl = (dest: string) => `${data.origin}/app/products/${data.slug}/${dest}`;
  return (
    <PrintableDocument title={`Monthly Money Reset: ${data.monthLabel}`} subject="Your money snapshot">
      <PrintablePage palette={PALETTE}>
        <PrintableHeader eyebrow="MONTHLY MONEY RESET" palette={PALETTE} />

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
            <PrintableSectionLabel palette={PALETTE}>WHAT IS PROTECTED</PrintableSectionLabel>
            <PrintableRow label="Bills not yet paid" value={formatCurrency(data.protectedUnpaidBills, data.currency)} palette={PALETTE} />
            <PrintableRow label="Reserve still held" value={formatCurrency(data.protectedReserveHeld, data.currency)} palette={PALETTE} />
          </View>
          <View style={styles.col}>
            <PrintableSectionLabel palette={PALETTE}>UPCOMING BILLS</PrintableSectionLabel>
            {data.upcomingBills.length === 0 ? (
              <Text style={styles.emptyLine}>Every bill is handled this month.</Text>
            ) : (
              data.upcomingBills.map((bill, i) => (
                <PrintableRow key={i} label={bill.name} value={formatCurrency(bill.amount, data.currency)} palette={PALETTE} />
              ))
            )}
          </View>
        </View>

        <View style={styles.calcWrap}>
          <PrintableSectionLabel palette={PALETTE}>HOW THIS IS CALCULATED</PrintableSectionLabel>
          {data.breakdownLines.map((line, i) => (
            <PrintableRow key={i} label={line.label} sign={line.sign} value={formatCurrency(line.value, data.currency)} palette={PALETTE} />
          ))}
        </View>

        <PrintableContinueFooter
          palette={PALETTE}
          links={[
            { label: "Open your workspace", href: productUrl("workspace") },
            { label: "Update your setup", href: productUrl("setup") },
            { label: "See your history", href: productUrl("history") },
          ]}
          note={`This is a snapshot from ${data.generatedLabel}. Your Monthly Money Reset keeps updating as the month changes, so open it any time and it reflects the latest. This is not financial advice.`}
        />
      </PrintablePage>
    </PrintableDocument>
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

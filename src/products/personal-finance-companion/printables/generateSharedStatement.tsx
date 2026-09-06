/**
 * The Shared Responsibility statement: a generated, per-user PDF listing
 * what's settled and what's still owed across every shared bill and
 * subscription, built on the shared PrintableDocument shell
 * (src/design-system/PrintableDocument.tsx). This is the "generated
 * statement" the Trump Card Memo asked for in place of plain copy-paste
 * text: it reads computeSharedResponsibilitySummary() directly, the same
 * pure function the in-app Bills/Subscriptions cards use, so the PDF and
 * the live UI can never disagree about what's owed.
 *
 * This module imports @react-pdf/renderer and must therefore only ever be
 * reached via a dynamic import, same discipline as every existing
 * generatePdf.tsx in this repo.
 */
import { View, Text, pdf } from "@react-pdf/renderer";
import {
  PrintableDocument,
  PrintablePage,
  PrintableHeader,
  PrintableSectionLabel,
  PrintableRow,
  PrintableContinueFooter,
  type PrintablePalette,
} from "@/design-system/PrintableDocument";
import { computeSharedResponsibilitySummary, type SharedResponsibilityItem } from "../domain/sharedResponsibility";
import { formatCurrency } from "@/lib/currency";

export type SharedStatementData = {
  generatedLabel: string;
  items: SharedResponsibilityItem[];
  origin: string;
  slug: string;
};

/** This product's own petrol accent (definition.ts's theme.accentScale), not a hardcoded placeholder. */
const PALETTE: PrintablePalette = {
  accent: "#2e4a4d",
  ink: "#1a2420",
  muted: "#6b7570",
  line: "#e4e0d5",
  paper: "#fffdf9",
};

function SharedStatementDocument({ data }: { data: SharedStatementData }) {
  const summary = computeSharedResponsibilitySummary(data.items);
  const productUrl = (dest: string) => `${data.origin}/app/products/${data.slug}/${dest}`;

  return (
    <PrintableDocument title="Personal Finance Companion: Shared Responsibility statement" subject="What's settled and what's still owed">
      <PrintablePage palette={PALETTE}>
        <PrintableHeader eyebrow="PERSONAL FINANCE COMPANION" palette={PALETTE} />

        <Text style={{ fontFamily: "Times-Bold", fontSize: 24, color: PALETTE.accent }}>Shared Responsibility</Text>
        <Text style={{ fontSize: 10, color: PALETTE.muted, marginTop: 3 }}>As of {data.generatedLabel}.</Text>

        <View style={{ marginTop: 22 }}>
          <PrintableSectionLabel palette={PALETTE}>STILL OWED</PrintableSectionLabel>
          {summary.unsettled.length === 0 ? (
            <Text style={{ fontSize: 9.5, color: PALETTE.muted }}>Nothing outstanding. Every shared item is settled.</Text>
          ) : (
            summary.unsettled.map((line, i) => (
              <PrintableRow key={i} label={line.name} value={formatCurrency(line.otherShareMinorUnits, line.currency)} palette={PALETTE} />
            ))
          )}
          {Object.entries(summary.totalsOwedByCurrency).map(([currency, amount]) => (
            <View key={currency} style={{ marginTop: 10, flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold", color: PALETTE.ink }}>Total owed to you ({currency})</Text>
              <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold", color: PALETTE.ink }}>{formatCurrency(amount, currency)}</Text>
            </View>
          ))}
        </View>

        {summary.settled.length > 0 && (
          <View style={{ marginTop: 22 }}>
            <PrintableSectionLabel palette={PALETTE}>ALREADY SETTLED</PrintableSectionLabel>
            {summary.settled.map((line, i) => (
              <PrintableRow
                key={i}
                label={line.settledAt ? `${line.name} (settled ${line.settledAt.slice(0, 10)})` : line.name}
                value={formatCurrency(line.otherShareMinorUnits, line.currency)}
                palette={PALETTE}
              />
            ))}
          </View>
        )}

        <PrintableContinueFooter
          palette={PALETTE}
          links={[
            { label: "Open Bills", href: productUrl("bills") },
            { label: "Open Subscriptions", href: productUrl("subscriptions") },
          ]}
          note={`This is a snapshot from ${data.generatedLabel}. Mark an item settled in the app once you've squared up, and it moves to Already Settled the next time this statement is generated. This is not financial advice.`}
        />
      </PrintablePage>
    </PrintableDocument>
  );
}

export async function downloadSharedStatement(data: SharedStatementData): Promise<void> {
  const blob = await pdf(<SharedStatementDocument data={data} />).toBlob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "shared-responsibility-statement.pdf";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

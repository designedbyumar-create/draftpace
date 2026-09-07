/**
 * The Intake Summary: this product's signature document. A one-page,
 * per-person printable meant to supplement a clinic's own intake
 * paperwork, never replace it, built on the shared PrintableDocument
 * shell (src/design-system/PrintableDocument.tsx).
 *
 * It reads buildIntakeSummary() directly, the same pure function the
 * in-app screens would use to show the same facts, so the PDF and the
 * live account can never disagree about what's on it. Anything a
 * person marked private is excluded before this file ever sees it.
 *
 * This module imports @react-pdf/renderer and must therefore only ever
 * be reached via a dynamic import, same discipline as every existing
 * generatePdf.tsx in this repo.
 */
import { View, Text, pdf } from "@react-pdf/renderer";
import {
  PrintableDocument,
  PrintablePage,
  PrintableHeader,
  PrintableSectionLabel,
  type PrintablePalette,
} from "@/design-system/PrintableDocument";
import type { IntakeSummaryData, IntakeSummaryLine } from "../intakeSummary";

export type IntakeSummaryPrintData = IntakeSummaryData & { generatedLabel: string };

/** This product's own dusty lavender-blue accent (definition.ts's theme.accentScale), not a hardcoded placeholder. */
const PALETTE: PrintablePalette = {
  accent: "#606e8e",
  ink: "#21242c",
  muted: "#6d7280",
  line: "#e4e8ef",
  paper: "#fdfdfe",
};

function LineList({ items, empty }: { items: IntakeSummaryLine[]; empty: string }) {
  if (items.length === 0) {
    return <Text style={{ fontSize: 9.5, color: PALETTE.muted }}>{empty}</Text>;
  }
  return (
    <>
      {items.map((item, i) => (
        <View key={i} style={{ paddingVertical: 4, borderBottom: 0.7, borderColor: PALETTE.line, borderStyle: "solid" }}>
          <Text style={{ fontSize: 9.5, color: PALETTE.ink, fontFamily: "Helvetica-Bold" }}>{item.label}</Text>
          {item.detail && <Text style={{ fontSize: 9, color: PALETTE.muted, marginTop: 1 }}>{item.detail}</Text>}
        </View>
      ))}
    </>
  );
}

function IntakeSummaryDocument({ data }: { data: IntakeSummaryPrintData }) {
  return (
    <PrintableDocument title={`Family Health Binder: Intake Summary for ${data.member.name}`} subject="Medications, allergies, family history and recent symptoms">
      <PrintablePage palette={PALETTE}>
        <PrintableHeader eyebrow="FAMILY HEALTH BINDER" palette={PALETTE} />

        <Text style={{ fontFamily: "Times-Bold", fontSize: 24, color: PALETTE.accent }}>Intake Summary</Text>
        <Text style={{ fontSize: 10, color: PALETTE.muted, marginTop: 3 }}>
          {data.member.name}
          {data.member.dateOfBirth ? `, born ${data.member.dateOfBirth}` : ""} — as of {data.generatedLabel}
        </Text>

        <View style={{ marginTop: 22 }}>
          <PrintableSectionLabel palette={PALETTE}>MEDICATIONS</PrintableSectionLabel>
          <LineList items={data.medications} empty="None recorded." />
        </View>

        <View style={{ marginTop: 18 }}>
          <PrintableSectionLabel palette={PALETTE}>ALLERGIES</PrintableSectionLabel>
          <LineList items={data.allergies} empty="None recorded." />
        </View>

        <View style={{ marginTop: 18 }}>
          <PrintableSectionLabel palette={PALETTE}>FAMILY HISTORY</PrintableSectionLabel>
          <LineList items={data.history} empty="None recorded." />
        </View>

        <View style={{ marginTop: 18 }}>
          <PrintableSectionLabel palette={PALETTE}>RECENT SYMPTOMS</PrintableSectionLabel>
          <LineList items={data.recentSymptoms} empty="None recorded." />
        </View>

        <View style={{ marginTop: 24, padding: 12, backgroundColor: "#f4f5f8" }}>
          <Text style={{ fontSize: 8.5, color: PALETTE.ink, lineHeight: 1.6 }}>
            This page supplements your clinic&apos;s own intake paperwork; it does not replace it. It reflects only
            what was marked to appear here as of {data.generatedLabel}, and excludes anything kept private in the
            account. Draftpace is not a covered entity under HIPAA; where the FTC Health Breach Notification Rule or
            an applicable state health-privacy law applies to information you store here, Draftpace follows it.
          </Text>
        </View>
      </PrintablePage>
    </PrintableDocument>
  );
}

export async function downloadIntakeSummary(data: IntakeSummaryPrintData): Promise<void> {
  const blob = await pdf(<IntakeSummaryDocument data={data} />).toBlob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `intake-summary-${data.member.name.toLowerCase().replace(/\s+/g, "-")}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

/**
 * The emergency card: one small card for a wallet, a bag or the fridge, drawn
 * at card size with a dashed cut line. Short by design, names and numbers and
 * no sentences, so it can be read at a glance by someone who does not know
 * the family.
 */
import { Document, Text, View } from "@react-pdf/renderer";
import type { EmergencyCardData } from "../printSheets";
import { PALETTE, Page, SOFT, contactText, download, slug } from "./pdfKit";

export type EmergencyCardPrintData = EmergencyCardData & { generatedLabel: string };

function Line({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", marginTop: 4 }}>
      <Text style={{ width: 62, fontSize: 7.5, color: PALETTE.muted, letterSpacing: 0.6 }}>{label.toUpperCase()}</Text>
      <Text style={{ flex: 1, fontSize: 9.5, color: PALETTE.ink }}>{value}</Text>
    </View>
  );
}

export function EmergencyCardDocument({ data }: { data: EmergencyCardPrintData }) {
  const { person } = data;
  const meta = [person.age, person.dateOfBirth ? `born ${person.dateOfBirth}` : null].filter(Boolean).join(", ");
  const rows: [string, string][] = [
    ["Conditions", data.conditions.join(", ")],
    ["Medications", data.medications.join("; ")],
    ["Call", contactText(data.emergency) ?? ""],
    ["Doctor", data.doctor ? [data.doctor.name, data.doctor.phone].filter(Boolean).join(", ") : ""],
    ["Insurance", data.insurance ? [data.insurance.insurer, data.insurance.memberId && `ID ${data.insurance.memberId}`].filter(Boolean).join(", ") : ""],
  ];
  return (
    <Document title={`Family Health Binder: Emergency card for ${person.name}`} author="Draftpace" subject="Allergies, medications and who to call">
      <Page eyebrow="FAMILY HEALTH BINDER">
        <Text style={{ fontSize: 10, color: PALETTE.muted, marginBottom: 12 }}>Cut along the dashed line and fold or keep flat. Made {data.generatedLabel}.</Text>
        <View style={{ width: 300, padding: 14, borderWidth: 1, borderColor: PALETTE.muted, borderStyle: "dashed", borderRadius: 8 }}>
          <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 15, color: PALETTE.ink }}>{person.name}</Text>
          {meta ? <Text style={{ fontSize: 8.5, color: PALETTE.muted, marginTop: 3 }}>{meta}</Text> : null}
          <View style={{ marginTop: 8, padding: 7, backgroundColor: SOFT, borderRadius: 4 }}>
            <Text style={{ fontSize: 7.5, letterSpacing: 0.8, color: PALETTE.accent, fontFamily: "Helvetica-Bold" }}>ALLERGIES</Text>
            <Text style={{ fontSize: 10.5, fontFamily: "Helvetica-Bold", color: PALETTE.ink, marginTop: 1 }}>{data.allergies.length > 0 ? data.allergies.join("; ") : "None recorded"}</Text>
          </View>
          {rows.filter(([, value]) => value).map(([label, value]) => (
            <Line key={label} label={label} value={value} />
          ))}
        </View>
        {data.hiddenCount > 0 && (
          <Text style={{ fontSize: 8.5, color: PALETTE.muted, marginTop: 10 }}>
            {data.hiddenCount === 1 ? "One record marked private is" : `${data.hiddenCount} records marked private are`} left off this card. It reflects only what was typed in, is not medical advice, and does not replace a medical ID.
          </Text>
        )}
        {data.hiddenCount === 0 && <Text style={{ fontSize: 8.5, color: PALETTE.muted, marginTop: 10 }}>It reflects only what was typed in, is not medical advice, and does not replace a medical ID.</Text>}
      </Page>
    </Document>
  );
}

export async function downloadEmergencyCard(data: EmergencyCardPrintData): Promise<void> {
  await download(<EmergencyCardDocument data={data} />, `emergency-card-${slug(data.person.name)}.pdf`);
}

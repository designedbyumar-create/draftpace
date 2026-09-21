/**
 * The caregiver sheet: for a babysitter, a grandparent or a respite carer.
 * What to avoid comes first and largest, then what is taken, who to call, and
 * the family's own notes. The only advice on it is the fixed line to call 911
 * in an emergency; nothing on the page is worked out from the record.
 */
import { Document, Text, View } from "@react-pdf/renderer";
import type { CaregiverSheetData } from "../printSheets";
import { Block, Field, Lines, Note, PALETTE, Page, SOFT, Title, contactText, download, slug } from "./pdfKit";

export type CaregiverSheetPrintData = CaregiverSheetData & { generatedLabel: string };

export function CaregiverSheetDocument({ data }: { data: CaregiverSheetPrintData }) {
  const { person } = data;
  return (
    <Document title={`Family Health Binder: Caregiver sheet for ${person.name}`} author="Draftpace" subject="What a sitter or carer needs to know">
      <Page eyebrow="FAMILY HEALTH BINDER">
        <Title person={person}>{`All about ${person.name}`}</Title>

        <View style={{ marginTop: 20, padding: 14, backgroundColor: SOFT, borderRadius: 6 }} wrap={false}>
          <Text style={{ fontSize: 8, letterSpacing: 1.2, color: PALETTE.accent, fontFamily: "Helvetica-Bold", marginBottom: 6 }}>ALLERGIES</Text>
          {data.allergies.length === 0 ? (
            <Text style={{ fontSize: 11, color: PALETTE.ink }}>None recorded.</Text>
          ) : (
            data.allergies.map((a, i) => (
              <Text key={i} style={{ fontSize: 13, color: PALETTE.ink, fontFamily: "Helvetica-Bold", marginBottom: 2 }}>
                {a.label}
                {a.detail ? <Text style={{ fontFamily: "Helvetica", fontSize: 10.5 }}>{`  (${a.detail})`}</Text> : null}
              </Text>
            ))
          )}
        </View>

        <Block label="Medications now">
          <Lines items={data.medications} empty="None recorded." />
        </Block>
        {data.conditions.length > 0 && (
          <Block label="Conditions">
            <Lines items={data.conditions} empty="None recorded." />
          </Block>
        )}

        <Block label="Who to call">
          <Field label="Emergency contact" value={contactText(data.emergency)} />
          <Field label="Doctor" value={data.doctor ? [data.doctor.name, data.doctor.phone].filter(Boolean).join(", ") : null} />
        </Block>

        {data.notes && (
          <Block label={`Good to know about ${person.name}`}>
            <Text style={{ fontSize: 11, color: PALETTE.ink, lineHeight: 1.6 }}>{data.notes}</Text>
          </Block>
        )}

        <View style={{ marginTop: 20 }} wrap={false}>
          <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold", color: PALETTE.ink }}>In an emergency, call 911.</Text>
        </View>

        <Note generatedLabel={data.generatedLabel} hiddenCount={data.hiddenCount} />
      </Page>
    </Document>
  );
}

export async function downloadCaregiverSheet(data: CaregiverSheetPrintData): Promise<void> {
  await download(<CaregiverSheetDocument data={data} />, `caregiver-sheet-${slug(data.person.name)}.pdf`);
}

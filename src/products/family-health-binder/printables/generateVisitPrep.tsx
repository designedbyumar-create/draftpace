/**
 * The visit page: what to take to an appointment. The questions written down
 * beforehand with a box to tick each, what is taken now, what has been
 * happening, and ruled space for what the doctor says. Nothing is worked out
 * from the record; it is the family's own words put where they will be seen.
 */
import { Document, Text, View } from "@react-pdf/renderer";
import type { VisitPrepData } from "../printSheets";
import { Block, Lines, Note, PALETTE, Page, Title, download, slug } from "./pdfKit";

export type VisitPrepPrintData = VisitPrepData & { generatedLabel: string };

export function VisitPrepDocument({ data }: { data: VisitPrepPrintData }) {
  const { person, visit } = data;
  const sub = visit ? [visit.reason, visit.withWhom && `with ${visit.withWhom}`, visit.date].filter(Boolean).join(", ") : undefined;
  return (
    <Document title={`Family Health Binder: Visit page for ${person.name}`} author="Draftpace" subject="Questions, medications and symptoms for an appointment">
      <Page eyebrow="FAMILY HEALTH BINDER">
        <Title person={person} sub={sub}>
          Visit page
        </Title>

        <Block label="Questions to ask" top={22}>
          {data.questions.length === 0 ? (
            <Text style={{ fontSize: 10, color: PALETTE.muted }}>{visit ? "No questions written down." : "No visit chosen."}</Text>
          ) : (
            data.questions.map((q, i) => (
              <View key={i} style={{ flexDirection: "row", marginBottom: 6 }}>
                <View style={{ width: 10, height: 10, borderWidth: 1, borderColor: PALETTE.muted, borderStyle: "solid", marginRight: 8, marginTop: 1 }} />
                <Text style={{ flex: 1, fontSize: 11, color: PALETTE.ink }}>{q}</Text>
              </View>
            ))
          )}
        </Block>

        <Block label="Allergies">
          <Lines items={data.allergies} empty="None recorded." />
        </Block>
        <Block label="Taking now">
          <Lines items={data.medications} empty="None recorded." />
        </Block>
        <Block label="Recent symptoms">
          <Lines items={data.recentSymptoms} empty="None recorded." />
        </Block>

        <Block label="Notes from the visit">
          {Array.from({ length: 5 }, (_, i) => (
            <View key={i} style={{ height: 22, borderBottomWidth: 0.8, borderBottomColor: "#d5c3ba", borderBottomStyle: "solid" }} />
          ))}
        </Block>

        <Note generatedLabel={data.generatedLabel} hiddenCount={data.hiddenCount} />
      </Page>
    </Document>
  );
}

export async function downloadVisitPrep(data: VisitPrepPrintData): Promise<void> {
  await download(<VisitPrepDocument data={data} />, `visit-page-${slug(data.person.name)}.pdf`);
}

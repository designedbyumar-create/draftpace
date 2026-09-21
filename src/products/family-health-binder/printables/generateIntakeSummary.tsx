/**
 * The Intake Summary: a one-page, per-person page to hand a clinic alongside
 * their own intake paperwork, never in place of it. Built on the same kit as
 * the family's other four pages (pdfKit.tsx) and on buildIntakeSummary(), the
 * same pure function the tests hold to the privacy rules, so the page and the
 * account can never disagree about what is on it.
 */
import { Document } from "@react-pdf/renderer";
import { usDate } from "../dates";
import type { IntakeSummaryData } from "../intakeSummary";
import { Block, Lines, Note, Page, Title, download, slug } from "./pdfKit";

export type IntakeSummaryPrintData = IntakeSummaryData & { generatedLabel: string; hiddenCount?: number };

export function IntakeSummaryDocument({ data }: { data: IntakeSummaryPrintData }) {
  const person = { name: data.member.name, age: null, dateOfBirth: data.member.dateOfBirth ? usDate(data.member.dateOfBirth) : null };
  return (
    <Document title={`Family Health Binder: Intake Summary for ${data.member.name}`} author="Draftpace" subject="Medications, allergies, conditions, family history and recent symptoms">
      <Page eyebrow="FAMILY HEALTH BINDER">
        <Title person={person} sub={`as of ${data.generatedLabel}`}>
          Intake Summary
        </Title>
        <Block label="Allergies" top={22}>
          <Lines items={data.allergies} empty="None recorded." />
        </Block>
        <Block label="Medications">
          <Lines items={data.medications} empty="None recorded." />
        </Block>
        <Block label="Conditions">
          <Lines items={data.conditions} empty="None recorded." />
        </Block>
        <Block label="Family history">
          <Lines items={data.history} empty="None recorded." />
        </Block>
        <Block label="Recent symptoms">
          <Lines items={data.recentSymptoms} empty="None recorded." />
        </Block>
        <Note generatedLabel={data.generatedLabel} hiddenCount={data.hiddenCount ?? 0} />
      </Page>
    </Document>
  );
}

export async function downloadIntakeSummary(data: IntakeSummaryPrintData): Promise<void> {
  await download(<IntakeSummaryDocument data={data} />, `intake-summary-${slug(data.member.name)}.pdf`);
}

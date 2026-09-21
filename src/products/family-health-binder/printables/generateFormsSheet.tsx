/**
 * The Forms sheet: the answers school, camp, sports and new-patient forms
 * keep asking for, in the order they ask, for one person. Meant to sit beside
 * the form while it is filled in. A missing answer is said plainly as "Not
 * recorded", never blank and never guessed.
 */
import { Document } from "@react-pdf/renderer";
import type { FormsSheetData } from "../printSheets";
import { Block, Field, Lines, Note, Page, Title, contactText, download, slug } from "./pdfKit";

export type FormsSheetPrintData = FormsSheetData & { generatedLabel: string };

export function FormsSheetDocument({ data }: { data: FormsSheetPrintData }) {
  const { person } = data;
  const insurance = data.insurance;
  return (
    <Document title={`Family Health Binder: Forms sheet for ${person.name}`} author="Draftpace" subject="The answers health, school and camp forms ask for">
      <Page eyebrow="FAMILY HEALTH BINDER">
        <Title person={person} sub={`as of ${data.generatedLabel}`}>
          Forms sheet
        </Title>

        <Block label="About" top={16}>
          <Field label="Date of birth" value={person.dateOfBirth} />
          <Field label="Emergency contact" value={contactText(data.emergency)} />
        </Block>

        <Block label="Health insurance">
          <Field label="Insurer" value={insurance?.insurer} />
          <Field label="Member ID" value={insurance?.memberId} />
          <Field label="Group number" value={insurance?.group} />
        </Block>

        <Block label="Doctors and pharmacy">
          {data.careTeam.length === 0 ? (
            <Field label="Doctor" value={null} />
          ) : (
            data.careTeam.map((p, i) => <Field key={i} label={p.role} value={[p.name, p.phone].filter(Boolean).join(", ")} />)
          )}
        </Block>

        <Block label="Allergies">
          <Lines items={data.allergies} empty="None recorded." />
        </Block>
        <Block label="Conditions">
          <Lines items={data.conditions} empty="None recorded." />
        </Block>
        <Block label="Medications">
          <Lines items={data.medications} empty="None recorded." />
        </Block>
        <Block label="Vaccines">
          <Lines items={data.immunizations} empty="None recorded." />
        </Block>

        <Note generatedLabel={data.generatedLabel} hiddenCount={data.hiddenCount} />
      </Page>
    </Document>
  );
}

export async function downloadFormsSheet(data: FormsSheetPrintData): Promise<void> {
  await download(<FormsSheetDocument data={data} />, `forms-sheet-${slug(data.person.name)}.pdf`);
}

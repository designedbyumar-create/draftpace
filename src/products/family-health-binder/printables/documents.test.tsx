import { describe, expect, it } from "vitest";
import { renderToBuffer } from "@react-pdf/renderer";
import { allergy, condition, event, fact, immunization, member, provider, visit } from "../testFixtures";
import { buildCaregiverSheet, buildEmergencyCard, buildFormsSheet, buildVisitPrep } from "../printSheets";
import { buildIntakeSummary } from "../intakeSummary";
import { FormsSheetDocument } from "./generateFormsSheet";
import { CaregiverSheetDocument } from "./generateCaregiverSheet";
import { EmergencyCardDocument } from "./generateEmergencyCard";
import { VisitPrepDocument } from "./generateVisitPrep";
import { IntakeSummaryDocument } from "./generateIntakeSummary";

/**
 * The five pages have to actually render, and a full record has to stay on
 * one sheet: a page that spills its closing note alone onto a second sheet
 * looks broken in a printer tray. Made from a deliberately heavy record so
 * a change that adds height is caught here and not at the printer.
 */
const T = "2026-09-07";
const G = "September 7, 2026";
const m = member({ emergencyName: "Sam (dad)", emergencyPhone: "(555) 010-0142", insurer: "Acme Health", insuranceMemberId: "XYZ123456", insuranceGroup: "G77", caregiverNotes: "Bedtime is 8.\nLikes the green cup." });
const facts = [
  fact(),
  fact({ id: "m2", detail: "Vitamin D", dosage: "400 IU", frequency: "daily" }),
  allergy(),
  allergy({ id: "a2", detail: "Penicillin", reaction: "Rash" }),
  condition(),
  fact({ id: "h", kind: "history", detail: "Asthma on mom's side", dosage: null, frequency: null }),
  fact({ id: "hid", detail: "Private med", visibility: "private" }),
];
const providers = [provider(), provider({ id: "ph", kind: "pharmacy", name: "Corner Pharmacy", phone: "(555) 010-0177" }), provider({ id: "s", kind: "specialist", name: "Dr. Kim (allergy)", phone: "(555) 010-0190" })];
const shots = [immunization(), immunization({ id: "2", vaccine: "DTaP", givenOn: "2018-08-02" }), immunization({ id: "4", vaccine: "Influenza (flu)", givenOn: "2025-10-12" })];
const events = [event(), event({ id: "e2", description: "Cough", onsetAt: "2026-08-20" })];
const visits = [visit({ questions: "Is the cough something to worry about?\nCan she swim this week?" })];

const pages = (buffer: Buffer) => (buffer.toString("latin1").match(/\/Type \/Page\b/g) ?? []).length;

describe("the family's printed pages", () => {
  const documents = {
    "forms sheet": <FormsSheetDocument data={{ ...buildFormsSheet(m, facts, providers, shots, events, visits, T), generatedLabel: G }} />,
    "caregiver sheet": <CaregiverSheetDocument data={{ ...buildCaregiverSheet(m, facts, providers, shots, events, visits, T), generatedLabel: G }} />,
    "emergency card": <EmergencyCardDocument data={{ ...buildEmergencyCard(m, facts, providers, shots, events, visits, T), generatedLabel: G }} />,
    "visit page": <VisitPrepDocument data={{ ...buildVisitPrep(m, visits[0], facts, events, shots, visits, T), generatedLabel: G }} />,
    "intake summary": <IntakeSummaryDocument data={{ ...buildIntakeSummary(m, facts, events), generatedLabel: G, hiddenCount: 1 }} />,
  };

  for (const [name, element] of Object.entries(documents)) {
    it(`render the ${name} as a single PDF sheet`, async () => {
      const buffer = await renderToBuffer(element);
      expect(buffer.subarray(0, 4).toString()).toBe("%PDF");
      expect(pages(buffer), `${name} spilled onto a second sheet`).toBe(1);
    }, 30000);
  }
});

/**
 * Homeschool record keeping requirements, one entry per US jurisdiction.
 *
 * THE SINGLE SOURCE OF TRUTH THIS EXISTS TO BE
 *
 * This data used to live only inside one guide's table
 * (src/content/guides.ts, "Homeschool record keeping requirements,
 * state by state"). Homeschooling Companion's setup needed the same
 * facts, and hand-copying them a second time guarantees the two drift
 * the moment either one is corrected. This is now the one place the
 * facts live; the guide's table renders from this array instead of
 * carrying its own copy, and the product's state picker reads from it
 * too.
 *
 * Content is unchanged from what the guide already published, with one
 * fix made while moving it: two entries used British spelling
 * (immunisation, enrolment) that had slipped past the locale pass
 * already done on the rest of the guides layer. Corrected here since
 * this product is US-first and this is now the canonical copy.
 *
 * Laws change. This is deliberately a broad regulation level and a
 * one-line summary, not a citation, and every surface that reads from
 * it should say so, same as the guide already does.
 */

export type HomeschoolRegulationLevel = "None" | "Low" | "Moderate" | "High";

/**
 * A structured breakdown of `note`, for the states worth breaking down.
 *
 * Every field here is derived directly from that state's own `note`
 * above, restructured rather than researched again: this is the same
 * reviewed, published content, read as a checklist instead of a
 * sentence. Present only for High and Moderate states, since a None or
 * Low state's note is already a checklist of at most one thing.
 */
export interface HomeschoolStateChecklist {
  /** A running log or record of instruction is kept. */
  log: boolean;
  /** Attendance, or hours, are tracked. */
  attendanceOrHours: boolean;
  /** Samples of the child's actual work, a portfolio, are kept. */
  workSamples: boolean;
  /** A test score or a formal evaluation is kept on file. */
  testOrEvaluation: boolean;
  /** Anything the state's own note calls out beyond the four above, in its own words (e.g. immunization records). */
  otherNotes: string[];
}

export interface HomeschoolStateRequirement {
  state: string;
  level: HomeschoolRegulationLevel;
  /** What that state is actually asked to keep, in one sentence. */
  note: string;
  /** Only present for High and Moderate states. See HomeschoolStateChecklist. */
  checklist?: HomeschoolStateChecklist;
}

export const HOMESCHOOL_STATE_REQUIREMENTS: HomeschoolStateRequirement[] = [
  { state: "Alabama", level: "Low", note: "Notice through a church or private school; attendance records" },
  { state: "Alaska", level: "None", note: "Nothing filed; records for your own use" },
  { state: "Arizona", level: "Low", note: "Notice of intent; keep your own records" },
  { state: "Arkansas", level: "Moderate", note: "Notice of intent each year; records of instruction", checklist: { log: true, attendanceOrHours: false, workSamples: false, testOrEvaluation: false, otherNotes: [] } },
  { state: "California", level: "Moderate", note: "Private school affidavit; attendance register and course list", checklist: { log: true, attendanceOrHours: true, workSamples: false, testOrEvaluation: false, otherNotes: [] } },
  { state: "Colorado", level: "Moderate", note: "Notice; attendance, immunization and test or evaluation every other year", checklist: { log: false, attendanceOrHours: true, workSamples: false, testOrEvaluation: true, otherNotes: ["Immunization records are kept too."] } },
  { state: "Connecticut", level: "None", note: "Nothing required; portfolio only if you opt into review" },
  { state: "Delaware", level: "Low", note: "Enrollment and attendance reported annually" },
  { state: "District of Columbia", level: "High", note: "Notice; portfolio available for review; annual reporting", checklist: { log: true, attendanceOrHours: false, workSamples: true, testOrEvaluation: false, otherNotes: [] } },
  { state: "Florida", level: "High", note: "Notice; portfolio of work and log kept two years; annual evaluation", checklist: { log: true, attendanceOrHours: false, workSamples: true, testOrEvaluation: true, otherNotes: [] } },
  { state: "Georgia", level: "Moderate", note: "Declaration of intent; attendance; annual progress reports kept", checklist: { log: true, attendanceOrHours: true, workSamples: false, testOrEvaluation: false, otherNotes: [] } },
  { state: "Hawaii", level: "Moderate", note: "Notice; record of curriculum; annual progress report", checklist: { log: true, attendanceOrHours: false, workSamples: false, testOrEvaluation: false, otherNotes: [] } },
  { state: "Idaho", level: "None", note: "Nothing filed; records for your own use" },
  { state: "Illinois", level: "None", note: "Nothing filed; records for your own use" },
  { state: "Indiana", level: "Low", note: "Attendance records, produced on request" },
  { state: "Iowa", level: "Low", note: "Options range from none to reporting; depends on the route chosen" },
  { state: "Kansas", level: "Low", note: "Register as a non-accredited private school; keep attendance" },
  { state: "Kentucky", level: "Low", note: "Notice; attendance and scholarship records" },
  { state: "Louisiana", level: "Moderate", note: "Application or notice; portfolio or test results annually", checklist: { log: false, attendanceOrHours: false, workSamples: true, testOrEvaluation: true, otherNotes: ["Portfolio and test results are alternatives, not both."] } },
  { state: "Maine", level: "Moderate", note: "Notice; annual assessment by test or portfolio review", checklist: { log: false, attendanceOrHours: false, workSamples: true, testOrEvaluation: true, otherNotes: ["Test and portfolio review are alternatives."] } },
  { state: "Maryland", level: "High", note: "Notice; portfolio reviewed by the district up to three times a year", checklist: { log: false, attendanceOrHours: false, workSamples: true, testOrEvaluation: false, otherNotes: [] } },
  { state: "Massachusetts", level: "High", note: "Prior approval of your plan; progress reports as agreed", checklist: { log: true, attendanceOrHours: false, workSamples: false, testOrEvaluation: false, otherNotes: ["Your plan needs approval before you start."] } },
  { state: "Michigan", level: "None", note: "Nothing filed under the home education route" },
  { state: "Minnesota", level: "Moderate", note: "Notice; annual testing; records of subjects and attendance", checklist: { log: true, attendanceOrHours: true, workSamples: false, testOrEvaluation: true, otherNotes: [] } },
  { state: "Mississippi", level: "Low", note: "Certificate of enrollment filed annually" },
  { state: "Missouri", level: "Moderate", note: "No notice, but a log of hours, samples of work and evaluations kept", checklist: { log: true, attendanceOrHours: true, workSamples: true, testOrEvaluation: true, otherNotes: [] } },
  { state: "Montana", level: "Low", note: "Notice; attendance and immunization records kept" },
  { state: "Nebraska", level: "Moderate", note: "Notice and information filed annually; attendance records", checklist: { log: false, attendanceOrHours: true, workSamples: false, testOrEvaluation: false, otherNotes: [] } },
  { state: "Nevada", level: "Low", note: "Notice of intent filed once; records for your own use" },
  { state: "New Hampshire", level: "Moderate", note: "Notice; portfolio kept two years; annual evaluation", checklist: { log: false, attendanceOrHours: false, workSamples: true, testOrEvaluation: true, otherNotes: [] } },
  { state: "New Jersey", level: "None", note: "Nothing filed; records for your own use" },
  { state: "New Mexico", level: "Low", note: "Notice filed annually; immunization records" },
  { state: "New York", level: "High", note: "Notice; individualised plan; quarterly reports; annual assessment", checklist: { log: true, attendanceOrHours: false, workSamples: false, testOrEvaluation: true, otherNotes: ["Your plan is individualised and filed in advance."] } },
  { state: "North Carolina", level: "Moderate", note: "Notice; attendance and immunization; annual standardised test kept", checklist: { log: false, attendanceOrHours: true, workSamples: false, testOrEvaluation: true, otherNotes: ["Immunization records are kept too."] } },
  { state: "North Dakota", level: "Moderate", note: "Notice; annual testing in certain grades; records kept", checklist: { log: true, attendanceOrHours: false, workSamples: false, testOrEvaluation: true, otherNotes: [] } },
  { state: "Ohio", level: "High", note: "Notice; annual academic assessment by test or portfolio review", checklist: { log: false, attendanceOrHours: false, workSamples: true, testOrEvaluation: true, otherNotes: ["Test and portfolio review are alternatives."] } },
  { state: "Oklahoma", level: "None", note: "Nothing filed; records for your own use" },
  { state: "Oregon", level: "Moderate", note: "Notice on starting; testing at certain grades, results kept", checklist: { log: false, attendanceOrHours: false, workSamples: false, testOrEvaluation: true, otherNotes: [] } },
  { state: "Pennsylvania", level: "High", note: "Affidavit; log, portfolio, and annual evaluator review", checklist: { log: true, attendanceOrHours: false, workSamples: true, testOrEvaluation: true, otherNotes: [] } },
  { state: "Rhode Island", level: "Moderate", note: "District approval; attendance and progress as the district requires", checklist: { log: true, attendanceOrHours: true, workSamples: false, testOrEvaluation: false, otherNotes: ["Exactly what is required is set by your district."] } },
  { state: "South Carolina", level: "High", note: "Association or district option; portfolio, log and progress records", checklist: { log: true, attendanceOrHours: false, workSamples: true, testOrEvaluation: false, otherNotes: ["Exactly what is required depends on which option you choose."] } },
  { state: "South Dakota", level: "Low", note: "Notice; testing at certain grades" },
  { state: "Tennessee", level: "Moderate", note: "Notice; attendance; testing at certain grades depending on route", checklist: { log: false, attendanceOrHours: true, workSamples: false, testOrEvaluation: true, otherNotes: ["Whether testing applies depends on the route you choose."] } },
  { state: "Texas", level: "None", note: "Nothing filed; keep curriculum evidence for your own use" },
  { state: "Utah", level: "Low", note: "One-time affidavit; records for your own use" },
  { state: "Vermont", level: "High", note: "Enrollment filed annually; assessment and progress report", checklist: { log: true, attendanceOrHours: false, workSamples: false, testOrEvaluation: true, otherNotes: [] } },
  { state: "Virginia", level: "Moderate", note: "Notice; annual evidence of progress by test or evaluation", checklist: { log: false, attendanceOrHours: false, workSamples: false, testOrEvaluation: true, otherNotes: [] } },
  { state: "Washington", level: "Moderate", note: "Declaration of intent; annual test or assessment, results kept", checklist: { log: false, attendanceOrHours: false, workSamples: false, testOrEvaluation: true, otherNotes: [] } },
  { state: "West Virginia", level: "Moderate", note: "Notice; annual academic assessment kept", checklist: { log: false, attendanceOrHours: false, workSamples: false, testOrEvaluation: true, otherNotes: [] } },
  { state: "Wisconsin", level: "Low", note: "Annual enrollment report filed" },
  { state: "Wyoming", level: "Low", note: "Curriculum submitted annually to the local board" },
];

/** Looked up by exact state name, case-insensitive. */
export function getHomeschoolStateRequirement(state: string): HomeschoolStateRequirement | undefined {
  const needle = state.trim().toLowerCase();
  return HOMESCHOOL_STATE_REQUIREMENTS.find((entry) => entry.state.toLowerCase() === needle);
}

/** Every jurisdiction name, in the order they're listed, for a picker. */
export const HOMESCHOOL_STATE_NAMES: string[] = HOMESCHOOL_STATE_REQUIREMENTS.map((entry) => entry.state);

/** One line of context per level, shown next to a state once it's picked. */
export const HOMESCHOOL_LEVEL_DESCRIPTION: Record<HomeschoolRegulationLevel, string> = {
  None: "Nothing is filed with the state. Records are for your own use.",
  Low: "A notice is typically filed, and basic records are kept, but there is no ongoing review.",
  Moderate: "Notice and some form of annual reporting or testing is typically required.",
  High: "A portfolio or a formal annual assessment is typically part of the law, not just a good habit.",
};

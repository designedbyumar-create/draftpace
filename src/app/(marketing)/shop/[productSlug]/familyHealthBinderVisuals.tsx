/**
 * Bespoke mobile mockups for Family Health Binder's Shop page, following the
 * pattern its siblings established: recreations of the shipped product, not
 * screenshots and not a generic template.
 *
 * What is drawn maps to what ships. Screen 1 is Overview: each person as a
 * card, allergies first as tags, with only what is true beneath it (the next
 * visit, and what the forms sheet is still missing). Screens 2 and 3 are the
 * pages the product prints, drawn as the paper they are: the Forms sheet and
 * the Caregiver sheet. The bottom bar is the real one: Overview, Family,
 * Symptoms, Visits.
 *
 * Every line is worked out by the same functions the product uses, from a
 * small set of sample records (describeAge, formsGaps, nextVisit,
 * buildFormsSheet, buildCaregiverSheet), so a drawing cannot say something
 * the product would not, and none of it implies a diagnosis, a dose check or
 * a vaccine schedule. Every colour comes from the product's own definition,
 * and every phrase drawn is asserted in familyHealthBinderVisuals.test.tsx.
 *
 * The people, doctors and numbers are illustrative and internally
 * consistent, never presented as real records.
 */
import type { ReactNode } from "react";
import { CalendarCheck, Clock, Compass, User, WarningCircle } from "@/design-system/Icon";
import { familyHealthBinderDefinition as definition } from "@/products/family-health-binder/definition";
import { describeAge } from "@/products/family-health-binder/dates";
import { RELATIONSHIP_LABEL } from "@/products/family-health-binder/labels";
import { PERSON_HUES, MARK_FILL_PERCENT, MARK_INK_PERCENT, initialOf } from "@/products/family-health-binder/personColors";
import { buildCaregiverSheet, buildFormsSheet, formsGaps } from "@/products/family-health-binder/printSheets";
import { describeVisit, describeVisitTiming, nextVisit } from "@/products/family-health-binder/visits";
import type { FamilyMember, Immunization, MedicalFact, Provider, SymptomEvent, Visit } from "@/products/family-health-binder/state";
import PhoneFrame from "../PhoneFrame";

const theme = definition.theme;
const ground = theme?.ground?.light;
const accent = theme?.accentScale;
if (!ground || !accent) throw new Error("Family Health Binder must declare its ground and accent scale.");

const DESK = ground.appBg;
const SURFACE = ground.surface;
const WASH = ground.surfaceMuted;
const INK = ground.text;
const MUTED = ground.muted;
const FAINT = ground.faint;
const RULE = ground.border;
const STRONG_RULE = ground.borderStrong;
const ACCENT = accent.base;
const ACCENT_STRONG = accent.strong;
const ACCENT_SOFT = accent.soft;
const ACCENT_LABEL = accent.contrast;

const TODAY = "2026-09-21";
const stamp = { createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z", status: "active" as const };

const member = (over: Partial<FamilyMember> & Pick<FamilyMember, "id" | "name">): FamilyMember => ({
  relationship: "child",
  dateOfBirth: null,
  emergencyName: null,
  emergencyPhone: null,
  insurer: null,
  insuranceMemberId: null,
  insuranceGroup: null,
  caregiverNotes: null,
  medicationsCheckedOn: null,
  ...stamp,
  ...over,
});
const fact = (over: Partial<MedicalFact> & Pick<MedicalFact, "id" | "familyMemberId" | "kind" | "detail">): MedicalFact => ({
  dosage: null,
  frequency: null,
  reaction: null,
  startedOn: null,
  stoppedOn: null,
  visibility: "summary",
  ...stamp,
  ...over,
});

export const SAMPLE = {
  members: [
    member({
      id: "m1",
      name: "Amina",
      dateOfBirth: "2018-04-02",
      emergencyName: "Sam (dad)",
      emergencyPhone: "(555) 010-0142",
      insurer: "Acme Health",
      insuranceMemberId: "XYZ123456",
      insuranceGroup: "G77",
      caregiverNotes: "Bedtime is 8. Likes the green cup.",
    }),
    member({ id: "m2", name: "Leo", dateOfBirth: "2025-08-14" }),
    member({ id: "m3", name: "Grandma Rose", relationship: "parent", dateOfBirth: "1947-02-11", emergencyName: "Sam", emergencyPhone: "(555) 010-0142", insurer: "Medicare" }),
  ],
  facts: [
    fact({ id: "a1", familyMemberId: "m1", kind: "allergy", detail: "Peanuts", reaction: "Hives" }),
    fact({ id: "a2", familyMemberId: "m1", kind: "allergy", detail: "Penicillin", reaction: "Rash" }),
    fact({ id: "c1", familyMemberId: "m1", kind: "condition", detail: "Asthma" }),
    fact({ id: "d1", familyMemberId: "m1", kind: "medication", detail: "Vitamin D", dosage: "400 IU", frequency: "daily" }),
    fact({ id: "a3", familyMemberId: "m2", kind: "allergy", detail: "Eggs" }),
    fact({ id: "c2", familyMemberId: "m3", kind: "condition", detail: "High blood pressure" }),
  ] as MedicalFact[],
  providers: [
    { id: "p1", familyMemberId: "m1", kind: "doctor", name: "Dr. Patel", phone: "(555) 010-0100", note: null, ...stamp },
    { id: "p2", familyMemberId: "m1", kind: "pharmacy", name: "Corner Pharmacy", phone: "(555) 010-0177", note: null, ...stamp },
  ] as Provider[],
  immunizations: [
    { id: "i1", familyMemberId: "m1", vaccine: "MMR", givenOn: "2019-05-01", note: null, visibility: "summary", ...stamp },
    { id: "i2", familyMemberId: "m1", vaccine: "DTaP", givenOn: "2018-08-02", note: null, visibility: "summary", ...stamp },
  ] as Immunization[],
  events: [] as SymptomEvent[],
  visits: [{ id: "v1", familyMemberId: "m1", visitOn: "2026-09-26", withWhom: "Dr. Patel", reason: "Yearly checkup", questions: null, notes: null, visibility: "summary", ...stamp }] as Visit[],
};

type RGB = [number, number, number];
const rgb = (hex: string): RGB => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as RGB;
const mix = (a: RGB, b: RGB, aPercent: number): string =>
  "#" + a.map((v, i) => Math.round((v * aPercent + b[i] * (100 - aPercent)) / 100).toString(16).padStart(2, "0")).join("");

/** The same mixing the product does in CSS, worked out here because the shop page does not carry the product's tokens. */
function markColors(index: number) {
  const hue = rgb(PERSON_HUES[index % PERSON_HUES.length]);
  return { fill: mix(hue, rgb(SURFACE), MARK_FILL_PERCENT), ink: mix(hue, rgb(INK), MARK_INK_PERCENT) };
}

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-1 text-[10px] font-semibold" style={{ color: INK }}>
      <span>9:41</span>
      <div className="flex items-center gap-1">
        <span className="h-2 w-3 rounded-[1px] border border-current" />
        <span className="h-2 w-2 rounded-full border border-current" />
      </div>
    </div>
  );
}

const TABS = [
  { id: "workspace", Icon: Compass },
  { id: "members", Icon: User },
  { id: "timeline", Icon: Clock },
  { id: "visits", Icon: CalendarCheck },
] as const;

function tabLabel(id: string): string {
  return id === "workspace" ? (definition.workspaceLabel ?? "Overview") : (definition.destinationLabels?.[id] ?? id);
}

/** The four real destinations, the accent only on the one you are on. Print lives under More, so no tab is lit there. */
function TabBar({ current }: { current: string | null }) {
  return (
    <div className="-mx-4 -mb-4 mt-auto flex border-t" style={{ borderColor: RULE, backgroundColor: SURFACE }}>
      {TABS.map(({ id, Icon }) => (
        <span key={id} className="flex h-10 flex-1 flex-col items-center justify-center gap-px text-[7px] font-semibold" style={{ color: id === current ? ACCENT : MUTED }}>
          <Icon size={12} aria-hidden />
          {tabLabel(id)}
        </span>
      ))}
    </div>
  );
}

function Screen({ children }: { children: ReactNode }) {
  return (
    <PhoneFrame accent={ACCENT}>
      <div className="flex h-full flex-col px-4 pb-4 pt-9" style={{ backgroundColor: DESK }}>
        <StatusBar />
        {children}
      </div>
    </PhoneFrame>
  );
}

function Heading({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="mt-3">
      <p className="text-[7px] font-medium" style={{ color: MUTED }}>
        {kicker}
      </p>
      <h3 className="mt-0.5 text-[16px] font-semibold leading-none tracking-[-0.02em]" style={{ color: INK }}>
        {title}
      </h3>
    </div>
  );
}

function Mark({ index, name, size }: { index: number; name: string; size: number }) {
  const { fill, ink } = markColors(index);
  return (
    <span className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold" style={{ width: size, height: size, backgroundColor: fill, color: ink, fontSize: size * 0.42 }}>
      {initialOf(name)}
    </span>
  );
}

function AllergyTag({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center gap-[3px] rounded-full px-1.5 py-[2px] text-[6.5px] font-semibold" style={{ backgroundColor: ACCENT_SOFT, color: ACCENT_STRONG }}>
      <WarningCircle size={7} aria-hidden />
      {children}
    </span>
  );
}

function QuietTag({ children }: { children: string }) {
  return (
    <span className="inline-flex rounded-full px-1.5 py-[2px] text-[6.5px] font-medium" style={{ backgroundColor: WASH, color: MUTED }}>
      {children}
    </span>
  );
}

/**
 * Screen 1: Overview. One card per person, allergies first, then only what
 * is true and useful beneath it.
 */
export function OverviewScreenMockup() {
  const { members, facts, providers, visits } = SAMPLE;
  return (
    <Screen>
      <Heading kicker="Everyone at a glance" title="Overview" />
      <ul className="mt-3 flex flex-col gap-3">
        {members.map((m, index) => {
          const allergies = facts.filter((f) => f.familyMemberId === m.id && f.kind === "allergy");
          const conditions = facts.filter((f) => f.familyMemberId === m.id && f.kind === "condition");
          const next = nextVisit(visits, m.id, TODAY);
          const gaps = formsGaps(m, providers);
          return (
            <li key={m.id} className="flex flex-col gap-1.5">
              <div className="rounded-[14px] border p-2.5" style={{ borderColor: RULE, backgroundColor: SURFACE }}>
                <div className="flex items-center gap-2">
                  <Mark index={index} name={m.name} size={22} />
                  <div>
                    <p className="text-[9px] font-semibold leading-tight" style={{ color: INK }}>
                      {m.name}
                    </p>
                    <p className="text-[6.5px]" style={{ color: MUTED }}>
                      {[RELATIONSHIP_LABEL[m.relationship], describeAge(m.dateOfBirth, TODAY)].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {allergies.map((a) => (
                    <AllergyTag key={a.id}>{a.detail}</AllergyTag>
                  ))}
                  {conditions.map((c) => (
                    <QuietTag key={c.id}>{c.detail}</QuietTag>
                  ))}
                </div>
              </div>
              {(next || gaps.length > 0) && (
                <div className="mx-1 flex flex-col gap-0.5 text-[6.5px] leading-snug" style={{ color: MUTED }}>
                  {next && (
                    <p>
                      <span className="font-semibold" style={{ color: INK }}>
                        Next visit
                      </span>{" "}
                      {describeVisit(next)}, {describeVisitTiming(next, TODAY).toLowerCase()}
                    </p>
                  )}
                  {gaps.length > 0 && (
                    <p>
                      <span className="font-semibold" style={{ color: INK }}>
                        Forms sheet is missing
                      </span>{" "}
                      {gaps.join(", ")}
                    </p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <TabBar current="workspace" />
    </Screen>
  );
}

function Paper({ children }: { children: ReactNode }) {
  return (
    <div className="mt-3 rounded-[4px] border p-2.5 pb-3 shadow-sm" style={{ borderColor: STRONG_RULE, backgroundColor: SURFACE }}>
      {children}
    </div>
  );
}

function PaperLabel({ children }: { children: string }) {
  return (
    <p className="mb-0.5 mt-2 text-[5px] font-bold uppercase tracking-[0.14em]" style={{ color: ACCENT }}>
      {children}
    </p>
  );
}

function PaperRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 border-b py-[2.5px] text-[6px]" style={{ borderColor: RULE }}>
      <span className="w-[42px] shrink-0" style={{ color: MUTED }}>
        {label}
      </span>
      <span className="font-semibold" style={{ color: INK }}>
        {value}
      </span>
    </div>
  );
}

/**
 * Screen 2: the Forms sheet, drawn as the paper it prints. Built by the same
 * function that builds the PDF, so it holds what the page holds.
 */
export function FormsSheetScreenMockup() {
  const { members, facts, providers, immunizations, events, visits } = SAMPLE;
  const sheet = buildFormsSheet(members[0], facts, providers, immunizations, events, visits, TODAY);
  return (
    <Screen>
      <Heading kicker="The pages that leave the house" title="Print" />
      <Paper>
        <p className="text-[9px] font-semibold leading-none" style={{ color: INK }}>
          Forms sheet
        </p>
        <p className="mt-1 text-[5.5px]" style={{ color: MUTED }}>
          {[sheet.person.name, sheet.person.age, sheet.person.dateOfBirth && `born ${sheet.person.dateOfBirth}`].filter(Boolean).join(", ")}
        </p>
        <PaperLabel>About</PaperLabel>
        <PaperRow label="Date of birth" value={sheet.person.dateOfBirth ?? "Not recorded"} />
        <PaperRow label="Emergency" value={[sheet.emergency?.name, sheet.emergency?.phone].filter(Boolean).join(", ") || "Not recorded"} />
        <PaperLabel>Health insurance</PaperLabel>
        <PaperRow label="Insurer" value={sheet.insurance?.insurer ?? "Not recorded"} />
        <PaperRow label="Member ID" value={sheet.insurance?.memberId ?? "Not recorded"} />
        <PaperLabel>Doctors and pharmacy</PaperLabel>
        {sheet.careTeam.map((p) => (
          <PaperRow key={p.role} label={p.role} value={[p.name, p.phone].filter(Boolean).join(", ")} />
        ))}
        <PaperLabel>Allergies</PaperLabel>
        {sheet.allergies.map((a) => (
          <PaperRow key={a.label} label={a.label} value={a.detail} />
        ))}
        <PaperLabel>Vaccines</PaperLabel>
        {sheet.immunizations.map((v) => (
          <PaperRow key={v.label} label={v.label} value={v.detail} />
        ))}
      </Paper>
      <span className="mt-2.5 inline-block self-start rounded-full px-3 py-1.5 text-[7px] font-semibold" style={{ backgroundColor: ACCENT, color: ACCENT_LABEL }}>
        Make it
      </span>
      <TabBar current={null} />
    </Screen>
  );
}

/**
 * Screen 3: the Caregiver sheet. What to avoid comes first and largest, then
 * what is taken, who to call, and the family's own notes.
 */
export function CaregiverSheetScreenMockup() {
  const { members, facts, providers, immunizations, events, visits } = SAMPLE;
  const sheet = buildCaregiverSheet(members[0], facts, providers, immunizations, events, visits, TODAY);
  return (
    <Screen>
      <Heading kicker="The pages that leave the house" title="Print" />
      <Paper>
        <p className="text-[9px] font-semibold leading-none" style={{ color: INK }}>
          All about {sheet.person.name}
        </p>
        <div className="mt-2 rounded-[4px] p-1.5" style={{ backgroundColor: ACCENT_SOFT }}>
          <p className="text-[5px] font-bold uppercase tracking-[0.14em]" style={{ color: ACCENT }}>
            Allergies
          </p>
          {sheet.allergies.map((a) => (
            <p key={a.label} className="mt-0.5 text-[8px] font-semibold" style={{ color: INK }}>
              {a.label}
              <span className="text-[6px] font-normal">{`  (${a.detail})`}</span>
            </p>
          ))}
        </div>
        <PaperLabel>Medications now</PaperLabel>
        {sheet.medications.map((m) => (
          <PaperRow key={m.label} label={m.label} value={m.detail} />
        ))}
        <PaperLabel>Who to call</PaperLabel>
        <PaperRow label="Emergency" value={[sheet.emergency?.name, sheet.emergency?.phone].filter(Boolean).join(", ")} />
        <PaperRow label="Doctor" value={[sheet.doctor?.name, sheet.doctor?.phone].filter(Boolean).join(", ")} />
        {sheet.notes && (
          <>
            <PaperLabel>{`Good to know about ${sheet.person.name}`}</PaperLabel>
            <p className="text-[6.5px] leading-snug" style={{ color: INK }}>
              {sheet.notes}
            </p>
          </>
        )}
        <p className="mt-2 text-[6.5px] font-semibold" style={{ color: INK }}>
          In an emergency, call 911.
        </p>
      </Paper>
      <span className="mt-2.5 inline-block self-start rounded-full border px-3 py-1.5 text-[7px] font-semibold" style={{ borderColor: STRONG_RULE, color: FAINT }}>
        Make it
      </span>
      <TabBar current={null} />
    </Screen>
  );
}

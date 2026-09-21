"use client";

import { useState } from "react";
import Button from "@/design-system/Button";
import EmptyState from "@/design-system/EmptyState";
import { Article } from "@/design-system/Icon";
import { longDate, todayIso } from "../dates";
import { buildIntakeSummary } from "../intakeSummary";
import { buildCaregiverSheet, buildEmergencyCard, buildFormsSheet, buildVisitPrep, formsGaps, privateCount } from "../printSheets";
import { describeVisit, nextVisit } from "../visits";
import { CARD, Heading, PersonPicker } from "./Care";
import { gate } from "./Gate";
import { useFamilyHealthBinder } from "./useFamilyHealthBinder";

type DocId = "forms" | "caregiver" | "emergency" | "visit" | "intake";

/**
 * Print: the pages that leave the house, one set per person. Every page is
 * built fresh from the record, dated, and leaves off anything marked
 * private, and each says how many records that was.
 */
export default function PrintablesModule() {
  const data = useFamilyHealthBinder();
  const [personId, setPersonId] = useState<string | null>(null);
  const [making, setMaking] = useState<DocId | null>(null);
  const [error, setError] = useState<string | null>(null);

  const blocked = gate(data);
  if (blocked) return blocked;
  const { members, facts, events, providers, immunizations, visits } = data;
  if (members.length === 0) {
    return <EmptyState icon={Article} title="Nobody added yet" description="Add a person in Family before printing anything." />;
  }

  const today = todayIso();
  const member = members.find((m) => m.id === personId) ?? members[0];
  const next = nextVisit(visits, member.id, today);
  const gaps = formsGaps(member, providers);
  const hidden = privateCount(member.id, facts, events, immunizations, visits);

  async function make(id: DocId) {
    setMaking(id);
    setError(null);
    const generatedLabel = longDate(today);
    try {
      if (id === "forms") {
        const { downloadFormsSheet } = await import("../printables/generateFormsSheet");
        await downloadFormsSheet({ ...buildFormsSheet(member, facts, providers, immunizations, events, visits, today), generatedLabel });
      } else if (id === "caregiver") {
        const { downloadCaregiverSheet } = await import("../printables/generateCaregiverSheet");
        await downloadCaregiverSheet({ ...buildCaregiverSheet(member, facts, providers, immunizations, events, visits, today), generatedLabel });
      } else if (id === "emergency") {
        const { downloadEmergencyCard } = await import("../printables/generateEmergencyCard");
        await downloadEmergencyCard({ ...buildEmergencyCard(member, facts, providers, immunizations, events, visits, today), generatedLabel });
      } else if (id === "visit") {
        const { downloadVisitPrep } = await import("../printables/generateVisitPrep");
        await downloadVisitPrep({ ...buildVisitPrep(member, next, facts, events, immunizations, visits, today), generatedLabel });
      } else {
        const { downloadIntakeSummary } = await import("../printables/generateIntakeSummary");
        await downloadIntakeSummary({ ...buildIntakeSummary(member, facts, events), generatedLabel, hiddenCount: hidden });
      }
    } catch {
      // A failed generation must never look like a saved download.
      setError("The page could not be made. Nothing was downloaded.");
    } finally {
      setMaking(null);
    }
  }

  const docs: { id: DocId; title: string; blurb: string; note?: string }[] = [
    { id: "forms", title: "Forms sheet", blurb: "The answers school, camp, sports and new-patient forms ask for, in the order they ask.", note: gaps.length > 0 ? `Missing: ${gaps.join(", ")}.` : undefined },
    { id: "caregiver", title: "Caregiver sheet", blurb: "For a babysitter, grandparent or respite carer: what to avoid, what is taken, who to call, and your notes." },
    { id: "emergency", title: "Emergency card", blurb: "One small card for a wallet, a bag or the fridge." },
    { id: "visit", title: "Visit page", blurb: "Your questions, what is taken now and recent symptoms, with room for notes.", note: next ? `For ${describeVisit(next)}.` : "No visit planned, so it prints without questions." },
    { id: "intake", title: "Intake summary", blurb: "For a new doctor: allergies, medications, conditions, family history and recent symptoms." },
  ];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <Heading kicker="The pages that leave the house" title="Print" />
      {members.length > 1 && <PersonPicker people={members} activeId={member.id} onPick={setPersonId} />}
      <p className="text-[14px] leading-relaxed text-[var(--muted)]">
        {hidden > 0
          ? `${hidden === 1 ? "One record" : `${hidden} records`} marked private for ${member.name} stay${hidden === 1 ? "s" : ""} off every page.`
          : `Nothing is marked private for ${member.name}. Anything you mark private stays off every page.`}
      </p>

      <ul className={`${CARD} px-5`}>
        {docs.map((doc) => (
          <li key={doc.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-4 [&:not(:first-child)]:border-t [&:not(:first-child)]:border-[var(--border)]">
            <div className="min-w-0 flex-1 basis-64">
              <p className="text-[16px] font-semibold text-[var(--text)]">{doc.title}</p>
              <p className="mt-0.5 text-[14px] leading-snug text-[var(--muted)]">{doc.blurb}</p>
              {doc.note && <p className="mt-1 text-[13.5px] leading-snug text-[var(--muted)]">{doc.note}</p>}
            </div>
            <Button variant={doc.id === "forms" ? "commit" : "action"} size="sm" disabled={making !== null} onClick={() => make(doc.id)}>
              {making === doc.id ? "Preparing..." : "Make it"}
            </Button>
          </li>
        ))}
      </ul>
      {error && <p role="alert" className="text-[13px] text-[var(--danger)]">{error}</p>}
    </div>
  );
}

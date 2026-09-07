"use client";

import FirstRun from "@/components/platform/FirstRun";
import FirstRunTour from "@/components/platform/FirstRunTour";
import { FAMILY_HEALTH_BINDER_SLUG } from "../instanceData";
import type { TourStep } from "@/components/platform/GuidedTour";
import { motion, useReducedMotion } from "framer-motion";
import EmptyState from "@/design-system/EmptyState";
import { Heart } from "@/design-system/Icon";
import { entranceVariant, staggerContainer, staggerItem } from "@/design-system/motion";
import { useFamilyHealthBinder } from "./useFamilyHealthBinder";
import type { FamilyMember, MedicalFact, SymptomEvent } from "../state";

const RELATIONSHIP_LABEL: Record<FamilyMember["relationship"], string> = {
  self: "You",
  spouse: "Spouse",
  child: "Child",
  other: "Other",
};

function memberSummaryLine(member: FamilyMember, facts: MedicalFact[]): string {
  const active = facts.filter((f) => f.familyMemberId === member.id && f.status === "active");
  const medications = active.filter((f) => f.kind === "medication").length;
  const allergies = active.filter((f) => f.kind === "allergy").length;
  const parts = [
    medications > 0 ? `${medications} medication${medications === 1 ? "" : "s"}` : null,
    allergies > 0 ? `${allergies} allerg${allergies === 1 ? "y" : "ies"}` : null,
  ].filter((part): part is string => part !== null);
  return parts.length > 0 ? parts.join(", ") : "Nothing recorded yet";
}

function mostRecentEvent(events: SymptomEvent[]): SymptomEvent | null {
  const active = events.filter((e) => e.status === "active");
  if (active.length === 0) return null;
  return active.reduce((latest, e) => (e.onsetAt > latest.onsetAt ? e : latest));
}

const TOUR_STEPS: TourStep[] = [
  {
    targetId: "empty-state",
    title: "Nobody in the binder yet",
    body:
      "Everything here is a fact you record about somebody in your family. Nothing is filled in for you and nothing is inferred.",
  },
  {
    targetId: "rail-members",
    title: "Add the people first",
    body:
      "Adults and children alike are rows under your own account. Nobody gets a separate login.",
  },
  {
    targetId: "rail-timeline",
    title: "Record symptoms as they happen",
    body:
      "Onset, duration and severity are real fields, so a pattern across weeks is something you can see rather than reconstruct at an intake desk.",
  },
  {
    targetId: "rail-workspace",
    title: "Everyone at a glance",
    body:
      "Overview shows each person and what is recorded for them, plus the most recent symptom across the family.",
  },
];

/**
 * The whole account, on one screen: who's in the binder, a one-line
 * summary of what's recorded for each, and, when there is one, the most
 * recently recorded symptom, so a pattern across the family is visible
 * without opening every person's own page. No due-list ranking here,
 * unlike Vehicle Maintenance Companion's Due: nothing here is ever
 * "overdue," this is a record, not a schedule.
 */
export default function WorkspaceModule() {
  const { status, errorMessage, members, facts, events } = useFamilyHealthBinder();
  const reduceMotion = useReducedMotion();

  if (status === "loading") return <p className="text-[13px] text-[var(--faint)]">Loading...</p>;
  if (status === "no-instance") {
    return (
      <EmptyState icon={Heart} title="Nothing to show yet" description="This product has not been set up on your account." />
    );
  }
  if (status === "error") {
    return (
      <EmptyState icon={Heart} title="Couldn't load this" description={errorMessage ?? "Try again."} />
    );
  }
  if (members.length === 0) {
    return (
      <FirstRun
        slug={FAMILY_HEALTH_BINDER_SLUG}
        icon={Heart}
        title="Nobody added yet"
        description="Add the first person in your family to start keeping their medications, allergies and symptoms on hand."
        actionLabel="Add the first person"
        destination="members"
        steps={TOUR_STEPS}
      />
    );
  }

  const recent = mostRecentEvent(events);
  const recentMember = recent ? members.find((m) => m.id === recent.familyMemberId) : null;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <FirstRunTour slug={FAMILY_HEALTH_BINDER_SLUG} steps={TOUR_STEPS} />
      <motion.header initial="hidden" animate="visible" variants={entranceVariant(Boolean(reduceMotion))}>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Overview</p>
        <h1 className="mt-2 text-[26px] leading-tight text-[var(--text)]" style={{ fontFamily: "var(--product-narrative-font, inherit)" }}>
          {members.length === 1 ? "One person in this binder." : `${members.length} people in this binder.`}
        </h1>
      </motion.header>

      {recent && recentMember && (
        <section aria-label="Most recently recorded" className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Most recently recorded</p>
          <p className="mt-1.5 text-[13.5px] text-[var(--text)]">
            {recentMember.name}: {recent.description}, {recent.onsetAt}
          </p>
        </section>
      )}

      <motion.ul initial="hidden" animate="visible" variants={staggerContainer(Boolean(reduceMotion))} className="flex flex-col gap-2">
        {members.map((member) => (
          <motion.li
            key={member.id}
            variants={staggerItem(Boolean(reduceMotion))}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-3"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <h4 className="text-[13.5px] font-semibold text-[var(--text)]">{member.name}</h4>
              <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--faint)]">
                {RELATIONSHIP_LABEL[member.relationship]}
              </span>
            </div>
            <p className="mt-0.5 text-[12px] text-[var(--muted)]">{memberSummaryLine(member, facts)}</p>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}

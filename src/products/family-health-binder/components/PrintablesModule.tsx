"use client";

import { useState } from "react";
import Surface from "@/design-system/Surface";
import Button from "@/design-system/Button";
import EmptyState from "@/design-system/EmptyState";
import { Article, Heart } from "@/design-system/Icon";
import { buildIntakeSummary } from "../intakeSummary";
import { useFamilyHealthBinder } from "./useFamilyHealthBinder";
import type { FamilyMember } from "../state";

function dateLabel(date: Date): string {
  return date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

/**
 * Choosing a family member, then generating their Intake Summary. This
 * module never decides what's on the page itself: buildIntakeSummary()
 * already filtered out anything marked private, so this only wires the
 * choice to the download.
 */
export default function PrintablesModule() {
  const { status, errorMessage, members, facts, events } = useFamilyHealthBinder();
  const [memberId, setMemberId] = useState<string | null>(null);
  const [making, setMaking] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  if (status === "loading") return <p className="text-[13px] text-[var(--faint)]">Loading...</p>;
  if (status === "no-instance") {
    return <EmptyState icon={Heart} title="Nothing to show yet" description="This product has not been set up on your account." />;
  }
  if (status === "error") {
    return <EmptyState icon={Heart} title="Couldn't load this" description={errorMessage ?? "Try again."} />;
  }
  if (members.length === 0) {
    return <EmptyState icon={Heart} title="Nobody added yet" description="Add a family member in Family before generating an Intake Summary." />;
  }

  const member: FamilyMember = members.find((m) => m.id === memberId) ?? members[0];

  async function generate() {
    setMaking(true);
    setGenerateError(null);
    try {
      const { downloadIntakeSummary } = await import("../printables/generateIntakeSummary");
      const summary = buildIntakeSummary(member, facts, events);
      await downloadIntakeSummary({ ...summary, generatedLabel: dateLabel(new Date()) });
    } catch {
      // A failed generation must never look like a saved download.
      setGenerateError("The document could not be made. Nothing was downloaded.");
    } finally {
      setMaking(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Summary</p>
        <h1 className="mt-2 text-xl font-semibold text-[var(--text)]">Intake Summary</h1>
        <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-[var(--muted)]">
          A one-page summary for one person: medications, allergies, family history and recent symptoms, dated and
          ready to hand to a clinic alongside their own paperwork. Anything you&apos;ve marked private stays out of it.
        </p>
      </div>

      {members.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {members.map((m) => (
            <Button key={m.id} size="sm" variant={m.id === member.id ? "primary" : "secondary"} onClick={() => setMemberId(m.id)}>
              {m.name}
            </Button>
          ))}
        </div>
      )}

      <Surface className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[var(--primary)]">
            <Article size={18} aria-hidden />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[var(--text)]">Intake Summary, {member.name}</p>
            <p className="mt-0.5 text-[12px] text-[var(--muted)]">Generated fresh each time, dated.</p>
          </div>
        </div>
        <Button size="sm" disabled={making} onClick={generate}>
          {making ? "Preparing..." : "Generate"}
        </Button>
      </Surface>

      {generateError && <p className="text-[13px] text-[var(--danger)]">{generateError}</p>}
    </div>
  );
}

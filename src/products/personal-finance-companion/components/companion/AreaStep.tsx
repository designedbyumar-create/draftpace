"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import Surface from "@/design-system/Surface";
import Badge from "@/design-system/Badge";
import Button from "@/design-system/Button";
import Alert from "@/design-system/Alert";
import { EASE_OUT, useCombinedReducedMotion } from "@/components/onboarding/motion";
import { STATUS_LABEL, STATUS_TONE } from "../shared/lifecycle";
import { computeCapabilities, type FinancialPictureInputs } from "../../companion/capability";
import type { FinancialArea } from "../../state";
import { AREA_CONFIGS, type AreaRecord } from "./companionAreas";
import UnlockMoment from "./UnlockMoment";

/**
 * The one generic screen every Companion area renders through — orient
 * (purpose/ask prompt), ask (open the real FormSheet), explain (why-text),
 * confirm/save (the FormSheet's own Save, unchanged), reflect (what
 * changed + unlock), continue. Existing-data and skip/not-sure are both
 * first-class landing states, not edge cases bolted on — see launch spec
 * Stage C §4/§13.
 */
export default function AreaStep({
  area,
  instanceId,
  records,
  onRecordSaved,
  onAreaStatusChange,
  onAdvance,
  onBack,
  isFirst,
  isLast,
}: {
  area: FinancialArea;
  instanceId: string;
  records: FinancialPictureInputs;
  onRecordSaved: (area: FinancialArea, record: AreaRecord, wasCreate: boolean) => void;
  onAreaStatusChange: (area: FinancialArea, status: "in-progress" | "acknowledged-skip" | "complete") => void;
  onAdvance: () => void;
  onBack: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const reduceMotion = useCombinedReducedMotion();
  const config = AREA_CONFIGS[area];
  const areaRecords = (records[areaRecordsKey(area)] as AreaRecord[]) ?? [];
  const active = areaRecords.filter((r) => r.status !== "archived");

  const [mode, setMode] = useState<"landing" | "reviewing" | "reflecting">("landing");
  const [formOpen, setFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AreaRecord | null>(null);
  const [lastSaved, setLastSaved] = useState<AreaRecord | null>(null);
  const addButtonRef = useRef<HTMLDivElement>(null);

  // Captured once per area visit — the "before" reading, so an unlock
  // moment fires exactly when this area's own save is what tipped the
  // capability from waiting to something real, not on every render.
  const [wasWaiting] = useState(() => computeCapabilities(records).find((c) => c.key === config.capabilityKey)?.status === "waiting");
  const allCapabilitiesNow = computeCapabilities(records);
  const capabilityNow = allCapabilitiesNow.find((c) => c.key === config.capabilityKey);
  const justUnlocked = wasWaiting && capabilityNow?.status !== "waiting";
  const readyCount = allCapabilitiesNow.filter((c) => c.status !== "waiting").length;
  const showWeKnowEnough = justUnlocked && readyCount >= 2;

  function handleSaved(record: AreaRecord) {
    onRecordSaved(area, record, editingRecord === null);
    onAreaStatusChange(area, record.status === "confirmedIncomplete" ? "in-progress" : "complete");
    setLastSaved(record);
    setFormOpen(false);
    setEditingRecord(null);
    setMode("reflecting");
  }

  function openCreate() {
    setEditingRecord(null);
    setFormOpen(true);
  }

  function openEdit(record: AreaRecord) {
    setEditingRecord(record);
    setFormOpen(true);
  }

  function skip() {
    onAreaStatusChange(area, "acknowledged-skip");
    onAdvance();
  }

  const Icon = config.icon;

  return (
    <Surface elevated className="flex flex-col gap-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
          <Icon size={19} aria-hidden />
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">{config.title}</p>
          <h2 className="mt-0.5 text-[17px] font-semibold text-[var(--text)]">{config.purpose}</h2>
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={mode}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.2, ease: EASE_OUT }}
        >
      {mode === "reflecting" && lastSaved ? (
        <div className="flex flex-col gap-4">
          <Alert tone="success">{config.summarize(lastSaved).title} saved.</Alert>
          {justUnlocked && <UnlockMoment message={config.unlockMessage} />}
          {showWeKnowEnough && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3.5">
              <p className="text-[13px] font-semibold text-[var(--text)]">We know enough to show something useful.</p>
              <p className="mt-1 text-[12px] leading-relaxed text-[var(--muted)]">
                Draftpace can now show {readyCount} {readyCount === 1 ? "part" : "parts"} of your financial picture. You can stop here
                anytime without losing progress.
              </p>
              <Link
                href="/app/products/personal-finance-companion/workspace"
                className="mt-2 inline-block text-[12px] font-semibold text-[var(--primary)] hover:underline"
              >
                See my current picture →
              </Link>
            </div>
          )}
          <div className="flex flex-wrap gap-2.5">
            <Button size="md" variant="secondary" onClick={openCreate}>
              Add another
            </Button>
            <Button size="md" onClick={onAdvance}>
              Continue
            </Button>
          </div>
        </div>
      ) : active.length > 0 && mode === "landing" ? (
        <div className="flex flex-col gap-4">
          <p className="text-[14px] leading-relaxed text-[var(--text)]">
            You already have {active.length} {active.length === 1 ? config.singularNoun : config.pluralNoun} in Draftpace. Would you like to
            review them or continue?
          </p>
          <div className="flex flex-wrap gap-2.5">
            <Button size="md" variant="secondary" onClick={() => setMode("reviewing")}>
              Review existing
            </Button>
            <Button size="md" variant="secondary" onClick={openCreate}>
              Add another
            </Button>
            <Button
              size="md"
              onClick={() => {
                onAreaStatusChange(area, "complete");
                onAdvance();
              }}
            >
              Looks right, continue
            </Button>
          </div>
        </div>
      ) : mode === "reviewing" ? (
        <div className="flex flex-col gap-4">
          <ul className="flex flex-col gap-2">
            {active.map((record) => {
              const summary = config.summarize(record);
              return (
                <li key={record.id}>
                  <button
                    type="button"
                    onClick={() => openEdit(record)}
                    className="flex w-full flex-col items-start rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-left hover:border-[var(--primary)]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-[var(--text)]">{summary.title}</span>
                      <Badge tone={STATUS_TONE[record.status]}>{STATUS_LABEL[record.status]}</Badge>
                    </div>
                    <span className="mt-0.5 text-[12px] text-[var(--muted)]">{summary.detail}</span>
                    {summary.incomplete && <span className="mt-1 text-[12px] text-[var(--warning)]">{summary.incomplete}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="flex flex-wrap gap-2.5">
            <Button size="md" variant="secondary" onClick={openCreate}>
              {config.addLabel}
            </Button>
            <Button
              size="md"
              onClick={() => {
                onAreaStatusChange(area, "complete");
                onAdvance();
              }}
            >
              Continue
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-[15px] font-medium leading-relaxed text-[var(--text)]">{config.askPrompt}</p>
          <p className="text-[13px] leading-relaxed text-[var(--muted)]">
            <span className="font-semibold text-[var(--text)]">Why we ask: </span>
            {config.whyText}
          </p>
          <div className="flex flex-wrap gap-2.5">
            <div ref={addButtonRef} className="inline-block">
              <Button size="md" onClick={openCreate}>
                {config.addLabel}
              </Button>
            </div>
            <Button size="md" variant="ghost" onClick={skip}>
              I don&apos;t have this information yet
            </Button>
          </div>
        </div>
      )}
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between border-t border-[var(--border)] pt-3.5">
        <Button size="sm" variant="ghost" onClick={onBack} disabled={isFirst}>
          Back
        </Button>
        <p className="text-[12px] font-medium text-[var(--faint)]">{isLast ? "Last area" : "You can revisit any area later"}</p>
      </div>

      {config.renderForm({
        open: formOpen,
        editing: editingRecord,
        instanceId,
        accounts: records.accounts,
        onClose: () => setFormOpen(false),
        onSaved: handleSaved,
        triggerRef: addButtonRef,
      })}
    </Surface>
  );
}

function areaRecordsKey(area: FinancialArea): keyof FinancialPictureInputs {
  switch (area) {
    case "accounts":
      return "accounts";
    case "income":
      return "incomeSources";
    case "bills":
      return "bills";
    case "subscriptions":
      return "subscriptions";
    case "transactions":
      return "transactions";
    case "debt":
      return "debts";
    case "savings":
      return "savingsGoals";
  }
}

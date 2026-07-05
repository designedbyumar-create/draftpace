"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, CheckCircle2, Circle, Save } from "@/components/ui/Icon";
import { Planner, PlannerBlock } from "@/lib/planners";

type PlannerValue = string | number | boolean;
type PlannerEntry = Record<string, PlannerValue>;

function storageKey(plannerId: string) {
  return `draftpace-planner-entry:${plannerId}`;
}

function checkinKey() {
  return "draftpace-checkins";
}

function readEntry(plannerId: string): PlannerEntry {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(storageKey(plannerId));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function PlannerRenderer({ planner }: { planner: Planner }) {
  const [entry, setEntry] = useState<PlannerEntry>({});
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [checkedIn, setCheckedIn] = useState(false);

  useEffect(() => {
    setEntry(readEntry(planner.id));
    try {
      const checkins = JSON.parse(window.localStorage.getItem(checkinKey()) || "{}");
      setCheckedIn(Boolean(checkins[planner.id]?.[getTodayKey()]));
    } catch {
      setCheckedIn(false);
    }
  }, [planner.id]);

  useEffect(() => {
    if (Object.keys(entry).length === 0) return;
    window.localStorage.setItem(storageKey(planner.id), JSON.stringify(entry));
    window.localStorage.setItem("draftpace-sync-state", JSON.stringify({ status: "queued", updatedAt: new Date().toISOString() }));
    setSavedAt(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
  }, [entry, planner.id]);

  const totalBlocks = useMemo(
    () => planner.sections.reduce((count, section) => count + section.blocks.length, 0),
    [planner.sections]
  );

  const completedBlocks = useMemo(() => {
    return planner.sections.reduce((count, section) => {
      return (
        count +
        section.blocks.filter((block) => {
          const value = entry[block.id];
          if (typeof value === "boolean") return value;
          if (typeof value === "number") return value > 0;
          return typeof value === "string" && value.trim().length > 0;
        }).length
      );
    }, 0);
  }, [entry, planner.sections]);

  const progress = Math.round((completedBlocks / Math.max(totalBlocks, 1)) * 100);

  const update = (id: string, value: PlannerValue) => {
    setEntry((current) => ({ ...current, [id]: value }));
  };

  const completeCheckin = () => {
    const today = getTodayKey();
    const raw = window.localStorage.getItem(checkinKey());
    const checkins = raw ? JSON.parse(raw) : {};
    checkins[planner.id] = { ...(checkins[planner.id] || {}), [today]: true };
    window.localStorage.setItem(checkinKey(), JSON.stringify(checkins));
    setCheckedIn(true);

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Draftpace streak saved", {
        body: `${planner.title} is checked in for today.`,
        icon: "/logo/dp-monogram-indigo.svg",
      });
    }
  };

  return (
    <div className="space-y-4">
      <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--primary)]">
              Interactive planner
            </p>
            <h1 className="mt-2 text-[28px] font-black leading-tight tracking-tight text-[var(--text)]">
              {planner.title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{planner.description}</p>
          </div>
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl text-lg font-black text-white"
            style={{ background: planner.accent }}
          >
            {progress}%
          </div>
        </div>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-[var(--surface-strong)]">
          <div className="h-full rounded-full bg-[var(--primary)] transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-[var(--muted)]">
          <span>{completedBlocks} of {totalBlocks} fields touched</span>
          <span className="flex items-center gap-1">
            <Save size={13} />
            {savedAt ? `Saved locally ${savedAt}` : "Ready"}
          </span>
        </div>
      </section>

      {planner.sections.map((section) => (
        <section key={section.id} className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5">
          {section.eyebrow && (
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--faint)]">{section.eyebrow}</p>
          )}
          <h2 className="mt-1 text-xl font-black tracking-tight text-[var(--text)]">{section.title}</h2>
          {section.description && <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{section.description}</p>}
          <div className="mt-5 space-y-4">
            {section.blocks.map((block) => (
              <PlannerField key={block.id} block={block} value={entry[block.id]} onChange={(value) => update(block.id, value)} />
            ))}
          </div>
        </section>
      ))}

      <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="flex items-center gap-3">
          <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${checkedIn ? "bg-emerald-50 text-emerald-700" : "bg-[var(--primary-soft)] text-[var(--primary)]"}`}>
            {checkedIn ? <CheckCircle2 size={20} /> : <Circle size={20} />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-[var(--text)]">{checkedIn ? "Today is checked in" : "Save today's streak"}</p>
            <p className="text-xs leading-5 text-[var(--muted)]">
              Check-ins power streaks, reminders, and weekly summaries.
            </p>
          </div>
          <button
            type="button"
            disabled={checkedIn}
            onClick={completeCheckin}
            className="rounded-2xl bg-[var(--primary)] px-4 py-3 text-xs font-black text-[var(--primary-contrast)] disabled:opacity-50"
          >
            {checkedIn ? "Done" : "Check in"}
          </button>
        </div>
      </section>
    </div>
  );
}

function PlannerField({
  block,
  value,
  onChange,
}: {
  block: PlannerBlock;
  value: PlannerValue | undefined;
  onChange: (value: PlannerValue) => void;
}) {
  const baseInput =
    "mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)]";

  if (block.type === "checkbox") {
    return (
      <button
        type="button"
        onClick={() => onChange(!value)}
        className="flex w-full items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 text-left"
      >
        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${value ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-contrast)]" : "border-[var(--border)]"}`}>
          {value ? <Check size={14} /> : null}
        </span>
        <span className="text-sm font-bold text-[var(--text)]">{block.label}</span>
      </button>
    );
  }

  if (block.type === "textarea") {
    return (
      <label className="block">
        <FieldLabel block={block} />
        <textarea
          value={String(value || "")}
          onChange={(event) => onChange(event.target.value)}
          placeholder={block.placeholder}
          rows={4}
          className={baseInput}
        />
      </label>
    );
  }

  if (block.type === "number") {
    return (
      <label className="block">
        <FieldLabel block={block} />
        <div className="relative">
          {block.unit && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--muted)]">{block.unit}</span>}
          <input
            type="number"
            value={typeof value === "number" ? value : ""}
            onChange={(event) => onChange(Number(event.target.value))}
            placeholder={block.placeholder}
            className={`${baseInput} ${block.unit ? "pl-8" : ""}`}
          />
        </div>
      </label>
    );
  }

  if (block.type === "rating") {
    const max = block.max || 5;
    const current = typeof value === "number" ? value : 0;
    return (
      <div>
        <FieldLabel block={block} />
        <div className="mt-2 grid grid-cols-5 gap-2">
          {Array.from({ length: max }, (_, index) => index + 1).map((score) => (
            <button
              key={score}
              type="button"
              onClick={() => onChange(score)}
              className={`h-11 rounded-2xl border text-sm font-black ${
                current >= score
                  ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-contrast)]"
                  : "border-[var(--border)] bg-[var(--surface-muted)] text-[var(--muted)]"
              }`}
            >
              {score}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (block.type === "select") {
    return (
      <div>
        <FieldLabel block={block} />
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1 dp-scrollbar-hide">
          {(block.options || []).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold ${
                value === option
                  ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-contrast)]"
                  : "border-[var(--border)] bg-[var(--surface-muted)] text-[var(--muted)]"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <label className="block">
      <FieldLabel block={block} />
      <input
        type="text"
        value={String(value || "")}
        onChange={(event) => onChange(event.target.value)}
        placeholder={block.placeholder}
        className={baseInput}
      />
    </label>
  );
}

function FieldLabel({ block }: { block: PlannerBlock }) {
  return (
    <>
      <span className="text-sm font-bold text-[var(--text)]">{block.label}</span>
      {block.helper && <span className="mt-1 block text-xs text-[var(--muted)]">{block.helper}</span>}
    </>
  );
}

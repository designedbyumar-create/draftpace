"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell, { AppCard } from "@/components/app/AppShell";
import { planners } from "@/lib/planners";
import { getActiveSystems } from "@/lib/systems";

type Checkins = Record<string, Record<string, boolean>>;

function readCheckins(): Checkins {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem("draftpace-checkins") || "{}");
  } catch {
    return {};
  }
}

export default function ProgressPage() {
  const [checkins, setCheckins] = useState<Checkins>({});

  useEffect(() => {
    setCheckins(readCheckins());
  }, []);

  const activeSystemIds = useMemo(() => new Set(getActiveSystems().map((system) => system.id)), []);

  const days = useMemo(() => {
    return Array.from({ length: 28 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (27 - index));
      const key = date.toISOString().slice(0, 10);
      const active = Object.entries(checkins).some(([systemId, plannerDays]) => activeSystemIds.has(systemId) && plannerDays[key]);
      return { key, active, label: date.getDate() };
    });
  }, [activeSystemIds, checkins]);

  const total = days.filter((day) => day.active).length;
  const activeSystems = Object.keys(checkins).filter((systemId) => activeSystemIds.has(systemId)).length;

  return (
    <AppShell title="Progress" subtitle="Your streaks and System rhythm.">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <AppCard className="p-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--faint)]">Last 28 days</p>
            <p className="mt-3 text-4xl font-black text-[var(--text)]">{total}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">days with a check-in</p>
          </AppCard>
          <AppCard className="p-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--faint)]">Active</p>
            <p className="mt-3 text-4xl font-black text-[var(--text)]">{activeSystems}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">Systems touched</p>
          </AppCard>
        </div>

        <AppCard className="p-5">
          <h2 className="text-lg font-black text-[var(--text)]">Consistency map</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">A calm view of whether you showed up, not a punishment chart.</p>
          <div className="mt-5 grid grid-cols-7 gap-2">
            {days.map((day) => (
              <div
                key={day.key}
                className={`flex aspect-square items-center justify-center rounded-2xl text-[11px] font-black ${
                  day.active
                    ? "bg-[var(--primary)] text-[var(--primary-contrast)]"
                    : "bg-[var(--surface-muted)] text-[var(--faint)]"
                }`}
                title={day.key}
              >
                {day.label}
              </div>
            ))}
          </div>
        </AppCard>

        <AppCard className="p-5">
          <h2 className="text-lg font-black text-[var(--text)]">System progress</h2>
          <div className="mt-4 space-y-3">
            {planners.map((planner) => {
              const count = planner.status === "coming_soon" ? 0 : Object.values(checkins[planner.id] || {}).filter(Boolean).length;
              return (
                <div key={planner.id}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-bold text-[var(--text)]">{planner.title}</span>
                    <span className="text-xs font-bold text-[var(--muted)]">
                      {planner.status === "coming_soon" ? "Coming soon" : `${count} check-ins`}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-strong)]">
                    <div className="h-full rounded-full" style={{ width: `${Math.min(100, count * 12)}%`, background: planner.accent }} />
                  </div>
                </div>
              );
            })}
          </div>
        </AppCard>
      </div>
    </AppShell>
  );
}

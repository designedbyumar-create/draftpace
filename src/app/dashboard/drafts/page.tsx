"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, Lock } from "@/components/ui/Icon";
import AppShell, { AppBadge, AppCard } from "@/components/app/AppShell";
import { categoryLabels, formatPlannerPrice, planners } from "@/lib/planners";

type EntryMap = Record<string, Record<string, string | number | boolean>>;

function readEntries(): EntryMap {
  if (typeof window === "undefined") return {};
  const entries: EntryMap = {};
  planners.forEach((planner) => {
    try {
      const raw =
        window.localStorage.getItem(`draftpace-system-runtime:${planner.id}`) ||
        window.localStorage.getItem(`draftpace-system-state:${planner.id}`);
      if (raw) entries[planner.id] = JSON.parse(raw);
    } catch {
      entries[planner.id] = {};
    }
  });
  return entries;
}

export default function DraftsPage() {
  const [entries, setEntries] = useState<EntryMap>({});

  useEffect(() => {
    setEntries(readEntries());
  }, []);

  return (
    <AppShell title="Systems" subtitle="Preview upcoming Systems and open active app experiences.">
      <div className="space-y-5">
        <AppCard className="p-5">
          <h2 className="text-xl font-black tracking-tight text-[var(--text)]">System Library</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Coming-soon Systems are visible as premium previews. Active Systems will save progress locally until the database model is approved.
          </p>
        </AppCard>

        <div className="grid gap-3">
          {planners.map((planner) => {
            const comingSoon = planner.status === "coming_soon";
            const touched = comingSoon ? 0 : Object.keys(entries[planner.id] || {}).length;
            const locked = planner.access !== "free" && !planner.prototypeUnlocked;
            const href = comingSoon ? `/dashboard/planner/${planner.id}` : locked ? "/pricing" : `/dashboard/planner/${planner.id}`;
            return (
              <Link
                key={planner.id}
                href={href}
                className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-4 transition hover:border-[var(--primary)]"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white" style={{ background: planner.accent }}>
                    {locked && !comingSoon ? <Lock size={19} /> : touched > 0 ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-black text-[var(--text)]">{planner.title}</p>
                      {comingSoon && <AppBadge tone="primary">Coming Soon</AppBadge>}
                      <AppBadge tone={planner.access === "free" ? "green" : "muted"}>{formatPlannerPrice(planner)}</AppBadge>
                    </div>
                    <p className="mt-1 text-xs font-semibold text-[var(--faint)]">
                      {categoryLabels[planner.category]} · {planner.duration} · {planner.estimatedMinutes} min
                    </p>
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-[var(--muted)]">
                      {planner.dashboardCard.summary || planner.description}
                    </p>
                  </div>
                  <ArrowRight size={17} className="mt-3 shrink-0 text-[var(--faint)]" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}

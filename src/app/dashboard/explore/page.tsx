"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "@/components/ui/Icon";
import AppShell, { AppBadge } from "@/components/app/AppShell";
import { PlannerCategory, categoryLabels, formatPlannerPrice, planners } from "@/lib/planners";
import { systemCategories } from "@/lib/systems";

const filters: ("all" | PlannerCategory)[] = ["all", ...systemCategories.map((category) => category.id)];

export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | PlannerCategory>("all");

  const filtered = useMemo(() => {
    return planners.filter((planner) => {
      const matchesCategory = category === "all" || planner.category === category;
      const q = query.toLowerCase();
      const matchesQuery =
        !q ||
        planner.title.toLowerCase().includes(q) ||
        planner.description.toLowerCase().includes(q) ||
        planner.subtitle.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  return (
    <AppShell title="Explore" subtitle="Browse interactive Draftpace Systems built for the app.">
      <div className="space-y-5">
        <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-3">
          <div className="flex items-center gap-3 rounded-2xl bg-[var(--surface-muted)] px-4 py-3">
            <Search size={17} className="text-[var(--faint)]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search Systems..."
              aria-label="Search Systems"
              className="min-w-0 flex-1 bg-transparent text-sm text-[var(--text)] outline-none placeholder:text-[var(--faint)]"
            />
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 dp-scrollbar-hide">
            {filters.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold ${
                  category === item
                    ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-contrast)]"
                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]"
                }`}
              >
                {item === "all" ? "All" : categoryLabels[item]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((planner) => {
            const comingSoon = planner.status === "coming_soon";
            const unlocked = planner.access === "free" || planner.prototypeUnlocked || comingSoon;
            const href = unlocked ? `/dashboard/planner/${planner.id}` : "/pricing";
            return (
              <Link
                key={planner.id}
                href={href}
                className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 transition hover:-translate-y-0.5 hover:border-[var(--primary)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="h-2 w-16 rounded-full" style={{ background: planner.accent }} />
                  <AppBadge tone={planner.access === "free" ? "green" : planner.access === "membership" ? "primary" : "orange"}>
                    {comingSoon ? "Coming Soon" : formatPlannerPrice(planner)}
                  </AppBadge>
                </div>
                <p className="mt-5 text-base font-black tracking-tight text-[var(--text)]">{planner.title}</p>
                <p className="mt-1 text-xs font-bold text-[var(--faint)]">{categoryLabels[planner.category]} · {planner.duration}</p>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--muted)]">{planner.description}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[var(--primary)]">
                  {comingSoon ? "Preview System" : unlocked ? "Open System" : "Unlock access"}
                  <ArrowRight size={15} />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}

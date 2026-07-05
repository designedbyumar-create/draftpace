"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Compass, LockKeyhole, Search, Sparkles } from "@/components/ui/Icon";
import { formatSystemPrice, getStoreSystems, getSystemCategory, SystemBlueprint, SystemCategory, systemCategories } from "@/lib/systems";
import { SystemBook } from "@/components/system/SystemVisuals";

const filters: ("all" | SystemCategory)[] = ["all", ...systemCategories.map((category) => category.id)];

export default function StorePage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | SystemCategory>("all");

  const systems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return getStoreSystems(category).filter((system) => {
      if (!q) return true;
      return (
        system.name.toLowerCase().includes(q) ||
        system.promise.toLowerCase().includes(q) ||
        system.description.toLowerCase().includes(q) ||
        system.paths.some((path) => path.name.toLowerCase().includes(q))
      );
    });
  }, [category, query]);

  const featured = systems.filter((system) => system.storeCard.featured);

  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 py-10 text-[#171411] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-[32px] border border-[#e9e2d7] bg-white p-5 shadow-[0_24px_80px_rgba(23,20,17,0.07)] sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#ddd3c3] bg-[#f5f1ea] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-[#6b6258]">
                <Sparkles size={14} />
                Draftpace Systems
              </div>
              <h1 className="mt-6 max-w-3xl text-[42px] font-black leading-[0.95] tracking-tight sm:text-[64px]">
                Interactive systems for turning plans into daily momentum.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[#655c52] sm:text-lg">
                Browse the System Packs being prepared for the app. Each pack is designed as a guided operating system, not a static PDF.
              </p>
            </div>

            <div className="rounded-[28px] border border-[#e9e2d7] bg-[#f8f4ed] p-4">
              {featured[0] ? (
                <SystemBook
                  visualKind={featured[0].visualTheme.visualKind}
                  accent={featured[0].visualTheme.accent}
                  secondary={featured[0].visualTheme.secondary}
                  title={featured[0].shortName}
                />
              ) : (
                <div className="flex min-h-[230px] items-center justify-center rounded-[28px] bg-white text-sm font-bold text-[#6b6258]">
                  Systems loading
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-[#e9e2d7] bg-white p-3 shadow-[0_16px_50px_rgba(23,20,17,0.05)]">
          <div className="flex items-center gap-3 rounded-2xl bg-[#f8f4ed] px-4 py-3">
            <Search size={17} className="text-[#8c8276]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search Systems..."
              aria-label="Search Systems"
              className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[#171411] outline-none placeholder:text-[#9a9288]"
            />
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {filters.map((item) => {
              const active = category === item;
              const label = item === "all" ? "All" : getSystemCategory(item)?.label || item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`shrink-0 rounded-full border px-4 py-2 text-xs font-black transition ${
                    active
                      ? "border-[#3730a3] bg-[#3730a3] text-white"
                      : "border-[#e4dbce] bg-white text-[#6b6258] hover:border-[#3730a3]/30"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-2">
          {systems.map((system) => (
            <SystemStoreCard key={system.id} system={system} />
          ))}
        </section>

        {systems.length === 0 && (
          <section className="mt-8 rounded-[28px] border border-[#e9e2d7] bg-white p-8 text-center">
            <p className="text-sm font-bold text-[#655c52]">No Systems match this search yet.</p>
          </section>
        )}
      </div>
    </main>
  );
}

function SystemStoreCard({ system }: { system: SystemBlueprint }) {
  const category = getSystemCategory(system.category);
  const comingSoon = system.status === "coming_soon";
  const highlights = system.storeCard.highlights?.length
    ? system.storeCard.highlights
    : system.paths.slice(0, 3).map((path) => path.name);

  return (
    <article className="overflow-hidden rounded-[30px] border border-[#e9e2d7] bg-white shadow-[0_18px_60px_rgba(23,20,17,0.06)]">
      <div className="grid gap-0 sm:grid-cols-[1fr_220px]">
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f1eee8] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-[#6b6258]">
              <Compass size={13} />
              {category?.label || system.category}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eeeefd] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-[#3730a3]">
              <Clock size={13} />
              {comingSoon ? "Coming Soon" : "Active"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f6f3ee] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-[#6b6258]">
              <LockKeyhole size={13} />
              {formatSystemPrice(system)}
            </span>
          </div>

          <h2 className="mt-5 text-[28px] font-black leading-tight tracking-tight text-[#171411]">{system.name}</h2>
          <p className="mt-3 text-sm leading-6 text-[#655c52]">{system.storeCard.summary || system.promise}</p>

          <div className="mt-5 grid gap-2">
            {highlights.map((highlight) => (
              <div key={highlight} className="flex items-center gap-2 rounded-2xl bg-[#f8f4ed] px-3 py-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: system.visualTheme.accent }}
                />
                <span className="text-xs font-bold leading-5 text-[#655c52]">{highlight}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              disabled={comingSoon}
              className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-black ${
                comingSoon
                  ? "cursor-not-allowed bg-[#eeebe5] text-[#8c8276]"
                  : "bg-[#3730a3] text-white shadow-[0_16px_38px_rgba(55,48,163,0.24)]"
              }`}
            >
              {comingSoon ? system.storeCard.ctaLabel || "Notify Me" : "Open System"}
              <ArrowRight size={15} />
            </button>
            <Link
              href={`/dashboard/planner/${system.slug}`}
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#e4dbce] px-5 py-3 text-sm font-black text-[#3730a3]"
            >
              Preview details
            </Link>
          </div>
        </div>

        <div className="border-t border-[#e9e2d7] bg-[#f8f4ed] p-4 sm:border-l sm:border-t-0">
          <SystemBook
            visualKind={system.visualTheme.visualKind}
            accent={system.visualTheme.accent}
            secondary={system.visualTheme.secondary}
            title={system.shortName}
          />
        </div>
      </div>
    </article>
  );
}

"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Flower, Leaf, Snowflake, Sun, type DraftpaceIcon } from "@/design-system/Icon";
import { staggerContainer, staggerItem } from "@/design-system/motion";
import type { SeasonId, SeasonJob, SeasonSummary } from "../seasons";

/**
 * Seasons: the home as a year, not a to-do list. People plan home upkeep
 * by season, months ahead, so this starts from the season the date is in
 * and lets you look ahead to the next. Presentational only: recording a
 * job happens in the module, through the same sheet Home uses.
 */

const SHEET =
  "overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_1px_2px_rgba(28,25,20,0.04),0_14px_28px_-22px_rgba(28,25,20,0.2)]";

/**
 * Each season's own tone and glyph. Mixed into the surface rather than set
 * as a flat colour, so the same header reads in light and in dark, and the
 * product's own green keeps every control. Named for what people search
 * for ("fall home maintenance checklist"), not for what the app calls it.
 */
const SEASON_LOOK: Record<SeasonId, { tone: string; Icon: DraftpaceIcon }> = {
  spring: { tone: "#6f9a5b", Icon: Flower },
  summer: { tone: "#c99a2e", Icon: Sun },
  autumn: { tone: "#b8692f", Icon: Leaf },
  winter: { tone: "#5f86a8", Icon: Snowflake },
};

export function SeasonsHeader({ selected, isCurrent }: { selected: SeasonSummary; isCurrent: boolean }) {
  const { tone, Icon } = SEASON_LOOK[selected.id];
  return (
    <div
      className="rounded-[28px] border p-5 sm:p-6"
      style={{
        background: `color-mix(in srgb, ${tone} 14%, var(--surface))`,
        borderColor: `color-mix(in srgb, ${tone} 30%, transparent)`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
          {isCurrent ? "This season" : "Looking ahead"}
        </p>
        <span
          aria-hidden
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
          style={{ background: `color-mix(in srgb, ${tone} 24%, transparent)`, color: `color-mix(in srgb, ${tone} 82%, var(--text))` }}
        >
          <Icon size={22} />
        </span>
      </div>
      <h1
        className="mt-3 text-[34px] font-medium leading-[1.06] tracking-[-0.02em] text-[var(--text)] [text-wrap:balance]"
        style={{ fontFamily: "var(--product-narrative-font)" }}
      >
        {selected.label} home maintenance checklist
      </h1>
      <p className="mt-3 text-[14px] leading-snug text-[var(--muted)]">
        The jobs that are best done from {selected.span}.
      </p>
    </div>
  );
}

export default function SeasonsView({
  seasons,
  currentId,
  selectedId,
  onSelect,
  onRecord,
}: {
  seasons: SeasonSummary[];
  currentId: SeasonId;
  selectedId: SeasonId;
  onSelect: (id: SeasonId) => void;
  onRecord: (job: SeasonJob) => void;
}) {
  const reduceMotion = useReducedMotion();
  const selected = seasons.find((season) => season.id === selectedId) ?? seasons[0];
  const months = [...new Map(selected.jobs.map((job) => [job.monthKey, job.monthLabel])).entries()];

  return (
    <div className="flex flex-col gap-7 pb-8">
      <SeasonsHeader selected={selected} isCurrent={selected.id === currentId} />

      <div role="tablist" aria-label="Season" className="-mx-1 flex gap-1 overflow-x-auto px-1">
        {seasons.map((season) => {
          const on = season.id === selectedId;
          return (
            <button
              key={season.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => onSelect(season.id)}
              className={`flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] ${
                on
                  ? "bg-[var(--primary)] text-[var(--primary-contrast)]"
                  : "text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
              }`}
            >
              {season.label}
              {season.id === currentId && (
                <span
                  role="img"
                  aria-label="now"
                  className={`h-1.5 w-1.5 rounded-full ${on ? "bg-[var(--primary-contrast)]" : "bg-[var(--primary)]"}`}
                />
              )}
            </button>
          );
        })}
      </div>

      {selected.jobs.length === 0 ? (
        <p className="text-[14px] leading-relaxed text-[var(--muted)]">
          Nothing in your home is tied to this season yet. As you add things and record what you do, the jobs that
          belong to it will appear here.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {months.map(([monthKey, monthLabel]) => (
            <section key={monthKey} aria-label={monthLabel}>
              <div className="flex items-baseline gap-3">
                <h2
                  className="text-[22px] font-medium leading-none tracking-[-0.01em] text-[var(--text)]"
                  style={{ fontFamily: "var(--product-narrative-font)" }}
                >
                  {monthLabel}
                </h2>
                <span aria-hidden className="h-px flex-1 bg-[var(--border)]" />
              </div>
              <motion.ul
                className={`mt-3 ${SHEET}`}
                initial="hidden"
                animate="visible"
                variants={staggerContainer(Boolean(reduceMotion))}
              >
                {selected.jobs
                  .filter((job) => job.monthKey === monthKey)
                  .map((job) => (
                    <motion.li
                      key={job.taskId}
                      variants={staggerItem(Boolean(reduceMotion))}
                      className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-x-2.5 border-b border-[var(--border)] py-2.5 pl-2.5 pr-4 last:border-b-0"
                    >
                      <button
                        type="button"
                        onClick={() => onRecord(job)}
                        aria-label={`Record ${job.title}`}
                        className="group/tick flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
                      >
                        <span className="h-[30px] w-[30px] rounded-full border-2 border-[color-mix(in_srgb,var(--primary)_65%,transparent)] transition-colors group-hover/tick:bg-[var(--primary-soft)]" />
                      </button>
                      <div className="min-w-0">
                        <p className="text-[15px] font-semibold leading-snug text-[var(--text)]">{job.title}</p>
                        <p className="mt-0.5 text-[13px] leading-snug text-[var(--muted)]">{job.about}</p>
                      </div>
                      {job.dueNow && (
                        <span className="text-[11.5px] font-semibold text-[var(--warning)]">Due now</span>
                      )}
                    </motion.li>
                  ))}
              </motion.ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

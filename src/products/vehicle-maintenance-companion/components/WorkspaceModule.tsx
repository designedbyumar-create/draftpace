"use client";

import FirstRunTour from "@/components/platform/FirstRunTour";
import { VEHICLE_MAINTENANCE_COMPANION_SLUG } from "../instanceData";
import type { TourStep } from "@/components/platform/GuidedTour";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Button from "@/design-system/Button";
import EmptyState from "@/design-system/EmptyState";
import { Car, CheckCircle2, Clock, WarningCircle } from "@/design-system/Icon";
import { describeResultError } from "@/product-framework/result";
import { entranceVariant, staggerContainer, staggerItem } from "@/design-system/motion";
import { updateMaintenanceItem } from "../domain/maintenanceItems";
import { effectiveIntervalMiles, effectiveIntervalMonths, deriveDueView, type DueVehicleItem } from "../dueStatus";
import { useVehicleMaintenance } from "./useVehicleMaintenance";

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** What a due item's remaining figure reads as, whichever dimension is more urgent. */
function remainingLine(entry: DueVehicleItem): string {
  const parts: string[] = [];
  if (entry.milesRemaining !== null) {
    parts.push(
      entry.milesRemaining < 0
        ? `${Math.abs(entry.milesRemaining).toLocaleString()} miles past due`
        : `${entry.milesRemaining.toLocaleString()} miles left`
    );
  }
  if (entry.daysRemaining !== null) {
    parts.push(entry.daysRemaining < 0 ? `${Math.abs(entry.daysRemaining)} days past due` : `${entry.daysRemaining} days left`);
  }
  return parts.join(", ");
}

function intervalLine(entry: DueVehicleItem): string {
  const effMiles = effectiveIntervalMiles(entry.item);
  const effMonths = effectiveIntervalMonths(entry.item);
  const parts = [
    effMiles ? `every ${effMiles.toLocaleString()} miles` : null,
    effMonths ? `every ${effMonths} months` : null,
  ].filter(Boolean);
  return parts.join(", ");
}

/**
 * The single most-urgent item, given the dominant-action treatment: the
 * one thing this screen wants a person to look at first. There is no
 * separate shared hero component to build onto here (Phase 2's plan text
 * refers to one that was never actually built for Personal Finance
 * Companion); this follows the same per-product "one dominant thing"
 * card idiom already proven in Personal Life Affairs' and Alongside's
 * own workspace screens instead.
 */
function DueHero({ entry, pending, onMarkDone }: { entry: DueVehicleItem; pending: boolean; onMarkDone: () => void }) {
  const reduceMotion = useReducedMotion();
  const overdue = entry.urgency >= 1;

  return (
    <motion.section
      key={entry.item.id}
      aria-label="Most urgent"
      initial="hidden"
      animate="visible"
      variants={entranceVariant(Boolean(reduceMotion))}
      className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5"
      style={{ borderLeftWidth: 3, borderLeftColor: overdue ? "var(--danger)" : "var(--primary)" }}
    >
      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: overdue ? "var(--danger)" : "var(--primary)" }}>
        {overdue ? <WarningCircle size={13} aria-hidden /> : <Clock size={13} aria-hidden />}
        <span>{overdue ? "Due" : "Due soon"}</span>
      </div>
      <h1 className="mt-2 text-[24px] leading-tight text-[var(--text)]" style={{ fontFamily: "var(--product-narrative-font, inherit)" }}>
        {entry.item.taskName}
      </h1>
      <p className="mt-1 text-[13px] text-[var(--muted)]">{entry.vehicle.label}</p>
      <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--muted)]">
        {remainingLine(entry)}
        {intervalLine(entry) ? ` (${intervalLine(entry)})` : ""}
      </p>
      <div className="mt-4">
        <Button variant="commit" size="sm" disabled={pending} onClick={onMarkDone}>
          {pending ? "Saving..." : "Mark done today"}
        </Button>
      </div>
    </motion.section>
  );
}

function DueRow({ entry, pending, onMarkDone }: { entry: DueVehicleItem; pending: boolean; onMarkDone: () => void }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.li variants={staggerItem(Boolean(reduceMotion))} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h4 className="text-[13.5px] font-semibold text-[var(--text)]">{entry.item.taskName}</h4>
        <span className="text-[12px] text-[var(--faint)]">{entry.vehicle.label}</span>
      </div>
      <p className="mt-0.5 text-[12px] text-[var(--muted)]">{remainingLine(entry)}</p>
      <div className="mt-2">
        <Button size="sm" variant="ghost" disabled={pending} onClick={onMarkDone}>
          {pending ? "Saving..." : "Mark done today"}
        </Button>
      </div>
    </motion.li>
  );
}

function NoBaselineRow({ entry }: { entry: DueVehicleItem }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.li variants={staggerItem(Boolean(reduceMotion))} className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3.5 py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h4 className="text-[13.5px] font-semibold text-[var(--text)]">{entry.item.taskName}</h4>
        <span className="text-[12px] text-[var(--faint)]">{entry.vehicle.label}</span>
      </div>
      <p className="mt-0.5 text-[12px] text-[var(--muted)]">
        {entry.vehicle.historyKnown ? "Nothing recorded yet for this job." : "This vehicle's history is unknown."} Nothing to judge yet.
      </p>
    </motion.li>
  );
}

const TOUR_STEPS: TourStep[] = [
  {
    targetId: "empty-state",
    title: "Nothing is due yet",
    body:
      "Due computes from intervals and facts you record. With no vehicle added there is nothing to judge, so it says nothing rather than guessing at a schedule.",
  },
  {
    targetId: "rail-vehicles",
    title: "Add a vehicle first",
    body:
      "Say what you call it and whether you actually know its service history. If you do not, nothing will ever read as overdue on a fact you never had.",
  },
  {
    targetId: "rail-workspace",
    title: "What is due, ranked",
    body:
      "One view across every vehicle you own, most urgent first, computed only from what you entered.",
  },
];

/**
 * The single ranked "what's due" view: everything Vehicle Maintenance
 * Companion's Due destination shows, read directly from
 * deriveDueView(), never computed or restated here.
 */
export default function WorkspaceModule() {
  const { status, errorMessage, vehicles, items, replaceItem } = useVehicleMaintenance();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  if (status === "loading") return <p className="text-[13px] text-[var(--faint)]">Loading...</p>;
  if (status === "no-instance") {
    return (
      <EmptyState icon={Car} title="Nothing to show yet" description="This product has not been set up on your account." />
    );
  }
  if (status === "error") {
    return (
      <EmptyState icon={Car} title="Couldn't load this" description={errorMessage ?? "Try again."} />
    );
  }
  if (vehicles.length === 0) {
    return (
      <>
        <FirstRunTour slug={VEHICLE_MAINTENANCE_COMPANION_SLUG} steps={TOUR_STEPS} />
        <EmptyState
          icon={Car}
          title="No vehicles yet"
          description="Add a vehicle in Vehicles to start tracking what it needs, then this screen will show what's due."
        />
      </>
    );
  }

  async function markDone(entry: DueVehicleItem) {
    setPendingId(entry.item.id);
    setActionError(null);
    const result = await updateMaintenanceItem(entry.item.id, {
      lastDoneAt: dateKey(new Date()),
      lastDoneMileage: entry.vehicle.currentMileage,
    });
    setPendingId(null);
    if (!result.ok) {
      setActionError(describeResultError(result.error));
      return;
    }
    replaceItem(result.data);
  }

  const now = new Date();
  const view = deriveDueView(vehicles, items, now);
  // The dominant action is the single most urgent item overall: the most
  // overdue "due" entry, or (only when nothing is actually overdue) the
  // most urgent "due soon" entry, never both at once.
  const [firstDue, ...restDue] = view.due;
  const shownHero = firstDue ?? view.dueSoon[0];
  const remainingDueSoon = firstDue ? view.dueSoon : view.dueSoon.slice(1);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <FirstRunTour slug={VEHICLE_MAINTENANCE_COMPANION_SLUG} steps={TOUR_STEPS} />
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Due</p>
        <h1 className="mt-2 text-[26px] leading-tight text-[var(--text)]" style={{ fontFamily: "var(--product-narrative-font, inherit)" }}>
          What's due, across everything you own.
        </h1>
      </header>

      {actionError && (
        <p className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-[13px] text-[var(--danger)]">{actionError}</p>
      )}

      {shownHero ? (
        <DueHero entry={shownHero} pending={pendingId === shownHero.item.id} onMarkDone={() => markDone(shownHero)} />
      ) : (
        <section aria-label="Nothing due" className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-center gap-2 text-[13px]" style={{ color: "var(--primary)" }}>
            <CheckCircle2 size={17} aria-hidden />
            <span>Nothing is due right now.</span>
          </div>
          <p className="mt-2 max-w-lg text-[13.5px] leading-relaxed text-[var(--muted)]">
            Everything you're tracking is within its interval. This will update as intervals elapse or as you record
            work done.
          </p>
        </section>
      )}

      {(restDue.length > 0 || remainingDueSoon.length > 0) && (
        <section aria-label="Also worth knowing about">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Also due</p>
          <motion.ul
            initial="hidden"
            animate="visible"
            variants={staggerContainer(Boolean(reduceMotion))}
            className="mt-2 flex flex-col gap-2"
          >
            {restDue.map((entry) => (
              <DueRow key={entry.item.id} entry={entry} pending={pendingId === entry.item.id} onMarkDone={() => markDone(entry)} />
            ))}
            {remainingDueSoon.map((entry) => (
              <DueRow key={entry.item.id} entry={entry} pending={pendingId === entry.item.id} onMarkDone={() => markDone(entry)} />
            ))}
          </motion.ul>
        </section>
      )}

      {view.noBaseline.length > 0 && (
        <section aria-label="Nothing to judge yet">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Nothing to judge yet</p>
          <motion.ul
            initial="hidden"
            animate="visible"
            variants={staggerContainer(Boolean(reduceMotion))}
            className="mt-2 flex flex-col gap-2"
          >
            {view.noBaseline.map((entry) => (
              <NoBaselineRow key={entry.item.id} entry={entry} />
            ))}
          </motion.ul>
        </section>
      )}
    </div>
  );
}

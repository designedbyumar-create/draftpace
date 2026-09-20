import Link from "next/link";
import type { ReactNode } from "react";
import Button from "@/design-system/Button";
import type { DueView, DueVehicleItem } from "../dueStatus";
import { describeInterval, describeRemaining } from "../dueText";
import { describeVehicle, type LampState, type VehicleLamp } from "../fleet";
import { odometerDigits, shortDay } from "../odometer";
import { describeRenewalTiming, renewalTitle, type RenewalEntry } from "../renewals";
import { todayIso, type MileageFreshness } from "../mileageFreshness";
import type { Vehicle } from "../state";
import { ChipRow, Label, MONO, PANEL, Plate, ROW_RULE, ScreenHeading } from "./Workshop";

/**
 * The Due screen, presentational: everything it shows is handed to it, and
 * the forms it can open are handed in as renderers, so it draws the same
 * in the app and in tests.
 */

const BASE = "/app/products/vehicle-maintenance-companion";

export interface MileageNotice {
  vehicle: Vehicle;
  /** "none" is a vehicle with a distance-based job and no mileage; "stale" is a reading old enough to question. */
  kind: "none" | "stale";
  freshness: MileageFreshness;
}

export interface DueScreenProps {
  view: DueView;
  /** Active vehicles, so a quiet day can still show one. */
  vehicles: Vehicle[];
  /** One lamp per vehicle, for the strip that appears when there is more than one. */
  lamps: VehicleLamp[];
  /** The vehicle Due is narrowed to, or null for all of them. */
  filterId: string | null;
  onFilter: (vehicleId: string | null) => void;
  /** Renewals on their way or already past, the ones worth seeing on Due. */
  renewals: RenewalEntry[];
  mileageNotices: MileageNotice[];
  /** The id of the job whose form is open, if any. */
  openItemId: string | null;
  onOpen: (itemId: string | null) => void;
  renderForm: (entry: DueVehicleItem) => ReactNode;
  /** The vehicle whose mileage form is open, if any. */
  openMileageId: string | null;
  onOpenMileage: (vehicleId: string | null) => void;
  renderMileageForm: (vehicle: Vehicle) => ReactNode;
  actionError: string | null;
}

function describeMileageNotice(notice: MileageNotice): string {
  if (notice.kind === "none") return `${notice.vehicle.label} has jobs tracked by distance but no mileage yet, so they cannot be judged.`;
  const f = notice.freshness;
  if (f.state === "stale" && f.days !== null) return `${notice.vehicle.label}'s mileage was last updated ${f.days} days ago. Distances below are worked out from it.`;
  return `${notice.vehicle.label}'s mileage has no date on it. Distances below are worked out from it.`;
}

/** A lit lamp for a job that is due, a ring for one that is close, nothing lit otherwise. */
function Lamp({ state, size = 10, className = "" }: { state: LampState | "none"; size?: number; className?: string }) {
  const style = { width: size, height: size };
  if (state === "due") return <span aria-hidden className={`shrink-0 rounded-full ${className}`} style={{ ...style, background: "var(--primary)" }} />;
  if (state === "soon") return <span aria-hidden className={`shrink-0 rounded-full border-2 ${className}`} style={{ ...style, borderColor: "var(--primary)" }} />;
  return <span aria-hidden className={`shrink-0 rounded-full border border-[var(--border-strong)] ${className}`} style={style} />;
}

/** One chip per vehicle, its lamp beside it, and All. Tapping one narrows Due to that vehicle. */
function FleetStrip({ lamps, filterId, onFilter }: { lamps: VehicleLamp[]; filterId: string | null; onFilter: (id: string | null) => void }) {
  return (
    <ChipRow
      label="Vehicle"
      activeId={filterId}
      onPick={onFilter}
      items={[{ id: null, text: "ALL" }, ...lamps.map(({ vehicle, state }) => ({ id: vehicle.id, text: vehicle.plate ?? vehicle.label, lamp: <Lamp state={state} size={8} /> }))]}
    />
  );
}

function Odometer({ miles }: { miles: number }) {
  const { digits, lead } = odometerDigits(miles);
  return (
    <div className="flex items-end gap-[3px]" role="img" aria-label={`${miles.toLocaleString()} miles`}>
      {digits.map((digit, index) => (
        <span
          key={index}
          aria-hidden
          className={`${MONO} flex h-[42px] w-[28px] items-center justify-center rounded-[var(--radius-sm)] border border-white/10 bg-black/50 text-[24px] font-bold`}
          style={{ opacity: index < lead ? 0.25 : 1 }}
        >
          {digit}
        </span>
      ))}
      <span className={`${MONO} ml-2 pb-1 text-[11px] uppercase tracking-[0.12em] opacity-60`}>miles</span>
    </div>
  );
}

/** A gauge scale: fine ticks with a longer one every tenth, drawn as texture along the base of the cluster. */
function Scale() {
  return (
    <svg aria-hidden className="block h-[10px] w-full opacity-30" preserveAspectRatio="none" viewBox="0 0 200 10">
      {Array.from({ length: 61 }, (_, i) => (
        <line key={i} x1={i * (200 / 60)} x2={i * (200 / 60)} y1={i % 10 === 0 ? 0 : 5} y2={10} stroke="currentColor" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  );
}

/**
 * The instrument cluster: the vehicle as its own gauge panel, its plate and
 * odometer, and under them one lamp that is lit only when a job really is
 * due. On a quiet day the lamp is dark and the panel says so.
 */
function ClusterHero({ entry, vehicle, open, onOpen }: { entry: DueVehicleItem | undefined; vehicle: Vehicle; open: boolean; onOpen: () => void }) {
  const overdue = entry !== undefined && entry.urgency >= 1;
  const today = todayIso(new Date());
  return (
    <section
      aria-label={entry ? "Most urgent" : "Nothing due"}
      className="rounded-[var(--radius-lg)] p-5"
      style={{
        color: "var(--product-hero-ink)",
        background: "linear-gradient(180deg, var(--product-hero-from) 0%, var(--product-hero-mid) 38%, var(--product-hero-to) 100%)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08), 0 0 0 1px color-mix(in srgb, var(--product-hero-to) 90%, black)",
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <Plate tone="hero">{vehicle.plate ?? vehicle.label}</Plate>
        {describeVehicle(vehicle) !== (vehicle.plate ?? vehicle.label) && <span className="text-[12px] opacity-70">{describeVehicle(vehicle)}</span>}
      </div>
      {vehicle.currentMileage !== null ? (
        <>
          <div className="mt-5">
            <Odometer miles={vehicle.currentMileage} />
          </div>
          <p className={`${MONO} mt-2 text-[10.5px] uppercase tracking-[0.1em] opacity-55`}>{vehicle.mileageUpdatedAt ? `as of ${shortDay(vehicle.mileageUpdatedAt, today)}` : "no date on this reading"}</p>
        </>
      ) : (
        <p className="mt-5 text-[13px] opacity-75">No mileage yet</p>
      )}
      <div className="mt-4">
        <Scale />
      </div>
      <div className={`${MONO} mt-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em]`}>
        {entry ? (
          <span aria-hidden className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--primary)", boxShadow: "0 0 0 4px color-mix(in srgb, var(--primary) 32%, transparent)" }} />
        ) : (
          <span aria-hidden className="h-2.5 w-2.5 rounded-full border border-white/40" />
        )}
        {entry ? (overdue ? "Due" : "Due soon") : "All clear"}
      </div>
      {entry ? (
        <>
          <h2 className="mt-2 text-[26px] font-bold leading-[1.1] tracking-[-0.02em]">{entry.item.taskName}</h2>
          <p className={`${MONO} mt-2 text-[12.5px] leading-relaxed opacity-80`}>
            {describeRemaining(entry)}
            {describeInterval(entry.item) ? ` (${describeInterval(entry.item)})` : ""}
          </p>
          {!open && (
            <div className="mt-5">
              <Button variant="commit" onClick={onOpen}>
                I had this done
              </Button>
            </div>
          )}
        </>
      ) : (
        <>
          <h2 className="mt-2 text-[26px] font-bold leading-[1.1] tracking-[-0.02em]">Nothing is due right now.</h2>
          <p className="mt-2 text-[13.5px] leading-relaxed opacity-80">Everything you&apos;re tracking is within its interval. This will update as intervals elapse or as you record work done.</p>
        </>
      )}
    </section>
  );
}

function Row({ entry, lamp, open, onOpen, form, text, action }: { entry: DueVehicleItem; lamp: LampState | "none"; open: boolean; onOpen: () => void; form: ReactNode; text: string; action: string }) {
  return (
    <li className={`px-4 py-3.5 ${ROW_RULE}`}>
      <div className="flex items-start gap-3">
        <Lamp state={lamp} className="mt-[7px]" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <h3 className="text-[15px] font-semibold leading-tight tracking-[-0.01em] text-[var(--text)]">{entry.item.taskName}</h3>
            <Plate>{entry.vehicle.plate ?? entry.vehicle.label}</Plate>
          </div>
          <p className={`${MONO} mt-1 text-[12px] leading-relaxed text-[var(--muted)]`}>{text}</p>
          <div className="mt-2">{open ? form : <button type="button" onClick={onOpen} className="text-[13px] font-semibold text-[var(--primary)] hover:underline">{action}</button>}</div>
        </div>
      </div>
    </li>
  );
}

export default function DueScreen(props: DueScreenProps) {
  const { view, vehicles, lamps, filterId, onFilter, renewals, mileageNotices, openItemId, onOpen, renderForm, openMileageId, onOpenMileage, renderMileageForm, actionError } = props;
  const [firstDue, ...restDue] = view.due;
  const hero = firstDue ?? view.dueSoon[0];
  const heroVehicle = hero?.vehicle ?? vehicles.find((v) => v.id === filterId) ?? vehicles[0];
  const alsoDue = [...restDue, ...(firstDue ? view.dueSoon : view.dueSoon.slice(1))];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <ScreenHeading kicker="Across everything you own" title="Due" />

      {vehicles.length > 1 && <FleetStrip lamps={lamps} filterId={filterId} onFilter={onFilter} />}

      {actionError && <p className={`${PANEL} p-3 text-[13px] text-[var(--danger)]`}>{actionError}</p>}

      <ClusterHero entry={hero} vehicle={heroVehicle} open={hero !== undefined && openItemId === hero.item.id} onOpen={() => hero && onOpen(hero.item.id)} />
      {hero && openItemId === hero.item.id && <div>{renderForm(hero)}</div>}

      {mileageNotices.map((notice) => (
        <section key={notice.vehicle.id} aria-label="Mileage" className={`${PANEL} flex gap-3 py-3 pl-0 pr-4`}>
          <span aria-hidden className="w-[3px] shrink-0 self-stretch" style={{ backgroundColor: "var(--primary)" }} />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] leading-relaxed text-[var(--text)]">{describeMileageNotice(notice)}</p>
            <div className="mt-2">
              {openMileageId === notice.vehicle.id ? (
                renderMileageForm(notice.vehicle)
              ) : (
                <button type="button" onClick={() => onOpenMileage(notice.vehicle.id)} className="text-[13px] font-semibold text-[var(--primary)] hover:underline">
                  Update mileage
                </button>
              )}
            </div>
          </div>
        </section>
      ))}

      {alsoDue.length > 0 && (
        <section aria-label="Also worth knowing about">
          <Label>Also due</Label>
          <ul className={PANEL}>
            {alsoDue.map((entry) => (
              <Row key={entry.item.id} entry={entry} lamp={entry.urgency >= 1 ? "due" : "soon"} open={openItemId === entry.item.id} onOpen={() => onOpen(entry.item.id)} form={renderForm(entry)} text={describeRemaining(entry)} action="I had this done" />
            ))}
          </ul>
        </section>
      )}

      {renewals.length > 0 && (
        <section aria-label="Paperwork">
          <Label>Paperwork</Label>
          <ul className={PANEL}>
            {renewals.map((entry) => (
              <li key={entry.renewal.id} className={ROW_RULE}>
                <Link href={`${BASE}/paperwork`} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 px-4 py-3.5 transition-colors hover:bg-[var(--surface-muted)]">
                  <span className="text-[15px] font-semibold tracking-[-0.01em] text-[var(--text)]">
                    {renewalTitle(entry.renewal)}
                    <span className="ml-2 text-[12.5px] font-normal text-[var(--faint)]">{entry.vehicle.label}</span>
                  </span>
                  <span className={`${MONO} text-[12px] ${entry.state === "pastDate" ? "text-[var(--danger)]" : "text-[var(--muted)]"}`}>
                    {describeRenewalTiming(entry.days)}, {entry.renewal.dueOn}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {view.noBaseline.length > 0 && (
        <section aria-label="Nothing to judge yet">
          <Label>Nothing to judge yet</Label>
          <ul className={PANEL}>
            {view.noBaseline.map((entry) => (
              <Row
                key={entry.item.id}
                entry={entry}
                lamp="none"
                open={openItemId === entry.item.id}
                onOpen={() => onOpen(entry.item.id)}
                form={renderForm(entry)}
                text={`${entry.vehicle.historyKnown ? "Nothing recorded for this job yet." : "This vehicle's history is unknown."} Nothing to judge until you record when it was last done.`}
                action="Record when it was last done"
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

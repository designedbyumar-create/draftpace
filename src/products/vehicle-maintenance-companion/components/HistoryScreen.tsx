import type { ReactNode } from "react";
import Button from "@/design-system/Button";
import { ChipRow, Label, MONO, PANEL, ROW_RULE, ScreenHeading } from "./Workshop";
import { plural } from "../dueText";
import { formatCost, type HistoryYear } from "../serviceHistory";
import type { ServiceEvent } from "../state";

export interface VehicleChoice {
  id: string;
  label: string;
  closed: boolean;
}

export interface HistoryScreenProps {
  available: boolean;
  choices: VehicleChoice[];
  /** Null means every vehicle. */
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  groups: HistoryYear[];
  /** For labelling an entry with its vehicle when every vehicle is showing. */
  labelFor: (vehicleId: string) => string;
  logOpen: boolean;
  onOpenLog: () => void;
  renderLogForm: () => ReactNode;
  canLog: boolean;
  editingId: string | null;
  onEdit: (id: string | null) => void;
  renderEditForm: (event: ServiceEvent) => ReactNode;
  onRemove: (event: ServiceEvent) => void;
  removingId: string | null;
  notice: string | null;
  onPrint: () => void;
  printing: boolean;
  /** The vehicle a print would be for, or null when more than one is showing. */
  printLabel: string | null;
}

function EntryRow({ event, showVehicle, label, props }: { event: ServiceEvent; showVehicle: boolean; label: string; props: HistoryScreenProps }) {
  if (props.editingId === event.id) return <li className={`p-3 ${ROW_RULE}`}>{props.renderEditForm(event)}</li>;
  const facts = [event.shop, event.costMinorUnits !== null ? formatCost(event.costMinorUnits) : null, showVehicle ? label : null].filter(Boolean);
  return (
    <li className={`grid grid-cols-[96px_1fr] gap-x-4 px-4 py-3.5 ${ROW_RULE}`}>
      <div className={`${MONO} text-[12px] leading-relaxed text-[var(--muted)]`}>
        <p className="font-bold text-[var(--text)]">{event.doneOn}</p>
        {event.mileage !== null && <p>{event.mileage.toLocaleString()} mi</p>}
      </div>
      <div className="min-w-0">
        <p className="text-[15px] font-semibold leading-tight tracking-[-0.01em] text-[var(--text)]">{event.taskName}</p>
        {facts.length > 0 && <p className={`${MONO} mt-1 text-[12px] text-[var(--muted)]`}>{facts.join(" \u00b7 ")}</p>}
        {event.note && <p className="mt-1 text-[12.5px] text-[var(--faint)]">{event.note}</p>}
        <div className="mt-2 flex items-center gap-4">
          <button type="button" onClick={() => props.onEdit(event.id)} className="text-[13px] font-semibold text-[var(--muted)] hover:text-[var(--text)]">
            Change
          </button>
          <button type="button" disabled={props.removingId === event.id} onClick={() => props.onRemove(event)} className="text-[13px] font-semibold text-[var(--muted)] hover:text-[var(--text)]">
            {props.removingId === event.id ? "Removing..." : "Remove"}
          </button>
        </div>
      </div>
    </li>
  );
}

/**
 * History: what has been done to each vehicle, newest first, by year. The
 * only figure it adds up is the cost somebody chose to enter, and it says
 * how many entries that covers, so a total never reads as the whole story.
 */
export default function HistoryScreen(props: HistoryScreenProps) {
  const { available, choices, selectedId, onSelect, groups, labelFor, logOpen, onOpenLog, canLog, notice, onPrint, printing, printLabel } = props;
  const showVehicle = selectedId === null && choices.length > 1;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <ScreenHeading kicker="What has been done, and when" title="History" />
        {canLog && !logOpen && available && (
          <Button size="sm" variant="secondary" onClick={onOpenLog}>
            Log a service
          </Button>
        )}
      </div>

      {!available && (
        <p className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-[13px] leading-relaxed text-[var(--muted)]">
          The service record could not be loaded right now. Nothing has been lost; try again in a moment.
        </p>
      )}

      {notice && <p className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-[13px] text-[var(--danger)]">{notice}</p>}

      {available && choices.length > 1 && (
        <ChipRow label="Vehicle" activeId={selectedId} onPick={onSelect} items={[{ id: null, text: "ALL" }, ...choices.map((c) => ({ id: c.id, text: `${c.label}${c.closed ? " (closed)" : ""}` }))]} />
      )}

      {logOpen && props.renderLogForm()}

      {available && groups.length === 0 && (
        <section className="rounded-[var(--radius)] border border-dashed border-[var(--border-strong)] p-5">
          <p className="text-[14px] font-semibold text-[var(--text)]">Nothing recorded yet.</p>
          <p className="mt-1 max-w-lg text-[13px] leading-relaxed text-[var(--muted)]">
            When you say a job was done, from Due or Vehicles, it lands here with its date and mileage. You can also log a service that was never a tracked job, like a repair.
          </p>
        </section>
      )}

      {groups.map((group) => (
        <section key={group.year} aria-label={group.year}>
          <Label
            meta={
              group.costedCount > 0
                ? `${formatCost(group.costMinorUnits)} entered, on ${group.costedCount} of ${plural(group.events.length, "entry", "entries")}`
                : undefined
            }
          >
            {group.year}
          </Label>
          <ul className={PANEL}>
            {group.events.map((event) => (
              <EntryRow key={event.id} event={event} showVehicle={showVehicle} label={labelFor(event.vehicleId)} props={props} />
            ))}
          </ul>
        </section>
      ))}

      {available && groups.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 border-t border-[var(--border)] pt-4">
          <Button size="sm" variant="secondary" disabled={printing || printLabel === null} onClick={onPrint}>
            {printing ? "Preparing..." : "Print the service record"}
          </Button>
          <p className="text-[12.5px] text-[var(--muted)]">
            {printLabel === null ? "Choose one vehicle to print its record." : `For ${printLabel}, oldest first, ready to hand to a buyer.`}
          </p>
        </div>
      )}
    </div>
  );
}

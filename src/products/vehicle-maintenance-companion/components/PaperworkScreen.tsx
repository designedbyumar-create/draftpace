import type { ReactNode } from "react";
import Button from "@/design-system/Button";
import { Label, MONO, PANEL, Plate, ROW_RULE, ScreenHeading } from "./Workshop";
import { describeRenewalTiming, renewalTitle, type RenewalEntry } from "../renewals";
import { DETAIL_FIELDS, detailsFromVehicle } from "../paperworkForm";
import type { Vehicle } from "../state";

export interface PaperworkVehicle {
  vehicle: Vehicle;
  /** Every active date for this vehicle, soonest first. */
  entries: RenewalEntry[];
}

export interface PaperworkScreenProps {
  available: boolean;
  vehicles: PaperworkVehicle[];
  detailsOpenId: string | null;
  onOpenDetails: (vehicleId: string | null) => void;
  renderDetailsForm: (vehicle: Vehicle) => ReactNode;
  /** "new:<vehicleId>" for a new date, or the renewal's id for a change. */
  renewalFormKey: string | null;
  onOpenRenewalForm: (key: string | null) => void;
  renderRenewalForm: (vehicle: Vehicle, entry: RenewalEntry | null) => ReactNode;
  onRemoveRenewal: (entry: RenewalEntry) => void;
  removingId: string | null;
  onPrintCard: (vehicle: Vehicle) => void;
  printingId: string | null;
  notice: string | null;
}

const STATE_STYLE: Record<RenewalEntry["state"], string> = {
  pastDate: "text-[var(--danger)]",
  soon: "text-[var(--text)]",
  later: "text-[var(--muted)]",
};

/**
 * Paperwork: the dates that belong to a vehicle, and the details that live
 * in its glove box. It records a date and where the paper is, and says how
 * far away the date is. It never says what a date means legally.
 */
export default function PaperworkScreen(props: PaperworkScreenProps) {
  const { available, vehicles, notice } = props;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <ScreenHeading kicker="Dates and glove box details" title="Paperwork" />
        <p className="mt-3 max-w-[52ch] text-[13.5px] leading-relaxed text-[var(--muted)]">
          Registration, insurance, an inspection, a warranty ending. You record the date and where the paper is. Nothing is uploaded, and nothing here says what any place requires.
        </p>
      </div>

      {!available && (
        <p className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-[13px] leading-relaxed text-[var(--muted)]">
          The dates could not be loaded right now. Nothing has been lost; try again in a moment.
        </p>
      )}
      {notice && <p className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-[13px] text-[var(--danger)]">{notice}</p>}

      {vehicles.map(({ vehicle, entries }) => {
        const details = detailsFromVehicle(vehicle);
        const shown = DETAIL_FIELDS.filter((f) => details[f.key] !== "");
        return (
          <section key={vehicle.id} aria-label={vehicle.label} className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Plate>{vehicle.plate ?? vehicle.label}</Plate>
              {vehicle.plate && <span className="text-[15px] font-semibold text-[var(--text)]">{vehicle.label}</span>}
            </div>

            <div>
              <Label>Dates</Label>
              {available && entries.length === 0 && <p className="rounded-[var(--radius)] border border-dashed border-[var(--border-strong)] px-4 py-4 text-[13px] text-[var(--faint)]">No dates recorded for this vehicle yet.</p>}
              {entries.length > 0 && (
                <ul className={PANEL}>
                  {entries.map((entry) => (
                    <li key={entry.renewal.id} className={`px-4 py-3.5 ${ROW_RULE}`}>
                      {props.renewalFormKey === entry.renewal.id ? (
                        props.renderRenewalForm(vehicle, entry)
                      ) : (
                        <>
                          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                            <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-[var(--text)]">{renewalTitle(entry.renewal)}</h3>
                            <span className={`${MONO} text-[12px] ${STATE_STYLE[entry.state]}`}>
                              {describeRenewalTiming(entry.days)}, {entry.renewal.dueOn}
                            </span>
                          </div>
                          {entry.renewal.whereKept && <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">Kept: {entry.renewal.whereKept}</p>}
                          {entry.renewal.note && <p className="mt-0.5 text-[12.5px] text-[var(--faint)]">{entry.renewal.note}</p>}
                          <div className="mt-2 flex items-center gap-4">
                            <button type="button" onClick={() => props.onOpenRenewalForm(entry.renewal.id)} className="text-[13px] font-semibold text-[var(--primary)] hover:underline">
                              Change or renew
                            </button>
                            <button type="button" disabled={props.removingId === entry.renewal.id} onClick={() => props.onRemoveRenewal(entry)} className="text-[13px] font-semibold text-[var(--muted)] hover:text-[var(--text)]">
                              {props.removingId === entry.renewal.id ? "Removing..." : "Remove"}
                            </button>
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-2.5">
                {props.renewalFormKey === `new:${vehicle.id}` ? (
                  props.renderRenewalForm(vehicle, null)
                ) : (
                  <Button size="sm" variant="ghost" disabled={!available} onClick={() => props.onOpenRenewalForm(`new:${vehicle.id}`)}>
                    Add a date
                  </Button>
                )}
              </div>
            </div>

            <div>
              <Label>Glove box details</Label>
              {props.detailsOpenId === vehicle.id ? (
                props.renderDetailsForm(vehicle)
              ) : (
                <>
                  {shown.length > 0 ? (
                    <dl className={PANEL}>
                      {shown.map((f) => (
                        <div key={f.key} className={`flex items-baseline justify-between gap-4 px-4 py-3 ${ROW_RULE}`}>
                          <dt className="text-[13px] text-[var(--muted)]">{f.label}</dt>
                          <dd className={`${MONO} text-right text-[13.5px] font-bold text-[var(--text)]`}>{details[f.key]}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : (
                    <p className="rounded-[var(--radius)] border border-dashed border-[var(--border-strong)] px-4 py-4 text-[13px] leading-relaxed text-[var(--faint)]">
                      Nothing recorded yet. Registration plate, VIN, tire size, oil, insurance and a roadside number all go on the card.
                    </p>
                  )}
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => props.onOpenDetails(vehicle.id)}>
                      {shown.length > 0 ? "Change details" : "Add details"}
                    </Button>
                    <Button size="sm" variant="secondary" disabled={props.printingId !== null} onClick={() => props.onPrintCard(vehicle)}>
                      {props.printingId === vehicle.id ? "Preparing..." : "Print the glove box card"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

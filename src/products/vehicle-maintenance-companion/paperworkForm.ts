import type { RenewalKind, Vehicle } from "./state";

const blankToNull = (text: string): string | null => (text.trim() === "" ? null : text.trim());

export interface RenewalFormValues {
  kind: RenewalKind;
  label: string;
  dueOn: string;
  whereKept: string;
  note: string;
}

export type RenewalFormResult =
  | { ok: true; renewal: { kind: RenewalKind; label: string | null; dueOn: string; whereKept: string | null; note: string | null } }
  | { ok: false; message: string };

/**
 * A date to keep in view. The date is required and is any real day, past or
 * to come: somebody catching up on a lapsed registration needs to record
 * the date that passed as much as one still ahead. An "other" date has to
 * be named, since nothing else says what it is.
 */
export function parseRenewalForm(values: RenewalFormValues): RenewalFormResult {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(values.dueOn)) return { ok: false, message: "Choose the date." };
  const label = blankToNull(values.label);
  if (values.kind === "other" && label === null) return { ok: false, message: "Say what this date is for." };
  return { ok: true, renewal: { kind: values.kind, label: values.kind === "other" ? label : null, dueOn: values.dueOn, whereKept: blankToNull(values.whereKept), note: blankToNull(values.note) } };
}

export interface DetailsFormValues {
  plate: string;
  vin: string;
  tyreSize: string;
  oilSpec: string;
  insurer: string;
  policyNumber: string;
  roadsidePhone: string;
}

export const DETAIL_FIELDS: { key: keyof DetailsFormValues; label: string; placeholder: string }[] = [
  { key: "plate", label: "Registration plate", placeholder: "7ABC123" },
  { key: "vin", label: "VIN", placeholder: "17 characters, from the windscreen or the papers" },
  { key: "tyreSize", label: "Tyre size", placeholder: "205/55 R16" },
  { key: "oilSpec", label: "Oil", placeholder: "5W-30, 4.2 litres" },
  { key: "insurer", label: "Insurer", placeholder: "Who the policy is with" },
  { key: "policyNumber", label: "Policy number", placeholder: "" },
  { key: "roadsidePhone", label: "Roadside help number", placeholder: "" },
];

export function detailsFromVehicle(vehicle: Vehicle): DetailsFormValues {
  return {
    plate: vehicle.plate ?? "",
    vin: vehicle.vin ?? "",
    tyreSize: vehicle.tyreSize ?? "",
    oilSpec: vehicle.oilSpec ?? "",
    insurer: vehicle.insurer ?? "",
    policyNumber: vehicle.policyNumber ?? "",
    roadsidePhone: vehicle.roadsidePhone ?? "",
  };
}

/** Every field is optional, and a cleared field is saved as nothing, so a detail can be taken back out. */
export function detailsPatch(values: DetailsFormValues): Record<keyof DetailsFormValues, string | null> {
  return {
    plate: blankToNull(values.plate),
    vin: blankToNull(values.vin),
    tyreSize: blankToNull(values.tyreSize),
    oilSpec: blankToNull(values.oilSpec),
    insurer: blankToNull(values.insurer),
    policyNumber: blankToNull(values.policyNumber),
    roadsidePhone: blankToNull(values.roadsidePhone),
  };
}

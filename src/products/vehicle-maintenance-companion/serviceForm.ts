import { parseCostToMinorUnits, type ServiceInput } from "./serviceHistory";

export interface ServiceFormValues {
  taskName: string;
  doneOn: string;
  mileage: string;
  shop: string;
  cost: string;
  note: string;
}

export type ServiceFormResult = { ok: true; service: ServiceInput } | { ok: false; message: string };

const blankToNull = (text: string): string | null => (text.trim() === "" ? null : text.trim());

/**
 * What the form says, checked and turned into what gets saved. A service
 * can be from any day up to today, never a day that has not happened; a
 * mileage is a whole number; a cost is optional and is never guessed from
 * something that is not a number.
 */
export function parseServiceForm(values: ServiceFormValues, today: string): ServiceFormResult {
  const taskName = values.taskName.trim();
  if (taskName === "") return { ok: false, message: "Say what was done." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(values.doneOn)) return { ok: false, message: "Choose the day it was done." };
  if (values.doneOn > today) return { ok: false, message: "A service cannot be dated after today." };

  let mileage: number | null = null;
  if (values.mileage.trim() !== "") {
    const cleaned = values.mileage.replace(/[,\s]/g, "");
    if (!/^\d+$/.test(cleaned)) return { ok: false, message: "Mileage is a whole number, like 48200." };
    mileage = Number(cleaned);
  }

  let costMinorUnits: number | null = null;
  if (values.cost.trim() !== "") {
    costMinorUnits = parseCostToMinorUnits(values.cost);
    if (costMinorUnits === null) return { ok: false, message: "Cost is an amount, like 120.50, or leave it empty." };
  }

  return { ok: true, service: { taskName, doneOn: values.doneOn, mileage, shop: blankToNull(values.shop), costMinorUnits, note: blankToNull(values.note) } };
}

export function emptyServiceForm(input: { taskName: string; today: string; vehicleMileage: number | null }): ServiceFormValues {
  return { taskName: input.taskName, doneOn: input.today, mileage: input.vehicleMileage === null ? "" : String(input.vehicleMileage), shop: "", cost: "", note: "" };
}

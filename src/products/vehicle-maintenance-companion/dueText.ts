import { effectiveIntervalMiles, effectiveIntervalMonths, type DueVehicleItem } from "./dueStatus";

export function plural(count: number, one: string, many: string = `${one}s`): string {
  return `${count.toLocaleString()} ${Math.abs(count) === 1 ? one : many}`;
}

/**
 * What is left, or how far past, on each dimension the job is tracked by.
 * Whatever is past its interval comes first, so a job that is late by time
 * but has miles in hand leads with the thing that is actually late.
 */
export function describeRemaining(entry: Pick<DueVehicleItem, "milesRemaining" | "daysRemaining">): string {
  const parts: { text: string; past: boolean }[] = [];
  if (entry.milesRemaining !== null) {
    const past = entry.milesRemaining < 0;
    const amount = Math.abs(entry.milesRemaining);
    parts.push({ text: `${plural(amount, "mile")} ${past ? "past due" : "left"}`, past });
  }
  if (entry.daysRemaining !== null) {
    const past = entry.daysRemaining < 0;
    const amount = Math.abs(entry.daysRemaining);
    parts.push({ text: entry.daysRemaining === 0 ? "due today" : `${plural(amount, "day")} ${past ? "past due" : "left"}`, past });
  }
  return [...parts.filter((p) => p.past), ...parts.filter((p) => !p.past)].map((p) => p.text).join(", ");
}

/** "every 5,000 miles, every 6 months", in the interval the job actually uses (halved under severe duty). */
export function describeInterval(item: Parameters<typeof effectiveIntervalMiles>[0] & Parameters<typeof effectiveIntervalMonths>[0]): string {
  const miles = effectiveIntervalMiles(item);
  const months = effectiveIntervalMonths(item);
  return [miles ? `every ${plural(miles, "mile")}` : null, months ? `every ${plural(months, "month")}` : null].filter(Boolean).join(", ");
}

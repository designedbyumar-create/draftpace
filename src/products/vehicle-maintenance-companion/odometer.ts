/**
 * The digits of a mechanical odometer: at least six cells, zero-padded on
 * the left, with `lead` marking where the real number starts so the padding
 * can be drawn dim. A number with more digits than the cells never loses
 * any, because a truncated odometer would show a different car's mileage.
 */
export function odometerDigits(miles: number, cells = 6): { digits: string[]; lead: number } {
  const whole = Math.max(0, Math.floor(miles));
  const digits = String(whole).padStart(cells, "0").split("");
  const lead = digits.findIndex((d) => d !== "0");
  return { digits, lead: lead === -1 ? digits.length - 1 : lead };
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "1 Aug" for a day in the current year, "1 Aug 2025" for any other, from a "YYYY-MM-DD" date. */
export function shortDay(isoDate: string, todayIso: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const sameYear = isoDate.slice(0, 4) === todayIso.slice(0, 4);
  return `${d} ${MONTHS[m - 1]}${sameYear ? "" : ` ${y}`}`;
}

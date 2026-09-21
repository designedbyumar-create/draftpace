/**
 * The working behind "Tell it once": six things a person might hate to
 * forget, and what a Companion does with each. Pure and deterministic, so it
 * renders the same on the server and in the browser and can be tested.
 *
 * The rules are the products' own, stated where they apply:
 *   Home Base       a job comes up 30 days before it is due, and says so once
 *                   when it is late
 *   Vehicle         a date shows on Due from 45 days out (RENEWAL_SOON_DAYS),
 *                   and an opt-in reminder goes 14 days before (RENEWAL_LEAD_DAYS)
 *   Personal Finance  "Coming up" covers the next 14 days
 *   Life Affairs    an entry comes back for a second look on its own interval
 *   Family Health   an allergy has no date and never reminds anyone
 *   Travel          nothing is said until a booking changes, and then what
 *                   depended on it is shown, unchanged so far
 *
 * Reminders are off by default in every product that has them, so turning
 * the switch on only ever adds a sentence to what the person is told.
 */
export const TODAY = new Date(2026, 8, 21);

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const formatDay = (d: Date) => `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
const addMonths = (d: Date, n: number) => {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
};
const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
const daysBetween = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / 86_400_000);

/** "1 day", "9 days", "4 weeks": days up to two weeks, then weeks. */
export function span(days: number): string {
  if (days === 1) return "1 day";
  if (days < 14) return `${days} days`;
  return `${Math.round(days / 7)} weeks`;
}

export type ItemId = "boiler" | "car" | "flight" | "allergy" | "visa" | "will";
export interface Options {
  /** Boiler: how many months ago it was last done. */
  ago: number;
  /** Car insurance: how many days until it renews. */
  daysAway: number;
  remind: boolean;
}
export const DEFAULTS: Options = { ago: 10, daysAway: 43, remind: false };

export interface Item {
  id: ItemId;
  name: string;
  /** The life area (its colour on the site). */
  area: string;
  product: string;
  productSlug: string;
  prints: string;
  control: "ago" | "daysAway" | null;
}

export const ITEMS: Item[] = [
  { id: "boiler", name: "Boiler service, every year", area: "home", product: "Home Base", productSlug: "home-management-companion", prints: "an Item Card", control: "ago" },
  { id: "car", name: "Car insurance renews", area: "vehicles", product: "Vehicle Maintenance Companion", productSlug: "vehicle-maintenance-companion", prints: "a glove box card", control: "daysAway" },
  { id: "flight", name: "Flight to Osaka", area: "travel", product: "Travel Companion", productSlug: "travel-companion", prints: "My Trip Book", control: null },
  { id: "allergy", name: "Amina's peanut allergy", area: "family-health", product: "Family Health Binder", productSlug: "family-health-binder", prints: "the Forms sheet", control: null },
  { id: "visa", name: "Visa payment, every month", area: "money", product: "Personal Finance Companion", productSlug: "personal-finance-companion", prints: "the monthly review page", control: null },
  { id: "will", name: "Where the will is kept", area: "affairs-and-endings", product: "Personal Life Affairs Companion", productSlug: "personal-life-affairs-companion", prints: "My Affairs", control: null },
];

export interface Result {
  remembered: string;
  worked: string;
  speaks: string;
}

const TOLD = " You asked to be told, so you get one notification then.";

export function describe(id: ItemId, o: Options = DEFAULTS): Result {
  switch (id) {
    case "boiler": {
      const last = addMonths(TODAY, -o.ago);
      const due = addMonths(last, 12);
      const n = daysBetween(TODAY, due);
      const from = addDays(due, -30);
      return {
        remembered: `Boiler service. Every 12 months. Last done ${formatDay(last)}.`,
        worked: n >= 0 ? `Next due ${formatDay(due)}, in ${span(n)}.` : `Was due ${formatDay(due)}. It is ${span(-n)} late.`,
        speaks:
          n < 0
            ? "It says so once, plainly, and asks whether you did it. It does not keep count."
            : daysBetween(TODAY, from) <= 0
              ? `It is on your Home screen now. It comes up 30 days before, and not sooner.${o.remind ? TOLD : ""}`
              : `Nothing yet. It comes up on ${formatDay(from)}, 30 days before.${o.remind ? TOLD : ""}`,
      };
    }
    case "car": {
      const due = addDays(TODAY, o.daysAway);
      return {
        remembered: `Insurance. Renews ${formatDay(due)}. Paper kept in the blue folder.`,
        worked: o.daysAway === 0 ? "Renews today." : `Renews in ${span(o.daysAway)}.`,
        speaks:
          (o.daysAway <= 45 ? "It is showing on Due now, because it is within 45 days." : `Nothing yet. It shows on Due from ${formatDay(addDays(due, -45))}, 45 days before.`) +
          (o.remind ? " You asked to be told, so you get one notification 14 days before." : ""),
      };
    }
    case "flight":
      return {
        remembered: "Flight to Osaka, Nov 12, 2026, 09:05. The airport transfer and the hotel check-in are booked around it.",
        worked: "Two bookings depend on it.",
        speaks: "Nothing, unless it changes. Then it shows what was built on it, unchanged so far, and you deal with each one.",
      };
    case "allergy":
      return {
        remembered: "Peanuts, hives. Kept against Amina.",
        worked: "There is no date to work out. It goes first on her card, as a tag.",
        speaks: "It never reminds you of anything. It is on the Forms sheet, the Caregiver sheet and the Emergency card, unless you mark it private.",
      };
    case "visa": {
      const due = new Date(2026, 8, 24);
      return {
        remembered: "Visa minimum, $85.00, on the 24th of every month.",
        worked: `Next payment ${formatDay(due)}, in ${span(daysBetween(TODAY, due))}.`,
        speaks: `It shows under Coming up for the next 14 days, and comes out of what is available to spend.${o.remind ? TOLD : ""}`,
      };
    }
    case "will": {
      const next = addMonths(TODAY, 12);
      return {
        remembered: "Will. Kept in the fireproof box, with a copy at Sam's.",
        worked: `It comes back for a second look every 12 months. Next: ${formatDay(next)}.`,
        speaks: "Quiet until then. If something in your life changes, it brings forward only what that could have made untrue.",
      };
    }
  }
}

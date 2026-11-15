/**
 * The stub households for the Alongside captures. Every row is typed the way
 * a person would type it; nothing here is a number, a name or a date the
 * product made up. No real names, no real emails, no activation codes.
 *
 *   empty     a new account: nothing recorded, so Now shows its first-run state
 *   quiet     one thing kept with no date (a reference): attention has nothing to say
 *   one-card  one open "something to do" with a date a few days away
 *
 * The clock is fixed at lib/screen-harness.mjs NOW (Monday 26 Oct 2026, 10:00).
 */
import type { LifeItem } from "@/products/alongside/life";

declare const __ADHD_SCENARIO__: "empty" | "quiet" | "one-card";

const base = {
  note: null, status: "open" as const, nextAt: null, userChosenDate: false, everyMonths: null, waitingOn: null,
  lastTouchedAt: null, leftOffNote: null, nextStep: null, createdAt: "2026-10-20T09:00:00Z",
};

const DENTIST: LifeItem = { ...base, id: "item-dentist", kind: "commitment", title: "Ring the dentist", nextAt: "2026-10-29T09:00:00Z" };
const WIFI: LifeItem = { ...base, id: "item-wifi", kind: "reference", title: "Wifi password for the flat", note: "On the back of the router" };

export const SCENARIO = __ADHD_SCENARIO__;
export const ITEMS: LifeItem[] = { empty: [], quiet: [WIFI], "one-card": [DENTIST] }[__ADHD_SCENARIO__];

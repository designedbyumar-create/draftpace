/**
 * The demo household for the Home Base captures. It is built to AGREE with
 * the three existing app screens
 * (creative/public/screens/home-management-companion-{history,seasons,workspace}.png):
 * a Fridge freezer (Kitchen), a Boiler (Utility cupboard), Smoke alarms
 * (Hallway and kitchen) and Garden irrigation (Back garden), with "Example"
 * as the make. No real names, no real emails.
 *
 * Only the Item Card (printables/generateItemCard.tsx) and the problem
 * sentence sheet read these rows; the setup and paste-notes screens start empty,
 * as a new account does. The model and the "what to buy" line on the Fridge
 * freezer are [ADDED] (the existing screens do not show them) and are plainly
 * fictional ("Example", "EX-300", "EF-20").
 */
import type { HomeItem } from "@/products/home-management-companion/state";

declare const __HB_TENURE__: "own" | "rent";

const lifecycle = (n: number) => {
  const t = `2026-09-${String(10 + n).padStart(2, "0")}T09:00:00Z`;
  return { status: "active" as const, needsReviewReason: null, source: "manual" as const, importSessionId: null, createdAt: t, updatedAt: t };
};
const item = (n: number, i: Partial<HomeItem> & Pick<HomeItem, "id" | "name" | "type">): HomeItem => ({
  brand: null, model: null, location: null, purchaseDate: null, installDate: null, warrantyExpiresAt: null,
  buySpec: null, documentLink: null, notes: null, ...lifecycle(n), ...i,
});

export const FRIDGE: HomeItem = item(0, {
  id: "item-fridge", name: "Fridge freezer", type: "refrigerator", brand: "Example", model: "EX-300", location: "Kitchen",
  purchaseDate: "2023-03-14", warrantyExpiresAt: "2025-03-14", buySpec: "Water filter cartridge EF-20",
  notes: "Coils cleaned in the spring. Door seal is fine.",
});
export const HOME_ITEMS: HomeItem[] = [
  FRIDGE,
  item(1, { id: "item-boiler", name: "Boiler", type: "boiler", brand: "Example", location: "Utility cupboard" }),
  item(2, { id: "item-alarms", name: "Smoke alarms", type: "smoke-detector", location: "Hallway and kitchen" }),
  item(3, { id: "item-irrigation", name: "Garden irrigation", type: "irrigation", location: "Back garden" }),
];

// Setup and Import start empty (a new account); the problem sheet is shown over the household.
export const TABLES: Record<string, unknown[]> = {};
export const SHEET_ITEMS = HOME_ITEMS;
export const TENURE: "own" | "rent" = __HB_TENURE__;

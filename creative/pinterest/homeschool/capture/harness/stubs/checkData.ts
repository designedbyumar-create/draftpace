// Stand-in for domain/checkData.ts (Supabase). Same Result shapes; items come from the fixture
// bank, and a started check just echoes the items the real assembleCheck() picked.
import { ok } from "@/product-framework/result";
import { ITEMS } from "../fixtures";

export type PastResult = { topicKey: string; standing: string; checkId: string; createdAt: string; answered: number; right: number };
export type StartedCheck = {
  checkId: string;
  items: { checkItemId: string; itemId: string | null; topicKey: string; prompt: string; expectedAnswer: string | null }[];
};

export const loadItems = async (_instance: string, topicKeys: string[]) => ok(ITEMS.filter((i) => topicKeys.includes(i.topicKey)));
export const createItem = async () => ok(ITEMS[0]);
export const loadPastResults = async () => ok([] as PastResult[]);
export const recordAnswer = async () => ok(null);
export const finishCheck = async () => ok(null);
export const startCheck = async (_instance: string, input: { items: { id: string; topicKey: string; prompt: string; expectedAnswer: string | null }[] }) =>
  ok<StartedCheck>({
    checkId: "demo-check",
    items: input.items.map((i) => ({ checkItemId: i.id, itemId: i.id, topicKey: i.topicKey, prompt: i.prompt, expectedAnswer: i.expectedAnswer })),
  });

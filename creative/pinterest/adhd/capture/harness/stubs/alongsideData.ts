// Stand-in for domain/alongsideData.ts (Supabase). Same exports. Items come from the scenario's fixture; a run is an
// in-memory record that answers itself as it is stepped through; the outcome logic is the REAL pure applyOutcome /
// offerFromDirectRun from outcome.ts, so what a finished run offers is the product's own.
import { ok, type Result } from "@/product-framework/result";
import type { ItemKind, LifeItem } from "@/products/alongside/life";
import type { OutcomeKind } from "@/products/alongside/playbook";
import { offerFromDirectRun } from "@/products/alongside/outcome";
import { ITEMS } from "../fixtures";

export interface NewItem {
  kind: ItemKind; title: string; note?: string | null; nextAt?: string | null; userChosenDate?: boolean;
  everyMonths?: number | null; waitingOn?: string | null;
}
export interface ItemEvent { id: string; itemId: string; line: string; itemTitle: string; outcome: string | null; occurredAt: string }
export interface RunRecord {
  id: string; itemId: string | null; playbookKey: string; playbookTitle: string;
  status: "open" | "finished" | "left"; answers: Record<string, string>; skipped: string[];
}
export interface FinishResult { item: LifeItem | null; offer: ReturnType<typeof offerFromDirectRun> }

export async function loadItems(): Promise<Result<LifeItem[]>> { return ok(ITEMS); }
export async function createItem(_id: string, draft: NewItem): Promise<Result<LifeItem>> {
  return ok({
    id: "new-item", kind: draft.kind, title: draft.title, note: draft.note ?? null, status: "open", nextAt: draft.nextAt ?? null,
    userChosenDate: draft.userChosenDate ?? false, everyMonths: null, waitingOn: null, lastTouchedAt: null, leftOffNote: null, nextStep: null,
    createdAt: "2026-10-26T10:00:00Z",
  });
}
export async function updateItem(itemId: string, patch: Partial<LifeItem>): Promise<Result<LifeItem>> {
  return ok({ ...(ITEMS.find((i) => i.id === itemId) as LifeItem), ...patch });
}
export async function loadItemEvents(): Promise<Result<ItemEvent[]>> { return ok([]); }
export async function startRun(_id: string, playbook: { key: string; title: string }, itemId: string | null): Promise<Result<RunRecord>> {
  return ok({ id: "demo-run", itemId, playbookKey: playbook.key, playbookTitle: playbook.title, status: "open", answers: {}, skipped: [] });
}
export async function loadOpenRun(): Promise<Result<RunRecord | null>> { return ok(null); }
export async function saveAnswer(): Promise<Result<null>> { return ok(null); }
export async function finishRun(_id: string, _run: RunRecord, item: LifeItem | null, outcome: OutcomeKind, detail: string | null, fallbackTitle: string): Promise<Result<FinishResult>> {
  return ok({ item, offer: item ? null : offerFromDirectRun({ outcome, detail, now: new Date() }, fallbackTitle) });
}
export async function recordOutcome(_id: string, item: LifeItem): Promise<Result<LifeItem>> { return ok(item); }
export async function leaveRun(): Promise<Result<null>> { return ok(null); }

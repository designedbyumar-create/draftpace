"use client";

import { supabase } from "@/lib/supabase/client";
import { ok, err, type Result } from "@/product-framework/result";
import type { ItemKind, LifeItem } from "../life";
import type { OutcomeKind } from "../playbook";
import { applyOutcome, offerFromDirectRun, type ItemPatch } from "../outcome";

/**
 * Everything this product reads from and writes to the database.
 *
 * One file, following Personal Life Affairs rather than Home Base: this
 * product has one loop and one kind of record, so a repository per table
 * would only ever produce files that get called together.
 *
 * WHAT THE WRITES GUARANTEE
 *
 * Nothing here deletes. Row level security has no delete policy, so an
 * item closes rather than disappearing, and history is append only. In a
 * product about things people find hard to finish, a bad week must not
 * be able to erase a good year.
 *
 * The rule this file exists to hold: when a run ends, the outcome is
 * applied through applyOutcome and nowhere else. The pure function
 * decides what changes, this file writes it, and "did not get to it"
 * therefore writes nothing anywhere without that having to be remembered
 * at each call site.
 */

const ITEM_COLUMNS =
  "id, kind, title, note, status, next_at, user_chosen_date, every_months, waiting_on, last_touched_at, left_off_note, next_step, created_at";

function toItem(row: Record<string, unknown>): LifeItem {
  return {
    id: row.id as string,
    kind: row.kind as ItemKind,
    title: row.title as string,
    note: (row.note as string | null) ?? null,
    status: row.status as LifeItem["status"],
    nextAt: (row.next_at as string | null) ?? null,
    userChosenDate: Boolean(row.user_chosen_date),
    everyMonths: (row.every_months as number | null) ?? null,
    waitingOn: (row.waiting_on as string | null) ?? null,
    lastTouchedAt: (row.last_touched_at as string | null) ?? null,
    leftOffNote: (row.left_off_note as string | null) ?? null,
    nextStep: (row.next_step as string | null) ?? null,
    createdAt: row.created_at as string,
  };
}

/** camelCase patch to the column names, in one place. */
const PATCH_COLUMN: Record<keyof ItemPatch, string> = {
  title: "title",
  note: "note",
  status: "status",
  kind: "kind",
  nextAt: "next_at",
  userChosenDate: "user_chosen_date",
  everyMonths: "every_months",
  waitingOn: "waiting_on",
  lastTouchedAt: "last_touched_at",
  leftOffNote: "left_off_note",
  nextStep: "next_step",
};

async function currentUserId(): Promise<Result<string>> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) return err({ kind: "network", message: error.message });
  if (!session) return err({ kind: "not-authenticated" });
  return ok(session.user.id);
}

// ------------------------------------------------------------------ items

export async function loadItems(productInstanceId: string): Promise<Result<LifeItem[]>> {
  const { data, error } = await supabase
    .from("als_items")
    .select(ITEM_COLUMNS)
    .eq("product_instance_id", productInstanceId)
    .neq("status", "archived")
    .order("created_at", { ascending: false });

  if (error) return err({ kind: "network", message: error.message });
  return ok(((data ?? []) as unknown as Record<string, unknown>[]).map(toItem));
}

export interface NewItem {
  kind: ItemKind;
  title: string;
  note?: string | null;
  nextAt?: string | null;
  userChosenDate?: boolean;
  everyMonths?: number | null;
  waitingOn?: string | null;
}

export async function createItem(productInstanceId: string, draft: NewItem): Promise<Result<LifeItem>> {
  const user = await currentUserId();
  if (!user.ok) return user;

  const { data, error } = await supabase
    .from("als_items")
    .insert({
      product_instance_id: productInstanceId,
      user_id: user.data,
      kind: draft.kind,
      title: draft.title.trim(),
      note: draft.note?.trim() || null,
      next_at: draft.nextAt ?? null,
      // Only true when the person picked the date themselves. It decides
      // whether attention says "you said you would come back to this" or
      // "coming up", and only one of those is honest for a date the
      // product suggested.
      user_chosen_date: draft.userChosenDate ?? false,
      every_months: draft.everyMonths ?? null,
      waiting_on: draft.waitingOn?.trim() || null,
    })
    .select(ITEM_COLUMNS)
    .single();

  if (error || !data) return err({ kind: "network", message: error?.message ?? "Could not save that." });
  return ok(toItem(data as unknown as Record<string, unknown>));
}

export async function updateItem(itemId: string, patch: ItemPatch): Promise<Result<LifeItem>> {
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const [key, value] of Object.entries(patch)) {
    row[PATCH_COLUMN[key as keyof ItemPatch]] = value;
  }

  const { data, error } = await supabase
    .from("als_items")
    .update(row)
    .eq("id", itemId)
    .select(ITEM_COLUMNS)
    .single();

  if (error || !data) return err({ kind: "network", message: error?.message ?? "Could not save that." });
  return ok(toItem(data as unknown as Record<string, unknown>));
}

// ---------------------------------------------------------------- history

export interface ItemEvent {
  id: string;
  itemId: string;
  line: string;
  itemTitle: string;
  outcome: string | null;
  occurredAt: string;
}

export async function loadItemEvents(productInstanceId: string, itemId?: string): Promise<Result<ItemEvent[]>> {
  let query = supabase
    .from("als_item_events")
    .select("id, item_id, line, item_title, outcome, occurred_at")
    .eq("product_instance_id", productInstanceId)
    .order("occurred_at", { ascending: false });

  if (itemId) query = query.eq("item_id", itemId);

  const { data, error } = await query;
  if (error) return err({ kind: "network", message: error.message });

  return ok(
    ((data ?? []) as unknown as Record<string, unknown>[]).map((row) => ({
      id: row.id as string,
      itemId: row.item_id as string,
      line: row.line as string,
      itemTitle: row.item_title as string,
      outcome: (row.outcome as string | null) ?? null,
      occurredAt: row.occurred_at as string,
    }))
  );
}

// -------------------------------------------------------------------- runs

export interface RunRecord {
  id: string;
  itemId: string | null;
  playbookKey: string;
  playbookTitle: string;
  status: "open" | "finished" | "left";
  answers: Record<string, string>;
  skipped: string[];
}

export async function startRun(
  productInstanceId: string,
  playbook: { key: string; title: string },
  itemId: string | null
): Promise<Result<RunRecord>> {
  const user = await currentUserId();
  if (!user.ok) return user;

  const { data, error } = await supabase
    .from("als_runs")
    .insert({
      product_instance_id: productInstanceId,
      user_id: user.data,
      item_id: itemId,
      playbook_key: playbook.key,
      // Snapshotted, so a run opened today still reads correctly after
      // the playbook is retitled or retired.
      playbook_title: playbook.title,
    })
    .select("id, item_id, playbook_key, playbook_title, status")
    .single();

  if (error || !data) return err({ kind: "network", message: error?.message ?? "Could not start that." });
  const row = data as unknown as Record<string, unknown>;
  return ok({
    id: row.id as string,
    itemId: (row.item_id as string | null) ?? null,
    playbookKey: row.playbook_key as string,
    playbookTitle: row.playbook_title as string,
    status: row.status as RunRecord["status"],
    answers: {},
    skipped: [],
  });
}

/**
 * Loads a run that was left open, with everything already answered.
 *
 * Resuming is not a convenience feature here. Somebody who closed the
 * tab halfway through preparing a phone call has lost the thread, not
 * the intention, and making them start again is the product recreating
 * the exact problem it exists to solve.
 */
export async function loadOpenRun(productInstanceId: string, itemId: string): Promise<Result<RunRecord | null>> {
  const { data, error } = await supabase
    .from("als_runs")
    .select("id, item_id, playbook_key, playbook_title, status")
    .eq("product_instance_id", productInstanceId)
    .eq("item_id", itemId)
    // "left" is included deliberately: leaving mid-run is not treated as
    // failure elsewhere in this product, and it must not be treated as
    // one here by silently becoming unresumable.
    .in("status", ["open", "left"])
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return err({ kind: "network", message: error.message });
  if (!data) return ok(null);

  const row = data as unknown as Record<string, unknown>;
  const answers = await supabase
    .from("als_run_answers")
    .select("step_key, answer, skipped")
    .eq("run_id", row.id as string);

  if (answers.error) return err({ kind: "network", message: answers.error.message });

  const collected: Record<string, string> = {};
  const skipped: string[] = [];
  for (const answer of (answers.data ?? []) as unknown as Record<string, unknown>[]) {
    if (answer.skipped) skipped.push(answer.step_key as string);
    else if (answer.answer) collected[answer.step_key as string] = answer.answer as string;
  }

  return ok({
    id: row.id as string,
    itemId: (row.item_id as string | null) ?? null,
    playbookKey: row.playbook_key as string,
    playbookTitle: row.playbook_title as string,
    status: row.status as RunRecord["status"],
    answers: collected,
    skipped,
  });
}

/**
 * Saves one step's answer.
 *
 * Only what the person wrote or chose themselves. A playbook's suggested
 * wording is never written here and never leaves the browser: it exists
 * to get somebody past the first fifteen seconds of a phone call, and a
 * record of which opening line they needed is not something this product
 * should be holding.
 */
export async function saveAnswer(
  productInstanceId: string,
  runId: string,
  stepKey: string,
  answer: string | null,
  skipped = false
): Promise<Result<null>> {
  const user = await currentUserId();
  if (!user.ok) return user;

  const { error } = await supabase.from("als_run_answers").upsert(
    {
      product_instance_id: productInstanceId,
      user_id: user.data,
      run_id: runId,
      step_key: stepKey,
      answer: skipped ? null : answer,
      skipped,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "run_id,step_key" }
  );

  if (error) return err({ kind: "network", message: error.message });
  return ok(null);
}

export interface FinishResult {
  item: LifeItem | null;
  /** Set when a run with nothing behind it produced something worth keeping. */
  offer: ReturnType<typeof offerFromDirectRun>;
}

/**
 * Closes a run and applies its outcome to Life.
 *
 * The single place the loop closes, so the rules live in applyOutcome
 * rather than being re-derived by each caller. In particular, "did not
 * get to it" reaches here like any other outcome and produces an empty
 * patch and no event, which is why nothing in this function needs to
 * special case it.
 */
async function applyOutcomeToItem(
  productInstanceId: string,
  userId: string,
  item: LifeItem,
  runId: string | null,
  outcome: OutcomeKind,
  detail: string | null,
  now: Date
): Promise<Result<LifeItem>> {
  const effect = applyOutcome(item, { outcome, detail, now });

  if (effect.event) {
    const logged = await supabase.from("als_item_events").insert({
      product_instance_id: productInstanceId,
      user_id: userId,
      item_id: item.id,
      // Nullable: an outcome recorded directly from the item page, with
      // no Companion run behind it, is still a real thing that happened.
      run_id: runId,
      line: effect.event,
      // Snapshot of what it was called at the time, so renaming an item
      // never rewrites what its history said.
      item_title: item.title,
      outcome,
    });
    if (logged.error) return err({ kind: "network", message: logged.error.message });
  }

  if (Object.keys(effect.patch).length === 0) return ok(item);
  return updateItem(item.id, effect.patch);
}

export async function finishRun(
  productInstanceId: string,
  run: RunRecord,
  item: LifeItem | null,
  outcome: OutcomeKind,
  detail: string | null,
  fallbackTitle: string
): Promise<Result<FinishResult>> {
  const user = await currentUserId();
  if (!user.ok) return user;
  const now = new Date();

  const closed = await supabase
    .from("als_runs")
    .update({
      status: "finished",
      outcome,
      outcome_detail: detail,
      ended_at: now.toISOString(),
      updated_at: now.toISOString(),
    })
    .eq("id", run.id);

  if (closed.error) return err({ kind: "network", message: closed.error.message });

  if (!item) {
    return ok({ item: null, offer: offerFromDirectRun({ outcome, detail, now }, fallbackTitle) });
  }

  const updated = await applyOutcomeToItem(productInstanceId, user.data, item, run.id, outcome, detail, now);
  if (!updated.ok) return updated;
  return ok({ item: updated.data, offer: null });
}

/**
 * The same outcomes finishRun applies, without a Companion run behind
 * them.
 *
 * For the quick actions on the item page: marking something sorted or
 * recording who it is waiting on does not always need eight questions
 * first, and forcing it through a run just to reuse this logic would be
 * the tail wagging the dog. What matters is that both paths write
 * through the one applyOutcome rule, so "did not get to it" writing
 * nothing, and a recurring item rolling forward instead of closing, hold
 * true here exactly as they do inside a run.
 */
export async function recordOutcome(
  productInstanceId: string,
  item: LifeItem,
  outcome: OutcomeKind,
  detail: string | null
): Promise<Result<LifeItem>> {
  const user = await currentUserId();
  if (!user.ok) return user;
  return applyOutcomeToItem(productInstanceId, user.data, item, null, outcome, detail, new Date());
}

/** Leaving a run part way through is not a failure and is not recorded as one. */
export async function leaveRun(runId: string): Promise<Result<null>> {
  const { error } = await supabase
    .from("als_runs")
    .update({ status: "left", updated_at: new Date().toISOString() })
    .eq("id", runId);

  if (error) return err({ kind: "network", message: error.message });
  return ok(null);
}

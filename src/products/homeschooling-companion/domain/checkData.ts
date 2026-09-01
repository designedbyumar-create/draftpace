"use client";

import { supabase } from "@/lib/supabase/client";
import { ok, err, type Result } from "@/product-framework/result";
import type { AnswerMark, CheckItem, ItemSource, PriorStanding, Standing, TopicStanding } from "../check";

/**
 * Reading and writing checks.
 *
 * Separate from learningData.ts because a check is the one part of this
 * product that could be mistaken for a judgement about a child, and
 * keeping its writes in one small file makes them easy to audit.
 *
 * Nothing here writes a score, because there is no score column. See the
 * migration.
 */

async function currentUserId(): Promise<Result<string>> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) return err({ kind: "network", message: error.message });
  if (!session) return err({ kind: "not-authenticated" });
  return ok(session.user.id);
}

// ------------------------------------------------------ the item bank

export async function loadItems(productInstanceId: string, topicKeys: string[]): Promise<Result<CheckItem[]>> {
  if (topicKeys.length === 0) return ok([]);
  const { data, error } = await supabase
    .from("hsc_items")
    .select("id, topic_key, source, prompt, expected_answer")
    .eq("product_instance_id", productInstanceId)
    .eq("status", "active")
    .in("topic_key", topicKeys);

  if (error) return err({ kind: "network", message: error.message });
  const rows = (data ?? []) as unknown as Record<string, unknown>[];
  return ok(
    rows.map((row) => ({
      id: row.id as string,
      topicKey: row.topic_key as string,
      source: row.source as ItemSource,
      prompt: row.prompt as string,
      expectedAnswer: (row.expected_answer as string | null) ?? null,
    }))
  );
}

/**
 * A question the parent wrote.
 *
 * Kept, so a family builds their own bank over a year and it is
 * genuinely theirs. child_id is deliberately left null: a question about
 * equivalent fractions is worth reusing for a second child, and nobody
 * should have to type it twice.
 */
export async function createItem(
  productInstanceId: string,
  input: { topicKey: string; prompt: string; expectedAnswer: string | null; source: ItemSource }
): Promise<Result<CheckItem>> {
  const user = await currentUserId();
  if (!user.ok) return user;

  const { data, error } = await supabase
    .from("hsc_items")
    .insert({
      product_instance_id: productInstanceId,
      user_id: user.data,
      topic_key: input.topicKey,
      source: input.source,
      prompt: input.prompt.trim(),
      expected_answer: input.expectedAnswer?.trim() || null,
    })
    .select("id, topic_key, source, prompt, expected_answer")
    .single();

  if (error || !data) return err({ kind: "network", message: error?.message ?? "Could not save that question." });
  const row = data as unknown as Record<string, unknown>;
  return ok({
    id: row.id as string,
    topicKey: row.topic_key as string,
    source: row.source as ItemSource,
    prompt: row.prompt as string,
    expectedAnswer: (row.expected_answer as string | null) ?? null,
  });
}

// ----------------------------------------------------------- a check

export interface StartedCheck {
  checkId: string;
  items: { checkItemId: string; itemId: string | null; topicKey: string; prompt: string; expectedAnswer: string | null }[];
}

/**
 * Records the check that was actually asked.
 *
 * The prompts are copied onto hsc_check_items rather than referenced,
 * so a question edited in June cannot rewrite what was asked in March.
 * Same discipline as position_label on a task event.
 */
export async function startCheck(
  productInstanceId: string,
  input: { childId: string; scope: "recent" | "topic" | "earlier"; topicKeys: string[]; seed: string; items: CheckItem[] }
): Promise<Result<StartedCheck>> {
  const user = await currentUserId();
  if (!user.ok) return user;

  const { data: checkRow, error: checkError } = await supabase
    .from("hsc_checks")
    .insert({
      product_instance_id: productInstanceId,
      user_id: user.data,
      child_id: input.childId,
      scope: input.scope,
      topic_keys: input.topicKeys,
      seed: input.seed,
    })
    .select("id")
    .single();

  if (checkError || !checkRow) {
    return err({ kind: "network", message: checkError?.message ?? "Could not start this check." });
  }
  const checkId = (checkRow as { id: string }).id;

  const { data: itemRows, error: itemsError } = await supabase
    .from("hsc_check_items")
    .insert(
      input.items.map((item, index) => ({
        product_instance_id: productInstanceId,
        user_id: user.data,
        check_id: checkId,
        item_id: item.id,
        topic_key: item.topicKey,
        ordinal: index,
        prompt: item.prompt,
        expected_answer: item.expectedAnswer,
      }))
    )
    .select("id, item_id, topic_key, prompt, expected_answer, ordinal");

  if (itemsError || !itemRows) {
    return err({ kind: "network", message: itemsError?.message ?? "Could not prepare the questions." });
  }

  const rows = (itemRows as unknown as Record<string, unknown>[]).sort(
    (a, b) => (a.ordinal as number) - (b.ordinal as number)
  );
  return ok({
    checkId,
    items: rows.map((row) => ({
      checkItemId: row.id as string,
      itemId: (row.item_id as string | null) ?? null,
      topicKey: row.topic_key as string,
      prompt: row.prompt as string,
      expectedAnswer: (row.expected_answer as string | null) ?? null,
    })),
  });
}

export async function recordAnswer(
  productInstanceId: string,
  input: { checkId: string; checkItemId: string; topicKey: string; mark: AnswerMark; response: string | null }
): Promise<Result<null>> {
  const user = await currentUserId();
  if (!user.ok) return user;

  const { error } = await supabase.from("hsc_check_answers").upsert(
    {
      product_instance_id: productInstanceId,
      user_id: user.data,
      check_id: input.checkId,
      check_item_id: input.checkItemId,
      topic_key: input.topicKey,
      mark: input.mark,
      response: input.response?.trim() || null,
    },
    { onConflict: "check_id,check_item_id" }
  );
  if (error) return err({ kind: "network", message: error.message });
  return ok(null);
}

/**
 * Writes the standings, including every "not enough to say".
 *
 * Recorded rather than omitted, so history shows the product was asked
 * and honestly declined, which is a different thing from never having
 * looked.
 */
export async function finishCheck(
  productInstanceId: string,
  input: { checkId: string; childId: string; standings: TopicStanding[] }
): Promise<Result<null>> {
  const user = await currentUserId();
  if (!user.ok) return user;

  if (input.standings.length > 0) {
    const { error: resultsError } = await supabase.from("hsc_check_results").upsert(
      input.standings.map((standing) => ({
        product_instance_id: productInstanceId,
        user_id: user.data,
        check_id: input.checkId,
        child_id: input.childId,
        topic_key: standing.topicKey,
        standing: standing.standing,
        answered: standing.answered,
        right_count: standing.right,
      })),
      { onConflict: "check_id,topic_key" }
    );
    if (resultsError) return err({ kind: "network", message: resultsError.message });
  }

  const { error } = await supabase
    .from("hsc_checks")
    .update({ state: "finished", finished_at: new Date().toISOString() })
    .eq("id", input.checkId);
  if (error) return err({ kind: "network", message: error.message });
  return ok(null);
}

export interface PastResult extends PriorStanding {
  checkId: string;
  createdAt: string;
  answered: number;
  right: number;
}

/** Every standing this child has ever had, newest first. */
export async function loadPastResults(productInstanceId: string, childId: string): Promise<Result<PastResult[]>> {
  const { data, error } = await supabase
    .from("hsc_check_results")
    .select("check_id, topic_key, standing, answered, right_count, created_at")
    .eq("product_instance_id", productInstanceId)
    .eq("child_id", childId)
    .order("created_at", { ascending: false });

  if (error) return err({ kind: "network", message: error.message });
  const rows = (data ?? []) as unknown as Record<string, unknown>[];
  return ok(
    rows.map((row) => ({
      checkId: row.check_id as string,
      topicKey: row.topic_key as string,
      standing: row.standing as Standing,
      answered: row.answered as number,
      right: row.right_count as number,
      createdAt: row.created_at as string,
    }))
  );
}

/** Every standing across all children, for the printed record. */
export async function loadResultsForChild(
  productInstanceId: string,
  childId: string
): Promise<Result<{ createdAt: string; topicKey: string; standing: Standing; answered: number; right: number }[]>> {
  const past = await loadPastResults(productInstanceId, childId);
  if (!past.ok) return past;
  return ok(
    past.data.map((row) => ({
      createdAt: row.createdAt,
      topicKey: row.topicKey,
      standing: row.standing,
      answered: row.answered,
      right: row.right,
    }))
  );
}

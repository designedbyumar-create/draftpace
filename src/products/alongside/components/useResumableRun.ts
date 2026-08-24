"use client";

import { loadOpenRun, startRun, type RunRecord } from "../domain/alongsideData";
import { PLAYBOOK_BY_KEY } from "../playbooks";
import type { Playbook } from "../playbook";
import { ok, err, type Result } from "@/product-framework/result";

export interface ResumableRun {
  playbook: Playbook;
  run: RunRecord;
}

/**
 * Whether opening the Companion for this item means picking up
 * something already in progress, or starting fresh.
 *
 * Checked fresh every time "Do this with me" is pressed rather than kept
 * in state, because a run left open is exactly the kind of fact that
 * goes stale the moment it is cached: it could have been finished, or
 * left, from another tab in the meantime.
 */
export async function findResumableRun(productInstanceId: string, itemId: string): Promise<ResumableRun | null> {
  const found = await loadOpenRun(productInstanceId, itemId);
  if (!found.ok || !found.data) return null;
  const playbook = PLAYBOOK_BY_KEY[found.data.playbookKey];
  // Should not happen: playbook keys are content, not user data, and the
  // library only grows. Falling back to "nothing to resume" is safer
  // than crashing the item on an unrecognised key.
  if (!playbook) return null;
  return { playbook, run: found.data };
}

/**
 * Creates the run a chosen playbook is about to step through.
 *
 * The one and only place startRun is called from. It is deliberately
 * not inside CompanionRun itself: a component that creates a database
 * row as a side effect of mounting will do it again on every remount,
 * including the ones React Strict Mode causes on purpose in development
 * to surface exactly this class of bug, which is how this product ended
 * up with an orphaned run during its own testing. Calling this once,
 * from the click that chose the playbook, and handing the finished
 * result to CompanionRun as a prop, removes the effect instead of
 * guarding it.
 */
export async function beginRun(
  productInstanceId: string,
  playbook: Playbook,
  itemId: string | null
): Promise<Result<RunRecord>> {
  const started = await startRun(productInstanceId, playbook, itemId);
  if (!started.ok) return err(started.error);
  return ok(started.data);
}

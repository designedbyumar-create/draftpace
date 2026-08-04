"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { currentCycleKey, cycleKeyToLabel } from "../cycle";
import {
  findProductInstanceId,
  loadMonthlyMoneyResetState,
  saveMonthlyMoneyResetState,
} from "../data";
import { createEmptyState, MonthlyMoneyResetState } from "../state";
import { computeSafeToSpend } from "../calculations";

export type InstanceStatus = "loading" | "ready" | "no-instance" | "error";
export type SaveStatus = "idle" | "saving" | "saved" | "conflict" | "error";

/**
 * The shared client-side data hook every Monthly Money Reset module uses.
 * Loads the current cycle's instance and state once, then autosaves edits
 * with a short debounce. Revision is tracked in a ref rather than state so
 * persistNow() never closes over a stale value — see
 * docs/products/MONTHLY-MONEY-RESET-STATES.md for the concurrency contract
 * this implements.
 *
 * "no-instance" means the product genuinely has no row for this user/cycle —
 * the correct, honest "not set up yet" state. "error" means a read failed
 * (network, a query error, or state that failed schema validation) and must
 * never be presented the same way: it is recoverable via retry(), and the
 * caller must render an explicit "could not load" state, not "not owned" —
 * see the P0 stability incident, 2026-08-04.
 */
export function useInstanceState(productSlug: string) {
  const [status, setStatus] = useState<InstanceStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [state, setStateInternal] = useState<MonthlyMoneyResetState | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [retryToken, setRetryToken] = useState(0);
  const revisionRef = useRef(1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<MonthlyMoneyResetState | null>(null);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setErrorMessage(null);
    (async () => {
      // The @supabase/ssr browser client hydrates its session from cookies
      // asynchronously. Awaiting getSession() guarantees the client is
      // authenticated before the first RLS-scoped read below, which otherwise
      // races ahead and runs unauthenticated, returning no rows for an
      // instance the user genuinely owns (Platform Home/Library happen to run
      // late enough to avoid this; the product modules query immediately).
      await supabase.auth.getSession();
      if (cancelled) return;
      const cycleKey = currentCycleKey();
      const found = await findProductInstanceId(productSlug, cycleKey);
      if (cancelled) return;
      if (found.status === "error") {
        setErrorMessage(found.message);
        setStatus("error");
        return;
      }
      if (found.status === "not-found") {
        setStatus("no-instance");
        return;
      }
      setInstanceId(found.id);
      const result = await loadMonthlyMoneyResetState(found.id);
      if (cancelled) return;
      if (result.status === "ok") {
        // An instance created by grant_free_product starts with state: '{}'
        // — genuinely empty, not a placeholder. Fill it with a real empty
        // state on first load rather than treating '{}' as an error.
        const isEmpty = Object.keys(result.state as unknown as Record<string, unknown>).length === 0;
        setStateInternal(
          isEmpty ? createEmptyState({ cycleKey, cycleLabel: cycleKeyToLabel(cycleKey) }) : result.state
        );
        revisionRef.current = result.revision;
        setStatus("ready");
      } else if (result.status === "not-found") {
        // The instance row exists but its state row does not (should not
        // normally happen — grant_free_product creates both together — but
        // this is a genuine absence, not a read failure, so it is honest to
        // treat it the same as no-instance rather than as an error).
        setStatus("no-instance");
      } else {
        setErrorMessage(result.message);
        setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productSlug, retryToken]);

  /** Re-runs the load from scratch — the Retry action on the error state. */
  const retry = useCallback(() => {
    setRetryToken((token) => token + 1);
  }, []);

  /**
   * Returns whether the save actually succeeded. A conflict is reported as
   * not-ok too: the caller's in-memory `next` was not the version persisted,
   * so any navigation gated on "my edits are safely saved" must not proceed
   * on a conflict either, even though the hook has already reconciled local
   * state to the server's authoritative copy.
   */
  const persistNow = useCallback(
    async (next: MonthlyMoneyResetState): Promise<boolean> => {
      if (!instanceId) return false;
      setSaveStatus("saving");
      const breakdown = computeSafeToSpend(next);
      const result = await saveMonthlyMoneyResetState({
        instanceId,
        expectedRevision: revisionRef.current,
        state: next,
        setupComplete: Boolean(next.setup.completedAt),
        safeToSpendMinorUnits: breakdown.safeToSpend,
        nextActionLabel: next.nextAction?.label ?? null,
      });

      if (result.status === "ok") {
        revisionRef.current = result.revision;
        setSaveStatus("saved");
        return true;
      }
      if (result.status === "conflict") {
        revisionRef.current = result.revision;
        setStateInternal(result.state);
        setSaveStatus("conflict");
        return false;
      }
      setSaveStatus("error");
      return false;
    },
    [instanceId]
  );

  /** Optimistically updates local state immediately, then autosaves after a short debounce. */
  const setState = useCallback(
    (next: MonthlyMoneyResetState) => {
      setStateInternal(next);
      pendingRef.current = next;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        if (pendingRef.current) persistNow(pendingRef.current);
      }, 700);
    },
    [persistNow]
  );

  /**
   * Flushes any pending debounced save immediately and reports whether it
   * succeeded — used before navigating away from a step. Callers that
   * navigate on completion (e.g. finishing Setup) must check the result and
   * stay put, with the entered values preserved locally, on failure. See the
   * P0 stability incident, 2026-08-04: navigating unconditionally after a
   * failed save is how a real save failure presented as lost progress.
   */
  const forceSave = useCallback((): Promise<boolean> => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (pendingRef.current) return persistNow(pendingRef.current);
    return Promise.resolve(true);
  }, [persistNow]);

  /**
   * Saves `next` and only updates local state once the save is confirmed —
   * unlike setState(), which applies its update optimistically before the
   * write lands. For a consequential, one-shot transition like closing a
   * cycle, applying the "closed" state optimistically and then failing to
   * persist it left the UI looking closed (hiding the retry control) even
   * though nothing was actually saved. See the MMR reliability pass,
   * 2026-08-04.
   */
  const saveDirectly = useCallback(
    async (next: MonthlyMoneyResetState): Promise<boolean> => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      const ok = await persistNow(next);
      if (ok) {
        setStateInternal(next);
        pendingRef.current = null;
      }
      return ok;
    },
    [persistNow]
  );

  return { status, errorMessage, instanceId, state, saveStatus, setState, forceSave, saveDirectly, retry };
}

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
 */
export function useInstanceState(productSlug: string) {
  const [status, setStatus] = useState<InstanceStatus>("loading");
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [state, setStateInternal] = useState<MonthlyMoneyResetState | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const revisionRef = useRef(1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<MonthlyMoneyResetState | null>(null);

  useEffect(() => {
    let cancelled = false;
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
      const id = await findProductInstanceId(productSlug, cycleKey);
      if (cancelled) return;
      if (!id) {
        setStatus("no-instance");
        return;
      }
      setInstanceId(id);
      const result = await loadMonthlyMoneyResetState(id);
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
        setStatus("no-instance");
      } else {
        setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productSlug]);

  const persistNow = useCallback(
    async (next: MonthlyMoneyResetState) => {
      if (!instanceId) return;
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
      } else if (result.status === "conflict") {
        revisionRef.current = result.revision;
        setStateInternal(result.state);
        setSaveStatus("conflict");
      } else {
        setSaveStatus("error");
      }
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

  /** Flushes any pending debounced save immediately — used before navigating away from a step. */
  const forceSave = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (pendingRef.current) return persistNow(pendingRef.current);
    return Promise.resolve();
  }, [persistNow]);

  return { status, instanceId, state, saveStatus, setState, forceSave };
}

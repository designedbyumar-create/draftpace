"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  findPersonalFinanceCompanionInstanceId,
  loadPersonalFinanceCompanionSetupState,
  savePersonalFinanceCompanionSetupState,
} from "../setupStateData";
import { createEmptySetupState, type PersonalFinanceCompanionSetupState } from "../state";

export type SetupInstanceStatus = "loading" | "ready" | "no-instance" | "error";
export type SetupSaveStatus = "idle" | "saving" | "saved" | "conflict" | "error";

/**
 * The shared client-side data hook for Personal Finance Companion's guided
 * setup flow — the autosave/resume foundation the launch spec's phase 8
 * asks for. Mirrors Monthly Money Reset's useInstanceState.ts hook
 * structurally (same debounce, same revision-in-a-ref concurrency
 * handling, same forceSave/saveDirectly distinction), scoped to
 * pfc_setup_state instead of monthly_money_reset_states. See that file's
 * own comments for the reasoning behind each piece — repeated only where
 * it differs below.
 *
 * "no-instance" here should be rare in practice for this product: unlike
 * Monthly Money Reset's free self-serve grant, Personal Finance
 * Companion's entitlement is created by grant_admin_product /
 * grant_purchased_product, which also creates the product_instances row
 * in the same transaction (see supabase/migrations/
 * 202608040001_grant_admin_purchased_and_revoke.sql) — by the time this
 * hook runs, an instance should already exist. It is handled the same
 * honest way regardless, rather than assumed away.
 */
export function useSetupState() {
  const [status, setStatus] = useState<SetupInstanceStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [state, setStateInternal] = useState<PersonalFinanceCompanionSetupState | null>(null);
  const [saveStatus, setSaveStatus] = useState<SetupSaveStatus>("idle");
  const [retryToken, setRetryToken] = useState(0);
  const revisionRef = useRef(1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<PersonalFinanceCompanionSetupState | null>(null);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setErrorMessage(null);
    (async () => {
      // See useInstanceState.ts's identical await — guards against the
      // browser client's session hydrating after this effect's first read.
      await supabase.auth.getSession();
      if (cancelled) return;
      const found = await findPersonalFinanceCompanionInstanceId();
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
      const result = await loadPersonalFinanceCompanionSetupState(found.id);
      if (cancelled) return;
      if (result.status === "ok") {
        setStateInternal(result.state);
        revisionRef.current = result.revision;
        setStatus("ready");
      } else if (result.status === "not-found") {
        // No setup-state row yet for this instance — genuinely absent, not
        // a read failure, and expected before the first autosave (see the
        // save RPC's lazy-create branch). Start from a real empty default
        // at revision 0, so the first save creates the row.
        setStateInternal(createEmptySetupState());
        revisionRef.current = 0;
        setStatus("ready");
      } else {
        setErrorMessage(result.message);
        setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [retryToken]);

  const retry = useCallback(() => {
    setRetryToken((token) => token + 1);
  }, []);

  const persistNow = useCallback(
    async (next: PersonalFinanceCompanionSetupState): Promise<boolean> => {
      if (!instanceId) return false;
      setSaveStatus("saving");
      const result = await savePersonalFinanceCompanionSetupState({
        instanceId,
        expectedRevision: revisionRef.current,
        state: next,
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

  const setState = useCallback(
    (next: PersonalFinanceCompanionSetupState) => {
      setStateInternal(next);
      pendingRef.current = next;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        if (pendingRef.current) persistNow(pendingRef.current);
      }, 700);
    },
    [persistNow]
  );

  const forceSave = useCallback((): Promise<boolean> => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (pendingRef.current) return persistNow(pendingRef.current);
    return Promise.resolve(true);
  }, [persistNow]);

  const saveDirectly = useCallback(
    async (next: PersonalFinanceCompanionSetupState): Promise<boolean> => {
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

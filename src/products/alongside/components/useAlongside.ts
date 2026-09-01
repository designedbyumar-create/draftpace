"use client";

import { useCallback, useEffect, useState } from "react";
import { describeResultError } from "@/product-framework/result";
import { findAlongsideInstanceId } from "../instanceData";
import { loadItems } from "../domain/alongsideData";
import type { LifeItem } from "../life";

export type LoadStatus = "loading" | "ready" | "no-instance" | "error";

/**
 * Loading Life, shared by every surface that shows it.
 *
 * Three screens need the same two facts, and this product recomputes
 * attention on read rather than storing it, so every one of them needs
 * the full item list rather than a pre-filtered slice.
 */
export function useAlongside() {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [items, setItems] = useState<LifeItem[]>([]);

  const load = useCallback(async () => {
    const found = await findAlongsideInstanceId();
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
    const result = await loadItems(found.id);
    if (!result.ok) {
      setErrorMessage(describeResultError(result.error));
      setStatus("error");
      return;
    }
    setItems(result.data);
    setStatus("ready");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /** Applies one changed item in place, so a screen never reloads to show a result. */
  const replaceItem = useCallback((updated: LifeItem) => {
    setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
  }, []);

  const addItem = useCallback((created: LifeItem) => {
    setItems((current) => [created, ...current]);
  }, []);

  return { status, errorMessage, instanceId, items, setErrorMessage, load, replaceItem, addItem };
}

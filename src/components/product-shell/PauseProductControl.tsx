"use client";

import { useEffect, useState } from "react";
import Button from "@/design-system/Button";
import Alert from "@/design-system/Alert";
import { supabase } from "@/lib/supabase/client";
import { setProductInstancePaused } from "@/product-framework/instances";

/**
 * Vacation-mode pause for an ongoing (cycleModel: "continuous") Companion
 * — any such product's own SettingsModule renders this with just the
 * instance id it already has (`<PauseProductControl instanceId={id} />`).
 * Deliberately separate from Monthly Money Reset's own inline pause
 * button in its SettingsModule.tsx: that one calls
 * setProductInstanceLifecycle and leaves for Library, since pausing there
 * closes a whole monthly cycle. This calls setProductInstancePaused
 * instead (a plain, cycle-agnostic flag — see its own migration's comment
 * for why they're kept separate) and stays on the page either way, since
 * pausing an ongoing product isn't leaving anything — it stays fully
 * usable, it just stops competing for Home's attention until resumed.
 *
 * Loads its own current paused_at on mount rather than asking the caller
 * to already know it — every product's own Settings module already has
 * an instanceId lying around from its normal load, and nothing else about
 * this control should depend on how that product's Settings screen is
 * otherwise structured.
 */
export default function PauseProductControl({ instanceId }: { instanceId: string }) {
  const [pausedAt, setPausedAt] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("product_instances")
      .select("paused_at")
      .eq("id", instanceId)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setPausedAt((data?.paused_at as string | null) ?? null);
        setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [instanceId]);

  async function toggle() {
    setPending(true);
    setFailed(false);
    const nextPaused = !pausedAt;
    const result = await setProductInstancePaused(instanceId, nextPaused);
    setPending(false);
    if (!result.ok) {
      setFailed(true);
      return;
    }
    setPausedAt(nextPaused ? new Date().toISOString() : null);
  }

  if (!loaded) return null;

  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-[13px] font-semibold text-[var(--text)]">{pausedAt ? "Paused" : "Pause this product"}</p>
        <p className="mt-0.5 text-[12px] text-[var(--muted)]">
          {pausedAt
            ? "It stays exactly as it is, and won't compete for attention on Home until you resume it."
            : "Going away for a while? Pausing keeps everything as it is and stops it from asking for attention."}
        </p>
        {failed && (
          <div className="mt-2">
            <Alert tone="danger">Couldn&apos;t update this. Nothing changed, try again.</Alert>
          </div>
        )}
      </div>
      <Button variant="secondary" size="sm" onClick={toggle} disabled={pending}>
        {pending ? (pausedAt ? "Resuming…" : "Pausing…") : pausedAt ? "Resume" : "Pause"}
      </Button>
    </div>
  );
}

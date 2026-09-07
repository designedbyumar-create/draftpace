"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * When a product's first-run tour should be open, and how it closes.
 *
 * Extracted because Monthly Money Reset and Personal Finance Companion
 * each carried their own copy of this thirty-line effect, and seven more
 * products were about to need it. The trigger rules are the platform's,
 * not any one product's: a product decides what its steps are, never when
 * a tour is allowed to appear.
 *
 * THE RULES
 *
 * Once per product per device, on the first visit after the product is
 * ready to be toured. `ready` is the product's own gate (Monthly Money
 * Reset waits for setup to be complete, since a tour of an unconfigured
 * Workspace would point at placeholders); a product with no setup step
 * passes `true`.
 *
 * An explicit replay (`?tour=1`, from a Settings link) always opens the
 * tour regardless of the first-use flag, and the param is stripped from
 * the URL immediately so a refresh does not re-trigger it. A replay never
 * touches the first-use flag, so replaying does not make the tour appear
 * again unprompted later.
 *
 * The flag is localStorage, so it is per-device and per-browser: somebody
 * who buys on a laptop and opens on a phone is toured again. That is the
 * honest trade for not writing a row to the database for something this
 * small, and it fails in the harmless direction.
 */
export function useFirstRunTour(slug: string, ready: boolean, destination = "workspace") {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tourOn, setTourOn] = useState(false);
  const replayRequested = searchParams.get("tour") === "1";

  useEffect(() => {
    if (!ready || typeof window === "undefined") return;

    if (replayRequested) {
      setTourOn(true);
      router.replace(`/app/products/${slug}/${destination}`);
      return;
    }

    if (window.localStorage.getItem(storageKey(slug))) return;
    // A short beat so the tour anchors to a settled layout rather than
    // one still resolving its first paint.
    const timer = window.setTimeout(() => setTourOn(true), 550);
    return () => window.clearTimeout(timer);
  }, [ready, slug, destination, replayRequested, router]);

  const finishTour = useCallback(() => {
    setTourOn(false);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(storageKey(slug), "1");
      } catch {
        // A browser refusing storage (private mode, blocked site data) must
        // not break closing the tour. Worst case it opens once more.
      }
    }
  }, [slug]);

  return { tourOn, finishTour };
}

function storageKey(slug: string): string {
  return `draftpace-tour-${slug}`;
}

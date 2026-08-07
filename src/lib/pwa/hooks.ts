"use client";

import { useEffect, useState, useCallback } from "react";

/**
 * Generic PWA install/standalone/connectivity hooks — platform
 * infrastructure, not scoped to any one product, so a future product-
 * specific "Install the Companion" screen (launch spec's PWA install
 * experience section — deliberately not built this session, see
 * docs/products/PERSONAL-FINANCE-COMPANION-FOUNDATION.md) has something
 * real to build on rather than re-deriving this from scratch. The
 * `beforeinstallprompt` handling here is extracted from
 * src/design-system/shell/PlatformShell.tsx's existing InstallPromptCard,
 * which is left as-is (still works, not touched) rather than refactored
 * to use this — see this repository's general policy against
 * opportunistic refactors of already-working, unrelated code.
 */

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/**
 * Whether the app is currently running installed/standalone. Chromium
 * (desktop + Android) reports this via the `display-mode: standalone`
 * media query; iOS Safari has no such query and instead exposes
 * `navigator.standalone` directly on `Navigator` — both are checked, since
 * relying on only one silently misreports the other platform. See the PWA
 * audit's finding that no standalone-mode detection existed anywhere in
 * this repository before this hook.
 */
export function useStandaloneMode(): boolean {
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
    const update = () => setStandalone(mediaQuery.matches || iosStandalone);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return standalone;
}

export type InstallPromptState = {
  /** True once the browser has signaled this page is eligible to install and the prompt hasn't been used yet. Always false on iOS Safari, which never fires `beforeinstallprompt` — see docs/products/PERSONAL-FINANCE-COMPANION-FOUNDATION.md's PWA section for the iOS "Add to Home Screen" instructional-fallback this implies a caller needs instead. */
  canInstall: boolean;
  /** Opens the native install prompt. Resolves to the user's choice, or null if there was nothing to prompt. */
  promptInstall: () => Promise<"accepted" | "dismissed" | null>;
};

export function useInstallPrompt(): InstallPromptState {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setPromptEvent(null);
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<"accepted" | "dismissed" | null> => {
    if (!promptEvent) return null;
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    setPromptEvent(null);
    return choice.outcome;
  }, [promptEvent]);

  return { canInstall: promptEvent !== null, promptInstall };
}

/**
 * Online/offline connectivity — the foundation for the explicit offline
 * states the launch spec's phase 11 requires (online / temporarily
 * offline / save failed / retry available / stale cached read). Does not
 * itself queue or retry anything — see
 * docs/products/PERSONAL-FINANCE-COMPANION-FOUNDATION.md's offline
 * contract for why this product deliberately has no optimistic offline
 * write queue.
 */
export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return online;
}

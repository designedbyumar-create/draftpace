"use client";

/**
 * Device-local install-prompt dismissal — deliberately `localStorage`, not
 * account/product state. Mirrors push_subscriptions' own device-scoping:
 * whether this specific browser has already been asked to install belongs
 * to the device, not to the user's account or any product's financial
 * state, and must never cross devices or suppress the prompt everywhere
 * from one dismissal elsewhere.
 */

const INSTALL_PROMPT_DISMISSED_KEY = "dp_install_prompt_dismissed";

export function hasDismissedInstallPrompt(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(INSTALL_PROMPT_DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

export function dismissInstallPrompt(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(INSTALL_PROMPT_DISMISSED_KEY, "1");
  } catch {
    // Storage unavailable (private browsing, quota) — worst case the card
    // reappears next visit, which is safe, never destructive.
  }
}

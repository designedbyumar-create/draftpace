/**
 * Shared client-side snooze state for Attention items — one storage key so
 * Workspace's "Needs a look" preview and the full Attention destination
 * always agree on what's currently hidden. This device only, and never a
 * second source of truth for whether the underlying issue is resolved:
 * snoozing an item never changes the record it points at.
 */
const SNOOZE_STORAGE_KEY = "pfc-attention-snoozed";
const SNOOZE_DAYS = 7;

export function readSnoozed(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(SNOOZE_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export function writeSnoozed(value: Record<string, string>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SNOOZE_STORAGE_KEY, JSON.stringify(value));
}

export function snoozeUntil(now: Date): string {
  return new Date(now.getTime() + SNOOZE_DAYS * 24 * 60 * 60 * 1000).toISOString();
}

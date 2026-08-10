"use client";

import { supabase } from "@/lib/supabase/client";

/**
 * Browser-side Web Push plumbing — platform-level (not PFC-specific),
 * since a push subscription belongs to the device/account, not to one
 * product. Every capability check here reflects real browser state; none
 * of it fakes a "supported" or "granted" result the way a hardcoded flag
 * would (Stage F §26).
 */

export type PushCapability =
  | "unsupported"
  | "denied"
  | "default"
  | "granted-not-subscribed"
  | "subscribed";

export async function detectPushCapability(): Promise<PushCapability> {
  if (typeof window === "undefined") return "unsupported";
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return "unsupported";

  const permission = Notification.permission;
  if (permission === "denied") return "denied";
  if (permission === "default") return "default";

  const registration = await navigator.serviceWorker.ready.catch(() => null);
  if (!registration) return "granted-not-subscribed";
  const existing = await registration.pushManager.getSubscription().catch(() => null);
  return existing ? "subscribed" : "granted-not-subscribed";
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

/** True only when `existing` is bound to the exact same VAPID public key as `currentKey`. */
export function subscriptionMatchesKey(existing: PushSubscription, currentKey: Uint8Array): boolean {
  const bound = existing.options?.applicationServerKey;
  if (!bound) return false;
  const boundBytes = new Uint8Array(bound);
  if (boundBytes.length !== currentKey.length) return false;
  for (let i = 0; i < currentKey.length; i++) {
    if (boundBytes[i] !== currentKey[i]) return false;
  }
  return true;
}

async function authHeader(): Promise<Record<string, string>> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return {};
  return { Authorization: `Bearer ${session.access_token}` };
}

export type SubscribeResult = { ok: true } | { ok: false; reason: "unsupported" | "permission-denied" | "no-public-key" | "network" };

/** Requests OS/browser permission (only ever call this from a deliberate user action, never on page load) and, once granted, registers a real push subscription with the server. */
export async function subscribeToPush(): Promise<SubscribeResult> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    return { ok: false, reason: "unsupported" };
  }
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!publicKey) return { ok: false, reason: "no-public-key" };

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return { ok: false, reason: "permission-denied" };

  const registration = await navigator.serviceWorker.ready;
  const applicationServerKey = urlBase64ToUint8Array(publicKey);
  let subscription = await registration.pushManager.getSubscription();

  // A subscription bound to a VAPID key that's since been rotated can never
  // be delivered to by the current VAPID_PRIVATE_KEY — reusing it here
  // would silently persist a dead subscription server-side. Rather than
  // relying on the caller to remember to turn notifications off and back on
  // after a rotation, detect the mismatch and transparently replace it.
  // Re-subscribing when uncertain (e.g. .options is unexpectedly empty) is
  // always safe — it's idempotent and never loses data — so this errs
  // toward refreshing rather than reusing.
  if (subscription && !subscriptionMatchesKey(subscription, applicationServerKey)) {
    await subscription.unsubscribe();
    subscription = null;
  }
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey as BufferSource,
    });
  }

  const headers = await authHeader();
  if (!headers.Authorization) return { ok: false, reason: "network" };

  const response = await fetch("/api/notifications/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(subscription.toJSON()),
  });
  return response.ok ? { ok: true } : { ok: false, reason: "network" };
}

export async function unsubscribeFromPush(): Promise<boolean> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return false;
  const registration = await navigator.serviceWorker.ready.catch(() => null);
  if (!registration) return false;
  const subscription = await registration.pushManager.getSubscription().catch(() => null);
  if (!subscription) return true;

  const headers = await authHeader();
  await fetch("/api/notifications/unsubscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({ endpoint: subscription.endpoint }),
  }).catch(() => null);

  return subscription.unsubscribe();
}

export async function sendTestPush(): Promise<{ ok: boolean; message: string }> {
  const headers = await authHeader();
  if (!headers.Authorization) return { ok: false, message: "Please sign in first." };
  const response = await fetch("/api/notifications/test", { method: "POST", headers });
  const body = await response.json().catch(() => ({}));
  return { ok: response.ok, message: body.message ?? body.error ?? (response.ok ? "Test notification sent." : "Could not send a test notification.") };
}

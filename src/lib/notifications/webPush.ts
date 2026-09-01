import webpush from "web-push";

/**
 * Server-only Web Push sending. VAPID_PRIVATE_KEY never leaves this
 * module's process — it's read from env, never returned, logged, or sent
 * to any client. Returns a clear "not configured" result rather than
 * throwing when the keys are missing, so callers (the cron evaluator, the
 * test-send route) can report that honestly instead of crashing.
 */

export interface WebPushSubscriptionInput {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export type SendOutcome = { outcome: "sent" } | { outcome: "gone" } | { outcome: "failed"; statusCode?: number } | { outcome: "notConfigured" };

let configured = false;

function ensureConfigured(): boolean {
  if (configured) return true;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) return false;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
  return true;
}

export function isWebPushConfigured(): boolean {
  return ensureConfigured();
}

export async function sendWebPush(
  subscription: WebPushSubscriptionInput,
  payload: { title: string; body: string; url: string }
): Promise<SendOutcome> {
  if (!ensureConfigured()) return { outcome: "notConfigured" };

  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return { outcome: "sent" };
  } catch (error) {
    const statusCode = (error as { statusCode?: number }).statusCode;
    if (statusCode === 404 || statusCode === 410) return { outcome: "gone" };
    return { outcome: "failed", statusCode };
  }
}

// Stand-in for lib/notifications/pushClient.ts. A headless file:// page has no service worker, so the real
// detectPushCapability() would answer "unsupported". Someone who has reminders switched on has, by definition,
// granted permission and subscribed this device, so that is what the stub says.
export type PushCapability = "unsupported" | "denied" | "default" | "granted-not-subscribed" | "subscribed";
export async function detectPushCapability(): Promise<PushCapability> { return "subscribed"; }
export async function subscribeToPush() { return { ok: true as const }; }
export async function unsubscribeFromPush() { return true; }
export async function sendTestPush() { return { ok: true, message: "capture harness: nothing is sent" }; }
export function subscriptionMatchesKey() { return true; }

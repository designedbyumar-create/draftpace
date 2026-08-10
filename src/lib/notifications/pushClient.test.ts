import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { subscriptionMatchesKey } from "./pushClient";

function fakeSubscription(applicationServerKey: ArrayBuffer | null): PushSubscription {
  return { options: { applicationServerKey } } as unknown as PushSubscription;
}

describe("subscriptionMatchesKey", () => {
  it("returns true when the subscription is bound to the exact same key", () => {
    const key = new Uint8Array([1, 2, 3, 4]);
    const sub = fakeSubscription(key.buffer as ArrayBuffer);
    expect(subscriptionMatchesKey(sub, key)).toBe(true);
  });

  it("returns false when the subscription is bound to a different key (e.g. after a VAPID rotation)", () => {
    const oldKey = new Uint8Array([1, 2, 3, 4]);
    const newKey = new Uint8Array([9, 9, 9, 9]);
    const sub = fakeSubscription(oldKey.buffer as ArrayBuffer);
    expect(subscriptionMatchesKey(sub, newKey)).toBe(false);
  });

  it("returns false when the keys differ only in length", () => {
    const shortKey = new Uint8Array([1, 2, 3]);
    const longKey = new Uint8Array([1, 2, 3, 4]);
    const sub = fakeSubscription(shortKey.buffer as ArrayBuffer);
    expect(subscriptionMatchesKey(sub, longKey)).toBe(false);
  });

  it("returns false (never assumes a match) when the subscription has no applicationServerKey on record", () => {
    const key = new Uint8Array([1, 2, 3, 4]);
    const sub = fakeSubscription(null);
    expect(subscriptionMatchesKey(sub, key)).toBe(false);
  });
});

describe("subscribeToPush: recovers from a stale VAPID-key subscription", () => {
  const ORIGINAL_ENV = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB";
    vi.resetModules();
    vi.doMock("@/lib/supabase/client", () => ({
      supabase: { auth: { getSession: async () => ({ data: { session: { access_token: "tok" } } }) } },
    }));
    vi.stubGlobal("window", {
      atob: (s: string) => Buffer.from(s, "base64").toString("binary"),
      PushManager: {},
    });
    vi.stubGlobal("Notification", { requestPermission: vi.fn().mockResolvedValue("granted") });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = ORIGINAL_ENV;
    vi.unstubAllGlobals();
    vi.doUnmock("@/lib/supabase/client");
    vi.resetModules();
  });

  it("unsubscribes a key-mismatched subscription and creates a fresh one, instead of silently reusing it", async () => {
    const staleUnsubscribe = vi.fn().mockResolvedValue(true);
    const staleSubscription = {
      // Bound to a different (pre-rotation) key than NEXT_PUBLIC_VAPID_PUBLIC_KEY above.
      options: { applicationServerKey: new Uint8Array([9, 9, 9]).buffer },
      unsubscribe: staleUnsubscribe,
    };
    const freshSubscription = { toJSON: () => ({ endpoint: "https://example.com/fresh" }) };

    const subscribe = vi.fn().mockResolvedValue(freshSubscription);
    const getSubscription = vi.fn().mockResolvedValue(staleSubscription);

    vi.stubGlobal("navigator", {
      serviceWorker: { ready: Promise.resolve({ pushManager: { getSubscription, subscribe } }) },
    });

    const { subscribeToPush } = await import("./pushClient");
    const result = await subscribeToPush();

    expect(staleUnsubscribe).toHaveBeenCalledTimes(1);
    expect(subscribe).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ ok: true });
  });

  it("does not unsubscribe or resubscribe when no existing subscription is present", async () => {
    const freshSubscription = { toJSON: () => ({ endpoint: "https://example.com/fresh" }) };
    const subscribe = vi.fn().mockResolvedValue(freshSubscription);
    const getSubscription = vi.fn().mockResolvedValue(null);

    vi.stubGlobal("navigator", {
      serviceWorker: { ready: Promise.resolve({ pushManager: { getSubscription, subscribe } }) },
    });

    const { subscribeToPush } = await import("./pushClient");
    const result = await subscribeToPush();

    expect(subscribe).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ ok: true });
  });
});

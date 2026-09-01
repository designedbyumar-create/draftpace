import { describe, expect, it, vi } from "vitest";
import { appAccountMenuItems, publicSignedInAccountMenuItems } from "./accountMenuItems";

describe("appAccountMenuItems", () => {
  it("includes Visit Draftpace website, routing to / as a plain link", () => {
    const items = appAccountMenuItems(() => {});
    const visitSite = items.find((item) => item.key === "visit-site");
    expect(visitSite?.label).toBe("Visit Draftpace website");
    expect(visitSite?.href).toBe("/");
  });

  it("Visit Draftpace website carries no onSelect at all, so it cannot invoke sign-out or any other side effect", () => {
    const items = appAccountMenuItems(() => {});
    const visitSite = items.find((item) => item.key === "visit-site");
    expect(visitSite?.onSelect).toBeUndefined();
  });

  it("only the sign-out item calls the provided handler; every other item is a plain href", () => {
    const onSignOut = vi.fn();
    const items = appAccountMenuItems(onSignOut);

    const signOut = items.find((item) => item.key === "sign-out");
    expect(signOut?.href).toBeUndefined();
    signOut?.onSelect?.();
    expect(onSignOut).toHaveBeenCalledTimes(1);

    for (const item of items.filter((entry) => entry.key !== "sign-out")) {
      expect(item.href).toEqual(expect.stringMatching(/^\//));
      expect(item.onSelect).toBeUndefined();
    }
  });

  it("has the exact route targets Account, Settings, and Billing point to", () => {
    const items = appAccountMenuItems(() => {});
    expect(items.find((item) => item.key === "account")?.href).toBe("/app/account");
    expect(items.find((item) => item.key === "settings")?.href).toBe("/app/settings");
    expect(items.find((item) => item.key === "billing")?.href).toBe("/app/billing");
  });
});

describe("publicSignedInAccountMenuItems", () => {
  it("Open Draftpace routes to /app", () => {
    const items = publicSignedInAccountMenuItems(() => {});
    expect(items.find((item) => item.key === "open-app")?.href).toBe("/app");
  });

  it("includes Library and Account with the correct targets", () => {
    const items = publicSignedInAccountMenuItems(() => {});
    expect(items.find((item) => item.key === "library")?.href).toBe("/app/library");
    expect(items.find((item) => item.key === "account")?.href).toBe("/app/account");
  });

  it("sign-out calls the provided handler and carries no href", () => {
    const onSignOut = vi.fn();
    const items = publicSignedInAccountMenuItems(onSignOut);
    const signOut = items.find((item) => item.key === "sign-out");
    expect(signOut?.href).toBeUndefined();
    signOut?.onSelect?.();
    expect(onSignOut).toHaveBeenCalledTimes(1);
  });
});

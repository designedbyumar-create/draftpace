import { describe, expect, it } from "vitest";
import { mapAlongsideSignal, mapHmcItem, mapPfcItem, pickTopAttentionItem, type SharedAttentionItem } from "./attentionAdapter";
import type { AttentionItem as PfcAttentionItem } from "@/products/personal-finance-companion/attention";
import type { AttentionItem as HmcAttentionItem } from "@/products/home-management-companion/attention";
import type { AttentionSignal as AlongsideAttentionSignal } from "@/products/alongside/attention";

describe("mapPfcItem", () => {
  it("maps a needsResolution item to critical, carrying its own message and deep link through unchanged", () => {
    const item: PfcAttentionItem = {
      id: "billMissingDueDate:b1",
      kind: "billMissingDueDate",
      urgency: "needsResolution",
      area: "bills",
      entityId: "b1",
      message: "Rent needs a due date.",
      deepLink: "/app/products/personal-finance-companion/bills?focus=b1",
    };
    expect(mapPfcItem(item)).toEqual({
      id: "billMissingDueDate:b1",
      productSlug: "personal-finance-companion",
      severity: "critical",
      title: "Bill is missing a due date",
      detail: "Rent needs a due date.",
      href: "/app/products/personal-finance-companion/bills?focus=b1",
    });
  });

  it("maps a worthAWhile item to advisory", () => {
    const item: PfcAttentionItem = {
      id: "accountStale:a1",
      kind: "accountStale",
      urgency: "worthAWhile",
      area: "accounts",
      entityId: "a1",
      message: "Checking balance has not been updated recently.",
      deepLink: "/app/products/personal-finance-companion/accounts?focus=a1",
    };
    expect(mapPfcItem(item).severity).toBe("advisory");
  });
});

describe("mapHmcItem", () => {
  it("maps a soon item to critical and keeps its own href", () => {
    const item: HmcAttentionItem = {
      id: "problem:p1",
      kind: "problem",
      urgency: "soon",
      entityId: "p1",
      title: "Leak under the sink",
      detail: "Reported as a problem",
      href: "/app/products/home-management-companion/item/thing1",
    };
    expect(mapHmcItem(item, "instance-1")).toEqual({
      id: "problem:p1",
      productSlug: "home-management-companion",
      severity: "critical",
      title: "Leak under the sink",
      detail: "Reported as a problem",
      href: "/app/products/home-management-companion/item/thing1",
    });
  });

  it("maps a canWait item to advisory", () => {
    const item: HmcAttentionItem = {
      id: "maintenanceDue:t1",
      kind: "maintenanceDue",
      urgency: "canWait",
      entityId: "t1",
      title: "Change AC filter",
      detail: "Last done 4 months ago, usually every 3 months",
      href: null,
    };
    expect(mapHmcItem(item, "instance-1").severity).toBe("advisory");
  });

  it("falls back to the instance itself when the item has no href of its own", () => {
    const item: HmcAttentionItem = {
      id: "maintenanceDue:t1",
      kind: "maintenanceDue",
      urgency: "canWait",
      entityId: "t1",
      title: "Change AC filter",
      detail: "Last done 4 months ago",
      href: null,
    };
    expect(mapHmcItem(item, "instance-1").href).toBe("/app/products/home-management-companion/item/instance-1");
  });
});

describe("mapAlongsideSignal", () => {
  it("is always quiet — Alongside's weight is sort-only, never urgency, per its own file", () => {
    const signal: AlongsideAttentionSignal = {
      itemId: "i1",
      reason: "coming-up",
      line: "Coming up in 3 days",
      weight: 297,
    };
    expect(mapAlongsideSignal(signal).severity).toBe("quiet");
    expect(mapAlongsideSignal(signal).detail).toBe("Coming up in 3 days");
  });
});

describe("pickTopAttentionItem", () => {
  const critical = (productSlug: string): SharedAttentionItem => ({
    id: `${productSlug}-critical`,
    productSlug,
    severity: "critical",
    title: "Critical",
    detail: "detail",
    href: "/href",
  });
  const advisory = (productSlug: string): SharedAttentionItem => ({
    id: `${productSlug}-advisory`,
    productSlug,
    severity: "advisory",
    title: "Advisory",
    detail: "detail",
    href: "/href",
  });
  const quiet = (productSlug: string): SharedAttentionItem => ({
    id: `${productSlug}-quiet`,
    productSlug,
    severity: "quiet",
    title: "Quiet",
    detail: "detail",
    href: "/href",
  });

  it("picks a critical item over an advisory one, regardless of which product was used more recently", () => {
    const result = pickTopAttentionItem([
      { items: [advisory("home-management-companion")], lastActivityAt: "2026-09-05T00:00:00Z" },
      { items: [critical("personal-finance-companion")], lastActivityAt: "2026-08-01T00:00:00Z" },
    ]);
    expect(result?.productSlug).toBe("personal-finance-companion");
  });

  it("breaks a same-severity tie by most recent activity", () => {
    const result = pickTopAttentionItem([
      { items: [advisory("home-management-companion")], lastActivityAt: "2026-09-01T00:00:00Z" },
      { items: [advisory("personal-finance-companion")], lastActivityAt: "2026-09-04T00:00:00Z" },
    ]);
    expect(result?.productSlug).toBe("personal-finance-companion");
  });

  it("never lets a quiet-only product win the hero slot", () => {
    const result = pickTopAttentionItem([{ items: [quiet("alongside")], lastActivityAt: "2026-09-05T00:00:00Z" }]);
    expect(result).toBeNull();
  });

  it("returns null when nothing has anything to report", () => {
    expect(pickTopAttentionItem([])).toBeNull();
    expect(pickTopAttentionItem([{ items: [], lastActivityAt: "2026-09-01T00:00:00Z" }])).toBeNull();
  });
});

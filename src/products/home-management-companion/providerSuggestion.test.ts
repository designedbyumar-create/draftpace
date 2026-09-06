import { describe, expect, it } from "vitest";
import { suggestProviderForItem } from "./providerSuggestion";
import type { HomeItem, ServiceProvider } from "./state";

function item(overrides: Partial<HomeItem> = {}): HomeItem {
  return {
    id: "item-1",
    name: "Water heater",
    type: "water-heater",
    brand: null,
    model: null,
    location: null,
    purchaseDate: null,
    installDate: null,
    warrantyExpiresAt: null,
    buySpec: null,
    documentLink: null,
    notes: null,
    status: "active",
    needsReviewReason: null,
    source: "manual",
    importSessionId: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function provider(overrides: Partial<ServiceProvider> = {}): ServiceProvider {
  return {
    id: "provider-1",
    name: "Ace Plumbing",
    category: "water",
    phone: null,
    email: null,
    lastUsedAt: "2026-06-01",
    notes: null,
    status: "active",
    needsReviewReason: null,
    source: "manual",
    importSessionId: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("suggestProviderForItem", () => {
  it("returns null when the item isn't found", () => {
    expect(suggestProviderForItem("missing", [item()], [provider()])).toBeNull();
  });

  it("returns null for an unrecognised, custom type with no category", () => {
    const custom = item({ type: "sump-pump-custom-thing" });
    expect(suggestProviderForItem(custom.id, [custom], [provider()])).toBeNull();
  });

  it("returns null when no provider has ever worked in that category", () => {
    const result = suggestProviderForItem("item-1", [item()], [provider({ category: "power" })]);
    expect(result).toBeNull();
  });

  it("suggests the matching provider with a human category label", () => {
    const result = suggestProviderForItem("item-1", [item()], [provider()]);
    expect(result).toEqual({ provider: provider(), categoryLabel: "Water and plumbing" });
  });

  it("ignores an archived provider even if the category matches", () => {
    const result = suggestProviderForItem("item-1", [item()], [provider({ status: "archived" })]);
    expect(result).toBeNull();
  });

  it("picks the most recently used provider when more than one matches", () => {
    const older = provider({ id: "p-old", name: "Old Plumbing", lastUsedAt: "2025-01-01" });
    const newer = provider({ id: "p-new", name: "New Plumbing", lastUsedAt: "2026-08-01" });
    const result = suggestProviderForItem("item-1", [item()], [older, newer]);
    expect(result?.provider.id).toBe("p-new");
  });
});

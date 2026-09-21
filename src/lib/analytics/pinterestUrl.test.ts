import { describe, expect, it, afterEach } from "vitest";
import { buildPinterestUrl } from "./pinterestUrl";

const ORIGINAL_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

afterEach(() => {
  // Assigning `undefined` to a process.env property coerces it to the
  // literal string "undefined" rather than deleting it — exactly the kind
  // of silent-truthy-string bug this file's own siteUrl() fallback exists
  // to survive, so it would be a poor irony to reintroduce it here.
  if (ORIGINAL_SITE_URL === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
  else process.env.NEXT_PUBLIC_SITE_URL = ORIGINAL_SITE_URL;
});

describe("buildPinterestUrl", () => {
  it("produces the exact URL shape the taxonomy specifies", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://draftpace.com";
    const url = buildPinterestUrl({ path: "/shop/personal-finance-companion", campaign: "personal_finance_companion", pinId: "pfc_001" });
    expect(url).toBe(
      "https://draftpace.com/shop/personal-finance-companion?utm_source=pinterest&utm_medium=organic_social&utm_campaign=personal_finance_companion&utm_content=pfc_001"
    );
  });

  it("gives two different Pins for the same product two distinguishable URLs", () => {
    const base = { path: "/free", campaign: "monthly_money_reset" };
    const first = buildPinterestUrl({ ...base, pinId: "mmr_001" });
    const second = buildPinterestUrl({ ...base, pinId: "mmr_002" });
    expect(first).not.toBe(second);
    expect(new URL(first).searchParams.get("utm_content")).toBe("mmr_001");
    expect(new URL(second).searchParams.get("utm_content")).toBe("mmr_002");
  });

  it("includes utm_term only when given one, never as a blank parameter", () => {
    const withoutTerm = buildPinterestUrl({ path: "/free", campaign: "x", pinId: "x_001" });
    expect(new URL(withoutTerm).searchParams.has("utm_term")).toBe(false);

    const withTerm = buildPinterestUrl({ path: "/free", campaign: "x", pinId: "x_001", term: "budgeting" });
    expect(new URL(withTerm).searchParams.get("utm_term")).toBe("budgeting");
  });

  it("always sets organic Pinterest source and medium, regardless of campaign or Pin id", () => {
    const url = new URL(buildPinterestUrl({ path: "/shop/travel-companion", campaign: "anything", pinId: "anything_001" }));
    expect(url.searchParams.get("utm_source")).toBe("pinterest");
    expect(url.searchParams.get("utm_medium")).toBe("organic_social");
  });

  it("falls back to the production domain, and honours NEXT_PUBLIC_SITE_URL when a preview deployment sets it", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    expect(buildPinterestUrl({ path: "/free", campaign: "x", pinId: "x_001" }).startsWith("https://draftpace.com/free")).toBe(true);

    process.env.NEXT_PUBLIC_SITE_URL = "https://preview-123.vercel.app";
    expect(buildPinterestUrl({ path: "/free", campaign: "x", pinId: "x_001" }).startsWith("https://preview-123.vercel.app/free")).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import * as route from "./route";

/**
 * Structural coverage, matching monthly-money-reset/routes.test.ts's
 * approach: this route can't be exercised end-to-end without a mocked
 * Supabase client (no such harness exists in this repo yet — see that
 * file's own note on the testing gap), so the entitlement-gate properties
 * that matter are checked against the source text instead. This mirrors
 * exactly what routes.test.ts already does for
 * [productSlug]/layout.tsx's entitlement gate, since this route
 * deliberately repeats that same gate rather than relying on the layout
 * (route handlers aren't wrapped by page layouts).
 */
describe("GET /api/products/[productSlug]/printables/[assetId]", () => {
  it("exports GET", () => {
    expect(typeof route.GET).toBe("function");
  });

  const source = readFileSync(
    join(process.cwd(), "src/app/api/products/[productSlug]/printables/[assetId]/route.ts"),
    "utf-8"
  );

  it("redirects signed-out requests to login rather than serving anything", () => {
    expect(source).toContain("if (!user) {");
    const signedOutBlockMatch = source.match(/if \(!user\) \{([\s\S]*?)\n {2}\}/);
    expect(signedOutBlockMatch).not.toBeNull();
    expect(signedOutBlockMatch?.[1]).toContain("NextResponse.redirect");
    expect(signedOutBlockMatch?.[1]).toContain("/login");
  });

  it("queries for an active, non-revoked entitlement scoped to this product, matching the layout gate", () => {
    expect(source).toContain('.from("entitlements")');
    expect(source).toContain('.eq("product_slug", productSlug)');
    expect(source).toContain('.eq("is_active", true)');
    expect(source).toContain('.is("revoked_at", null)');
  });

  it("never treats a failed entitlement read as not-entitled", () => {
    const errorBlockMatch = source.match(/if \(error\) \{([\s\S]*?)\n {2}\}/);
    expect(errorBlockMatch).not.toBeNull();
    expect(errorBlockMatch?.[1]).not.toContain("/app/activate");
  });

  it("redirects to activation only once a missing entitlement is confirmed", () => {
    expect(source).toContain("if (!entitlement) {");
    const notEntitledBlockMatch = source.match(/if \(!entitlement\) \{([\s\S]*?)\n {2}\}/);
    expect(notEntitledBlockMatch).not.toBeNull();
    expect(notEntitledBlockMatch?.[1]).toContain("/app/activate/${productSlug}");
  });

  it("checks entitlement before ever calling the asset-bytes loader", () => {
    const entitlementCheckIndex = source.indexOf('.from("entitlements")');
    // The route picks a per-product loader and then invokes it, so this
    // matches the invocation rather than any one product's function name.
    const bytesCallIndex = source.indexOf("loader(assetId)");
    expect(entitlementCheckIndex).toBeGreaterThan(-1);
    expect(bytesCallIndex).toBeGreaterThan(-1);
    expect(entitlementCheckIndex).toBeLessThan(bytesCallIndex);
  });

  it("selects the asset-bytes loader from the same slug the entitlement was checked against", () => {
    // The guard against one product's entitlement serving another's bytes:
    // both the query and the loader choice key off `productSlug`, and the
    // loader is only resolved after the entitlement branches have run.
    const entitlementCheckIndex = source.indexOf('.eq("product_slug", productSlug)');
    const loaderChoiceIndex = source.indexOf("const loader =");
    expect(entitlementCheckIndex).toBeGreaterThan(-1);
    expect(loaderChoiceIndex).toBeGreaterThan(-1);
    expect(entitlementCheckIndex).toBeLessThan(loaderChoiceIndex);
    expect(source.slice(loaderChoiceIndex, source.indexOf("loader(assetId)"))).toContain("productSlug ===");
  });

  it("serves nothing for a product with no printable loader", () => {
    expect(source).toContain("if (!loader) {");
  });

  it("uses the real server Supabase client, so RLS applies to the check", () => {
    expect(source).toContain("createSupabaseServerClient");
  });

  it("serves the file with a private, non-cached, attachment disposition", () => {
    expect(source).toContain('"Content-Type": "application/pdf"');
    expect(source).toContain("Content-Disposition");
    expect(source).toContain("attachment;");
    expect(source).toContain('"Cache-Control": "private, no-store"');
  });
});

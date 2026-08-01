import { describe, expect, it } from "vitest";
import * as route from "./route";

/**
 * The core safety property this endpoint depends on: there is no GET
 * handler. Next.js returns 405 for any method without an export, so a GET
 * request, a <Link> prefetch, a crawler, or a link-preview bot can never
 * reach the grant logic. This test fails loudly if a GET export is ever
 * added back.
 */
describe("POST /api/products/[productSlug]/activate", () => {
  it("exports POST", () => {
    expect(typeof route.POST).toBe("function");
  });

  it("exports no GET, HEAD, or PUT handler", () => {
    expect("GET" in route).toBe(false);
    expect("HEAD" in route).toBe(false);
    expect("PUT" in route).toBe(false);
  });
});

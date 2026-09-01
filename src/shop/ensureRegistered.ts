import { registerShopFixtures } from "./fixtures";
import { registerRealShopProducts } from "./products";

/**
 * shopRegistry is populated at request time by module-level singletons.
 * (marketing)/layout.tsx calls this before rendering any child route, but
 * Next.js can skip re-invoking a shared layout's render function on a
 * client-side soft navigation between two routes under the same layout
 * segment (Layouts persist across navigations by design) - so a request
 * that only re-renders a leaf page can arrive with an unregistered
 * registry. Both registration calls are idempotent (guarded by their own
 * `registered` flag), so calling this again here is cheap and makes every
 * route that reads shopRegistry self-sufficient regardless of layout
 * execution order. Every route calling this must also export
 * `dynamic = "force-dynamic"`: without it, Next.js can cache a stale
 * empty-registry render (build time or a cold serverless instance) and
 * serve it until the next deploy, "hard refresh always works, client-side
 * nav occasionally shows an empty Store" reported live on production.
 */
export function ensureShopRegistered(): void {
  registerShopFixtures();
  registerRealShopProducts();
}

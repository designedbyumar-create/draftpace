import type { FinancialArea } from "./state";

/**
 * The one typed destination model every Attention item, notification, and
 * reminder resolves through — never a raw/arbitrary URL. Every target
 * stays inside the entitlement-protected product routes; nothing here can
 * point anywhere else. See docs on Attention/notification architecture
 * for why this exists as its own tiny module rather than living inside
 * attention.ts or notifications.ts: both need the identical mapping.
 */

const BASE = "/app/products/personal-finance-companion";

export type SafeDeepLinkTarget =
  | { kind: "area"; area: FinancialArea; focusId?: string }
  | { kind: "reviewQueue" }
  | { kind: "attention" }
  | { kind: "companionResume" }
  | { kind: "setupCentre" };

export function resolveSafeDeepLink(target: SafeDeepLinkTarget): string {
  switch (target.kind) {
    case "area":
      return target.focusId ? `${BASE}/${target.area}?focus=${target.focusId}` : `${BASE}/${target.area}`;
    case "reviewQueue":
      return `${BASE}/transactions?filter=review`;
    case "attention":
      return `${BASE}/workspace?panel=attention`;
    case "companionResume":
      return `${BASE}/start`;
    case "setupCentre":
      return `${BASE}/setup-centre`;
  }
}

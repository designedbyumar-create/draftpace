/**
 * Deliberately not "use client" — the same split as buttonStyles.ts from
 * Button.tsx: src/app/admin/support/page.tsx is a Server Component and
 * needs this plain data, and importing a value (even a non-component one)
 * from a "use client" module turns it into a client-reference proxy
 * rather than the real array, breaking a server-side .map() over it. This
 * file has no client-only code, so it carries no such boundary.
 */

export const SUPPORT_CATEGORIES = [
  { value: "account", label: "Account and access" },
  { value: "product", label: "Product access" },
  { value: "technical", label: "Technical issue" },
  { value: "privacy", label: "Privacy or data request" },
  { value: "other", label: "Something else" },
] as const;

export type SupportCategory = (typeof SUPPORT_CATEGORIES)[number]["value"];

import type { Provider, ProviderKind } from "./state";

export const PROVIDER_LABEL: Record<ProviderKind, string> = {
  doctor: "Doctor",
  specialist: "Specialist",
  dentist: "Dentist",
  pharmacy: "Pharmacy",
  other: "Other",
};

const ORDER: ProviderKind[] = ["doctor", "specialist", "dentist", "pharmacy", "other"];

/** One person's active providers, the main doctor first, in the order a form asks for them. */
export function careTeam(providers: Provider[], memberId: string): Provider[] {
  return providers
    .filter((p) => p.familyMemberId === memberId && p.status === "active")
    .sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind) || (a.createdAt < b.createdAt ? -1 : 1));
}

/** The first doctor entered, which is the one forms mean by "primary". */
export function primaryDoctor(providers: Provider[], memberId: string): Provider | null {
  return careTeam(providers, memberId).find((p) => p.kind === "doctor") ?? null;
}

export function pharmacyFor(providers: Provider[], memberId: string): Provider | null {
  return careTeam(providers, memberId).find((p) => p.kind === "pharmacy") ?? null;
}

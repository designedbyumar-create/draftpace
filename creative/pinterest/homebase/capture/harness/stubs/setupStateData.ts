// Stand-in for setupStateData.ts: that file asks Supabase for the product instance.
export const HOME_MANAGEMENT_COMPANION_SLUG = "home-management-companion";
export type FindInstanceResult = { status: "found"; id: string } | { status: "not-found" } | { status: "error"; message: string };
export async function findHomeManagementCompanionInstanceId(): Promise<FindInstanceResult> {
  return { status: "found", id: "demo-instance" };
}
export async function markHomeManagementCompanionSetupComplete(): Promise<{ ok: boolean }> { return { ok: true }; }

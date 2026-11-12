// Stand-in for setupStateData.ts: that file asks Supabase for the product instance.
export const PERSONAL_FINANCE_COMPANION_SLUG = "personal-finance-companion";
export async function findPersonalFinanceCompanionInstanceId() {
  return { status: "found" as const, id: "demo-instance" };
}

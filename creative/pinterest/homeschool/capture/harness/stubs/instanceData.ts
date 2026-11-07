// Stand-in for src/products/homeschooling-companion/instanceData.ts: that file asks Supabase for the product instance.
export const HOMESCHOOLING_COMPANION_SLUG = "homeschooling-companion";
export async function findHomeschoolInstanceId() {
  return { status: "found" as const, id: "demo-instance" };
}

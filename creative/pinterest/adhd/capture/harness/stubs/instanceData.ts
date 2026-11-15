// Stand-in for instanceData.ts: that file asks Supabase for the product instance.
export const ALONGSIDE_SLUG = "alongside";
export type FindInstanceResult = { status: "found"; id: string } | { status: "not-found" } | { status: "error"; message: string };
export async function findAlongsideInstanceId(): Promise<FindInstanceResult> {
  return { status: "found", id: "demo-instance" };
}

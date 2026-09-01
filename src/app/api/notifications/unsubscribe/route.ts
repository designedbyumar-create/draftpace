import { NextResponse } from "next/server";
import { getSupabaseClientForBearer } from "@/lib/server-auth";

export async function POST(request: Request) {
  const { user, supabase, error } = await getSupabaseClientForBearer(request);
  if (!user || !supabase) return NextResponse.json({ error: error || "Please sign in first." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { endpoint?: string } | null;
  if (!body?.endpoint) return NextResponse.json({ error: "Missing endpoint." }, { status: 400 });

  // RLS's delete policy (auth.uid() = user_id) is the real ownership
  // check here — this filter is belt-and-suspenders, not the boundary.
  const { error: dbError } = await supabase.from("push_subscriptions").delete().eq("endpoint", body.endpoint).eq("user_id", user.id);

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

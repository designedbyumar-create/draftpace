import { NextResponse } from "next/server";
import { getUserFromBearer } from "@/lib/server-auth";

export async function POST(request: Request) {
  const { user, error } = await getUserFromBearer(request);
  if (!user) return NextResponse.json({ error: error || "Please sign in first." }, { status: 401 });

  const subscription = await request.json().catch(() => null);
  if (!subscription?.endpoint) {
    return NextResponse.json({ error: "Missing push subscription." }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    note:
      "Persist this subscription to Supabase push_subscriptions once the notifications table is created.",
  });
}

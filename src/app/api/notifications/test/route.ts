import { NextResponse } from "next/server";
import { getUserFromBearer } from "@/lib/server-auth";

export async function POST(request: Request) {
  const { user, error } = await getUserFromBearer(request);
  if (!user) return NextResponse.json({ error: error || "Please sign in first." }, { status: 401 });

  return NextResponse.json({
    ok: true,
    title: "Draftpace reminder test",
    body: "Your planner reminder pipeline is ready for Web Push wiring.",
  });
}

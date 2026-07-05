import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  const expected = process.env.CRON_SECRET ? `Bearer ${process.env.CRON_SECRET}` : null;

  if (!expected || auth !== expected) {
    return NextResponse.json({ error: "Unauthorized cron request." }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    note:
      "Vercel Cron should call this route to find users at reminder time and send Web Push notifications.",
  });
}

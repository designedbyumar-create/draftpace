import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = String(body?.email || "").trim().toLowerCase();

  if (!emailPattern.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: "Waitlist is not configured yet." }, { status: 503 });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });

  const { error } = await supabase.from("launch_subscribers").insert({
    email,
    source: "coming-soon",
    user_agent: request.headers.get("user-agent"),
    referrer: request.headers.get("referer"),
  });

  if (error && error.code !== "23505") {
    return NextResponse.json({ error: "Could not join the list. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

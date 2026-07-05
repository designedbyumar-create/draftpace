import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (!process.env.STRIPE_WEBHOOK_SECRET || !signature) {
    return NextResponse.json(
      { error: "Stripe webhook verification is not configured." },
      { status: 503 }
    );
  }

  await request.text();

  return NextResponse.json({
    received: true,
    note:
      "Wire this endpoint to verify Stripe signatures and update Supabase orders/subscriptions with a service role key.",
  });
}

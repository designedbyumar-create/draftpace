import { NextResponse } from "next/server";
import { getUserFromBearer } from "@/lib/server-auth";

export async function POST(request: Request) {
  const { user, error } = await getUserFromBearer(request);
  if (!user) return NextResponse.json({ error: error || "Please sign in first." }, { status: 401 });

  if (!process.env.STRIPE_SECRET_KEY || !process.env.NEXT_PUBLIC_SITE_URL) {
    return NextResponse.json(
      { error: "Billing portal is not configured. Add Stripe env vars and store the customer ID first." },
      { status: 503 }
    );
  }

  return NextResponse.json(
    {
      error:
        "Billing portal needs a stored Stripe customer ID from the subscription webhook before it can open securely.",
    },
    { status: 501 }
  );
}

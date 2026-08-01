import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SessionProvider } from "@/design-system/shell/SessionProvider";
import { registerDevFixtures } from "@/product-framework/fixtures";
import { registerMonthlyMoneyReset } from "@/products/monthly-money-reset/register";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  registerDevFixtures();
  registerMonthlyMoneyReset();

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Defense in depth — src/proxy.ts already verifies this for every /app/*
  // request before it reaches here.
  if (!user) redirect("/login");

  if (!user.user_metadata?.onboarding_complete) redirect("/onboarding");

  return <SessionProvider user={user}>{children}</SessionProvider>;
}

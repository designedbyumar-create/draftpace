"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

type AuthGateContextValue = { session: Session };

const AuthGateContext = createContext<AuthGateContextValue | null>(null);

/**
 * Session data for any component rendered inside an <AuthGate>. Throws if
 * used outside one, since a gated tree is only ever rendered once a session
 * is confirmed present.
 */
export function useAuthSession() {
  const context = useContext(AuthGateContext);
  if (!context) throw new Error("useAuthSession must be used inside AuthGate");
  return context.session;
}

/**
 * Shared client-side auth boundary for /app and /admin. Server-side session
 * verification would require @supabase/ssr, which is not an approved Phase 1
 * dependency — see docs/DECISIONS.md.
 */
export default function AuthGate({
  children,
  requireOnboarding = true,
}: {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace("/login");
        return;
      }
      setSession(data.session);
      setChecked(true);
    });
  }, [router]);

  useEffect(() => {
    if (!checked || !session || !requireOnboarding) return;
    const onboardingComplete = Boolean(session.user.user_metadata?.onboarding_complete);
    if (!onboardingComplete && !pathname.startsWith("/onboarding")) {
      router.replace("/onboarding");
    }
  }, [checked, session, requireOnboarding, pathname, router]);

  if (!checked || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--app-bg)]">
        <div className="flex flex-col items-center gap-3">
          <Image src="/logo/dp-monogram-indigo.svg" alt="Draftpace" width={48} height={48} priority />
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
        </div>
      </div>
    );
  }

  return <AuthGateContext.Provider value={{ session }}>{children}</AuthGateContext.Provider>;
}

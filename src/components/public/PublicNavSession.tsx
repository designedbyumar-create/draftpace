"use client";

import { useEffect, useState } from "react";
import PublicNav, { type PublicNavSessionState } from "@/components/public/PublicNav";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";

/**
 * Reads the session in the browser and hands it to the header. Doing this
 * on the server made the whole marketing layout dynamic, and with it every
 * guide: pages that never change per visitor were being rendered on demand.
 * getSession reads the cookie locally, so there is no network wait; the
 * server-verified check still guards /app and /admin in src/proxy.ts.
 */
export default function PublicNavSession() {
  const [user, setUser] = useState<PublicNavSessionState>(undefined);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setUser(null);
      return;
    }
    let live = true;
    const show = (u: { email?: string | null; user_metadata?: Record<string, unknown> } | null | undefined) => {
      if (!live) return;
      setUser(
        u
          ? {
              email: u.email ?? null,
              displayName: typeof u.user_metadata?.display_name === "string" ? u.user_metadata.display_name : null,
            }
          : null,
      );
    };
    supabase.auth.getSession().then(({ data }) => show(data.session?.user));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => show(session?.user));
    return () => {
      live = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return <PublicNav user={user} />;
}

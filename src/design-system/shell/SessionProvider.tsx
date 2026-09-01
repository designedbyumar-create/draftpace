"use client";

import { createContext, useContext } from "react";
import type { User } from "@supabase/supabase-js";

const SessionContext = createContext<User | null>(null);

/**
 * Pure data sharing — not a security boundary. By the time this renders,
 * src/proxy.ts and the server layout above it have already verified the
 * session; this just avoids every client component re-fetching the user.
 */
export function SessionProvider({ user, children }: { user: User; children: React.ReactNode }) {
  return <SessionContext.Provider value={user}>{children}</SessionContext.Provider>;
}

export function useSession(): User {
  const user = useContext(SessionContext);
  if (!user) throw new Error("useSession must be used inside SessionProvider");
  return user;
}

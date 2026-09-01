"use client";

import { supabase } from "./client";

/**
 * The one sign-out path, reused by every account menu (authenticated app,
 * public desktop header, public mobile header) instead of each surface
 * re-implementing the same two calls.
 */
export async function signOutAndRedirect(destination: string = "/") {
  await supabase.auth.signOut();
  window.location.assign(destination);
}

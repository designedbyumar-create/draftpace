"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { getSupabaseConfigStatus, getAuthUnavailableMessage } from "@/lib/supabase/config";
import { consumeOAuthRedirect, getSafeRedirect } from "@/components/auth/redirect";
import { resolveCallbackOutcome } from "@/components/auth/callbackOutcome";
import Alert from "@/design-system/Alert";
import Button from "@/design-system/Button";
import { LogoMark } from "@/design-system/Logo";

export default function AuthCallback() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--app-bg)]">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
        </div>
      }
    >
      <AuthCallbackHandler />
    </Suspense>
  );
}

/**
 * The single authoritative OAuth code exchange. detectSessionInUrl is disabled
 * on the browser client (src/lib/supabase/client.ts), so the code is exchanged
 * exactly once here. The real session, not the exchange call's return value, is
 * the source of truth: if a valid session exists we always proceed, so a
 * successful sign-in can never render as a failure. A human error is shown only
 * when no session could be established.
 */
function AuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [failed, setFailed] = useState(false);
  const [message, setMessage] = useState("Sign-in didn't complete. Please try again.");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const clearAuthParams = () => {
      if (typeof window !== "undefined") {
        window.history.replaceState({}, "", window.location.pathname);
      }
    };

    const run = async () => {
      const configStatus = getSupabaseConfigStatus();
      if (!configStatus.valid) {
        setMessage(getAuthUnavailableMessage(configStatus));
        setFailed(true);
        return;
      }

      const code = searchParams.get("code");
      const providerError = searchParams.get("error_description") || searchParams.get("error");
      // OAuth intent rides in sessionStorage (the redirect_to sent to Supabase
      // must match the allow list exactly and can't carry its own query). The
      // query param is a fallback for any non-OAuth flow that lands here.
      const redirectTo = getSafeRedirect(consumeOAuthRedirect() ?? searchParams.get("redirectTo"), "/app");

      try {
        // The one and only exchange. Its returned error is not treated as fatal
        // on its own; the getSession check below is authoritative.
        if (code) {
          await supabase.auth.exchangeCodeForSession(code);
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (resolveCallbackOutcome(Boolean(session)) === "redirect") {
          // Success: router.replace navigates away, which also clears the code.
          router.replace(redirectTo);
          return;
        }

        // No session established. If the provider returned an explicit error,
        // that is the reason; either way, this is a genuine failure.
        clearAuthParams();
        if (providerError) setMessage("Sign-in didn't complete. Please try again.");
        setFailed(true);
      } catch {
        // Network or unexpected error: still verify a session may have been set
        // before declaring failure, so we never fail after a real success.
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (session) {
            router.replace(redirectTo);
            return;
          }
        } catch {
          // fall through to failure
        }
        clearAuthParams();
        setMessage("Couldn't reach the account service. Check your connection and try again.");
        setFailed(true);
      }
    };

    run();
  }, [router, searchParams]);

  if (failed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--app-bg)] px-4 text-center">
        <LogoMark size={36} />
        <div className="max-w-sm">
          <Alert tone="danger">{message}</Alert>
        </div>
        <Button href="/login" size="md">
          Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--app-bg)]">
      <LogoMark size={36} />
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
      <p className="text-[13px] text-[var(--muted)]">Signing you in…</p>
    </div>
  );
}

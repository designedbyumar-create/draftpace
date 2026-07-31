"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";
import { getSafeRedirect } from "@/components/auth/redirect";
import Alert from "@/design-system/Alert";
import Button from "@/design-system/Button";

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

function AuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const redirectTo = getSafeRedirect(searchParams.get("redirectTo"));

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setFailed(true);
          return;
        }
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.replace(redirectTo);
      } else {
        setFailed(true);
      }
    };
    handleCallback();
  }, [router, searchParams]);

  if (failed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--app-bg)] px-4 text-center">
        <Image src="/logo/dp-monogram-indigo.svg" alt="Draftpace" width={36} height={36} />
        <div className="max-w-sm">
          <Alert tone="danger">Sign-in didn&apos;t complete. Please try again.</Alert>
        </div>
        <Button href="/login" size="md">
          Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--app-bg)]">
      <Image src="/logo/dp-monogram-indigo.svg" alt="Draftpace" width={36} height={36} />
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
      <p className="text-[13px] text-[var(--muted)]">Signing you in…</p>
    </div>
  );
}

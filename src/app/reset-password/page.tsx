"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { getSupabaseConfigStatus, getAuthUnavailableMessage } from "@/lib/supabase/config";
import AuthCard from "@/components/auth/AuthCard";
import Button from "@/design-system/Button";
import Input from "@/design-system/Input";
import Alert from "@/design-system/Alert";
import Link from "next/link";

type SessionState = "checking" | "ready" | "invalid" | "config-error";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sessionState, setSessionState] = useState<SessionState>("checking");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const establishSession = async () => {
      const configStatus = getSupabaseConfigStatus();
      if (!configStatus.valid) {
        setError(getAuthUnavailableMessage(configStatus));
        setSessionState("config-error");
        return;
      }
      try {
        const code = searchParams.get("code");
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          setSessionState(exchangeError ? "invalid" : "ready");
          return;
        }
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setSessionState(session ? "ready" : "invalid");
      } catch {
        setError("Couldn't reach the account service. Check your connection and try again.");
        setSessionState("config-error");
      }
    };
    establishSession();
  }, [searchParams]);

  const submit = async () => {
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
        return;
      }
      setDone(true);
    } catch {
      setError("Couldn't reach the account service. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sessionState === "checking") {
    return (
      <AuthCard title="Reset password" showLegalFooter={false}>
        <p className="text-[13px] text-[var(--muted)]">Verifying your reset link…</p>
      </AuthCard>
    );
  }

  if (sessionState === "config-error") {
    return (
      <AuthCard title="Sign-in is unavailable" showLegalFooter={false}>
        <Alert tone="danger">{error}</Alert>
      </AuthCard>
    );
  }

  if (sessionState === "invalid") {
    return (
      <AuthCard title="This link isn't valid" showLegalFooter={false}>
        <Alert tone="danger">This reset link is invalid or has expired. Request a new one to continue.</Alert>
        <Button href="/forgot-password" size="lg" fullWidth className="mt-5">
          Request a new link
        </Button>
      </AuthCard>
    );
  }

  if (done) {
    return (
      <AuthCard title="Password updated" showLegalFooter={false}>
        <Alert tone="success">Your password has been changed. You can now sign in with it.</Alert>
        <Button size="lg" fullWidth className="mt-5" onClick={() => router.push("/login")}>
          Continue to sign in
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Choose a new password"
      footer={
        <Link href="/login" className="text-[13px] font-semibold text-[var(--primary)] hover:underline">
          Back to sign in
        </Link>
      }
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <Input
          label="New password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Min. 8 characters"
          autoFocus
          containerClassName="mb-4"
        />
        <Input
          label="Confirm new password"
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Re-enter your new password"
          containerClassName="mb-5"
        />
        {error && (
          <div className="mb-4">
            <Alert tone="danger">{error}</Alert>
          </div>
        )}
        <Button type="submit" size="lg" fullWidth disabled={loading || !password || !confirmPassword}>
          {loading ? "Updating…" : "Update password"}
        </Button>
      </form>
    </AuthCard>
  );
}

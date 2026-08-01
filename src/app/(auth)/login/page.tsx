"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { getSupabaseConfigStatus, getAuthUnavailableMessage } from "@/lib/supabase/config";
import AuthCard from "@/components/auth/AuthCard";
import GoogleIcon from "@/components/auth/GoogleIcon";
import { getSafeRedirect } from "@/components/auth/redirect";
import Button from "@/design-system/Button";
import Input from "@/design-system/Input";
import Alert from "@/design-system/Alert";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = getSafeRedirect(searchParams.get("redirectTo"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    const configStatus = getSupabaseConfigStatus();
    if (!configStatus.valid) {
      setError(getAuthUnavailableMessage(configStatus));
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(
          signInError.message?.toLowerCase().includes("fetch") || signInError.status === undefined
            ? "Couldn't reach the account service. Check your connection and try again."
            : "Wrong email or password. Double check and try again."
        );
        return;
      }
      router.push(redirectTo);
    } catch {
      setError("Couldn't reach the account service. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    const configStatus = getSupabaseConfigStatus();
    if (!configStatus.valid) {
      setError(getAuthUnavailableMessage(configStatus));
      return;
    }
    setError("");
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}` },
    });
    if (oauthError) {
      setError("Couldn't start Google sign-in. Please try again.");
    }
  };

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your Draftpace account"
      footer={
        <p className="text-[13px] text-[var(--muted)]">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-[var(--primary)] hover:underline">
            Sign up free
          </Link>
        </p>
      }
    >
      {redirectTo !== "/app" && (
        <div className="mb-5">
          <Alert tone="info">Sign in to continue.</Alert>
        </div>
      )}

      <Button variant="secondary" size="lg" fullWidth onClick={handleGoogle} iconLeft={<GoogleIcon />} className="mb-5">
        Continue with Google
      </Button>

      <div className="relative mb-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--border)]" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-[var(--surface)] px-3 text-[12px] text-[var(--faint)]">or sign in with email</span>
        </div>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleLogin();
        }}
      >
        <Input
          label="Email address"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          autoFocus
          containerClassName="mb-4"
        />

        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="password" className="text-[13px] font-semibold text-[var(--text)]">
            Password
          </label>
          <Link href="/forgot-password" className="text-[12px] font-semibold text-[var(--primary)] hover:underline">
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Your password"
          autoComplete="current-password"
          containerClassName="mb-5"
        />

        {error && (
          <div className="mb-4">
            <Alert tone="danger">{error}</Alert>
          </div>
        )}

        <Button type="submit" size="lg" fullWidth disabled={loading || !email || !password}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthCard>
  );
}

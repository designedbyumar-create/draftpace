"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import AuthCard from "@/components/auth/AuthCard";
import GoogleIcon from "@/components/auth/GoogleIcon";
import { getSafeRedirect } from "@/components/auth/redirect";
import Button from "@/design-system/Button";
import Input from "@/design-system/Input";
import Alert from "@/design-system/Alert";
import { Check } from "@/design-system/Icon";

const STEP_TITLES = ["What's your email?", "Create a password", "What should we call you?"];

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirectTo, setRedirectTo] = useState("/app");

  useEffect(() => {
    const emailFromUrl = searchParams.get("email");
    if (emailFromUrl) {
      setEmail(emailFromUrl);
      setStep(2);
    }
    setRedirectTo(getSafeRedirect(searchParams.get("redirectTo")));
  }, [searchParams]);

  const handleSignup = async () => {
    setLoading(true);
    setError("");
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name || email.split("@")[0] } },
    });
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message || "Something went wrong — please try again.");
      return;
    }
    router.push(redirectTo);
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}` },
    });
  };

  return (
    <AuthCard
      eyebrow={`Step ${step} of 3`}
      title={STEP_TITLES[step - 1]}
      footer={
        step === 1 ? (
          <p className="text-[13px] text-[var(--muted)]">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[var(--primary)] hover:underline">
              Sign in
            </Link>
          </p>
        ) : undefined
      }
    >
      <div className="mb-6 flex items-center gap-1.5">
        {[1, 2, 3].map((value) => (
          <div
            key={value}
            className="h-1 flex-1 rounded-full transition-all"
            style={{ background: value <= step ? "var(--primary)" : "var(--surface-strong)" }}
          />
        ))}
      </div>

      {step === 1 && (
        <div>
          <Input
            label="Email address"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && email && setStep(2)}
            placeholder="you@example.com"
            autoFocus
            containerClassName="mb-4"
          />
          <Button fullWidth size="lg" disabled={!email} onClick={() => email && setStep(2)} className="mb-4">
            Continue
          </Button>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border)]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[var(--surface)] px-3 text-[12px] text-[var(--faint)]">or</span>
            </div>
          </div>

          <Button variant="secondary" size="lg" fullWidth onClick={handleGoogle} iconLeft={<GoogleIcon />}>
            Continue with Google
          </Button>
        </div>
      )}

      {step === 2 && (
        <div>
          <p className="mb-5 text-[13px] text-[var(--muted)]">
            For <span className="font-semibold text-[var(--text)]">{email}</span>
          </p>
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && password.length >= 8 && setStep(3)}
            placeholder="Min. 8 characters"
            autoFocus
            hint={password.length > 0 && password.length < 8 ? "At least 8 characters" : undefined}
            containerClassName="mb-5"
          />
          <Button fullWidth size="lg" disabled={password.length < 8} onClick={() => setStep(3)} className="mb-3">
            Continue
          </Button>
          <Button fullWidth variant="ghost" onClick={() => setStep(1)}>
            Back
          </Button>
        </div>
      )}

      {step === 3 && (
        <div>
          <p className="mb-5 text-[13px] text-[var(--muted)]">Optional — we&apos;ll use your email name if you skip.</p>
          <Input
            label="Your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && handleSignup()}
            placeholder="e.g. Jamie"
            autoFocus
            containerClassName="mb-5"
          />

          {error && (
            <div className="mb-4">
              <Alert tone="danger">{error}</Alert>
            </div>
          )}

          <div className="mb-5 rounded-lg bg-[var(--primary-soft)] p-4">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--primary)]">What you&apos;re getting</p>
            <div className="flex flex-col gap-2.5">
              {["A Draftpace account", "Access to your products in one place"].map((item) => (
                <div key={item} className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white/60 text-[var(--primary)]">
                    <Check size={12} aria-hidden />
                  </span>
                  <span className="text-[13px] font-medium text-[var(--primary-strong)]">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <Button fullWidth size="lg" onClick={handleSignup} disabled={loading} className="mb-3">
            {loading ? "Setting up your account…" : "Continue"}
          </Button>
          <Button fullWidth variant="ghost" onClick={handleSignup} disabled={loading}>
            Skip — use my email name
          </Button>
        </div>
      )}
    </AuthCard>
  );
}

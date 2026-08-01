"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { getSupabaseConfigStatus, getAuthUnavailableMessage } from "@/lib/supabase/config";
import AuthCard from "@/components/auth/AuthCard";
import Button from "@/design-system/Button";
import Input from "@/design-system/Input";
import Alert from "@/design-system/Alert";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const sendReset = async () => {
    if (!email) return;
    const configStatus = getSupabaseConfigStatus();
    if (!configStatus.valid) {
      setError(getAuthUnavailableMessage(configStatus));
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetError) {
        setError(resetError.message);
        return;
      }
      setSent(true);
    } catch {
      setError("Couldn't reach the account service. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter your Draftpace email and we'll send a secure reset link."
      footer={
        <Link href="/login" className="text-[13px] font-semibold text-[var(--primary)] hover:underline">
          Back to sign in
        </Link>
      }
    >
      {sent ? (
        <Alert tone="success" title="Check your email">
          If an account exists for {email}, a secure reset link is on its way.
        </Alert>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            sendReset();
          }}
        >
          <Input
            label="Email address"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            autoFocus
            containerClassName="mb-5"
          />
          {error && (
            <div className="mb-4">
              <Alert tone="danger">{error}</Alert>
            </div>
          )}
          <Button type="submit" size="lg" fullWidth disabled={loading || !email}>
            {loading ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}

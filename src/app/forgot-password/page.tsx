"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "@/components/ui/Icon";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const sendReset = async () => {
    if (!email) return;
    setLoading(true);
    setError("");
    setStatus("");
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    setLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setStatus("Check your email for a secure reset link.");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--app-bg)] px-4 py-10 text-[var(--text)]">
      <section className="w-full max-w-sm rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-soft)]">
        <Image src="/logo/dp-monogram-indigo.svg" alt="Draftpace" width={44} height={44} priority />
        <h1 className="mt-6 text-2xl font-black tracking-tight">Reset password</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Enter your Draftpace email and we will send a secure reset link.
        </p>
        <label className="mt-6 block">
          <span className="text-xs font-bold text-[var(--muted)]">Email address</span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            placeholder="you@example.com"
            className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)]"
          />
        </label>
        <button
          onClick={sendReset}
          disabled={loading || !email}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] px-5 py-3 text-sm font-black text-[var(--primary-contrast)] disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send reset link"}
          {!loading && <ArrowRight size={15} />}
        </button>
        {status && <p className="mt-3 text-sm font-semibold text-emerald-600">{status}</p>}
        {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}
        <Link href="/login" className="mt-5 block text-center text-sm font-bold text-[var(--primary)]">
          Back to sign in
        </Link>
      </section>
    </main>
  );
}

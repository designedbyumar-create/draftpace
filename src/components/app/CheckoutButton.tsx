"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "@/components/ui/Icon";
import { supabase } from "@/lib/supabase";

export default function CheckoutButton({
  mode,
  plannerId,
  children,
  variant = "primary",
}: {
  mode: "membership-monthly" | "membership-yearly" | "planner";
  plannerId?: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const checkout = async () => {
    setLoading(true);
    setError("");

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
      router.push(`/signup?redirect=/pricing`);
      return;
    }

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ mode, plannerId }),
    });
    const payload = await response.json();
    setLoading(false);

    if (payload.url) {
      window.location.href = payload.url;
      return;
    }

    setError(payload.error || "Checkout is unavailable right now.");
  };

  return (
    <div>
      <button
        type="button"
        onClick={checkout}
        disabled={loading}
        className={`flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-black transition disabled:opacity-60 ${
          variant === "primary"
            ? "bg-[var(--primary)] text-[var(--primary-contrast)]"
            : "border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text)]"
        }`}
      >
        {loading ? "Preparing secure checkout..." : children}
        {!loading && <ArrowRight size={15} />}
      </button>
      {error && <p className="mt-2 text-xs font-semibold leading-5 text-red-600">{error}</p>}
    </div>
  );
}

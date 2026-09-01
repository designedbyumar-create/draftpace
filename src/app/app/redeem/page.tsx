"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PlatformShell from "@/design-system/shell/PlatformShell";
import Surface from "@/design-system/Surface";
import Input from "@/design-system/Input";
import Button from "@/design-system/Button";
import { Check } from "@/design-system/Icon";

/**
 * Where a code from a printed PDF (an Etsy PDF + code bundle) turns into
 * real ownership. Deliberately plain: paste, submit, land in the product.
 * The actual validation/grant is entirely server-side
 * (/api/redeem -> redeem_entitlement_code). This page has no logic of
 * its own beyond the fetch and the two outcome states.
 */
export default function RedeemPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error" | "success">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!code.trim()) {
      setStatus("error");
      setErrorMessage("Enter a code first.");
      return;
    }
    setStatus("submitting");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();
      if (!response.ok) {
        setStatus("error");
        setErrorMessage(data.error ?? "That code could not be redeemed.");
        return;
      }
      setStatus("success");
      setTimeout(() => {
        router.push(`/app/products/${data.productSlug}/workspace`);
      }, 1200);
    } catch {
      setStatus("error");
      setErrorMessage("Couldn't reach the server. Check your connection and try again.");
    }
  }

  return (
    <PlatformShell title="Redeem a code" subtitle="From a printed companion, or anywhere else you got one.">
      <Surface className="mx-auto max-w-md">
        {status === "success" ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--success-soft)] text-[var(--success)]">
              <Check size={18} aria-hidden />
            </span>
            <p className="text-[15px] font-semibold text-[var(--text)]">Redeemed. Taking you there now.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="e.g. AB3D-EFG7"
              autoFocus
              autoCapitalize="characters"
            />
            {status === "error" && errorMessage && <p className="text-[13px] text-[var(--danger)]">{errorMessage}</p>}
            <Button type="submit" disabled={status === "submitting"}>
              {status === "submitting" ? "Redeeming…" : "Redeem"}
            </Button>
          </form>
        )}
      </Surface>
    </PlatformShell>
  );
}

"use client";

import { useState } from "react";
import { Check, Save } from "@/design-system/Icon";

/** A read-only draft with a copy button: the hand-off to a platform's own composer. */
export default function CopyField({ label, value, multiline = false }: { label: string; value: string; multiline?: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <p className="text-caption font-semibold text-[var(--muted)]">{label}</p>
        <button onClick={copy} className="inline-flex items-center gap-1 text-caption font-semibold text-[var(--primary)] hover:underline">
          {copied ? <Check size={13} /> : <Save size={13} />}{copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className={`rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-body-sm ${multiline ? "whitespace-pre-wrap" : "truncate"}`}>{value}</div>
    </div>
  );
}

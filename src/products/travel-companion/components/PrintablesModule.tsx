"use client";

import { useState } from "react";
import type { ProductDefinition } from "@/product-framework/definition";
import Surface from "@/design-system/Surface";
import Button from "@/design-system/Button";
import { Article } from "@/design-system/Icon";

/**
 * Printable Trip Companion: an included, paper version of this product,
 * same role Personal Finance Companion's own printables destination
 * plays. It is not a second product and grants nothing on its own,
 * access comes from owning Travel Companion, the same entitlement gate
 * every destination under /app/products/travel-companion/** already
 * has.
 *
 * ONE REAL DIFFERENCE FROM PFC'S OWN VERSION
 *
 * PFC's printable is a pre-built, static asset: the same file for every
 * account, downloaded through a server route. My Trip Book is blank and
 * generic too, but it is generated fresh in this browser on every
 * click, never uploaded or stored, same reasoning as every client-side
 * printable on this platform. There is nothing here for a server route
 * to gate, so this card triggers generation directly rather than
 * linking to a download endpoint.
 */
export default function PrintablesModule(_props: { definition: ProductDefinition }) {
  const [size, setSize] = useState<"LETTER" | "A4">("LETTER");
  const [making, setMaking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function generate() {
    setMaking(true);
    setErrorMessage(null);
    try {
      const { downloadTripBook } = await import("../printables/download");
      const { DEFAULT_MANIFEST } = await import("../printables/document");
      await downloadTripBook({ ...DEFAULT_MANIFEST, size });
    } catch {
      // A failed generation must never look like a saved download.
      setErrorMessage("The book could not be made. Nothing was downloaded.");
    } finally {
      setMaking(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Included with this product</p>
        <h1 className="mt-2 text-xl font-semibold text-[var(--text)]">My Trip Book</h1>
        <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-[var(--muted)]">
          A standalone, modular travel planner, for the moments a screen is not the right tool. Trip overview,
          destinations, travellers, bookings, transport, accommodation, documents, threads and daily pages, blank for
          you to fill in by hand. It does not replace the live companion, and nothing here is filled in for you.
        </p>
      </div>

      <Surface className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[var(--primary)]">
            <Article size={18} aria-hidden />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[var(--text)]">My Trip Book</p>
            <p className="mt-0.5 text-[12px] text-[var(--muted)]">A blank, printable travel planner. Generated fresh each time.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(["LETTER", "A4"] as const).map((option) => (
            <Button key={option} size="sm" variant={size === option ? "primary" : "secondary"} onClick={() => setSize(option)}>
              {option === "LETTER" ? "US Letter" : "A4"}
            </Button>
          ))}
          <Button size="sm" disabled={making} onClick={generate}>
            {making ? "Preparing..." : "Generate"}
          </Button>
        </div>
      </Surface>

      {errorMessage && <p className="text-[13px] text-[var(--danger)]">{errorMessage}</p>}
    </div>
  );
}

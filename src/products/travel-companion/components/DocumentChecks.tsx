import Link from "next/link";
import type { DocumentCheck } from "../documentChecks";

/**
 * Dates worth a look, stated as dates.
 *
 * Says where a recorded expiry falls against the trip, and nothing about
 * what any country requires: entry rules differ by country and change, so
 * this only compares two dates the person entered and points at the guide
 * for the rest. Renders nothing when there is nothing to say, so an empty
 * or well-dated registry is not given a heading to fill.
 *
 * No red, no alarm and no "urgent". A date before the trip is simply a fact
 * the traveller will want to have seen.
 */
export default function DocumentChecks({ checks }: { checks: DocumentCheck[] }) {
  if (checks.length === 0) return null;
  return (
    <section
      aria-label="Dates worth a look"
      className="rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-muted)] p-4"
    >
      <h3 className="text-[15px] font-semibold text-[var(--text)]">Dates worth a look</h3>
      <ul className="mt-2 flex flex-col gap-2">
        {checks.map((check) => (
          <li key={check.documentId} className="text-[14px] leading-5 text-[var(--text)]">
            <span className="font-semibold">
              {check.personName && !check.label.toLowerCase().includes(check.personName.toLowerCase())
                ? `${check.personName}: ${check.label}`
                : check.label}
              .
            </span>{" "}
            <span className="text-[var(--muted)]">{check.line}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[12.5px] leading-5 text-[var(--muted)]">
        This only compares the dates you recorded. What each country asks for differs and changes, so check with the
        country you are visiting.{" "}
        <Link href="/guides/travel-document-checklist" className="font-semibold text-[var(--text)] underline hover:no-underline">
          What each traveller needs
        </Link>
        .
      </p>
    </section>
  );
}

import type { BillPayment } from "../../state";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Paid 5 Sep", from a "YYYY-MM-DD" date, spelled out so it reads the same everywhere. */
export function paidDayLabel(isoDate: string): string {
  const [, month, day] = isoDate.split("-").map(Number);
  return `Paid ${day} ${MONTHS[month - 1]}`;
}

/** The check beside a bill: ticks it paid for the month being looked at, and pressing it again undoes that. */
export default function PaidToggle({ name, payment, onToggle }: { name: string; payment: BillPayment | undefined; onToggle: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={Boolean(payment)}
      aria-label={payment ? `${name}: ${paidDayLabel(payment.paidOn)}. Mark as not paid` : `Mark ${name} as paid`}
      onClick={onToggle}
      className={`mt-px flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
        payment ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-contrast)]" : "border-[var(--border-strong)] bg-[var(--surface)]"
      }`}
    >
      {payment && (
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path d="M2.5 7.5l3 3 6-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

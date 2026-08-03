import Link from "next/link";

const CLAIMS = [
  "Your account and preferences are stored with Supabase, our authentication and database provider, and encrypted in transit.",
  "We don't sell your data or run advertising on it. There's nothing to opt out of because it isn't happening.",
  "You can see, in Settings, exactly what's saved to your account versus what only lives on your device.",
];

export default function TrustSection() {
  return (
    <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Trust</p>
        <h2 className="mt-3 font-serif text-[30px] font-semibold leading-tight tracking-tight sm:text-[38px]">
          A living product is personal. The way it is handled should be clear.
        </h2>
        <Link href="/trust" className="mt-4 inline-block text-[13px] font-semibold text-[var(--primary)] hover:underline">
          Read the full trust page
        </Link>
      </div>
      <ul className="flex flex-col divide-y divide-[var(--border)]">
        {CLAIMS.map((claim) => (
          <li key={claim} className="py-4 text-[14px] leading-relaxed text-[var(--text)] first:pt-0">
            {claim}
          </li>
        ))}
      </ul>
    </div>
  );
}

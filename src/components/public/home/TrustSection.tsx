import TextLink from "@/design-system/TextLink";

const CLAIMS = [
  "Your account and preferences are stored with Supabase, our authentication and database provider, and encrypted in transit.",
  "We don't sell your data or run advertising on it. There's nothing to opt out of because it isn't happening.",
  "You can see, in Settings, exactly what's saved to your account versus what only lives on your device.",
];

export default function TrustSection() {
  return (
    <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
      <div>
        <p className="text-eyebrow font-bold uppercase text-[var(--brand-ink)]">Trust</p>
        <h2 className="mt-3 text-heading-lg font-serif font-semibold tracking-tight">
          A living product is personal. The way it is handled should be clear.
        </h2>
        <TextLink href="/trust" className="mt-4">
          Read the full trust page
        </TextLink>
      </div>
      <ul className="flex flex-col divide-y divide-[var(--border)]">
        {CLAIMS.map((claim) => (
          <li key={claim} className="py-4 text-body-sm leading-relaxed text-[var(--text)] first:pt-0">
            {claim}
          </li>
        ))}
      </ul>
    </div>
  );
}

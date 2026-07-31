"use client";

import PlatformShell from "@/design-system/shell/PlatformShell";
import Surface from "@/design-system/Surface";
import Button from "@/design-system/Button";
import { ArrowRight, Lock, MessageCircle, Shield, Wrench } from "@/design-system/Icon";

const ENTRIES = [
  {
    icon: Lock,
    title: "Account and access",
    body: "Trouble signing in, resetting a password, or an unfamiliar sign-in.",
  },
  {
    icon: Wrench,
    title: "Product access",
    body: "A product you own isn't showing up, or looks wrong.",
  },
  {
    icon: MessageCircle,
    title: "Technical issue",
    body: "Something is broken, slow, or behaving unexpectedly.",
  },
  {
    icon: Shield,
    title: "Privacy or data request",
    body: "Ask about your data, or request an export or deletion.",
  },
];

export default function SupportPage() {
  return (
    <PlatformShell title="Support" subtitle="Get help with your account or a product">
      <div className="space-y-8">
        <section className="grid gap-3 sm:grid-cols-2">
          {ENTRIES.map((entry) => (
            <Surface key={entry.title}>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--surface-muted)] text-[var(--muted)]">
                <entry.icon size={16} aria-hidden />
              </div>
              <p className="mt-3 text-[13px] font-semibold text-[var(--text)]">{entry.title}</p>
              <p className="mt-1 text-[12px] leading-5 text-[var(--muted)]">{entry.body}</p>
              <Button href="mailto:support@draftpace.com" variant="ghost" size="sm" iconRight={<ArrowRight size={13} aria-hidden />} className="mt-3 px-0">
                Contact support
              </Button>
            </Surface>
          ))}
        </section>

        <section>
          <h2 className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--faint)]">Your cases</h2>
          <Surface>
            <p className="text-[13px] text-[var(--muted)]">
              In-app case tracking isn&apos;t built yet — support requests go to{" "}
              <a href="mailto:support@draftpace.com" className="font-semibold text-[var(--primary)] hover:underline">
                support@draftpace.com
              </a>{" "}
              and are handled by email for now.
            </p>
          </Surface>
        </section>
      </div>
    </PlatformShell>
  );
}

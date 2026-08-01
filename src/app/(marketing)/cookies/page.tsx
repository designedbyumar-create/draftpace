import type { Metadata } from "next";
import Container from "@/design-system/Container";
import Badge from "@/design-system/Badge";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "What cookies and local storage Draftpace uses, and why.",
  alternates: { canonical: "/cookies" },
};

const COOKIE_TYPES = [
  {
    type: "Essential",
    required: true,
    description:
      "Required for Draftpace to work: signing in and staying signed in. You cannot opt out of these without losing the ability to use the product.",
    items: [{ name: "Supabase session cookies", purpose: "Keep you signed in and refresh your session. Set by Supabase, our authentication provider.", duration: "Session, refreshed automatically" }],
  },
  {
    type: "Analytics",
    required: false,
    description: "We don't run any third-party analytics or advertising cookies today.",
    items: [{ name: "None", purpose: "No analytics cookies are set at this time.", duration: "N/A" }],
  },
];

const LOCAL_STORAGE_ITEMS = [
  { name: "Theme, text size, motion preference", purpose: "Kept in your browser's local storage, not a cookie, and never sent to our servers." },
];

export default function CookiesPage() {
  return (
    <main className="bg-[var(--bg)] text-[var(--text)]">
      <Container width="narrow" className="pb-10 pt-24">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">Legal</p>
        <h1 className="mt-3 font-serif text-[36px] font-semibold leading-tight tracking-tight sm:text-[44px]">
          Cookie Policy
        </h1>
        <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-[var(--muted)]">
          We use cookies to keep you signed in. That's basically it: no tracking, no advertising cookies.
        </p>
        <p className="mt-2 text-[12px] text-[var(--faint)]">Last updated: August 2026</p>
      </Container>

      <Container width="narrow" className="pb-24">
        <div className="rounded-lg border border-[var(--border)] p-5">
          <h2 className="text-[16px] font-semibold text-[var(--text)]">What are cookies?</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-[var(--muted)]">
            Small text files a site stores in your browser to remember things between visits, like whether you're
            signed in. We don't use cookies to track you across other websites or show you ads.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-10">
          {COOKIE_TYPES.map((group) => (
            <div key={group.type}>
              <div className="mb-3 flex items-center gap-2">
                <Badge tone={group.required ? "primary" : "neutral"}>{group.type}</Badge>
                {group.required && <span className="text-[11px] font-semibold text-[var(--faint)]">Required</span>}
              </div>
              <p className="mb-4 text-[13px] leading-relaxed text-[var(--muted)]">{group.description}</p>
              <div className="flex flex-col gap-2">
                {group.items.map((item) => (
                  <div key={item.name} className="grid grid-cols-1 gap-2 rounded-lg border border-[var(--border)] p-4 sm:grid-cols-[1fr_2fr_auto] sm:gap-4">
                    <div>
                      <p className="mb-0.5 text-[11px] font-bold uppercase tracking-wide text-[var(--faint)]">Name</p>
                      <p className="font-mono text-[12px] font-semibold text-[var(--text)]">{item.name}</p>
                    </div>
                    <div>
                      <p className="mb-0.5 text-[11px] font-bold uppercase tracking-wide text-[var(--faint)]">Purpose</p>
                      <p className="text-[13px] text-[var(--muted)]">{item.purpose}</p>
                    </div>
                    <div>
                      <p className="mb-0.5 text-[11px] font-bold uppercase tracking-wide text-[var(--faint)]">Duration</p>
                      <p className="whitespace-nowrap text-[13px] text-[var(--muted)]">{item.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div>
            <div className="mb-3 flex items-center gap-2">
              <Badge tone="neutral">Local storage</Badge>
              <span className="text-[11px] font-semibold text-[var(--faint)]">Not a cookie</span>
            </div>
            <p className="mb-4 text-[13px] leading-relaxed text-[var(--muted)]">
              Some preferences live in your browser's local storage rather than a cookie, and they're never
              transmitted to us at all.
            </p>
            <div className="flex flex-col gap-2">
              {LOCAL_STORAGE_ITEMS.map((item) => (
                <div key={item.name} className="rounded-lg border border-[var(--border)] p-4">
                  <p className="text-[13px] font-semibold text-[var(--text)]">{item.name}</p>
                  <p className="mt-1 text-[13px] text-[var(--muted)]">{item.purpose}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="mb-4 text-[16px] font-semibold text-[var(--text)]">How to manage cookies</h2>
          <div className="flex flex-col gap-3">
            {[
              {
                title: "In your browser",
                body: "You can block or delete cookies through your browser settings. Blocking essential cookies will break Draftpace, and you won't be able to stay signed in.",
              },
              {
                title: "Deleting your account",
                body: "In-product account deletion isn't available yet. Email privacy@draftpace.com to request it. Browser cookies clear when you sign out or clear your browser data regardless.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-lg border border-[var(--border)] p-5">
                <p className="text-[13px] font-semibold text-[var(--text)]">{item.title}</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--muted)]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-12 text-[13px] text-[var(--muted)]">
          Questions?{" "}
          <a href="mailto:privacy@draftpace.com" className="font-semibold text-[var(--primary)] hover:underline">
            privacy@draftpace.com
          </a>
        </p>
      </Container>
    </main>
  );
}

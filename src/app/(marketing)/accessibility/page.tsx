import type { Metadata } from "next";
import Container from "@/design-system/Container";

export const metadata: Metadata = {
  title: "Accessibility",
  description: "What Draftpace does today to be usable with a keyboard, screen reader, or different vision needs.",
  alternates: { canonical: "/accessibility" },
};

const PRACTICES = [
  {
    title: "Keyboard navigation",
    body: "Every interactive element, including the homepage's problem chooser and messy-to-clear demonstration, works with a keyboard alone, with a visible focus ring on whatever's currently selected.",
  },
  {
    title: "Reduced motion",
    body: "If your system requests reduced motion, animations shrink to effectively nothing automatically. You can also turn this on explicitly in Settings, independent of your device, if you'd rather not rely on that system setting.",
  },
  {
    title: "Text size",
    body: "Settings includes a text-size control (default, large, larger) that applies across the whole signed-in platform, on top of whatever zoom level your browser is already set to.",
  },
  {
    title: "Structure and labels",
    body: "Pages use real heading levels and semantic HTML, not styled divs pretending to be headings. Icon-only buttons carry accessible labels, not just a visual icon.",
  },
  {
    title: "Color and contrast",
    body: "Text and interface colors are chosen for reasonable contrast in both light and dark themes. We haven't run a formal contrast audit against every combination yet, and we're not claiming a specific compliance level until we have.",
  },
];

export default function AccessibilityPage() {
  return (
    <Container width="narrow" className="pb-24 pt-16 sm:pt-20">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">Accessibility</p>
      <h1 className="mt-3 font-serif text-[34px] font-semibold leading-tight tracking-tight sm:text-[44px]">
        What we do today, in plain terms.
      </h1>
      <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-[var(--muted)]">
        We're not going to claim a compliance certification we haven't earned. Here's what's actually implemented,
        and where we still have work to do.
      </p>

      <div className="mt-12 flex flex-col divide-y divide-[var(--border)]">
        {PRACTICES.map((practice) => (
          <div key={practice.title} className="py-6 first:pt-0">
            <h2 className="text-[16px] font-semibold text-[var(--text)]">{practice.title}</h2>
            <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-[var(--muted)]">{practice.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-6">
        <p className="text-[14px] font-semibold text-[var(--text)]">Found a problem?</p>
        <p className="mt-2 text-[13px] leading-relaxed text-[var(--muted)]">
          If something doesn't work with a keyboard, screen reader, or assistive technology you use, we want to know
          specifically what happened. Email{" "}
          <a href="mailto:support@draftpace.com" className="font-semibold text-[var(--primary)] hover:underline">
            support@draftpace.com
          </a>
          .
        </p>
      </div>
    </Container>
  );
}

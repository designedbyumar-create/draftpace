import type { Metadata } from "next";
import Container from "@/design-system/Container";
import AskDP from "@/components/public/help/AskDP";

export const metadata: Metadata = {
  title: "Ask",
  description:
    "Ask a real question about money, home, legal and admin, personal affairs, travel, work, documents, cars or family life, and get an answer from Draftpace's own sourced library, not a guess.",
  alternates: { canonical: "/help-with" },
};

/**
 * The URL stays /help-with. It is in the sitemap, indexed, and printed
 * inside at least one shipped product, so nothing about the address
 * changes even though the page underneath it is now a different thing:
 * Ask DP absorbs what this page used to do (pick your situation, meet
 * the Companion for it) and adds a real question-and-answer library in
 * front of it. See src/content/askdp.ts for what backs the answers and
 * src/components/public/help/AskDP.tsx for how a question resolves.
 */
export default function NeedHelpPage() {
  return (
    <Container width="wide" className="pb-24 pt-16 sm:pt-20">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--brand-ink)]">Ask</p>
      <h1 className="mt-3 max-w-2xl font-serif text-[34px] font-semibold leading-tight tracking-tight sm:text-[44px]">
        Ask a real question. Get an answer from what Draftpace actually knows.
      </h1>
      <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[var(--muted)]">
        Not a chat that generates an answer. Every answer here comes from a sourced entry in Draftpace&rsquo;s own
        library, and it says so plainly when nothing in the library covers what you asked.
      </p>

      <div className="mt-10 max-w-2xl">
        <AskDP />
      </div>
    </Container>
  );
}

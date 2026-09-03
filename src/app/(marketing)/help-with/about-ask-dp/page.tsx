import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/design-system/Container";
import { META_ENTRIES } from "@/content/askdp";

export const metadata: Metadata = {
  title: "What is Ask DP?",
  description:
    "Why Ask DP exists: a library shaped around real everyday problems, not the shape of the document the answer lives in, and how it connects to the rest of Draftpace.",
  alternates: { canonical: "/help-with/about-ask-dp" },
};

/**
 * Static sibling of /help-with/[needSlug], so it takes the exact segment
 * "about-ask-dp" instead of falling into that dynamic route. The one
 * link into this page lives on /help-with itself: "Curious about this?
 * Learn more." See AskDP.tsx for where that sits in the search flow.
 */
export default function AboutAskDPPage() {
  return (
    <Container width="narrow" className="pb-24 pt-16 sm:pt-20">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--brand-ink)]">Ask DP</p>
      <h1 className="mt-3 font-serif text-[34px] font-semibold leading-tight tracking-tight sm:text-[44px]">
        A library shaped around your problem, not the document.
      </h1>
      <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-[var(--muted)]">
        Most official information is written to cover every case there could ever be. A statute runs a hundred
        pages so it can hold up in every situation at once. Your situation is usually only a few lines of it.
        Ask DP exists to find that slice, show exactly where it came from, and say so plainly when it doesn&rsquo;t
        have it yet.
      </p>

      <div className="mt-14 flex flex-col gap-10 text-[15px] leading-relaxed text-[var(--text)]">
        <section>
          <h2 className="text-[16px] font-semibold text-[var(--text)]">What it actually is</h2>
          <p className="mt-3">
            Think of Ask DP as a librarian, not a search engine and not a chatbot. It doesn&rsquo;t write answers,
            it finds them. Every entry in the library was researched and checked against a real source before it
            went in, a statute, an official regulator, a body like the IRS, GOV.UK, or the CRA, and that source
            sits right under the answer so it can be checked again. Nothing here is composed on the fly, which is
            the entire point: an answer that&rsquo;s only ever retrieved, never generated, can&rsquo;t quietly be
            wrong in a fluent-sounding way.
          </p>
        </section>

        <section>
          <h2 className="text-[16px] font-semibold text-[var(--text)]">Why it isn&rsquo;t organised like a law library</h2>
          <p className="mt-3">
            A person asking &ldquo;is there a limit on my security deposit&rdquo; doesn&rsquo;t think in statute
            names or filing categories, they think in the actual words of the problem. So Ask DP runs as one flat
            library, not a set of legal sections to browse through first. The same search answers &ldquo;how long
            does an unpaid debt stay on my credit report&rdquo; and &ldquo;I don&rsquo;t know where my money is
            going,&rdquo; because both are real things people ask, even though only one of them has a statute
            behind it. Where there isn&rsquo;t a law to cite, the honest version is a real redirect instead: to
            the Draftpace guide or product that actually addresses it, never a fact invented to fill the gap.
          </p>
        </section>

        <section>
          <h2 className="text-[16px] font-semibold text-[var(--text)]">How it grows</h2>
          <p className="mt-3">
            This library is not finished, and it doesn&rsquo;t pretend to be. It grows one properly researched
            entry at a time, across the United States, the United Kingdom and Canada for now, and it says so when
            a topic is still thin or a question falls outside what&rsquo;s been checked yet. That&rsquo;s a real
            limit, not a placeholder for guessing: a library that fakes completeness on day one can&rsquo;t be
            trusted on day two either.
          </p>
        </section>

        <section>
          <h2 className="text-[16px] font-semibold text-[var(--text)]">How it fits the rest of Draftpace</h2>
          <p className="mt-3">
            Every Draftpace Companion holds the state of one part of somebody&rsquo;s life, so they don&rsquo;t
            have to keep it in their head. Ask DP does the same job for information instead of ongoing state: it
            holds the researched, sourced version of an answer so nobody has to read the hundred pages themselves
            to find their few lines of it. Where a Companion already exists for the problem behind a question,
            Ask DP points to it, clearly separated from the answer itself, never blended into it.
          </p>
        </section>
      </div>

      <div className="mt-16 border-t border-[var(--border)] pt-10">
        <h2 className="text-[16px] font-semibold text-[var(--text)]">Questions about Ask DP itself</h2>
        <div className="mt-6 flex flex-col gap-8">
          {META_ENTRIES.map((meta) => (
            <div key={meta.slug}>
              <p className="font-serif text-[17px] font-semibold leading-snug tracking-tight text-[var(--text)]">
                {meta.question}
              </p>
              <p className="mt-2 text-[14.5px] leading-relaxed text-[var(--muted)]">{meta.answer}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-14 border-t border-[var(--border)] pt-8">
        <Link href="/help-with" className="text-[13px] font-semibold text-[var(--primary)] hover:underline">
          ← Back to Ask DP
        </Link>
      </div>
    </Container>
  );
}

"use client";

import { useMemo, useState, type FormEvent } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Globe, Search } from "@/design-system/Icon";
import Badge from "@/design-system/Badge";
import { getGuideBySlug } from "@/content/guides";
import {
  ASK_ENTRIES,
  ASK_TOPICS,
  COUNTRY_LABEL,
  entriesForQuestion,
  entryForQuestionAndCountry,
  needsCountry,
  questionsForTopic,
  type AskEntry,
  type AskTopic,
  type Country,
} from "@/content/askdp";

/**
 * Ask DP: the successor to the Need help finder.
 *
 * The finder asked "which situation is yours" and showed a Companion.
 * This keeps that job and adds a second one: answer a real question
 * from the library first, and let the product be what it points to
 * afterward, not what it opens with.
 *
 * NOTHING HERE GENERATES TEXT
 *
 * Typing a question runs it through the same lookup the category chips
 * use: match against ASK_ENTRIES, never compose a sentence. What a
 * visitor reads is always one of the hand-written, sourced entries in
 * content/askdp.ts, or the honest empty state when nothing matches.
 * That is a deliberate limit, not a placeholder for a real model later:
 * see the file-level comment on content/askdp.ts for why.
 */

type Stage =
  | { step: "browse" }
  | { step: "need-country"; question: string }
  | { step: "answer"; question: string; country: Country | null };

// Generic words that would otherwise count as "content" by length alone
// and dilute a real match: a typed question missing one of these, or
// phrasing it differently ("put in" instead of "contribute"), should
// still hit on the words that actually identify the question.
const STOPWORDS = new Set([
  "this","that","have","does","will","your","about","from","need","want",
  "year","years","much","many","what","when","where","which","really",
  "actually","supposed","should","would","could","into","with","them",
  "make","just","only","also","being","been","were","there","their",
]);

function contentWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[?.,!]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOPWORDS.has(w));
}

function matchQuestion(input: string): string | null {
  const normalized = input.trim().toLowerCase();
  if (!normalized) return null;
  const seen = new Set(ASK_ENTRIES.map((e) => e.question));
  // Exact match first, so a chip click and a typed copy of the same
  // question always resolve identically.
  for (const q of seen) if (q.toLowerCase().replace(/[?.,!]/g, "") === normalized.replace(/[?.,!]/g, "")) return q;
  // Otherwise, a keyword overlap over content words only, so a stopword
  // a visitor happened to skip, or a paraphrase like "put in" for
  // "contribute", doesn't sink an otherwise clear match. Deliberately
  // simple and deterministic rather than fuzzy, so a match can always
  // be explained, and a genuine miss falls through to the honest empty
  // state instead of guessing at what was meant.
  const words = contentWords(normalized);
  let best: { question: string; score: number } | null = null;
  for (const q of seen) {
    const qWords = contentWords(q);
    if (qWords.length === 0) continue;
    const hits = qWords.filter((w) => words.some((typed) => typed.includes(w) || w.includes(typed)));
    const score = hits.length / qWords.length;
    if (score >= 0.5 && (!best || score > best.score)) best = { question: q, score };
  }
  return best?.question ?? null;
}

export default function AskDP() {
  const reduceMotion = useReducedMotion();
  const [stage, setStage] = useState<Stage>({ step: "browse" });
  const [openTopic, setOpenTopic] = useState<AskTopic | null>(null);
  const [typed, setTyped] = useState("");
  const [notFound, setNotFound] = useState(false);

  const topicsWithQuestions = useMemo(
    () => ASK_TOPICS.map((t) => ({ ...t, questions: questionsForTopic(t.slug) })),
    []
  );

  function chooseQuestion(question: string) {
    setNotFound(false);
    if (needsCountry(question)) {
      setStage({ step: "need-country", question });
    } else {
      setStage({ step: "answer", question, country: null });
    }
  }

  function handleAsk(event: FormEvent) {
    event.preventDefault();
    const matched = matchQuestion(typed);
    if (!matched) {
      setNotFound(true);
      setStage({ step: "browse" });
      return;
    }
    setNotFound(false);
    chooseQuestion(matched);
  }

  function reset() {
    setStage({ step: "browse" });
    setOpenTopic(null);
    setTyped("");
    setNotFound(false);
  }

  return (
    <div>
      {/* The type-in path. Always available, above the browse path,
          since typing is the faster route for someone who already knows
          their question and the whole point of not calling this a
          category directory. */}
      <form onSubmit={handleAsk} className="relative">
        <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--faint)]" aria-hidden />
        <input
          value={typed}
          onChange={(e) => {
            setTyped(e.target.value);
            if (notFound) setNotFound(false);
          }}
          placeholder="Ask a question, or pick one below"
          aria-label="Ask a question"
          className="h-14 w-full rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface)] pl-11 pr-28 text-[15px] text-[var(--text)] placeholder-[var(--faint)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus:border-[var(--primary)]"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-[var(--brand-ink)] px-4 py-2.5 text-[13px] font-semibold text-[var(--brand-ink-contrast)] transition-colors hover:opacity-90"
        >
          Ask
        </button>
      </form>

      {notFound && (
        <p className="mt-3 text-[13px] leading-relaxed text-[var(--muted)]">
          Nothing in the library covers that yet. Try one of the questions below, or a shorter version of what you
          asked.
        </p>
      )}

      <AnimatePresence mode="wait">
        {stage.step === "browse" && (
          <motion.div
            key="browse"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-8"
          >
            <div className="flex flex-wrap gap-2">
              {topicsWithQuestions.map((topic) => {
                const isOpen = topic.slug === openTopic;
                const disabled = topic.questions.length === 0;
                return (
                  <button
                    key={topic.slug}
                    type="button"
                    disabled={disabled}
                    aria-expanded={isOpen}
                    onClick={() => setOpenTopic(isOpen ? null : topic.slug)}
                    className={[
                      "rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors",
                      disabled
                        ? "cursor-default border-[var(--border)] text-[var(--faint)]"
                        : isOpen
                          ? "border-transparent bg-[var(--brand-ink)] text-[var(--brand-ink-contrast)]"
                          : "border-[var(--border-strong)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--brand-ink)] hover:text-[var(--text)]",
                    ].join(" ")}
                  >
                    {topic.label}
                    {!disabled && <span className="ml-1.5 opacity-60">{topic.questions.length}</span>}
                  </button>
                );
              })}
            </div>

            {openTopic && (
              <ul className="mt-5 flex flex-col gap-2" role="list">
                {topicsWithQuestions
                  .find((t) => t.slug === openTopic)!
                  .questions.map((q) => (
                    <li key={q}>
                      <button
                        type="button"
                        onClick={() => chooseQuestion(q)}
                        className="group flex w-full items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5 text-left transition-colors hover:border-[var(--primary)]"
                      >
                        <span className="text-[14.5px] text-[var(--text)]">{q}</span>
                        <ArrowRight size={15} aria-hidden className="shrink-0 text-[var(--faint)] transition-colors group-hover:text-[var(--primary)]" />
                      </button>
                    </li>
                  ))}
              </ul>
            )}

            {topicsWithQuestions.every((t) => t.questions.length === 0) === false &&
              topicsWithQuestions.some((t) => t.questions.length === 0) &&
              !openTopic && (
                <p className="mt-5 text-[13px] leading-relaxed text-[var(--faint)]">
                  Categories without a number are in the library plan but nothing is written yet. Nothing here is
                  filled in with a guess to look complete.
                </p>
              )}
          </motion.div>
        )}

        {stage.step === "need-country" && (
          <motion.div
            key="country"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.24 }}
            className="mt-8 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-6"
          >
            <div className="flex items-center gap-2.5">
              <Globe size={17} className="text-[var(--primary)]" aria-hidden />
              <p className="text-[13px] font-semibold text-[var(--text)]">This one depends on where you are.</p>
            </div>
            <p className="mt-2 text-[14px] leading-relaxed text-[var(--muted)]">
              &ldquo;{stage.question}&rdquo; has a different answer by country. Which one are you asking about?
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {(Object.keys(COUNTRY_LABEL) as Country[])
                .filter((c) => entryForQuestionAndCountry(stage.question, c))
                .map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setStage({ step: "answer", question: stage.question, country: c })}
                    className="rounded-full border border-[var(--border-strong)] bg-[var(--bg)] px-4 py-2 text-[13px] font-semibold text-[var(--text)] transition-colors hover:border-[var(--primary)]"
                  >
                    {COUNTRY_LABEL[c]}
                  </button>
                ))}
            </div>
            <button
              type="button"
              onClick={reset}
              className="mt-4 text-[12.5px] font-semibold text-[var(--faint)] hover:text-[var(--muted)]"
            >
              ← Ask something else
            </button>
          </motion.div>
        )}

        {stage.step === "answer" && (
          <motion.div
            key="answer"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.26 }}
            className="mt-8"
          >
            <AnswerCard question={stage.question} country={stage.country} onAskAnother={reset} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AnswerCard({
  question,
  country,
  onAskAnother,
}: {
  question: string;
  country: Country | null;
  onAskAnother: () => void;
}) {
  const entry: AskEntry | undefined = country
    ? entryForQuestionAndCountry(question, country)
    : entriesForQuestion(question)[0];

  const relatedGuide = entry?.relatedGuideSlug ? getGuideBySlug(entry.relatedGuideSlug) : undefined;

  if (!entry) {
    // Reachable if a jurisdiction picked in the country step somehow has
    // no matching entry, which entryForQuestionAndCountry's own filter
    // in the country step should prevent, but the empty state has to be
    // real rather than assumed unreachable.
    return (
      <div className="rounded-[var(--radius-xl)] border border-dashed border-[var(--border)] p-8 text-center">
        <p className="text-[14.5px] leading-relaxed text-[var(--muted)]">
          Nothing verified in the library covers this yet.
        </p>
        <button type="button" onClick={onAskAnother} className="mt-3 text-[13px] font-semibold text-[var(--primary)]">
          Ask something else
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        {entry.jurisdiction !== "universal" && <Badge tone="neutral">{COUNTRY_LABEL[entry.jurisdiction.country]}</Badge>}
        {entry.jurisdiction !== "universal" && "state" in entry.jurisdiction && entry.jurisdiction.state && (
          <Badge tone="neutral">{entry.jurisdiction.state}</Badge>
        )}
        {entry.jurisdiction !== "universal" && "province" in entry.jurisdiction && entry.jurisdiction.province && (
          <Badge tone="neutral">{entry.jurisdiction.province}</Badge>
        )}
      </div>

      <p className="mt-3 font-serif text-[19px] font-semibold leading-snug tracking-tight text-[var(--text)]">
        {entry.question}
      </p>

      {entry.kind === "rule" ? (
        <p className="mt-3.5 text-[15.5px] leading-[1.68] text-[var(--text)]">{entry.answer}</p>
      ) : (
        <div className="mt-3.5">
          <p className="font-serif text-[26px] font-semibold leading-none tracking-tight text-[var(--text)]">
            {entry.low}&ndash;{entry.high}
            <span className="ml-1.5 text-[14px] font-normal text-[var(--muted)]">{entry.unit}</span>
          </p>
          <p className="mt-2.5 text-[13px] leading-relaxed text-[var(--faint)]">
            Varies by {entry.variesBy.join(", ")}.
          </p>
        </div>
      )}

      {entry.changing && (
        <div className="mt-4 rounded-lg bg-[var(--warning-soft)] px-3.5 py-2.5">
          <p className="text-[12.5px] font-semibold leading-relaxed text-[var(--warning)]">Currently changing: {entry.changing}</p>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border)] pt-4">
        <a
          href={entry.source.url}
          target="_blank"
          rel="noreferrer noopener"
          className="text-[12.5px] font-semibold text-[var(--muted)] underline decoration-[var(--border-strong)] underline-offset-2 hover:text-[var(--text)]"
        >
          Source: {entry.source.name}
        </a>
        <span className="text-[12px] text-[var(--faint)]">Verified {entry.verifiedAt}</span>
      </div>

      {relatedGuide && (
        <a
          href={`/guides/${relatedGuide.slug}`}
          className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--primary)] hover:underline"
        >
          Full guide: {relatedGuide.title}
          <ArrowRight size={13} aria-hidden />
        </a>
      )}

      {entry.relatedProductSlug && (
        <div className="mt-5 flex flex-col gap-2 border-t border-[var(--border)] pt-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">Keeps track of this for you</p>
          <a
            href={`/shop/${entry.relatedProductSlug}`}
            className="group flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] px-3.5 py-3 transition-colors hover:border-[var(--primary)]"
          >
            <span className="flex items-center gap-2 text-[14px] font-semibold text-[var(--text)]">
              <Check size={14} className="text-[var(--success)]" aria-hidden />
              See the product
            </span>
            <ArrowRight size={15} aria-hidden className="text-[var(--primary)]" />
          </a>
        </div>
      )}

      <button type="button" onClick={onAskAnother} className="mt-5 text-[13px] font-semibold text-[var(--primary)]">
        Ask something else
      </button>
    </div>
  );
}

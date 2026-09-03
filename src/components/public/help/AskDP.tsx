"use client";

import { useEffect, useMemo, useState, type FormEvent, type KeyboardEvent } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, BadgeCheck, Check, Compass, Globe, MessageCircle, Search } from "@/design-system/Icon";
import Badge from "@/design-system/Badge";
import { getGuideBySlug } from "@/content/guides";
import {
  ASK_ENTRIES,
  COUNTRY_LABEL,
  entriesForQuestion,
  entryForQuestionAndCountry,
  fallbackSourcesForTopic,
  findMetaEntry,
  findProblemEntry,
  FEATURED_QUESTIONS,
  guessTopic,
  META_ENTRIES,
  needsCountry,
  PROBLEM_ENTRIES,
  relatedQuestions,
  SEARCH_PLACEHOLDER_EXAMPLES,
  type AskEntry,
  type AskTopic,
  type Country,
  type MetaEntry,
  type ProblemEntry,
} from "@/content/askdp";

/**
 * Ask DP: one flat knowledge hub, not nine browsable sections.
 *
 * Earlier versions of this component grouped everything under topic
 * chips you had to open before seeing a question. That made Ask DP read
 * as a small filing system. The actual point is narrower and more
 * useful than that: a real problem, in the words a person actually has
 * for it, redirected to exactly the slice of official information or
 * the guide or product that fits it, the way the mission page (see
 * /help-with/about-ask-dp) puts it. Filing that behind a category
 * picker first was the wrong shape. `AskTopic` still exists on every
 * entry, it just does two quieter jobs now: guessing a fallback source
 * when nothing matches, and surfacing a few more real entries to "keep
 * exploring" after an answer. It never renders as a browse taxonomy.
 *
 * NOTHING HERE GENERATES TEXT
 *
 * Typing a question runs it through the same lookup the chips use:
 * match against ASK_ENTRIES (sourced facts), PROBLEM_ENTRIES (real,
 * researched everyday problems, redirected rather than cited), and
 * META_ENTRIES (questions about the tool itself), never compose a
 * sentence. What a visitor reads is always one of the hand-written
 * entries in content/askdp.ts, or an honest miss with a pointer toward
 * an already-verified source, never a guess dressed up to look certain.
 */

type Stage =
  | { step: "browse" }
  | { step: "no-match"; input: string }
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

// Every typed-question candidate, paired with the canonical question or
// phrase it resolves to. An alias ("are you chatgpt", "ynab is too
// expensive") is a separate candidate from its canonical form, so a
// match on either lands on the same answer without duplicating it.
function matchCandidates(): { text: string; canonical: string }[] {
  const out: { text: string; canonical: string }[] = [];
  const seenCanonical = new Set<string>();
  for (const entry of ASK_ENTRIES) {
    if (seenCanonical.has(entry.question)) continue;
    seenCanonical.add(entry.question);
    out.push({ text: entry.question, canonical: entry.question });
  }
  for (const meta of META_ENTRIES) {
    out.push({ text: meta.question, canonical: meta.question });
    for (const alias of meta.aliases) out.push({ text: alias, canonical: meta.question });
  }
  for (const problem of PROBLEM_ENTRIES) {
    out.push({ text: problem.phrase, canonical: problem.phrase });
    for (const alias of problem.aliases) out.push({ text: alias, canonical: problem.phrase });
  }
  return out;
}

function matchQuestion(input: string): string | null {
  const normalized = input.trim().toLowerCase();
  if (!normalized) return null;
  const candidates = matchCandidates();
  // Exact match first, so a chip click and a typed copy of the same
  // question, or a typed alias, always resolve identically.
  const strip = (s: string) => s.toLowerCase().replace(/[?.,!]/g, "");
  for (const c of candidates) if (strip(c.text) === strip(normalized)) return c.canonical;
  // Otherwise, a keyword overlap over content words only, so a stopword
  // a visitor happened to skip, or a paraphrase like "put in" for
  // "contribute", doesn't sink an otherwise clear match. Deliberately
  // simple and deterministic rather than fuzzy, so a match can always
  // be explained, and a genuine miss falls through to the honest empty
  // state instead of guessing at what was meant.
  const words = contentWords(normalized);
  let best: { canonical: string; score: number } | null = null;
  for (const c of candidates) {
    const cWords = contentWords(c.text);
    if (cWords.length === 0) continue;
    const hits = cWords.filter((w) => words.some((typed) => typed.includes(w) || w.includes(typed)));
    const score = hits.length / cWords.length;
    if (score >= 0.5 && (!best || score > best.score)) best = { canonical: c.canonical, score };
  }
  return best?.canonical ?? null;
}

/** Live suggestions while typing, not just on submit: a substring match
 *  ("sub" -> "...cancel a subscription...") ranked by how early and how
 *  close to a whole word it lands, so partial typing feels responsive
 *  instead of requiring a full question before anything happens. Distinct
 *  canonical entries only, so an alias never shows up as a second row
 *  for the same answer it already resolves to. */
function suggestQuestions(input: string, limit = 5): string[] {
  const normalized = input.trim().toLowerCase();
  if (normalized.length < 2) return [];
  const seen = new Set<string>();
  const scored: { canonical: string; score: number }[] = [];
  for (const c of matchCandidates()) {
    if (seen.has(c.canonical)) continue;
    const text = c.text.toLowerCase();
    const index = text.indexOf(normalized);
    if (index === -1) continue;
    seen.add(c.canonical);
    // Earlier in the string, and right on a word boundary, ranks higher.
    const onWordBoundary = index === 0 || /\s/.test(text[index - 1]);
    scored.push({ canonical: c.canonical, score: index - (onWordBoundary ? 1000 : 0) });
  }
  scored.sort((a, b) => a.score - b.score);
  return scored.slice(0, limit).map((s) => s.canonical);
}

export default function AskDP() {
  const reduceMotion = useReducedMotion();
  const [stage, setStage] = useState<Stage>({ step: "browse" });
  const [typed, setTyped] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [highlighted, setHighlighted] = useState(0);

  // Rotates the search box's own placeholder through real examples, only
  // while it's actually empty and not being looked at: a hint that keeps
  // changing under someone's cursor while they're mid-thought would be
  // the wrong kind of "engaging."
  useEffect(() => {
    if (inputFocused || typed) return;
    const id = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % SEARCH_PLACEHOLDER_EXAMPLES.length);
    }, 3200);
    return () => clearInterval(id);
  }, [inputFocused, typed]);

  // Live, as typed, not only on submit: this is what makes the box feel
  // like it's actually listening rather than a form waiting to be
  // checked. Only offered on the browse stage, and only once there's
  // enough to go on (see suggestQuestions' own two-character floor).
  const suggestions = useMemo(
    () => (stage.step === "browse" ? suggestQuestions(typed) : []),
    [stage.step, typed]
  );
  const showSuggestions = inputFocused && suggestions.length > 0;
  const suggestionsKey = suggestions.join("|");

  useEffect(() => {
    setHighlighted(0);
  }, [suggestionsKey]);

  function chooseQuestion(question: string) {
    setTyped("");
    if (needsCountry(question)) {
      setStage({ step: "need-country", question });
    } else {
      setStage({ step: "answer", question, country: null });
    }
  }

  function handleAsk(event: FormEvent) {
    event.preventDefault();
    if (showSuggestions) {
      chooseQuestion(suggestions[highlighted]);
      return;
    }
    const matched = matchQuestion(typed);
    if (!matched) {
      setStage({ step: "no-match", input: typed });
      return;
    }
    chooseQuestion(matched);
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (showSuggestions && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      event.preventDefault();
      const delta = event.key === "ArrowDown" ? 1 : -1;
      setHighlighted((h) => (h + delta + suggestions.length) % suggestions.length);
    } else if (event.key === "Escape") {
      if (typed) setTyped("");
      else if (stage.step !== "browse") reset();
    }
  }

  function reset() {
    setStage({ step: "browse" });
    setTyped("");
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
          onChange={(e) => setTyped(e.target.value)}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          onKeyDown={handleInputKeyDown}
          placeholder={SEARCH_PLACEHOLDER_EXAMPLES[0]}
          aria-label="Ask a question"
          role="combobox"
          aria-expanded={showSuggestions}
          aria-controls="ask-dp-suggestions"
          aria-activedescendant={showSuggestions ? `ask-dp-suggestion-${highlighted}` : undefined}
          autoComplete="off"
          className="h-14 w-full rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface)] pl-11 pr-28 text-[15px] text-[var(--text)] placeholder:text-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus:border-[var(--primary)]"
        />
        {/* The real placeholder attribute above is a static, non-animating
            fallback (first-paint and screen readers). This overlay is
            what's actually seen: a rotating example that crossfades
            instead of cutting, hidden the moment there's real input.
            pointer-events-none, so it never intercepts a click meant for
            the input beneath it. */}
        {!typed && (
          <div className="pointer-events-none absolute left-11 right-28 top-1/2 -translate-y-1/2 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.span
                key={placeholderIndex}
                initial={reduceMotion ? false : { opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -5 }}
                transition={{ duration: 0.28 }}
                className="block truncate text-[15px] text-[var(--faint)]"
              >
                {SEARCH_PLACEHOLDER_EXAMPLES[placeholderIndex]}
              </motion.span>
            </AnimatePresence>
          </div>
        )}
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-[var(--brand-ink)] px-4 py-2.5 text-[13px] font-semibold text-[var(--brand-ink-contrast)] transition-colors hover:opacity-90"
        >
          Ask
        </button>

        {/* Live, as-typed suggestions: real library entries only, ranked
            by substring position, never a generated completion. Selected
            with the mouse or the keyboard (Up/Down to move, Enter to
            pick); onMouseDown rather than onClick so a click registers
            before the input's onBlur would otherwise close this first. */}
        <AnimatePresence>
          {showSuggestions && (
            <motion.ul
              id="ask-dp-suggestions"
              role="listbox"
              initial={reduceMotion ? false : { opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
              transition={{ duration: 0.14 }}
              className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface)] py-1.5 shadow-[shadow:var(--shadow-md)]"
            >
              {suggestions.map((q, i) => (
                <li key={q} role="option" id={`ask-dp-suggestion-${i}`} aria-selected={i === highlighted}>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      chooseQuestion(q);
                    }}
                    onMouseEnter={() => setHighlighted(i)}
                    className={[
                      "flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[14px] transition-colors",
                      i === highlighted ? "bg-[var(--surface-muted)] text-[var(--text)]" : "text-[var(--muted)]",
                    ].join(" ")}
                  >
                    <Search size={14} className="shrink-0 text-[var(--faint)]" aria-hidden />
                    <span className="truncate">{q}</span>
                  </button>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </form>

      {stage.step === "browse" && (
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-[12.5px] text-[var(--faint)]">
            Real questions and real everyday problems, answered from the library, not guessed.
          </p>
          <Link
            href="/help-with/about-ask-dp"
            className="shrink-0 text-[12.5px] font-semibold text-[var(--primary)] hover:underline"
          >
            Curious about this? Learn more
          </Link>
        </div>
      )}

      <AnimatePresence mode="wait">
        {stage.step === "browse" && (
          <motion.div
            key="browse"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-6 flex flex-wrap gap-2"
          >
            {FEATURED_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => chooseQuestion(q)}
                className="rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 py-2 text-[13px] font-semibold text-[var(--muted)] transition-colors hover:border-[var(--brand-ink)] hover:text-[var(--text)]"
              >
                {q}
              </button>
            ))}
          </motion.div>
        )}

        {stage.step === "no-match" && (
          <motion.div
            key="no-match"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.24 }}
            className="mt-8"
          >
            <NoMatchCard input={stage.input} onAskAnother={reset} onPick={chooseQuestion} />
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
            <AnswerCard question={stage.question} country={stage.country} onAskAnother={reset} onPick={chooseQuestion} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Real other questions from the same topic, purely as clickable links:
 *  never generated, always a real library entry, same discipline as
 *  everything else this renders. Absent entirely once there's nothing
 *  left to point to, rather than padded out to look fuller. */
function KeepExploring({ topic, exclude, onPick }: { topic: AskTopic; exclude: string; onPick: (q: string) => void }) {
  const more = relatedQuestions(topic, exclude);
  if (more.length === 0) return null;
  return (
    <div className="mt-5 border-t border-[var(--border)] pt-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">Keep exploring this</p>
      <div className="mt-2.5 flex flex-wrap gap-2" role="list">
        {more.map((q) => (
          <button
            key={q}
            type="button"
            role="listitem"
            onClick={() => onPick(q)}
            className="rounded-full border border-[var(--border)] bg-[var(--bg)] px-3.5 py-1.5 text-left text-[13px] font-medium text-[var(--muted)] transition-colors hover:border-[var(--primary)] hover:text-[var(--text)]"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

function NoMatchCard({
  input,
  onAskAnother,
  onPick,
}: {
  input: string;
  onAskAnother: () => void;
  onPick: (q: string) => void;
}) {
  const guessedTopic = guessTopic(input);
  const fallback = guessedTopic ? fallbackSourcesForTopic(guessedTopic) : [];

  return (
    <div className="rounded-[var(--radius-xl)] border border-dashed border-[var(--border)] p-6 sm:p-8">
      <p className="text-[14.5px] leading-relaxed text-[var(--text)]">
        Nothing in the library covers that yet, and it's not going to guess rather than say so.
      </p>

      {fallback.length > 0 && (
        <div className="mt-4">
          <p className="text-[12.5px] font-semibold text-[var(--muted)]">
            Based on what you asked, one of these official sources might help directly:
          </p>
          <ul className="mt-2 flex flex-col gap-1.5" role="list">
            {fallback.map((s) => (
              <li key={s.url}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-[13.5px] font-semibold text-[var(--primary)] underline decoration-[var(--border-strong)] underline-offset-2 hover:no-underline"
                >
                  {s.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-5 border-t border-[var(--border)] pt-5">
        <p className="text-[12.5px] font-semibold text-[var(--muted)]">Or try one of these:</p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {FEATURED_QUESTIONS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => onPick(q)}
              className="rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 py-2 text-[13px] font-semibold text-[var(--muted)] transition-colors hover:border-[var(--brand-ink)] hover:text-[var(--text)]"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      <button type="button" onClick={onAskAnother} className="mt-5 text-[13px] font-semibold text-[var(--primary)]">
        Ask something else
      </button>
    </div>
  );
}

function AnswerCard({
  question,
  country,
  onAskAnother,
  onPick,
}: {
  question: string;
  country: Country | null;
  onAskAnother: () => void;
  onPick: (q: string) => void;
}) {
  const entry: AskEntry | undefined = country
    ? entryForQuestionAndCountry(question, country)
    : entriesForQuestion(question)[0];

  const relatedGuide = entry?.relatedGuideSlug ? getGuideBySlug(entry.relatedGuideSlug) : undefined;

  // Checked in order once the fact library has nothing: a meta question,
  // a problem phrase, and a real AskEntry question never collide, since
  // all three are written from separate, non-overlapping question sets.
  const meta: MetaEntry | undefined = !entry ? findMetaEntry(question) : undefined;
  if (meta) return <MetaAnswerCard meta={meta} onAskAnother={onAskAnother} />;

  const problem: ProblemEntry | undefined = !entry ? findProblemEntry(question) : undefined;
  if (problem) return <ProblemAnswerCard problem={problem} onAskAnother={onAskAnother} onPick={onPick} />;

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
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--success)]">
          <BadgeCheck size={14} aria-hidden />
          Sourced answer
        </span>
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

      {entry.wealthdrafts && (
        <a
          href={entry.wealthdrafts.url}
          target="_blank"
          rel="noopener"
          className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--primary)] hover:underline"
        >
          More from Wealth Drafts: {entry.wealthdrafts.title}
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

      <KeepExploring topic={entry.topic} exclude={entry.question} onPick={onPick} />

      <button type="button" onClick={onAskAnother} className="mt-5 text-[13px] font-semibold text-[var(--primary)]">
        Ask something else
      </button>
    </div>
  );
}

/**
 * A real, researched everyday problem, not a sourced legal fact: no
 * jurisdiction badge, no Source/Verified footer (there's nothing to
 * cite for "you're not alone in this"), the redirect to a guide and
 * product *is* the answer rather than something bolted on afterward.
 */
function ProblemAnswerCard({
  problem,
  onAskAnother,
  onPick,
}: {
  problem: ProblemEntry;
  onAskAnother: () => void;
  onPick: (q: string) => void;
}) {
  const guides = (problem.relatedGuideSlugs ?? [])
    .map((slug) => getGuideBySlug(slug))
    .filter((g): g is NonNullable<typeof g> => Boolean(g));

  return (
    <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--primary)]">
        <Compass size={14} aria-hidden />
        Real problem, real redirect
      </span>
      <p className="mt-3 font-serif text-[19px] font-semibold leading-snug tracking-tight text-[var(--text)]">
        {problem.phrase}
      </p>
      <p className="mt-3.5 text-[15.5px] leading-[1.68] text-[var(--text)]">{problem.response}</p>

      {guides.length > 0 && (
        <div className="mt-4 flex flex-col gap-2 border-t border-[var(--border)] pt-4">
          {guides.map((guide) => (
            <a
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--primary)] hover:underline"
            >
              Full guide: {guide.title}
              <ArrowRight size={13} aria-hidden />
            </a>
          ))}
        </div>
      )}

      {problem.relatedProductSlug && (
        <div className="mt-5 flex flex-col gap-2 border-t border-[var(--border)] pt-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">Keeps track of this for you</p>
          <a
            href={`/shop/${problem.relatedProductSlug}`}
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

      <KeepExploring topic={problem.topic} exclude={problem.phrase} onPick={onPick} />

      <button type="button" onClick={onAskAnother} className="mt-5 text-[13px] font-semibold text-[var(--primary)]">
        Ask something else
      </button>
    </div>
  );
}

/**
 * A question about the tool, not a sourced fact: no jurisdiction badge, no
 * Source/Verified footer (there is nothing to cite for "what are you?"),
 * no product handoff, no "keep exploring" (meta questions aren't part of
 * the topic-tagged everyday-problem library that powers it). Visually
 * lighter than the other cards on purpose, so it reads as a straight,
 * honest answer rather than another library entry.
 */
function MetaAnswerCard({ meta, onAskAnother }: { meta: MetaEntry; onAskAnother: () => void }) {
  return (
    <div className="rounded-[var(--radius-xl)] border border-dashed border-[var(--border-strong)] bg-[var(--surface)] p-5 sm:p-6">
      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">
        <MessageCircle size={14} aria-hidden />
        About Ask DP
      </span>
      <p className="mt-3 font-serif text-[19px] font-semibold leading-snug tracking-tight text-[var(--text)]">
        {meta.question}
      </p>
      <p className="mt-3.5 text-[15.5px] leading-[1.68] text-[var(--text)]">{meta.answer}</p>
      <Link
        href="/help-with/about-ask-dp"
        className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--primary)] hover:underline"
      >
        More about Ask DP
        <ArrowRight size={13} aria-hidden />
      </Link>
      <button type="button" onClick={onAskAnother} className="mt-5 block text-[13px] font-semibold text-[var(--primary)]">
        Ask something else
      </button>
    </div>
  );
}

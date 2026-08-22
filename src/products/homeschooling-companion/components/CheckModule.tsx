"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/design-system/Button";
import Input from "@/design-system/Input";
import EmptyState from "@/design-system/EmptyState";
import { Check, ShieldCheck } from "@/design-system/Icon";
import { describeResultError } from "@/product-framework/result";
import { findHomeschoolInstanceId, HOMESCHOOLING_COMPANION_SLUG } from "../instanceData";
import { loadChildren, loadChildTopics, type ChildTopic } from "../domain/learningData";
import {
  createItem,
  finishCheck,
  loadItems,
  loadPastResults,
  recordAnswer,
  startCheck,
  type PastResult,
  type StartedCheck,
} from "../domain/checkData";
import {
  assembleCheck,
  CONFIDENCE_FLOOR,
  deriveResult,
  describeResult,
  describeStanding,
  shortfall,
  STANDING_LABEL,
  suggestion,
  type CheckAnswer,
  type CheckItem,
} from "../check";
import { TOPIC_BY_KEY } from "../taxonomy";
import type { Child } from "../learning";

type LoadStatus = "loading" | "ready" | "not-found" | "no-instance" | "error";
type Stage = "choose" | "questions" | "asking" | "results";

/**
 * Checking whether something landed.
 *
 * The parent chooses, the parent administers, the parent marks. This
 * product supplies the topics, the confidence floor and the language,
 * and supplies no questions at all: they are written here by the parent
 * and kept, or they come from the curriculum the family already owns.
 *
 * Nothing on this screen ever implies the product wrote a question, and
 * nothing on the results screen ever says anything about the child. See
 * check.ts, where all of that is enforced and tested.
 */
export default function CheckModule({ childId }: { childId: string }) {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [child, setChild] = useState<Child | null>(null);
  const [topics, setTopics] = useState<ChildTopic[]>([]);
  const [priors, setPriors] = useState<PastResult[]>([]);

  const [stage, setStage] = useState<Stage>("choose");
  const [scope, setScope] = useState<"recent" | "earlier">("recent");
  const [chosen, setChosen] = useState<string[]>([]);
  const [bank, setBank] = useState<CheckItem[]>([]);
  const [draftPrompt, setDraftPrompt] = useState("");
  const [draftAnswer, setDraftAnswer] = useState("");
  const [draftTopic, setDraftTopic] = useState<string | null>(null);
  const [started, setStarted] = useState<StartedCheck | null>(null);
  const [answers, setAnswers] = useState<CheckAnswer[]>([]);
  const [index, setIndex] = useState(0);
  const [response, setResponse] = useState("");
  const [pending, setPending] = useState(false);

  const load = useCallback(async () => {
    const found = await findHomeschoolInstanceId();
    if (found.status === "error") {
      setErrorMessage(found.message);
      setStatus("error");
      return;
    }
    if (found.status === "not-found") {
      setStatus("no-instance");
      return;
    }
    setInstanceId(found.id);
    const [childrenResult, topicsResult, priorsResult] = await Promise.all([
      loadChildren(found.id),
      loadChildTopics(found.id),
      loadPastResults(found.id, childId),
    ]);
    if (!childrenResult.ok) {
      setErrorMessage(describeResultError(childrenResult.error));
      setStatus("error");
      return;
    }
    const match = childrenResult.data.find((c) => c.id === childId) ?? null;
    if (!match) {
      setStatus("not-found");
      return;
    }
    setChild(match);
    setTopics(topicsResult.ok ? topicsResult.data.filter((t) => t.childId === childId) : []);
    setPriors(priorsResult.ok ? priorsResult.data : []);
    setStatus("ready");
  }, [childId]);

  useEffect(() => {
    load();
  }, [load]);

  const available = topics.filter((t) => (scope === "recent" ? t.state === "current" : t.state === "covered"));

  async function goToQuestions() {
    if (!instanceId || chosen.length === 0) return;
    setPending(true);
    setErrorMessage(null);
    const result = await loadItems(instanceId, chosen);
    setPending(false);
    if (!result.ok) {
      setErrorMessage(describeResultError(result.error));
      return;
    }
    setBank(result.data);
    setDraftTopic(chosen[0]);
    setStage("questions");
  }

  async function addQuestion() {
    if (!instanceId || !draftTopic || !draftPrompt.trim()) return;
    setPending(true);
    setErrorMessage(null);
    const result = await createItem(instanceId, {
      topicKey: draftTopic,
      prompt: draftPrompt,
      expectedAnswer: draftAnswer || null,
      source: "parent",
    });
    setPending(false);
    if (!result.ok) {
      setErrorMessage(describeResultError(result.error));
      return;
    }
    setBank((prev) => [...prev, result.data]);
    setDraftPrompt("");
    setDraftAnswer("");
  }

  async function begin() {
    if (!instanceId || !child) return;
    const seed = `${child.id}:${Date.now()}`;
    const picked = assembleCheck({ topicKeys: chosen, available: bank, seed });
    if (picked.length === 0) return;
    setPending(true);
    setErrorMessage(null);
    const result = await startCheck(instanceId, {
      childId: child.id,
      scope: scope === "recent" ? "recent" : "earlier",
      topicKeys: chosen,
      seed,
      items: picked,
    });
    setPending(false);
    if (!result.ok) {
      setErrorMessage(describeResultError(result.error));
      return;
    }
    setStarted(result.data);
    setAnswers([]);
    setIndex(0);
    setStage("asking");
  }

  async function mark(markValue: CheckAnswer["mark"]) {
    if (!instanceId || !started) return;
    const current = started.items[index];
    setPending(true);
    const saved = await recordAnswer(instanceId, {
      checkId: started.checkId,
      checkItemId: current.checkItemId,
      topicKey: current.topicKey,
      mark: markValue,
      response: response || null,
    });
    setPending(false);
    if (!saved.ok) {
      setErrorMessage(describeResultError(saved.error));
      return;
    }
    const next = [...answers, { itemId: current.checkItemId, topicKey: current.topicKey, mark: markValue }];
    setAnswers(next);
    setResponse("");

    if (index + 1 < started.items.length) {
      setIndex(index + 1);
      return;
    }

    const asked: CheckItem[] = started.items.map((item) => ({
      id: item.checkItemId,
      topicKey: item.topicKey,
      source: "parent",
      prompt: item.prompt,
      expectedAnswer: item.expectedAnswer,
    }));
    const result = deriveResult(asked, next);
    setPending(true);
    await finishCheck(instanceId, { checkId: started.checkId, childId, standings: result.topics });
    setPending(false);
    setStage("results");
    load();
  }

  if (status === "loading") return <p className="text-[13px] text-[var(--faint)]">Loading...</p>;
  if (status === "no-instance" || status === "not-found") {
    return <EmptyState icon={ShieldCheck} title="No such child" description="This may have been removed, or the link may be wrong." />;
  }
  if (status === "error" || !child) {
    return <EmptyState icon={ShieldCheck} title="Couldn't load this" description={errorMessage ?? "Try again."} />;
  }

  const backLink = (
    <Link
      href={`/app/products/${HOMESCHOOLING_COMPANION_SLUG}/kids/${child.id}`}
      className="text-[12px] font-semibold text-[var(--muted)] hover:text-[var(--text)]"
    >
      Back to {child.name}
    </Link>
  );

  const errorBanner = errorMessage && (
    <p className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-[13px] text-[var(--danger)]">
      {errorMessage}
    </p>
  );

  // ------------------------------------------------------------ results
  if (stage === "results" && started) {
    const asked: CheckItem[] = started.items.map((item) => ({
      id: item.checkItemId,
      topicKey: item.topicKey,
      source: "parent",
      prompt: item.prompt,
      expectedAnswer: item.expectedAnswer,
    }));
    const result = deriveResult(asked, answers);
    const earlier = priors.filter((p) => !answers.some((a) => a.topicKey === p.topicKey && p.checkId === started.checkId));

    return (
      <div className="flex flex-col gap-6">
        {backLink}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">What came back</p>
          <h1
            className="mt-2 text-[26px] leading-tight text-[var(--text)]"
            style={{ fontFamily: "var(--product-narrative-font, inherit)" }}
          >
            {describeResult(result)}
          </h1>
        </div>

        <div className="flex flex-col">
          {result.topics.map((topic) => {
            const advice = suggestion(topic, earlier);
            return (
              <div key={topic.topicKey} className="border-b border-[var(--border)] py-3.5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h2 className="text-[14.5px] text-[var(--text)]">{describeStanding(topic)}</h2>
                  <span className="text-[11px] font-semibold text-[var(--primary)]">
                    {STANDING_LABEL[topic.standing]}
                  </span>
                </div>
                <p className="mt-0.5 text-[12px] text-[var(--faint)]">
                  {/* The evidence, quietly, so a parent can see why the
                      product said what it said. Never the headline. */}
                  {topic.answered === 0
                    ? "Nothing answered on this."
                    : `${topic.right} of ${topic.answered} answered questions.`}
                </p>
                {advice && <p className="mt-1.5 text-[12.5px] leading-relaxed text-[var(--muted)]">{advice}</p>}
              </div>
            );
          })}
        </div>

        <p className="max-w-lg text-[12.5px] leading-relaxed text-[var(--faint)]">
          This is a short check you ran at home, not an assessment. It says what came back from these questions on this
          day, and nothing about {child.name}.
        </p>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" href={`/app/products/${HOMESCHOOLING_COMPANION_SLUG}/kids/${child.id}`}>
            Done
          </Button>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------- asking
  if (stage === "asking" && started) {
    const current = started.items[index];
    return (
      <div className="flex flex-col gap-5">
        {backLink}
        {errorBanner}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">
            Checking {child.name}
          </p>
          <p className="mt-1.5 text-[12px] text-[var(--faint)]">
            Question {index + 1} of {started.items.length} · {TOPIC_BY_KEY[current.topicKey]?.label ?? current.topicKey}
          </p>
          <h1
            className="mt-3 text-[24px] leading-snug text-[var(--text)]"
            style={{ fontFamily: "var(--product-narrative-font, inherit)" }}
          >
            {current.prompt}
          </h1>
        </div>

        <Input
          value={response}
          placeholder="What they said, if you want it written down"
          onChange={(event) => setResponse(event.target.value)}
        />

        {current.expectedAnswer && (
          <p className="text-[12.5px] text-[var(--muted)]">You noted the answer as: {current.expectedAnswer}</p>
        )}

        <div className="flex flex-wrap gap-2">
          <Button size="sm" disabled={pending} onClick={() => mark("right")}>
            Right
          </Button>
          <Button size="sm" variant="secondary" disabled={pending} onClick={() => mark("not-right")}>
            Not right
          </Button>
          <Button size="sm" variant="ghost" disabled={pending} onClick={() => mark("skipped")}>
            Skip
          </Button>
        </div>
        <p className="max-w-lg text-[12px] leading-relaxed text-[var(--faint)]">
          You mark it, because you are the one who can tell. A skipped question counts for nothing in either direction.
        </p>
      </div>
    );
  }

  // ---------------------------------------------------------- questions
  if (stage === "questions") {
    const counts = chosen.map((key) => ({
      key,
      label: TOPIC_BY_KEY[key]?.label ?? key,
      have: bank.filter((i) => i.topicKey === key).length,
      need: shortfall(key, bank),
    }));
    const total = bank.filter((i) => chosen.includes(i.topicKey)).length;

    return (
      <div className="flex flex-col gap-6">
        {backLink}
        {errorBanner}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">The questions</p>
          <h1
            className="mt-2 text-[26px] leading-tight text-[var(--text)]"
            style={{ fontFamily: "var(--product-narrative-font, inherit)" }}
          >
            Where are the questions coming from?
          </h1>
          <p className="mt-2 max-w-lg text-[13.5px] leading-relaxed text-[var(--muted)]">
            This product does not write them. Use your curriculum&rsquo;s own test, use the printed check sheets, or
            write a few here and they are kept for next time.
          </p>
        </div>

        <div className="flex flex-col">
          {counts.map((topic) => (
            <div key={topic.key} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-[var(--border)] py-2.5">
              <span className="text-[14px] text-[var(--text)]">{topic.label}</span>
              <span className="text-[12.5px] text-[var(--muted)]">
                {topic.have === 0
                  ? "No questions yet"
                  : topic.need > 0
                    ? `${topic.have} so far, ${topic.need} more before this can say anything`
                    : `${topic.have} questions`}
              </span>
            </div>
          ))}
        </div>

        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="text-[15px] font-semibold text-[var(--text)]">Write one</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {chosen.map((key) => (
              <Button
                key={key}
                size="sm"
                variant={draftTopic === key ? "primary" : "secondary"}
                onClick={() => setDraftTopic(key)}
              >
                {TOPIC_BY_KEY[key]?.label ?? key}
              </Button>
            ))}
          </div>
          <div className="mt-3 flex flex-col gap-2">
            <Input
              value={draftPrompt}
              placeholder="What is 3/6 the same as?"
              onChange={(event) => setDraftPrompt(event.target.value)}
            />
            <Input
              value={draftAnswer}
              placeholder="The answer, if you want it noted (optional)"
              onChange={(event) => setDraftAnswer(event.target.value)}
            />
            <div>
              <Button size="sm" disabled={pending || !draftPrompt.trim() || !draftTopic} onClick={addQuestion}>
                {pending ? "Saving..." : "Add it"}
              </Button>
            </div>
          </div>
        </section>

        {total < CONFIDENCE_FLOOR && (
          <p className="max-w-lg text-[12.5px] leading-relaxed text-[var(--muted)]">
            You can run a check with fewer, and it will still be recorded. It will say there was not enough to draw
            anything from, because there would not be.
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <Button size="sm" disabled={pending || total === 0} onClick={begin}>
            Start the check
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setStage("choose")}>
            Back
          </Button>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------- choose
  return (
    <div className="flex flex-col gap-6">
      {backLink}
      {errorBanner}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Check {child.name}</p>
        <h1
          className="mt-2 text-[26px] leading-tight text-[var(--text)]"
          style={{ fontFamily: "var(--product-narrative-font, inherit)" }}
        >
          What would you like to check?
        </h1>
        <p className="mt-2 max-w-lg text-[13.5px] leading-relaxed text-[var(--muted)]">
          Only what {child.name} has actually been working with. Nothing here is generated, and nothing is compared to
          anybody else.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={scope === "recent" ? "primary" : "secondary"}
          onClick={() => {
            setScope("recent");
            setChosen([]);
          }}
        >
          What they are doing now
        </Button>
        <Button
          size="sm"
          variant={scope === "earlier" ? "primary" : "secondary"}
          onClick={() => {
            setScope("earlier");
            setChosen([]);
          }}
        >
          Earlier work
        </Button>
      </div>

      {available.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title={scope === "recent" ? "Nothing marked as current" : "Nothing marked as covered"}
          description={
            /*
              The other scope having topics changes what is true here.
              Telling a parent to go and tick something when they already
              have, and it is sitting one tab away, reads as the product
              not looking.
            */
            topics.length > 0
              ? scope === "recent"
                ? `Everything ticked for ${child.name} is marked as already covered. Look at earlier work instead, or mark something as current on their page.`
                : `Nothing has been marked as already covered yet. Check what ${child.name} is doing now instead.`
              : `Tick what ${child.name} is covering on their page first. A check can only ask about what you have said you are teaching.`
          }
        />
      ) : (
        <div className="flex flex-col">
          {available.map((topic) => {
            const on = chosen.includes(topic.topicKey);
            return (
              <button
                key={topic.id}
                type="button"
                aria-pressed={on}
                onClick={() =>
                  setChosen((prev) => (on ? prev.filter((k) => k !== topic.topicKey) : [...prev, topic.topicKey]))
                }
                className="flex items-center gap-3 border-b border-[var(--border)] py-3 text-left"
              >
                <span
                  aria-hidden
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                    on ? "border-[var(--primary)] bg-[var(--primary)]" : "border-[var(--border-strong)]"
                  }`}
                >
                  {on && <Check size={11} className="text-white" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] text-[var(--text)]">
                    {TOPIC_BY_KEY[topic.topicKey]?.label ?? topic.topicKey}
                  </span>
                  <span className="block text-[12px] text-[var(--faint)]">{topic.subject}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div>
        <Button size="sm" disabled={pending || chosen.length === 0} onClick={goToQuestions}>
          Next
        </Button>
      </div>
    </div>
  );
}

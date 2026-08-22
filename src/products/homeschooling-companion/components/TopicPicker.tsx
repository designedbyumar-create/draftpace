"use client";

import { useState } from "react";
import Button from "@/design-system/Button";
import Input from "@/design-system/Input";
import { hasTopicsFor, searchTopics, topicsForSubject } from "../taxonomy";
import type { ChildTopic } from "../domain/learningData";

/**
 * What is this child actually covering?
 *
 * The five second interaction that replaces an entire document parsing
 * pipeline. The parent ticks what they are doing; that is the only thing
 * that can connect "Abeka Unit 3" to a topic a check could ask about,
 * and it is faster and more accurate than any amount of reading their
 * curriculum for them.
 *
 * Nothing here is required. A parent who never ticks anything has a
 * complete product, and simply has no checks available, which the
 * product says plainly rather than working around.
 */
export default function TopicPicker({
  subject,
  ticked,
  pending,
  onToggle,
  onState,
}: {
  subject: string;
  ticked: ChildTopic[];
  pending: boolean;
  onToggle: (topicKey: string, on: boolean) => void;
  onState: (topicKey: string, state: "current" | "covered") => void;
}) {
  const [query, setQuery] = useState("");

  if (!hasTopicsFor(subject)) {
    return (
      <p className="text-[12.5px] leading-relaxed text-[var(--muted)]">
        {/* True, and better than a blank list that looks broken. */}
        We do not have topics for {subject} yet, so there is nothing to tick. Everything else about it still works.
      </p>
    );
  }

  const all = topicsForSubject(subject);
  const shown = query.trim() ? searchTopics(query, subject) : all;
  const stateOf = (key: string) => ticked.find((t) => t.topicKey === key)?.state ?? null;

  return (
    <div className="flex flex-col gap-3">
      {all.length > 10 && (
        <Input
          value={query}
          placeholder={`Search ${subject.toLowerCase()} topics`}
          onChange={(event) => setQuery(event.target.value)}
        />
      )}

      {shown.length === 0 ? (
        <p className="text-[12.5px] text-[var(--muted)]">Nothing matches that.</p>
      ) : (
        <div className="flex flex-col">
          {shown.map((topic) => {
            const state = stateOf(topic.key);
            return (
              <div
                key={topic.key}
                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-[var(--border)] py-2.5"
              >
                <button
                  type="button"
                  disabled={pending}
                  aria-pressed={state !== null}
                  onClick={() => onToggle(topic.key, state === null)}
                  className={`text-left text-[13.5px] transition-colors ${
                    state !== null ? "font-semibold text-[var(--text)]" : "text-[var(--muted)] hover:text-[var(--text)]"
                  }`}
                >
                  {topic.label}
                </button>
                {state !== null && (
                  <div className="flex shrink-0 gap-1.5">
                    {(
                      [
                        ["current", "Doing now"],
                        ["covered", "Already covered"],
                      ] as const
                    ).map(([value, label]) => (
                      <Button
                        key={value}
                        size="sm"
                        variant={state === value ? "primary" : "secondary"}
                        disabled={pending}
                        onClick={() => onState(topic.key, value)}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[12px] leading-relaxed text-[var(--faint)]">
        Only what you are actually teaching. This is what a check would draw on, and nothing else uses it.
      </p>
    </div>
  );
}

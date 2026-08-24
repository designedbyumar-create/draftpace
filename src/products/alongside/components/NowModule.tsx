"use client";

import { useState } from "react";
import Button from "@/design-system/Button";
import EmptyState from "@/design-system/EmptyState";
import { Compass, Plus } from "@/design-system/Icon";
import { deriveAttention, QUIET_LINE } from "../attention";
import { isOpenToWork, type LifeItem } from "../life";
import { PLAYBOOKS, playbooksFor } from "../playbooks";
import type { OutcomeKind, Playbook } from "../playbook";
import type { FinishResult } from "../domain/alongsideData";
import CompanionRun from "./CompanionRun";
import PlaybookChooser from "./PlaybookChooser";
import AddItemForm from "./AddItemForm";
import { useAlongside } from "./useAlongside";

/**
 * Now.
 *
 * What the product says when somebody opens it. Everything here is
 * derived on read from what they recorded: nothing is scheduled, nothing
 * is predicted, and no line appears that cannot be traced to a date or a
 * note they put there themselves.
 *
 * QUIET IS A REAL ANSWER
 *
 * When nothing needs them, this screen says so and stops. It does not
 * fill the space with suggestions, a summary of the week, or a count of
 * what is outstanding. A product for people who are already carrying too
 * much has to be capable of saying there is nothing right now and
 * meaning it.
 *
 * Deliberately absent: a count of anything, a streak, a completion
 * figure, a red badge, and any sentence beginning with "you still
 * have not".
 */
export default function NowModule() {
  const { status, errorMessage, instanceId, items, replaceItem, addItem } = useAlongside();
  const [running, setRunning] = useState<{ playbook: Playbook; item: LifeItem | null } | null>(null);
  const [adding, setAdding] = useState(false);
  /** Which item is being matched to a playbook. One at a time, like everything else here. */
  const [choosing, setChoosing] = useState<string | null>(null);
  const [closing, setClosing] = useState<string | null>(null);

  if (status === "loading") return <p className="text-[13px] text-[var(--faint)]">Loading...</p>;
  if (status === "no-instance") {
    return (
      <EmptyState
        icon={Compass}
        title="Nothing to show yet"
        description="This product has not been set up on your account."
      />
    );
  }
  if (status === "error") {
    return <EmptyState icon={Compass} title="Couldn't load this" description={errorMessage ?? "Try again."} />;
  }
  if (!instanceId) return null;

  function finish(result: FinishResult, outcome: OutcomeKind) {
    if (result.item) replaceItem(result.item);
    setRunning(null);
    // Said once, in the past tense, about the thing rather than the
    // person. Nothing is said at all when they did not get to it.
    setClosing(outcome === "not-yet" ? null : "Recorded.");
  }

  if (running) {
    return (
      <CompanionRun
        instanceId={instanceId}
        playbook={running.playbook}
        item={running.item}
        existingRun={null}
        onFinished={finish}
        onLeft={() => setRunning(null)}
      />
    );
  }

  const attention = deriveAttention({ items }, new Date());
  const byId = new Map(items.map((item) => [item.id, item]));

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Now</p>
        <h1
          className="mt-2 text-[26px] leading-tight text-[var(--text)]"
          style={{ fontFamily: "var(--product-narrative-font, inherit)" }}
        >
          {attention.quiet ? QUIET_LINE : "Worth a look"}
        </h1>
        {attention.quiet && (
          <p className="mt-2 text-[14px] leading-6 text-[var(--muted)]">
            Anything you have recorded is still here in Life.
          </p>
        )}
      </header>

      {closing && <p className="text-[13px] text-[var(--muted)]">{closing}</p>}

      {!attention.quiet && (
        <ul className="flex flex-col gap-3">
          {attention.signals.map((signal) => {
            const item = byId.get(signal.itemId);
            if (!item) return null;
            const available = playbooksFor(item.kind);
            return (
              <li
                key={signal.itemId}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                  {signal.line}
                </p>
                <p className="mt-1.5 text-[16px] leading-6 text-[var(--text)]">{item.title}</p>
                {item.leftOffNote && (
                  <p className="mt-1 text-[13px] leading-5 text-[var(--muted)]">{item.leftOffNote}</p>
                )}
                {/* A waiting item gets no button until the day it is
                    worth chasing. Before then somebody else has the
                    ball; after then, chasing is the action. */}
                {isOpenToWork(item, new Date()) &&
                  available.length > 0 &&
                  (choosing === item.id ? (
                    <PlaybookChooser
                      item={item}
                      onPick={(playbook) => {
                        setChoosing(null);
                        setRunning({ playbook, item });
                      }}
                      onCancel={() => setChoosing(null)}
                    />
                  ) : (
                    <div className="mt-3">
                      <Button size="sm" variant="secondary" onClick={() => setChoosing(item.id)}>
                        Do this with me
                      </Button>
                    </div>
                  ))}
              </li>
            );
          })}
        </ul>
      )}

      {adding ? (
        <AddItemForm
          instanceId={instanceId}
          onAdded={(item) => {
            addItem(item);
            setAdding(false);
          }}
          onCancel={() => setAdding(false)}
        />
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={() => setAdding(true)} iconLeft={<Plus size={14} aria-hidden />}>
            Keep something
          </Button>
          {/* Opening the Companion with nothing behind it is a first
              class path. Somebody with one phone call to make today has
              not asked for a system and should not have to build one. */}
          {PLAYBOOKS.length > 0 && (
            <Button variant="ghost" onClick={() => setRunning({ playbook: PLAYBOOKS[0], item: null })}>
              Help me with something
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

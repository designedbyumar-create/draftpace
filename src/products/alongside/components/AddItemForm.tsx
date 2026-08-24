"use client";

import { useState } from "react";
import Button from "@/design-system/Button";
import Input from "@/design-system/Input";
import { describeResultError } from "@/product-framework/result";
import { KIND_PROMPT, type ItemKind, type LifeItem } from "../life";
import { createItem } from "../domain/alongsideData";

const KIND_ORDER: ItemKind[] = ["commitment", "waiting", "thread", "reference"];

/**
 * Putting something into Life.
 *
 * Two fields and a shape. No project, no tags, no priority, no due date
 * picker on the first screen, no sub-tasks. Everything a capture form
 * asks for is another chance to give up before the thing is written
 * down, and this product's whole premise is that the writing down is the
 * part that has to be effortless.
 *
 * The shape question comes second, after the words, because people
 * arrive with the thing on their mind and not with a category for it.
 */
export default function AddItemForm({
  instanceId,
  onAdded,
  onCancel,
}: {
  instanceId: string;
  onAdded: (item: LifeItem) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<ItemKind>("commitment");
  const [waitingOn, setWaitingOn] = useState("");
  const [when, setWhen] = useState("");
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function save() {
    setPending(true);
    setErrorMessage(null);
    const result = await createItem(instanceId, {
      kind,
      title,
      waitingOn: kind === "waiting" ? waitingOn : null,
      nextAt: when ? new Date(`${when}T09:00:00`).toISOString() : null,
      // True whenever a date came from this form, because it did come
      // from the person. It is what lets attention say "you said you
      // would come back to this" instead of implying the product
      // decided when this was due.
      userChosenDate: when.length > 0,
    });
    setPending(false);
    if (!result.ok) {
      setErrorMessage(describeResultError(result.error));
      return;
    }
    onAdded(result.data);
  }

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <Input
        label="What is it?"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder={kind === "reference" ? "The claim number for the insurance" : "Ring the energy company"}
        // Reference gets its own hint so the field does not quietly
        // become a place to save notes generally. It is for the detail
        // that lets you deal with a specific thing again.
        hint={kind === "reference" ? "A detail you will need for something specific, not a general note." : undefined}
        autoFocus
      />

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1.5 text-[13px] font-semibold text-[var(--text)]">What kind of thing is it?</legend>
        {KIND_ORDER.map((option) => (
          <label
            key={option}
            className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3.5 py-2.5 text-[14px] transition-colors ${
              kind === option
                ? "border-[var(--primary)] bg-[var(--surface-muted)] text-[var(--text)]"
                : "border-[var(--border)] text-[var(--muted)]"
            }`}
          >
            <input
              type="radio"
              name="kind"
              value={option}
              checked={kind === option}
              onChange={() => setKind(option)}
              className="accent-[var(--primary)]"
            />
            {KIND_PROMPT[option]}
          </label>
        ))}
      </fieldset>

      {kind === "waiting" && (
        <Input
          label="Who are you waiting on?"
          value={waitingOn}
          onChange={(event) => setWaitingOn(event.target.value)}
          placeholder="The council"
          hint="However you refer to them is fine."
        />
      )}

      {/* Optional, and last. A required date on a capture form is how
          somebody ends up inventing a deadline to get past the screen,
          and an invented deadline is worse than no date at all: it
          becomes the thing the product nags about. Without one, this
          stays in Life and Now never mentions it, which is the honest
          behaviour rather than a gap. */}
      {kind !== "reference" && (
        <Input
          type="date"
          label={kind === "waiting" ? "When should you check back?" : "Is there a day you want to come back to this?"}
          value={when}
          onChange={(event) => setWhen(event.target.value)}
          hint="Leave this empty if there is no date. Nothing will chase you about it."
        />
      )}

      {errorMessage && <p className="text-[13px] text-[var(--danger)]">{errorMessage}</p>}

      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={save} disabled={pending || title.trim().length === 0}>
          Keep this
        </Button>
        <Button variant="ghost" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
      </div>
    </section>
  );
}

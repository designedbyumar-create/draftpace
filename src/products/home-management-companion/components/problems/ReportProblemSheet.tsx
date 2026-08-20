"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "@/design-system/Button";
import Input from "@/design-system/Input";
import Select from "@/design-system/Select";
import Alert from "@/design-system/Alert";
import { describeResultError } from "@/product-framework/result";
import RecordFormSheet from "../shared/RecordFormSheet";
import { createProblem } from "../../domain/problems";
import { matchProblemSentence } from "../../problemSentence";
import { withArticle } from "../../homeVoice";
import type { HomeItem, ProblemSeverity } from "../../state";

const SEVERITY_LABEL: Record<ProblemSeverity, string> = {
  minor: "Minor",
  moderate: "Worth sorting",
  urgent: "Urgent",
};

/**
 * Telling Home Base something is wrong.
 *
 * One sentence, in the person's own words, is the whole requirement. The
 * sentence becomes the title, so nothing is ever lost in translation,
 * and matching only decides how much arrives already filled in.
 *
 * What is deliberately not asked: how much it will cost, and how big a
 * job it is. Somebody standing in front of a leaking faucet does not
 * know either yet, and asking turns a ten second report into a form.
 * Both are captured later, when the thing is actually resolved and the
 * answers are known.
 */
export default function ReportProblemSheet({
  open,
  instanceId,
  items,
  defaultItemId,
  onClose,
  onSaved,
}: {
  open: boolean;
  instanceId: string | null;
  items: HomeItem[];
  /** Pre-attaches the report when it was started from a particular thing's own surface. */
  defaultItemId?: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [sentence, setSentence] = useState("");
  const [itemId, setItemId] = useState("");
  const [severity, setSeverity] = useState<ProblemSeverity>("moderate");
  const [severityTouched, setSeverityTouched] = useState(false);
  const [itemTouched, setItemTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const active = useMemo(() => items.filter((item) => item.status !== "archived"), [items]);
  const match = useMemo(
    () => (sentence.trim() ? matchProblemSentence(sentence, active) : null),
    [sentence, active]
  );

  useEffect(() => {
    if (!open) return;
    setSentence("");
    setItemId(defaultItemId ?? "");
    setSeverity("moderate");
    setSeverityTouched(false);
    setItemTouched(Boolean(defaultItemId));
    setError(null);
  }, [open, defaultItemId]);

  // What the sentence recognised, unless the person has overridden it.
  useEffect(() => {
    if (!match) return;
    if (!severityTouched) setSeverity(match.severity);
    if (!itemTouched && match.itemId) setItemId(match.itemId);
  }, [match, severityTouched, itemTouched]);

  async function handleSave() {
    const title = sentence.trim();
    if (!title) {
      setError("Tell Home Base what's wrong, in your own words.");
      return;
    }
    if (!instanceId) {
      setError("Couldn't find your home. Try reloading the page.");
      return;
    }
    setSaving(true);
    setError(null);
    const result = await createProblem(instanceId, {
      thingId: itemId || null,
      providerId: null,
      title,
      description: null,
      resolutionStatus: "open",
      severity,
      // Not asked at report time: nobody knows yet. Captured on resolve.
      effort: "moderate",
      estimatedCostMinorUnits: null,
      actualCostMinorUnits: null,
      scheduledAt: null,
      resolvedAt: null,
      snoozedUntil: null,
      notes: null,
      status: "active",
      source: "manual",
    });
    setSaving(false);
    if (!result.ok) {
      setError(describeResultError(result.error));
      return;
    }
    onSaved();
    onClose();
  }

  return (
    <RecordFormSheet
      open={open}
      onClose={onClose}
      title="What's wrong?"
      description="Say it however you'd say it out loud. Home Base will work out the rest."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </>
      }
    >
      <Input
        label="In your own words"
        value={sentence}
        onChange={(event) => setSentence(event.target.value)}
        placeholder="e.g. The garage door is making a grinding noise"
        autoFocus
      />

      {match?.dangerous && (
        <Alert tone="warning">
          That sounds like one to deal with now rather than later. Home Base will keep the note either way.
        </Alert>
      )}

      {match?.matchedOn && !itemTouched && (
        <p className="text-[12px] text-[var(--muted)]">
          {match.kind === "item" && (
            <>
              Sounds like it&apos;s about your <span className="font-semibold text-[var(--text)]">{match.matchedOn}</span>.
            </>
          )}
          {match.kind === "ambiguous" && (
            <>
              Sounds like {withArticle(match.matchedOn)}. You have more than one, so pick which below.
            </>
          )}
          {match.kind === "typeOnly" && (
            <>
              Sounds like {withArticle(match.matchedOn)}, which isn&apos;t in your home yet. Saving this anyway.
            </>
          )}
        </p>
      )}

      <Select
        label="What's it about? (optional)"
        value={itemId}
        onChange={(event) => {
          setItemId(event.target.value);
          setItemTouched(true);
        }}
      >
        <option value="">Not about anything in particular</option>
        {active.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </Select>

      <Select
        label="How bad is it?"
        value={severity}
        onChange={(event) => {
          setSeverity(event.target.value as ProblemSeverity);
          setSeverityTouched(true);
        }}
      >
        {(Object.keys(SEVERITY_LABEL) as ProblemSeverity[]).map((option) => (
          <option key={option} value={option}>
            {SEVERITY_LABEL[option]}
          </option>
        ))}
      </Select>

      {error && <p className="text-[13px] text-[var(--danger)]">{error}</p>}
    </RecordFormSheet>
  );
}

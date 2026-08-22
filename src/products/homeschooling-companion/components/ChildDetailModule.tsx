"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import EmptyState from "@/design-system/EmptyState";
import Toggle from "@/design-system/Toggle";
import { User } from "@/design-system/Icon";
import { describeResultError } from "@/product-framework/result";
import { findHomeschoolInstanceId, HOMESCHOOLING_COMPANION_SLUG } from "../instanceData";
import { loadChildren, loadCurricula, loadPlan, loadPositions, setChildVisibility } from "../domain/learningData";
import {
  curriculaFor,
  describePosition,
  isReadyForToday,
  positionFor,
  SCHOOLING_LABEL,
  SOURCE_LABEL,
  type Child,
  type Curriculum,
  type PlanEntry,
  type Position,
  type Visibility,
} from "../learning";

type LoadStatus = "loading" | "ready" | "not-found" | "no-instance" | "error";

/**
 * One child.
 *
 * What they are learning, where they are in it, and what appears on
 * anything printed. Checking them will live here too, at the top and not
 * in a menu, because checking is a feature of the Companion reached
 * where the parent is already looking at that child.
 *
 * Every curriculum row states where it came from, every time. That is
 * the first of the product's trust rules and the cheapest to keep: a
 * parent must never have to wonder whether this invented something.
 */
export default function ChildDetailModule({ childId }: { childId: string }) {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [child, setChild] = useState<Child | null>(null);
  const [curricula, setCurricula] = useState<Curriculum[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [plan, setPlan] = useState<PlanEntry[]>([]);
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
    const [childrenResult, curriculaResult, positionsResult, planResult] = await Promise.all([
      loadChildren(found.id),
      loadCurricula(found.id),
      loadPositions(found.id),
      loadPlan(found.id),
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
    setCurricula(curriculaResult.ok ? curriculaResult.data : []);
    setPositions(positionsResult.ok ? positionsResult.data : []);
    setPlan(planResult.ok ? planResult.data : []);
    setStatus("ready");
  }, [childId]);

  useEffect(() => {
    load();
  }, [load]);

  async function changeVisibility(field: "name" | "age" | "notes", value: Visibility) {
    setPending(true);
    setErrorMessage(null);
    const result = await setChildVisibility(childId, field, value);
    setPending(false);
    if (!result.ok) {
      setErrorMessage(describeResultError(result.error));
      return;
    }
    setChild(result.data);
  }

  if (status === "loading") return <p className="text-[13px] text-[var(--faint)]">Loading...</p>;
  if (status === "no-instance") {
    return <EmptyState icon={User} title="Nothing here yet" description="This product has not been set up on your account." />;
  }
  if (status === "not-found") {
    return (
      <EmptyState
        icon={User}
        title="No such child"
        description="This may have been removed, or the link may be wrong."
      />
    );
  }
  if (status === "error" || !child) {
    return <EmptyState icon={User} title="Couldn't load this" description={errorMessage ?? "Try again."} />;
  }

  const following = curriculaFor(curricula, child.id);
  const subjects = plan.filter((entry) => entry.childId === child.id && entry.active);
  const ready = isReadyForToday({ child, curricula: following, positions, plan: subjects });
  const detail = [
    child.age !== null ? `Age ${child.age}` : null,
    child.schoolingType ? SCHOOLING_LABEL[child.schoolingType] : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex flex-col gap-7">
      <div>
        <Link
          href={`/app/products/${HOMESCHOOLING_COMPANION_SLUG}/kids`}
          className="text-[12px] font-semibold text-[var(--muted)] hover:text-[var(--text)]"
        >
          All children
        </Link>
        <h1
          className="mt-3 text-[28px] leading-tight text-[var(--text)]"
          style={{ fontFamily: "var(--product-narrative-font, inherit)" }}
        >
          {child.name}
        </h1>
        {detail && <p className="mt-1 text-[13px] text-[var(--muted)]">{detail}</p>}
      </div>

      {errorMessage && (
        <p className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-[13px] text-[var(--danger)]">
          {errorMessage}
        </p>
      )}

      <section aria-label="What they are learning">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">What they are learning</h2>
        {following.length === 0 && subjects.length === 0 ? (
          <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-[var(--muted)]">
            Nothing recorded yet. You can add subjects or a curriculum whenever you like, and this product works
            without either: recording what you actually did is enough on its own.
          </p>
        ) : (
          <div className="mt-2 flex flex-col">
            {following.map((curriculum) => {
              const where = describePosition(positionFor(positions, child.id, curriculum.id));
              return (
                <div key={curriculum.id} className="border-b border-[var(--border)] py-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="text-[14px] font-semibold text-[var(--text)]">{curriculum.subject}</h3>
                    {/* Where it came from, every time it is shown. */}
                    <span className="text-[11px] font-semibold text-[var(--primary)]">
                      {SOURCE_LABEL[curriculum.source]}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">{curriculum.title}</p>
                  {where && <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">Currently at {where}</p>}
                </div>
              );
            })}
            {subjects
              .filter((entry) => !following.some((c) => c.subject === entry.subject))
              .map((entry) => (
                <div key={entry.id} className="border-b border-[var(--border)] py-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="text-[14px] font-semibold text-[var(--text)]">{entry.subject}</h3>
                    <span className="text-[11px] font-semibold text-[var(--primary)]">{SOURCE_LABEL.parent}</span>
                  </div>
                </div>
              ))}
          </div>
        )}
        {!ready && (
          <p className="mt-3 max-w-lg text-[12.5px] leading-relaxed text-[var(--faint)]">
            Today will stay quiet until there is something here to draw on.
          </p>
        )}
      </section>

      <section aria-label="What appears on anything you print">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">
          What appears on anything you print
        </h2>
        <p className="mt-1.5 max-w-lg text-[13px] leading-relaxed text-[var(--muted)]">
          Their name is included so a record says whose it is. Everything else starts out left off, and it is yours to
          change. Nothing here is ever public: this only decides what is on the page when you print.
        </p>
        <div className="mt-3 flex flex-col">
          {(
            [
              ["name", "Their name", child.nameVisibility],
              ["age", "Their age", child.ageVisibility],
              ["notes", "Your notes about them", child.notesVisibility],
            ] as const
          ).map(([field, label, value]) => (
            <div key={field} className="flex items-center justify-between gap-4 border-b border-[var(--border)] py-3">
              <span className="text-[14px] text-[var(--text)]">{label}</span>
              <Toggle
                checked={value === "shareable"}
                disabled={pending}
                label={`Include ${label.toLowerCase()} when printing`}
                onChange={(next) => changeVisibility(field, next ? "shareable" : "private")}
              />
            </div>
          ))}
        </div>
      </section>

      <section aria-label="Checking what they have understood">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">
          Checking what they have understood
        </h2>
        <div className="mt-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-[13px] leading-relaxed text-[var(--muted)]">
            Not built yet. When it is, you will be able to check {child.name} on what they have actually been working
            with, using your own questions, your curriculum&rsquo;s own tests, or the printed check sheets. This
            product supplies the structure around a check, never the questions.
          </p>
        </div>
      </section>
    </div>
  );
}

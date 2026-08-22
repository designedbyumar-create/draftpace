"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/design-system/Button";
import EmptyState from "@/design-system/EmptyState";
import { ChevronRight, Plus, User } from "@/design-system/Icon";
import { describeResultError } from "@/product-framework/result";
import { findHomeschoolInstanceId, HOMESCHOOLING_COMPANION_SLUG } from "../instanceData";
import {
  createChild,
  createCurriculum,
  loadChildren,
  loadCurricula,
  loadPlan,
  setChildTopic,
  setPosition,
  setSubjects,
} from "../domain/learningData";
import { curriculaFor, SCHOOLING_LABEL, type Child, type Curriculum, type PlanEntry } from "../learning";
import { buildStartingOutline } from "../startingOutline";
import type { ChildDraft } from "../setup";
import AddChildFlow from "./AddChildFlow";

type LoadStatus = "loading" | "ready" | "no-instance" | "error";

/**
 * The children, and adding one.
 *
 * Deliberately a list and not a dashboard. Each child opens their own
 * page, because a parent should never have to mentally separate two
 * children's records inside one surface, and because everything except
 * "what are we doing today" belongs to exactly one child.
 *
 * Nothing here counts, ranks, compares or scores. Two children on this
 * screen are two children, not a leaderboard.
 */
export default function KidsModule() {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [curricula, setCurricula] = useState<Curriculum[]>([]);
  const [plan, setPlan] = useState<PlanEntry[]>([]);
  const [adding, setAdding] = useState(false);
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
    const [childrenResult, curriculaResult, planResult] = await Promise.all([
      loadChildren(found.id),
      loadCurricula(found.id),
      loadPlan(found.id),
    ]);
    if (!childrenResult.ok) {
      setErrorMessage(describeResultError(childrenResult.error));
      setStatus("error");
      return;
    }
    setChildren(childrenResult.data);
    setCurricula(curriculaResult.ok ? curriculaResult.data : []);
    setPlan(planResult.ok ? planResult.data : []);
    setStatus("ready");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /**
   * One draft becomes one child plus whatever else the parent told us.
   *
   * The child is written first and separately: if a later write fails,
   * the parent still has the child rather than losing everything they
   * just typed. The rest is best effort and can be added again from the
   * child's own page.
   */
  async function saveChild(draft: ChildDraft) {
    if (!instanceId) return;
    setPending(true);
    setErrorMessage(null);

    const parsedAge = Number.parseInt(draft.age, 10);
    const created = await createChild(instanceId, {
      name: draft.name,
      age: Number.isFinite(parsedAge) ? parsedAge : null,
      schoolingType: draft.schoolingType,
    });

    if (!created.ok) {
      setPending(false);
      setErrorMessage(describeResultError(created.error));
      return;
    }

    const child = created.data;

    if (draft.stance === "not-sure" && draft.subjects.length > 0) {
      /*
        The starting outline, applied exactly as it was shown.
        
        Rebuilt from the same inputs rather than passed through, so what
        is saved cannot drift from what the parent agreed to: the
        function is pure and the inputs are in the draft.
        
        Topics land as "current", which is what makes a check possible
        later. Every one of them is editable on the child's page, and the
        outline is a suggestion from that moment on, not a commitment.
      */
      const parsedOutlineAge = Number.parseInt(draft.age, 10);
      const outline = buildStartingOutline({
        age: Number.isFinite(parsedOutlineAge) ? parsedOutlineAge : null,
        subjects: draft.subjects,
        daysAvailable: draft.daysAvailable ?? 5,
      });
      await setSubjects(
        instanceId,
        child.id,
        outline.subjects.map((s) => ({
          subject: s.subject,
          daysPerWeek: s.daysPerWeek,
          minutesPerSession: s.minutes,
          // Ours until they change it. Labelling a suggestion as the
          // parent's own plan takes credit off them for our own guess.
          origin: "draftpace-outline" as const,
        }))
      );
      for (const subject of outline.subjects) {
        for (const topic of subject.focus) {
          await setChildTopic(instanceId, {
            childId: child.id,
            subject: subject.subject,
            topicKey: topic.key,
            state: "current",
          });
        }
      }
    } else if (draft.subjects.length > 0) {
      await setSubjects(instanceId, child.id, draft.subjects);
    }

    if (draft.stance === "have-one" && draft.curriculumTitle.trim()) {
      // One curriculum per subject, all sharing the title the parent
      // gave. A publisher curriculum covering several subjects is still
      // followed subject by subject, which is how a parent thinks about
      // it and how Today has to read it.
      const subjects = draft.subjects.length > 0 ? draft.subjects : ["General"];
      for (const subject of subjects) {
        await createCurriculum(instanceId, {
          childId: child.id,
          source: "publisher",
          title: draft.curriculumTitle,
          subject,
        });
      }
      if (draft.position.trim()) {
        const refreshed = await loadCurricula(instanceId);
        if (refreshed.ok) {
          for (const curriculum of curriculaFor(refreshed.data, child.id)) {
            await setPosition(instanceId, {
              childId: child.id,
              curriculumId: curriculum.id,
              label: draft.position,
            });
          }
        }
      }
    }

    setPending(false);
    setAdding(false);
    load();
  }

  if (status === "loading") return <p className="text-[13px] text-[var(--faint)]">Loading...</p>;
  if (status === "no-instance") {
    return <EmptyState icon={User} title="Nothing here yet" description="This product has not been set up on your account." />;
  }
  if (status === "error") {
    return <EmptyState icon={User} title="Couldn't load this" description={errorMessage ?? "Try again."} />;
  }

  if (adding) {
    return (
      <div className="flex flex-col gap-5">
        {errorMessage && (
          <p className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-[13px] text-[var(--danger)]">
            {errorMessage}
          </p>
        )}
        <AddChildFlow pending={pending} onDone={saveChild} onCancel={() => setAdding(false)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Kids</p>
        <h1
          className="mt-2 text-[26px] leading-tight text-[var(--text)]"
          style={{ fontFamily: "var(--product-narrative-font, inherit)" }}
        >
          {children.length === 0 ? "Who are you teaching?" : "Your children."}
        </h1>
        {children.length === 0 && (
          <p className="mt-2 max-w-lg text-[13.5px] leading-relaxed text-[var(--muted)]">
            Add one child to begin. It takes about a minute, and you can change anything afterwards.
          </p>
        )}
      </div>

      {errorMessage && (
        <p className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-[13px] text-[var(--danger)]">
          {errorMessage}
        </p>
      )}

      {children.length === 0 ? (
        <EmptyState
          icon={User}
          title="Nobody added yet"
          description="Everything in this product belongs to a child, so this is the place to start."
        />
      ) : (
        <div className="flex flex-col">
          {children.map((child) => {
            const subjects = plan.filter((entry) => entry.childId === child.id && entry.active);
            const following = curriculaFor(curricula, child.id);
            const detail = [
              child.age !== null ? `Age ${child.age}` : null,
              child.schoolingType ? SCHOOLING_LABEL[child.schoolingType] : null,
            ]
              .filter(Boolean)
              .join(" · ");

            return (
              <Link
                key={child.id}
                href={`/app/products/${HOMESCHOOLING_COMPANION_SLUG}/kids/${child.id}`}
                className="group flex items-center gap-3 border-b border-[var(--border)] py-3.5 text-left transition-colors hover:bg-[var(--surface-muted)]"
              >
                <span className="min-w-0 flex-1">
                  <span
                    className="block text-[16px] text-[var(--text)]"
                    style={{ fontFamily: "var(--product-narrative-font, inherit)" }}
                  >
                    {child.name}
                  </span>
                  {detail && <span className="block text-[12.5px] text-[var(--muted)]">{detail}</span>}
                  {following.length > 0 && (
                    <span className="mt-0.5 block text-[12.5px] text-[var(--muted)]">{following[0].title}</span>
                  )}
                  {subjects.length > 0 && (
                    <span className="mt-0.5 block text-[12px] text-[var(--faint)]">
                      {subjects.map((entry) => entry.subject).join(", ")}
                    </span>
                  )}
                </span>
                <ChevronRight
                  size={15}
                  aria-hidden
                  className="shrink-0 text-[var(--faint)] transition-colors group-hover:text-[var(--muted)]"
                />
              </Link>
            );
          })}
        </div>
      )}

      <div>
        <Button size="sm" iconLeft={<Plus size={14} aria-hidden />} onClick={() => setAdding(true)}>
          {children.length === 0 ? "Add a child" : "Add another child"}
        </Button>
      </div>
    </div>
  );
}

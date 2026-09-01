"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Badge from "@/design-system/Badge";
import Button from "@/design-system/Button";
import EmptyState from "@/design-system/EmptyState";
import Input from "@/design-system/Input";
import { ArrowRight, Check, Home } from "@/design-system/Icon";
import { describeResultError } from "@/product-framework/result";
import { findHomeManagementCompanionInstanceId, markHomeManagementCompanionSetupComplete } from "../setupStateData";
import { createHomeItem } from "../domain/homeItems";
import { createMaintenanceTask } from "../domain/maintenanceTasks";
import { createProblem } from "../domain/problems";
import { loadHomeProfile, saveHomeProfile, type HomeTenure } from "../domain/homeProfile";
import { typesOfferedAtSetup, type CareTemplate, type HomeItemTypeDefinition } from "../homeKnowledge";
import { describeCadence } from "../homeVoice";
import { severityFromSentence } from "../problemSentence";
import { categoryIconFor } from "./shared/CategoryIcon";

type LoadStatus = "loading" | "ready" | "no-instance" | "error";
type Step = "tenure" | "whatsHere" | "care" | "wrong";

/**
 * Getting a home into Home Base.
 *
 * Not a wizard that fills tables. The version this replaces had a third
 * step called "Add a maintenance task", which asked somebody to supply
 * the domain knowledge this product exists to provide for them.
 *
 * Four questions, nearly all of it answered by tapping. Owning or
 * renting decides what gets offered at all, because a renter has no roof
 * and an owner has no lease. Naming what is in the house is a grid of
 * things nearly every home has rather than a blank form. The care those
 * things need is proposed once, in a single consolidated list, instead
 * of five sequential sheets. And it asks what is wrong right now, which
 * almost no onboarding thinks to do and which immediately fills the most
 * valuable band on Home.
 *
 * Every step is skippable and none of it is a gate. One thing recorded
 * is enough for the product to be useful, so somebody who taps twice and
 * leaves still gets something true.
 */
export default function SetupModule() {
  const router = useRouter();
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [instanceId, setInstanceId] = useState<string | null>(null);

  const [step, setStep] = useState<Step>("tenure");
  const [tenure, setTenure] = useState<HomeTenure | null>(null);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [skippedCare, setSkippedCare] = useState<Set<string>>(new Set());
  const [wrongSentence, setWrongSentence] = useState("");
  const [busy, setBusy] = useState(false);
  const [addedCount, setAddedCount] = useState(0);

  const load = useCallback(async () => {
    setErrorMessage(null);
    const found = await findHomeManagementCompanionInstanceId();
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
    const profile = await loadHomeProfile(found.id);
    // Somebody coming back should not be asked the same question again.
    // The answer is remembered, and changeable from the next screen.
    if (profile.ok && profile.data.tenure) {
      setTenure(profile.data.tenure);
      setStep("whatsHere");
    }
    setStatus("ready");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const offered = useMemo(() => typesOfferedAtSetup(tenure), [tenure]);
  const pickedTypes = useMemo(() => offered.filter((type) => picked.has(type.id)), [offered, picked]);
  const proposedCare = useMemo(
    () => pickedTypes.flatMap((type) => type.care.map((care) => ({ type, care }))),
    [pickedTypes]
  );

  async function chooseTenure(value: HomeTenure) {
    setTenure(value);
    setStep("whatsHere");
    if (instanceId) await saveHomeProfile(instanceId, { tenure: value });
  }

  function togglePick(id: string) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleCare(id: string) {
    setSkippedCare((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  /** Creates the picked things, then whichever care was left ticked. Stops at the first failure rather than half-finishing quietly. */
  async function commitHome(): Promise<boolean> {
    if (!instanceId) return false;
    setBusy(true);
    setErrorMessage(null);
    let added = 0;
    for (const type of pickedTypes) {
      const created = await createHomeItem(instanceId, {
        name: type.label,
        type: type.id,
        brand: null,
        model: null,
        location: null,
        purchaseDate: null,
        installDate: null,
        warrantyExpiresAt: null,
        documentLink: null,
        notes: null,
        status: "active",
        source: "manual",
      });
      if (!created.ok) {
        setBusy(false);
        setErrorMessage(describeResultError(created.error));
        return false;
      }
      added += 1;
      for (const care of type.care) {
        if (skippedCare.has(care.id)) continue;
        const madeCare = await createMaintenanceTask(instanceId, {
          applianceId: created.data.id,
          name: care.taskName,
          cadenceDays: care.intervalDays,
          careTemplateId: care.id,
          lastDoneAt: null,
          documentLink: null,
          notes: null,
          status: "active",
          source: "manual",
        });
        if (!madeCare.ok) {
          setBusy(false);
          setErrorMessage(describeResultError(madeCare.error));
          return false;
        }
      }
    }
    setAddedCount((prev) => prev + added);
    setPicked(new Set());
    setBusy(false);
    return true;
  }

  async function finish() {
    if (!instanceId) return;
    setBusy(true);
    const sentence = wrongSentence.trim();
    if (sentence) {
      await createProblem(instanceId, {
        thingId: null,
        providerId: null,
        title: sentence,
        description: null,
        resolutionStatus: "open",
        severity: severityFromSentence(sentence),
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
    }
    await markHomeManagementCompanionSetupComplete(instanceId);
    setBusy(false);
    router.push("/app/products/home-management-companion/workspace");
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-16">
        <Badge tone="neutral">Loading…</Badge>
      </div>
    );
  }

  if (status === "error") {
    return (
      <EmptyState
        icon={Home}
        title="Couldn't start setup"
        description={errorMessage ?? "Something went wrong. Try again."}
        action={
          <Button size="sm" variant="secondary" onClick={load}>
            Retry
          </Button>
        }
      />
    );
  }

  if (status === "no-instance") {
    return <EmptyState icon={Home} title="No product instance found" description="This shouldn't happen for an owner. Contact support." />;
  }

  return (
    <div className="flex flex-col gap-8 pb-16">
      {step === "tenure" && (
        <Ask
          headline="Let's get to know your home."
          sub="Home Base remembers what your home needs, so you don't have to. A couple of taps is enough to start."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Choice label="I own it" detail="The roof, the boiler, the gutters, all of it." onSelect={() => chooseTenure("own")} />
            <Choice label="I rent" detail="Your lease, your deposit, and the bits you look after." onSelect={() => chooseTenure("rent")} />
          </div>
          <SkipLink onClick={() => setStep("whatsHere")}>Skip this</SkipLink>
        </Ask>
      )}

      {step === "whatsHere" && (
        <Ask
          headline="What's in your home?"
          sub="Tap whatever you have. Home Base already knows what these usually need, so that part isn't your job."
        >
          {tenure && (
            <p className="text-[12px] text-[var(--muted)]">
              {tenure === "rent" ? "Set up for a home you rent." : "Set up for a home you own."}{" "}
              <button
                type="button"
                onClick={() => setStep("tenure")}
                className="font-semibold text-[var(--primary)] underline-offset-4 hover:underline"
              >
                Change
              </button>
            </p>
          )}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {offered.map((type) => (
              <PickTile key={type.id} type={type} selected={picked.has(type.id)} onToggle={() => togglePick(type.id)} />
            ))}
          </div>
          {errorMessage && <p className="text-[13px] text-[var(--danger)]">{errorMessage}</p>}
          <div className="flex flex-wrap items-center gap-3">
            <Button disabled={picked.size === 0} iconRight={<ArrowRight size={14} aria-hidden />} onClick={() => setStep("care")}>
              {picked.size === 0 ? "Pick a few" : `Continue with ${picked.size}`}
            </Button>
            <Button variant="secondary" href="/app/products/home-management-companion/import">
              Bring in what you have
            </Button>
          </div>
          <SkipLink onClick={() => setStep("wrong")}>Skip this</SkipLink>
        </Ask>
      )}

      {step === "care" && (
        <Ask
          headline="Here's what those usually need."
          sub="This is the part Home Base handles for you. Untick anything that doesn't apply, and change any of it later."
        >
          {proposedCare.length === 0 ? (
            <p className="text-[13px] text-[var(--muted)]">Nothing worth proposing for those, which is fine.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {proposedCare.map(({ type, care }) => (
                <CareRow key={care.id} type={type} care={care} checked={!skippedCare.has(care.id)} onToggle={() => toggleCare(care.id)} />
              ))}
            </ul>
          )}
          {errorMessage && <p className="text-[13px] text-[var(--danger)]">{errorMessage}</p>}
          <div className="flex flex-wrap gap-3">
            <Button
              disabled={busy}
              iconRight={<ArrowRight size={14} aria-hidden />}
              onClick={async () => {
                if (await commitHome()) setStep("wrong");
              }}
            >
              {busy ? "Saving…" : "Add these"}
            </Button>
            <Button variant="secondary" disabled={busy} onClick={() => setStep("whatsHere")}>
              Back
            </Button>
          </div>
        </Ask>
      )}

      {step === "wrong" && (
        <Ask
          headline="Anything wrong right now?"
          sub="If something's broken or playing up, say so however you'd say it out loud. Otherwise skip it, and tell Home Base whenever it happens."
        >
          <Input
            label="In your own words"
            value={wrongSentence}
            onChange={(event) => setWrongSentence(event.target.value)}
            placeholder="e.g. The garage door is making a grinding noise"
            autoFocus
          />
          {addedCount > 0 && (
            <p className="text-[13px] text-[var(--muted)]">
              {`${addedCount === 1 ? "One thing" : `${addedCount} things`} in so far. That's already enough for Home Base to be useful.`}
            </p>
          )}
          <div>
            <Button disabled={busy} onClick={finish} iconRight={<Check size={14} aria-hidden />}>
              {busy ? "Finishing…" : wrongSentence.trim() ? "Save and finish" : "Nothing right now"}
            </Button>
          </div>
        </Ask>
      )}
    </div>
  );
}

/** One question per screen, asked in the product's own voice rather than labelled like a form. */
function Ask({ headline, sub, children }: { headline: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1
          className="text-[27px] font-medium leading-[1.15] tracking-[-0.01em] text-[var(--text)] sm:text-[32px]"
          style={{ fontFamily: "var(--product-narrative-font)", textWrap: "balance" }}
        >
          {headline}
        </h1>
        <p className="mt-2 max-w-prose text-[14px] leading-relaxed text-[var(--muted)]">{sub}</p>
      </div>
      {children}
    </div>
  );
}

function Choice({ label, detail, onSelect }: { label: string; detail: string; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] p-4 text-left transition-colors duration-[var(--dur)] ease-[var(--ease-out)] hover:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
    >
      <p className="text-[15px] font-semibold text-[var(--text)]">{label}</p>
      <p className="mt-0.5 text-[13px] text-[var(--muted)]">{detail}</p>
    </button>
  );
}

function PickTile({ type, selected, onToggle }: { type: HomeItemTypeDefinition; selected: boolean; onToggle: () => void }) {
  const Icon = categoryIconFor(type.id);
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={`flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-colors duration-[var(--dur)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] ${
        selected ? "border-[var(--primary)] bg-[var(--primary-soft)]" : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)]"
      }`}
    >
      <span className={selected ? "text-[var(--primary)]" : "text-[var(--faint)]"}>
        <Icon size={18} aria-hidden />
      </span>
      <span className={`text-[13px] font-semibold ${selected ? "text-[var(--primary)]" : "text-[var(--text)]"}`}>{type.label}</span>
    </button>
  );
}

function CareRow({
  type,
  care,
  checked,
  onToggle,
}: {
  type: HomeItemTypeDefinition;
  care: CareTemplate;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <li>
      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--border)] p-3.5 transition-colors duration-[var(--dur)] ease-[var(--ease-out)] hover:border-[var(--border-strong)]">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-[var(--border-strong)] text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
        />
        <span className="min-w-0">
          <span className="block text-[13px] font-semibold text-[var(--text)]">{care.taskName}</span>
          <span className="block text-[12px] text-[var(--muted)]">
            {type.label} · {describeCadence(care)}
          </span>
        </span>
      </label>
    </li>
  );
}

function SkipLink({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="self-start text-[13px] font-semibold text-[var(--muted)] underline-offset-4 hover:text-[var(--text)] hover:underline"
    >
      {children}
    </button>
  );
}

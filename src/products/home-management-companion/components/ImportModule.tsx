"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Badge from "@/design-system/Badge";
import Button from "@/design-system/Button";
import Surface from "@/design-system/Surface";
import EmptyState from "@/design-system/EmptyState";
import { Article, ArrowLeft, Download, ListChecks } from "@/design-system/Icon";
import { describeResultError } from "@/product-framework/result";
import { findHomeManagementCompanionInstanceId } from "../setupStateData";
import { listAppliances } from "../domain/appliances";
import { listMaintenanceTasks } from "../domain/maintenanceTasks";
import { listServiceProviders } from "../domain/serviceProviders";
import type { Appliance, MaintenanceTask, ServiceProvider } from "../state";
import type { ConfirmationSource, ExtractionCandidate } from "../import/types";
import PasteNotesStep from "./import/PasteNotesStep";
import TextFileStep from "./import/TextFileStep";
import CsvImportFlow from "./import/CsvImportFlow";
import CandidateReviewQueue from "./import/CandidateReviewQueue";

type LoadStatus = "loading" | "ready" | "no-instance" | "error";
type Step = "chooseMethod" | "pasteNotes" | "textFile" | "csv" | "review" | "done";

/**
 * Import: the entry point for CSV/paste-notes bulk import, Home Base's
 * own orchestrator. Deliberately a plain step state machine rather than
 * PFC's Companion orchestrator, matching this product's Setup module's
 * own simpler pattern (see definition.ts's own comment on why).
 */
export default function ImportModule() {
  const router = useRouter();
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>([]);
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);

  const [step, setStep] = useState<Step>("chooseMethod");
  const [candidates, setCandidates] = useState<ExtractionCandidate[]>([]);
  const [importSessionId, setImportSessionId] = useState<string | null>(null);
  const [source, setSource] = useState<ConfirmationSource>("pastedNotes");
  const [confirmedCount, setConfirmedCount] = useState(0);

  const load = useCallback(async () => {
    setStatus("loading");
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
    const [appliancesResult, tasksResult, providersResult] = await Promise.all([
      listAppliances(found.id),
      listMaintenanceTasks(found.id),
      listServiceProviders(found.id),
    ]);
    const failed = [appliancesResult, tasksResult, providersResult].find((r) => !r.ok);
    if (failed && !failed.ok) {
      setErrorMessage(describeResultError(failed.error));
      setStatus("error");
      return;
    }
    setAppliances(appliancesResult.ok ? appliancesResult.data : []);
    setMaintenanceTasks(tasksResult.ok ? tasksResult.data : []);
    setServiceProviders(providersResult.ok ? providersResult.data : []);
    setStatus("ready");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function handleCandidatesReady(newCandidates: ExtractionCandidate[], sessionId: string, candidateSource: ConfirmationSource) {
    setCandidates(newCandidates);
    setImportSessionId(sessionId);
    setSource(candidateSource);
    setStep("review");
  }

  function handleCandidateResolved(candidateId: string, result: { recordType: string; recordId: string } | "skipped") {
    setCandidates((prev) => prev.map((c) => (c.id === candidateId ? { ...c, reviewStatus: result === "skipped" ? "skipped" : "confirmed" } : c)));
    if (result !== "skipped") setConfirmedCount((n) => n + 1);
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-16">
        <Badge tone="neutral">Loading Import…</Badge>
      </div>
    );
  }

  if (status === "error") {
    return (
      <EmptyState
        icon={Download}
        title="Couldn't load Import"
        description={errorMessage ?? "Something went wrong. Try again."}
        action={
          <Button size="sm" variant="secondary" onClick={load}>
            Retry
          </Button>
        }
      />
    );
  }

  if (status === "no-instance" || !instanceId) {
    return <EmptyState icon={Download} title="No product instance found" description="This shouldn't happen for an owner. Contact support." />;
  }

  if (step === "chooseMethod") {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text)]">Import</h1>
          <p className="mt-1 text-[13px] text-[var(--muted)]">
            Bring in what you already have. Draftpace looks for patterns, never AI, and nothing becomes a real record
            until you confirm it.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <MethodCard icon={Article} title="Paste notes" description="Paste a few lines of text." onClick={() => setStep("pasteNotes")} />
          <MethodCard icon={Article} title="Text file" description="Upload a .txt file." onClick={() => setStep("textFile")} />
          <MethodCard icon={ListChecks} title="CSV" description="Upload a spreadsheet export." onClick={() => setStep("csv")} />
        </div>
      </div>
    );
  }

  if (step === "pasteNotes") {
    return (
      <div className="flex flex-col gap-4">
        <BackToChooser onClick={() => setStep("chooseMethod")} />
        <PasteNotesStep
          instanceId={instanceId}
          onBack={() => setStep("chooseMethod")}
          onCandidatesReady={(c, sessionId) => handleCandidatesReady(c, sessionId, "pastedNotes")}
        />
      </div>
    );
  }

  if (step === "textFile") {
    return (
      <div className="flex flex-col gap-4">
        <BackToChooser onClick={() => setStep("chooseMethod")} />
        <TextFileStep
          instanceId={instanceId}
          onBack={() => setStep("chooseMethod")}
          onCandidatesReady={(c, sessionId) => handleCandidatesReady(c, sessionId, "textFile")}
        />
      </div>
    );
  }

  if (step === "csv") {
    return (
      <div className="flex flex-col gap-4">
        <BackToChooser onClick={() => setStep("chooseMethod")} />
        <CsvImportFlow
          instanceId={instanceId}
          onBack={() => setStep("chooseMethod")}
          onDone={(ambiguousCandidates, sessionId) => handleCandidatesReady(ambiguousCandidates, sessionId, "csvImport")}
        />
      </div>
    );
  }

  if (step === "review") {
    return (
      <div className="flex flex-col gap-4">
        <CandidateReviewQueue
          instanceId={instanceId}
          candidates={candidates}
          existing={{ appliances, maintenanceTasks, serviceProviders }}
          importSessionId={importSessionId ?? ""}
          source={source}
          onCandidateResolved={handleCandidateResolved}
          onDone={() => setStep("done")}
        />
      </div>
    );
  }

  return (
    <Surface elevated className="flex flex-col gap-4">
      <p className="text-[15px] font-semibold text-[var(--text)]">
        {confirmedCount} {confirmedCount === 1 ? "record" : "records"} added.
      </p>
      <div className="flex flex-wrap gap-2.5">
        <Button
          variant="secondary"
          size="md"
          onClick={() => {
            setCandidates([]);
            setConfirmedCount(0);
            setStep("chooseMethod");
          }}
        >
          Import more
        </Button>
        <Button size="md" onClick={() => router.push("/app/products/home-management-companion/records")}>
          Go to Records
        </Button>
      </div>
    </Surface>
  );
}

function MethodCard({
  icon: Icon,
  title,
  description,
  onClick,
}: {
  icon: typeof Article;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="text-left">
      <Surface className="flex h-full flex-col gap-2 transition hover:border-[var(--primary)]">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
          <Icon size={15} aria-hidden />
        </div>
        <p className="text-[14px] font-semibold text-[var(--text)]">{title}</p>
        <p className="text-[12px] text-[var(--muted)]">{description}</p>
      </Surface>
    </button>
  );
}

function BackToChooser({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--muted)] hover:text-[var(--text)]">
      <ArrowLeft size={13} aria-hidden />
      Choose a different method
    </button>
  );
}

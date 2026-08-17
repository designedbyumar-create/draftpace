"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import Badge from "@/design-system/Badge";
import Button from "@/design-system/Button";
import EmptyState from "@/design-system/EmptyState";
import { Compass } from "@/design-system/Icon";
import { EASE_OUT, useCombinedReducedMotion } from "@/components/onboarding/motion";
import { useSetupState } from "../useSetupState";
import { deriveAttentionItems } from "../../attention";
import { computeCapabilities, type FinancialPictureInputs } from "../../companion/capability";
import type { Account, AreaSetupStatus, Bill, Debt, FinancialArea, IncomeSource, InputPath, SavingsGoal, Subscription, Transaction } from "../../state";
import { describeResultError } from "@/product-framework/result";

import { listAccounts } from "../../domain/accounts";
import { listIncomeSources } from "../../domain/incomeSources";
import { listBills } from "../../domain/bills";
import { listSubscriptions } from "../../domain/subscriptions";
import { listTransactions } from "../../domain/transactions";
import { listDebts } from "../../domain/debts";
import { listSavingsGoals } from "../../domain/savingsGoals";

import { COMPANION_AREA_ORDER, type AreaRecord } from "./companionAreas";
import OrientationStep from "./OrientationStep";
import AreaStep from "./AreaStep";
import SessionRecap, { type SessionChange } from "./SessionRecap";
import ReminderConsentPrompt from "./ReminderConsentPrompt";
import PasteNotesStep from "./import/PasteNotesStep";
import TextFileStep from "./import/TextFileStep";
import CandidateReviewQueue from "./import/CandidateReviewQueue";
import type { ExtractionCandidate } from "../../import/types";
import { listUnreviewedGroupedBySession } from "../../domain/extractionCandidates";

// Loaded on demand, not in every Companion page's initial bundle - most
// visitors never open the CSV import sub-flow.
const CsvImportFlow = dynamic(() => import("./import/CsvImportFlow"));

type ImportFlow = "notes" | "textFile" | "csv" | "review" | null;
type ImportSource = "pastedNotes" | "textFile" | "csvImport";

type LoadStatus = "loading" | "ready" | "no-instance" | "error";

const EMPTY_PICTURE: FinancialPictureInputs = {
  accounts: [],
  incomeSources: [],
  bills: [],
  subscriptions: [],
  transactions: [],
  debts: [],
  savingsGoals: [],
};

function initialSessionChanges(): Record<FinancialArea, SessionChange> {
  const changes = {} as Record<FinancialArea, SessionChange>;
  for (const area of COMPANION_AREA_ORDER) changes[area] = { area, created: 0, edited: 0, skipped: false };
  return changes;
}

/**
 * The real Companion experience — orientation, then the adaptive
 * seven-area guided journey, then a session recap. Registered for the
 * "start" destination (see catalog.ts), replacing the infrastructure-only
 * placeholder. Every save goes through the exact same domain functions
 * and FormSheet components the direct sections use (companionAreas.tsx);
 * this file owns only navigation, resume, and the session-local recap
 * log — never a second copy of financial state.
 */
export default function CompanionModule() {
  const reduceMotion = useCombinedReducedMotion();
  const { status: setupStatus, errorMessage: setupError, instanceId, state, saveStatus, setState, retry } = useSetupState();
  const [recordsStatus, setRecordsStatus] = useState<LoadStatus>("loading");
  const [recordsError, setRecordsError] = useState<string | null>(null);
  const [records, setRecords] = useState<FinancialPictureInputs>(EMPTY_PICTURE);
  const [sessionChanges, setSessionChanges] = useState<Record<FinancialArea, SessionChange>>(initialSessionChanges);
  const [showRecap, setShowRecap] = useState(false);
  const [showReminderConsent, setShowReminderConsent] = useState(false);
  const [reminderConsentShown, setReminderConsentShown] = useState(false);
  const [importFlow, setImportFlow] = useState<ImportFlow>(null);
  const [importSource, setImportSource] = useState<ImportSource>("pastedNotes");
  const [reviewCandidates, setReviewCandidates] = useState<ExtractionCandidate[]>([]);
  const [reviewAccountId, setReviewAccountId] = useState<string | undefined>(undefined);
  const [pendingReviewGroups, setPendingReviewGroups] = useState<{ source: ImportSource; candidates: ExtractionCandidate[] }[]>([]);
  const [checkedPendingReview, setCheckedPendingReview] = useState(false);

  const loadRecords = useCallback(async (id: string) => {
    setRecordsStatus("loading");
    const [accounts, incomeSources, bills, subscriptions, transactions, debts, savingsGoals] = await Promise.all([
      listAccounts(id),
      listIncomeSources(id),
      listBills(id),
      listSubscriptions(id),
      listTransactions(id),
      listDebts(id),
      listSavingsGoals(id),
    ]);
    const results = { accounts, incomeSources, bills, subscriptions, transactions, debts, savingsGoals };
    for (const result of Object.values(results)) {
      if (!result.ok) {
        setRecordsError(describeResultError(result.error));
        setRecordsStatus("error");
        return;
      }
    }
    setRecords({
      accounts: (accounts as { ok: true; data: Account[] }).data,
      incomeSources: (incomeSources as { ok: true; data: IncomeSource[] }).data,
      bills: (bills as { ok: true; data: Bill[] }).data,
      subscriptions: (subscriptions as { ok: true; data: Subscription[] }).data,
      transactions: (transactions as { ok: true; data: Transaction[] }).data,
      debts: (debts as { ok: true; data: Debt[] }).data,
      savingsGoals: (savingsGoals as { ok: true; data: SavingsGoal[] }).data,
    });
    setRecordsStatus("ready");
  }, []);

  useEffect(() => {
    if (instanceId) loadRecords(instanceId);
  }, [instanceId, loadRecords]);

  // Resume any candidates left over from a previous import that were never
  // reviewed — they stay durable in pfc_extraction_candidates regardless of
  // this component's own local state, so a fresh mount (a page reload, or
  // arriving here from Workspace's "N imported records waiting" card) picks
  // them back up instead of leaving them permanently stranded. Runs once
  // per mount, and only when nothing else already claims the screen.
  useEffect(() => {
    if (!instanceId || recordsStatus !== "ready" || checkedPendingReview || importFlow !== null || showRecap) return;
    setCheckedPendingReview(true);
    listUnreviewedGroupedBySession(instanceId).then((result) => {
      if (result.ok && result.data.length > 0) {
        const [first, ...rest] = result.data;
        setImportSource(first.source);
        setReviewCandidates(first.candidates);
        setReviewAccountId(undefined);
        setPendingReviewGroups(rest);
        setImportFlow("review");
      }
    });
  }, [instanceId, recordsStatus, checkedPendingReview, importFlow, showRecap]);

  if (setupStatus === "loading" || (setupStatus === "ready" && recordsStatus === "loading")) {
    return (
      <div className="flex items-center justify-center py-16">
        <Badge tone="neutral">Loading Companion…</Badge>
      </div>
    );
  }

  if (setupStatus === "error") {
    return (
      <EmptyState
        icon={Compass}
        title="Couldn't load Companion"
        description={setupError ?? "Something went wrong. Try again."}
        action={
          <Button size="sm" variant="secondary" onClick={retry}>
            Retry
          </Button>
        }
      />
    );
  }

  if (setupStatus === "no-instance") {
    return <EmptyState icon={Compass} title="No product instance found" description="This shouldn't happen for an owner. Contact support." />;
  }

  if (recordsStatus === "error") {
    return (
      <EmptyState
        icon={Compass}
        title="Couldn't load your financial data"
        description={recordsError ?? "Something went wrong. Try again."}
        action={
          <Button size="sm" variant="secondary" onClick={() => instanceId && loadRecords(instanceId)}>
            Retry
          </Button>
        }
      />
    );
  }

  if (!state || !instanceId) return null;

  function handleSelectPath(path: InputPath) {
    setState({ ...state!, selectedInputPath: path, orientation: { seenAt: new Date().toISOString(), skipped: false } });
    if (path === "notes") {
      setImportSource("pastedNotes");
      setImportFlow("notes");
      return;
    }
    if (path === "textFile") {
      setImportSource("textFile");
      setImportFlow("textFile");
      return;
    }
    if (path === "csv") {
      setImportSource("csvImport");
      setImportFlow("csv");
      return;
    }
    setState({ ...state!, selectedInputPath: path, currentScreen: 1, orientation: { seenAt: new Date().toISOString(), skipped: false } });
  }

  function finishImportFlow() {
    setImportFlow(null);
    setReviewCandidates([]);
    setReviewAccountId(undefined);
    setPendingReviewGroups([]);
    if (instanceId) loadRecords(instanceId);
    setState({ ...state!, currentScreen: 1 });
  }

  function handleSkipOrientation() {
    setState({ ...state!, currentScreen: 1, orientation: { seenAt: state!.orientation.seenAt, skipped: true } });
  }

  function handleAreaStatusChange(area: FinancialArea, areaStatus: AreaSetupStatus) {
    setState({ ...state!, areaProgress: { ...state!.areaProgress, [area]: areaStatus } });
    if (areaStatus === "acknowledged-skip") {
      setSessionChanges((prev) => ({ ...prev, [area]: { ...prev[area], skipped: true } }));
    }
  }

  function handleRecordSaved(area: FinancialArea, record: AreaRecord, wasCreate: boolean) {
    setRecords((prev) => {
      const key = areaToKey(area);
      const list = prev[key] as AreaRecord[];
      const next = wasCreate ? [...list, record] : list.map((r) => (r.id === record.id ? record : r));
      return { ...prev, [key]: next as never };
    });
    setSessionChanges((prev) => ({
      ...prev,
      [area]: { ...prev[area], created: prev[area].created + (wasCreate ? 1 : 0), edited: prev[area].edited + (wasCreate ? 0 : 1) },
    }));
  }

  function handleAdvance(currentArea: FinancialArea) {
    const currentIndex = COMPANION_AREA_ORDER.indexOf(currentArea);

    // Offer reminder consent once, right after Subscriptions — by then
    // there are usually real bill/subscription dates worth remembering,
    // and it's before the flow moves on to Transactions/Debt/Savings.
    if (currentArea === "subscriptions" && !reminderConsentShown) {
      const hasRelevantDates = records.bills.some((b) => b.dueRule !== null) || records.subscriptions.length > 0;
      if (hasRelevantDates) {
        setReminderConsentShown(true);
        setShowReminderConsent(true);
        return;
      }
    }

    if (currentIndex >= COMPANION_AREA_ORDER.length - 1) {
      setShowRecap(true);
      return;
    }
    setState({ ...state!, currentScreen: currentIndex + 2 });
  }

  function handleBack(currentArea: FinancialArea) {
    const currentIndex = COMPANION_AREA_ORDER.indexOf(currentArea);
    setState({ ...state!, currentScreen: currentIndex });
  }

  const capabilities = computeCapabilities(records);
  const attentionItems = deriveAttentionItems(records);

  if (showReminderConsent) {
    return (
      <ReminderConsentPrompt
        instanceId={instanceId}
        onDone={() => {
          setShowReminderConsent(false);
          const index = COMPANION_AREA_ORDER.indexOf("subscriptions");
          setState({ ...state!, currentScreen: index + 2 });
        }}
      />
    );
  }

  if (showRecap) {
    return (
      <SessionRecap
        changes={COMPANION_AREA_ORDER.map((a) => sessionChanges[a])}
        capabilities={capabilities}
        attentionItems={attentionItems}
        onReopenCompanion={() => {
          setShowRecap(false);
          setState({ ...state!, currentScreen: 1 });
        }}
      />
    );
  }

  if (!state.orientation.seenAt && !state.orientation.skipped && importFlow === null) {
    return <OrientationStep onSelectPath={handleSelectPath} onSkip={handleSkipOrientation} />;
  }

  if (importFlow === "notes") {
    return (
      <PasteNotesStep
        instanceId={instanceId}
        onCandidatesReady={(candidates) => {
          setReviewCandidates(candidates);
          setImportFlow("review");
        }}
        onBack={() => setImportFlow(null)}
      />
    );
  }

  if (importFlow === "textFile") {
    return (
      <TextFileStep
        instanceId={instanceId}
        onCandidatesReady={(candidates) => {
          setReviewCandidates(candidates);
          setImportFlow("review");
        }}
        onBack={() => setImportFlow(null)}
      />
    );
  }

  if (importFlow === "csv") {
    return (
      <CsvImportFlow
        instanceId={instanceId}
        accounts={records.accounts.filter((a) => a.status !== "archived")}
        existingTransactions={records.transactions}
        onBack={() => setImportFlow(null)}
        onDone={(ambiguousCandidates, accountId) => {
          if (ambiguousCandidates.length > 0) {
            setImportSource("csvImport");
            setReviewCandidates(ambiguousCandidates);
            setReviewAccountId(accountId);
            setImportFlow("review");
          } else {
            finishImportFlow();
          }
        }}
      />
    );
  }

  if (importFlow === "review") {
    return (
      <CandidateReviewQueue
        instanceId={instanceId}
        candidates={reviewCandidates}
        records={records}
        source={importSource}
        accountId={reviewAccountId}
        onCandidateResolved={(candidateId, result) => {
          setReviewCandidates((prev) => prev.map((c) => (c.id === candidateId ? { ...c, reviewStatus: result === "skipped" ? "skipped" : "confirmed" } : c)));
        }}
        onDone={() => {
          if (pendingReviewGroups.length > 0) {
            const [next, ...rest] = pendingReviewGroups;
            setImportSource(next.source);
            setReviewCandidates(next.candidates);
            setReviewAccountId(undefined);
            setPendingReviewGroups(rest);
            return;
          }
          finishImportFlow();
        }}
      />
    );
  }

  const areaIndex = Math.min(Math.max(state.currentScreen, 1), COMPANION_AREA_ORDER.length) - 1;
  const area = COMPANION_AREA_ORDER[areaIndex];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex gap-1">
          {COMPANION_AREA_ORDER.map((a, i) => (
            <span
              key={a}
              className={`h-1.5 w-5 rounded-full ${i === areaIndex ? "bg-[var(--primary)]" : state.areaProgress[a] ? "bg-[var(--success)]" : "bg-[var(--border)]"}`}
            />
          ))}
        </div>
        <Badge tone={saveStatus === "saved" ? "success" : saveStatus === "error" ? "danger" : "neutral"}>
          {saveStatus === "saving" ? "Saving…" : saveStatus === "saved" ? "Saved" : saveStatus === "error" ? "Save failed" : ""}
        </Badge>
      </div>
      {/* Import isn't first-run-only — a returning user should be able to
          paste more notes or import another CSV anytime, not just during
          the one-time orientation screen. */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-1 text-[12px] text-[var(--muted)]">
        <span>Have more to add?</span>
        <button type="button" onClick={() => setImportFlow("notes")} className="font-semibold text-[var(--primary)] hover:underline">
          Paste notes
        </button>
        <button type="button" onClick={() => setImportFlow("textFile")} className="font-semibold text-[var(--primary)] hover:underline">
          Upload a text file
        </button>
        <button type="button" onClick={() => setImportFlow("csv")} className="font-semibold text-[var(--primary)] hover:underline">
          Import a CSV
        </button>
      </div>
      {/* key={area} forces a fresh mount per area — without it React reuses
          the same AreaStep instance across areas, freezing its "was this
          capability waiting before" snapshot at whatever it was on the very
          first area visited and letting the previous area's reflect card
          leak into the next area's landing render. Found live: unlock
          moments silently never fired after the first area. The same key
          drives AnimatePresence's crossfade below — one area settling in as
          the last one settles out, not an abrupt swap. */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={area}
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
        >
          <AreaStep
            area={area}
            instanceId={instanceId}
            records={records}
            onRecordSaved={handleRecordSaved}
            onAreaStatusChange={handleAreaStatusChange}
            onAdvance={() => handleAdvance(area)}
            onBack={() => handleBack(area)}
            isFirst={areaIndex === 0}
            isLast={areaIndex === COMPANION_AREA_ORDER.length - 1}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function areaToKey(area: FinancialArea): keyof FinancialPictureInputs {
  switch (area) {
    case "accounts":
      return "accounts";
    case "income":
      return "incomeSources";
    case "bills":
      return "bills";
    case "subscriptions":
      return "subscriptions";
    case "transactions":
      return "transactions";
    case "debt":
      return "debts";
    case "savings":
      return "savingsGoals";
  }
}

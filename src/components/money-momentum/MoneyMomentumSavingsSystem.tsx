"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Check,
  ChevronRight,
  Flame,
  Landmark,
  Layers3,
  MessageCircle,
  Pause,
  Play,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trophy,
  Wallet,
  X,
} from "@/components/ui/Icon";
import {
  ChallengeDefinition,
  CompanionSignal,
  Envelope,
  SavingsChallengeId,
  SavingsFund,
  SavingsMilestone,
  SavingsPortfolio,
  createDefaultSavingsFund,
  createDefaultSavingsPortfolio,
  createSavingsFund,
  formatMoney,
  getCompanionResponse,
  getCrossedMilestone,
  getHomeLabel,
  getPaceLabel,
  getPortfolioStats,
  getRhythmLabel,
  getSavingsChallenge,
  getSavingsStats,
  getStatusLabel,
  savingsChallenges,
  savingsPortfolioStorageKey,
  savingsStorageKey,
} from "@/lib/moneyMomentumSavings";

type ViewMode = "hub" | "track";
type RitualStep = "amount" | "gate" | "note";
type RitualState = {
  envelopeIndex: number;
  step: RitualStep;
  recovery?: boolean;
};

function normalizeFund(value: unknown): SavingsFund {
  const fallback = createDefaultSavingsFund();

  if (!value || typeof value !== "object") return fallback;

  const parsed = value as Partial<SavingsFund>;
  const challenge = getSavingsChallenge((parsed.challenge as SavingsChallengeId) ?? fallback.challenge);
  const envelopes = Array.isArray(parsed.envelopes) && parsed.envelopes.length > 0
    ? parsed.envelopes
    : fallback.envelopes;

  return {
    ...fallback,
    ...parsed,
    id: typeof parsed.id === "string" ? parsed.id : fallback.id,
    goalName: typeof parsed.goalName === "string" ? parsed.goalName : challenge.name,
    reason: typeof parsed.reason === "string" ? parsed.reason : challenge.promise,
    challenge: challenge.id,
    target: Number(parsed.target) > 0 ? Number(parsed.target) : challenge.target,
    status: parsed.status === "paused" || parsed.status === "completed" ? parsed.status : "active",
    envelopes: envelopes.map((envelope): Envelope => ({
      amount: Number(envelope.amount) > 0 ? Number(envelope.amount) : 25,
      status: envelope.status === "stashed" ? "stashed" : "empty",
      stashedOn: envelope.stashedOn,
      note: envelope.note,
    })),
    firedMilestones: Array.isArray(parsed.firedMilestones) ? parsed.firedMilestones : [],
  };
}

function normalizePortfolio(value: unknown): SavingsPortfolio {
  const fallback = createDefaultSavingsPortfolio();

  if (!value || typeof value !== "object") return fallback;

  const parsed = value as Partial<SavingsPortfolio>;
  const funds = Array.isArray(parsed.funds) && parsed.funds.length > 0
    ? parsed.funds.map((fund) => normalizeFund(fund))
    : fallback.funds;
  const activeFundId = funds.some((fund) => fund.id === parsed.activeFundId)
    ? String(parsed.activeFundId)
    : funds[0].id;

  return {
    id: typeof parsed.id === "string" ? parsed.id : fallback.id,
    activeFundId,
    funds,
    createdAt: typeof parsed.createdAt === "string" ? parsed.createdAt : fallback.createdAt,
    updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString(),
  };
}

function readPortfolioFromStorage(): SavingsPortfolio {
  const portfolioRaw = window.localStorage.getItem(savingsPortfolioStorageKey);
  if (portfolioRaw) return normalizePortfolio(JSON.parse(portfolioRaw));

  const oldFundRaw = window.localStorage.getItem(savingsStorageKey);
  if (oldFundRaw) {
    const fund = normalizeFund(JSON.parse(oldFundRaw));
    const now = new Date().toISOString();
    return {
      id: "money-momentum-savings-portfolio",
      activeFundId: fund.id,
      funds: [fund],
      createdAt: fund.createdAt ?? now,
      updatedAt: now,
    };
  }

  return createDefaultSavingsPortfolio();
}

export default function MoneyMomentumSavingsSystem() {
  const [hydrated, setHydrated] = useState(false);
  const [view, setView] = useState<ViewMode>("hub");
  const [portfolio, setPortfolio] = useState<SavingsPortfolio>(() => createDefaultSavingsPortfolio());
  const [ritual, setRitual] = useState<RitualState | null>(null);
  const [depositAmount, setDepositAmount] = useState("25");
  const [depositNote, setDepositNote] = useState("");
  const [sealedEnvelope, setSealedEnvelope] = useState<number | null>(null);
  const [activeMilestone, setActiveMilestone] = useState<SavingsMilestone | null>(null);
  const [vaultOpen, setVaultOpen] = useState(false);
  const [companionSignal, setCompanionSignal] = useState<CompanionSignal>("entry");
  const [companionDraft, setCompanionDraft] = useState("");
  const [companionNote, setCompanionNote] = useState("");

  useEffect(() => {
    try {
      setPortfolio(readPortfolioFromStorage());
    } catch {
      setPortfolio(createDefaultSavingsPortfolio());
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(savingsPortfolioStorageKey, JSON.stringify(portfolio));
  }, [hydrated, portfolio]);

  const activeFund = useMemo(() => {
    return portfolio.funds.find((fund) => fund.id === portfolio.activeFundId) ?? portfolio.funds[0] ?? createDefaultSavingsFund();
  }, [portfolio]);
  const stats = useMemo(() => getSavingsStats(activeFund), [activeFund]);
  const portfolioStats = useMemo(() => getPortfolioStats(portfolio), [portfolio]);
  const challenge = useMemo(() => getSavingsChallenge(activeFund.challenge), [activeFund.challenge]);
  const companion = useMemo(
    () => getCompanionResponse(activeFund, companionSignal, activeMilestone),
    [activeFund, activeMilestone, companionSignal]
  );
  const selectedEnvelope = ritual ? activeFund.envelopes[ritual.envelopeIndex] : null;
  const completedEnvelopes = activeFund.envelopes.filter((envelope) => envelope.status === "stashed").reverse();
  const canUseActiveTrack = activeFund.status === "active" && stats.nextIndex !== -1;

  const updatePortfolio = (updater: (current: SavingsPortfolio) => SavingsPortfolio) => {
    setPortfolio((current) => ({
      ...updater(current),
      updatedAt: new Date().toISOString(),
    }));
  };

  const updateFund = (fundId: string, updater: (fund: SavingsFund) => SavingsFund) => {
    updatePortfolio((current) => ({
      ...current,
      funds: current.funds.map((fund) => (fund.id === fundId ? updater(fund) : fund)),
    }));
  };

  const openFund = (fundId: string) => {
    updatePortfolio((current) => ({
      ...current,
      activeFundId: fundId,
    }));
    setView("track");
    setRitual(null);
    setCompanionSignal("entry");
  };

  const startChallenge = (challengeId: SavingsChallengeId) => {
    const fund = createSavingsFund(challengeId);

    updatePortfolio((current) => ({
      ...current,
      activeFundId: fund.id,
      funds: [fund, ...current.funds],
    }));
    setView("track");
    setCompanionSignal("entry");
  };

  const setActiveFundStatus = (status: SavingsFund["status"]) => {
    updateFund(activeFund.id, (fund) => ({
      ...fund,
      status,
      completedAt: status === "completed" ? fund.completedAt ?? new Date().toISOString() : fund.completedAt,
    }));
    setCompanionSignal(status === "paused" ? "behind" : "entry");
  };

  const openRitual = (index = stats.nextIndex, recovery = false) => {
    if (!canUseActiveTrack || index < 0 || activeFund.envelopes[index]?.status !== "empty") return;

    const amount = recovery ? Math.min(5, activeFund.envelopes[index].amount) : activeFund.envelopes[index].amount;
    setDepositAmount(String(amount));
    setDepositNote("");
    setRitual({ envelopeIndex: index, step: "amount", recovery });
    setCompanionSignal(recovery ? "recovery" : "entry");
  };

  const closeRitual = () => {
    setRitual(null);
  };

  const moveRitual = (step: RitualStep) => {
    setRitual((current) => (current ? { ...current, step } : current));
  };

  const declineGate = () => {
    setRitual(null);
    setCompanionSignal("declined-gate");
  };

  const sealEnvelope = () => {
    if (!ritual || !selectedEnvelope || activeFund.status !== "active") return;

    const amount = Math.max(1, Math.round(Number(depositAmount) || selectedEnvelope.amount));
    const previousSaved = stats.saved;
    const nextEnvelopes = activeFund.envelopes.map((envelope, index) =>
      index === ritual.envelopeIndex
        ? {
            ...envelope,
            amount,
            status: "stashed" as const,
            stashedOn: new Date().toISOString(),
            note: depositNote.trim() || undefined,
          }
        : envelope
    );
    const draftFund: SavingsFund = {
      ...activeFund,
      envelopes: nextEnvelopes,
      streak: activeFund.streak + 1,
    };
    const nextStats = getSavingsStats(draftFund);
    const crossed = getCrossedMilestone(activeFund, previousSaved, nextStats.saved);
    const finished = nextStats.saved >= activeFund.target || nextStats.nextIndex === -1;
    const nextFund: SavingsFund = {
      ...draftFund,
      momentum: nextStats.momentumScore,
      status: finished ? "completed" : "active",
      completedAt: finished ? new Date().toISOString() : activeFund.completedAt,
      firedMilestones: crossed
        ? [...(activeFund.firedMilestones ?? []), crossed.id]
        : activeFund.firedMilestones ?? [],
    };

    updateFund(activeFund.id, () => nextFund);
    setRitual(null);
    setSealedEnvelope(ritual.envelopeIndex);
    setCompanionSignal(crossed ? "milestone" : finished ? "complete" : "deposit-sealed");

    if (crossed) {
      window.setTimeout(() => setActiveMilestone(crossed), 450);
    }

    window.setTimeout(() => setSealedEnvelope(null), 850);
  };

  const activateRecovery = () => {
    setCompanionSignal("recovery");
    openRitual(stats.nextIndex, true);
  };

  const submitCompanionNote = () => {
    const note = companionDraft.trim();
    if (!note) return;

    const lower = note.toLowerCase();
    if (lower.includes("tight") || lower.includes("broke") || lower.includes("can't") || lower.includes("hard")) {
      setCompanionSignal("cash-tight");
    } else if (lower.includes("bonus") || lower.includes("extra") || lower.includes("more") || lower.includes("easy")) {
      setCompanionSignal("extra-capacity");
    } else if (lower.includes("miss") || lower.includes("behind") || lower.includes("pause")) {
      setCompanionSignal("behind");
    } else {
      setCompanionSignal("entry");
    }

    setCompanionNote(note);
    setCompanionDraft("");
  };

  if (!hydrated) {
    return (
      <section className="mm-shell">
        <div className="mm-loading">
          <div className="mm-loading-mark" />
          <p>Opening Money Momentum</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mm-shell">
      <ChallengeNavigator
        portfolio={portfolio}
        activeFundId={activeFund.id}
        view={view}
        onHub={() => setView("hub")}
        onOpenFund={openFund}
      />

      {view === "hub" ? (
        <PortfolioHub
          portfolio={portfolio}
          portfolioStats={portfolioStats}
          onOpenFund={openFund}
          onStartChallenge={startChallenge}
        />
      ) : (
        <TrackExperience
          fund={activeFund}
          stats={stats}
          challenge={challenge}
          companion={companion}
          companionDraft={companionDraft}
          companionNote={companionNote}
          sealedEnvelope={sealedEnvelope}
          canUseActiveTrack={canUseActiveTrack}
          onBack={() => setView("hub")}
          onOpenRitual={openRitual}
          onActivateRecovery={activateRecovery}
          onVault={() => setVaultOpen(true)}
          onPause={() => setActiveFundStatus("paused")}
          onResume={() => setActiveFundStatus("active")}
          onCompanionDraftChange={setCompanionDraft}
          onCompanionSubmit={submitCompanionNote}
          onCompanionSignal={setCompanionSignal}
        />
      )}

      {ritual && selectedEnvelope && (
        <RitualOverlay
          ritual={ritual}
          amount={depositAmount}
          note={depositNote}
          home={getHomeLabel(activeFund.home)}
          selectedAmount={selectedEnvelope.amount}
          onAmountChange={setDepositAmount}
          onNoteChange={setDepositNote}
          onClose={closeRitual}
          onMove={moveRitual}
          onDecline={declineGate}
          onSeal={sealEnvelope}
        />
      )}

      {activeMilestone && <MilestoneModal milestone={activeMilestone} onClose={() => setActiveMilestone(null)} />}

      {vaultOpen && <VaultDrawer fund={activeFund} envelopes={completedEnvelopes} onClose={() => setVaultOpen(false)} />}
    </section>
  );
}

function ChallengeNavigator({
  portfolio,
  activeFundId,
  view,
  onHub,
  onOpenFund,
}: {
  portfolio: SavingsPortfolio;
  activeFundId: string;
  view: ViewMode;
  onHub: () => void;
  onOpenFund: (fundId: string) => void;
}) {
  return (
    <nav className="mm-track-nav" aria-label="Savings challenge navigation">
      <button type="button" className={`mm-nav-home ${view === "hub" ? "is-active" : ""}`} onClick={onHub}>
        <Layers3 size={16} />
        Cover
      </button>
      <div className="mm-nav-scroll">
        {portfolio.funds.map((fund) => {
          const stats = getSavingsStats(fund);
          const active = view === "track" && fund.id === activeFundId;
          return (
            <button
              type="button"
              key={fund.id}
              className={`mm-nav-item ${active ? "is-active" : ""}`}
              onClick={() => onOpenFund(fund.id)}
            >
              <span className={`mm-status-dot mm-status-dot--${fund.status}`} />
              <strong>{fund.goalName}</strong>
              <small>{stats.percent}%</small>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function PortfolioHub({
  portfolio,
  portfolioStats,
  onOpenFund,
  onStartChallenge,
}: {
  portfolio: SavingsPortfolio;
  portfolioStats: ReturnType<typeof getPortfolioStats>;
  onOpenFund: (fundId: string) => void;
  onStartChallenge: (challengeId: SavingsChallengeId) => void;
}) {
  const [trackFilter, setTrackFilter] = useState<SavingsFund["status"] | "all">("active");
  const sortedFunds = [...portfolio.funds].sort((a, b) => {
    const order = { active: 0, paused: 1, completed: 2 };
    return order[a.status] - order[b.status];
  });
  const visibleFunds =
    trackFilter === "all" ? sortedFunds : sortedFunds.filter((fund) => fund.status === trackFilter);
  const tabItems: Array<{ id: SavingsFund["status"] | "all"; label: string; count: number }> = [
    { id: "active", label: "Active", count: portfolioStats.activeCount },
    { id: "paused", label: "Paused", count: portfolioStats.pausedCount },
    { id: "completed", label: "Complete", count: portfolioStats.completedCount },
    { id: "all", label: "All", count: portfolio.funds.length },
  ];

  return (
    <div className="mm-hub">
      <section className="mm-cover mm-cover--hub">
        <div className="mm-cover__grain" />
        <div className="mm-cover__top">
          <span className="mm-system-pill">
            <BadgeCheck size={15} />
            Guided system
          </span>
          <span className="mm-mono">Draftpace System</span>
        </div>

        <div className="mm-cover__body">
          <div>
            <p className="mm-eyebrow">Money Momentum</p>
            <h2 className="mm-cover-title">Savings Challenge</h2>
            <p className="mm-cover-copy">
              A calm challenge desk for running multiple savings tracks without losing the thread.
            </p>
          </div>
          <MiniEnvelopeStack />
        </div>

        <div className="mm-cover-widgets">
          <CoverWidget
            icon={<PremiumGlyph kind="vault" />}
            label="Total stashed"
            value={formatMoney(portfolioStats.totalSaved)}
            note={`${portfolioStats.sealedEnvelopes}/${portfolioStats.totalEnvelopes} envelopes sealed`}
          />
          <CoverWidget
            icon={<PremiumGlyph kind="tracks" />}
            label="Challenge tracks"
            value={`${portfolioStats.activeCount} active`}
            note={`${portfolioStats.pausedCount} paused · ${portfolioStats.completedCount} complete`}
          />
          <CoverWidget
            icon={<PremiumGlyph kind="next" />}
            label="Next move"
            value={
              portfolioStats.nextFund && portfolioStats.nextStats?.nextIndex !== -1
                ? formatMoney(portfolioStats.nextFund.envelopes[portfolioStats.nextStats?.nextIndex ?? 0]?.amount ?? 0)
                : "Set"
            }
            note={portfolioStats.nextFund ? portfolioStats.nextFund.goalName : "Start a challenge"}
          />
        </div>
      </section>

      <div className="mm-hub-grid">
        <section className="mm-hub-panel">
          <PanelHead eyebrow="Your tracks" title="My challenges" />
          <div className="mm-status-tabs" role="tablist" aria-label="Filter savings tracks">
            {tabItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={trackFilter === item.id ? "is-active" : ""}
                onClick={() => setTrackFilter(item.id)}
              >
                <span>{item.label}</span>
                <strong>{item.count}</strong>
              </button>
            ))}
          </div>
          <div className="mm-track-list">
            {visibleFunds.length > 0 ? (
              visibleFunds.map((fund) => <TrackCard key={fund.id} fund={fund} onOpen={() => onOpenFund(fund.id)} />)
            ) : (
              <div className="mm-empty-panel">
                No {trackFilter === "all" ? "" : trackFilter} tracks yet.
              </div>
            )}
          </div>
        </section>

        <section className="mm-hub-panel">
          <PanelHead eyebrow="Challenge library" title="Start another" />
          <div className="mm-library-grid">
            {savingsChallenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                activeCount={portfolio.funds.filter((fund) => fund.challenge === challenge.id && fund.status !== "completed").length}
                onStart={() => onStartChallenge(challenge.id)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function TrackExperience({
  fund,
  stats,
  challenge,
  companion,
  companionDraft,
  companionNote,
  sealedEnvelope,
  canUseActiveTrack,
  onBack,
  onOpenRitual,
  onActivateRecovery,
  onVault,
  onPause,
  onResume,
  onCompanionDraftChange,
  onCompanionSubmit,
  onCompanionSignal,
}: {
  fund: SavingsFund;
  stats: ReturnType<typeof getSavingsStats>;
  challenge: ChallengeDefinition;
  companion: ReturnType<typeof getCompanionResponse>;
  companionDraft: string;
  companionNote: string;
  sealedEnvelope: number | null;
  canUseActiveTrack: boolean;
  onBack: () => void;
  onOpenRitual: (index?: number, recovery?: boolean) => void;
  onActivateRecovery: () => void;
  onVault: () => void;
  onPause: () => void;
  onResume: () => void;
  onCompanionDraftChange: (value: string) => void;
  onCompanionSubmit: () => void;
  onCompanionSignal: (signal: CompanionSignal) => void;
}) {
  return (
    <>
      <div className="mm-product-head">
        <div>
          <p className="mm-eyebrow">Money Momentum</p>
          <h2>{fund.goalName}</h2>
          <p>
            For <strong>{fund.reason}</strong>
          </p>
        </div>
        <div className="mm-product-actions">
          <span className={`mm-state-chip mm-state-chip--${fund.status}`}>{getStatusLabel(fund.status)}</span>
          <button type="button" className="mm-icon-action" onClick={onBack}>
            <ArrowLeft size={16} />
            Cover
          </button>
        </div>
      </div>

      {fund.status === "paused" && (
        <section className="mm-state-banner">
          <Pause size={18} />
          <div>
            <strong>This challenge is paused.</strong>
            <span>Progress is preserved. Resume when the rhythm fits again.</span>
          </div>
          <button type="button" className="mm-secondary" onClick={onResume}>
            <Play size={16} />
            Resume
          </button>
        </section>
      )}

      <div className="mm-system-grid">
        <main className="mm-main-column">
          <section className="mm-progress-card">
            <div className="mm-progress-top">
              <div>
                <span className="mm-mono">Track progress</span>
                <div className="mm-saved">
                  {formatMoney(stats.saved)}
                  <small>stashed in this challenge</small>
                </div>
                <p>
                  of <strong>{formatMoney(fund.target)}</strong> · {formatMoney(stats.left)} left
                </p>
              </div>
              <div className="mm-ring" aria-label={`${stats.percent}% funded`}>
                <div>{stats.percent}%</div>
                <span>Funded</span>
              </div>
            </div>

            <div className="mm-bar">
              <span style={{ width: `${stats.percent}%` }} />
            </div>

            <div className="mm-stat-row">
              <Stat icon={<Flame size={17} />} value={stats.momentumScore} label="Momentum" />
              <Stat icon={<Sparkles size={17} />} value={fund.streak} label="Deposit streak" />
              <Stat
                icon={<ShieldCheck size={17} />}
                value={`${stats.sealedCount}/${stats.totalEnvelopes}`}
                label="Sealed"
              />
            </div>
          </section>

          <section className="mm-board-section">
            <div className="mm-section-line">
              <div>
                <span className="mm-mono">The board</span>
                <p>Each envelope is one real deposit.</p>
              </div>
              <span>{challenge.description}</span>
            </div>

            <div className="mm-board" aria-label="Savings envelope board">
              {fund.envelopes.map((envelope, index) => {
                const isNext = index === stats.nextIndex && fund.status === "active";
                const isSealing = index === sealedEnvelope;
                return (
                  <button
                    type="button"
                    key={`${index}-${envelope.amount}`}
                    className={`mm-envelope ${envelope.status === "stashed" ? "mm-envelope--stashed" : ""} ${
                      isNext ? "mm-envelope--next" : ""
                    } ${isSealing ? "mm-envelope--sealing" : ""}`}
                    onClick={() => envelope.status === "empty" && onOpenRitual(index)}
                    disabled={fund.status !== "active" || envelope.status === "stashed"}
                    aria-label={`${envelope.status === "stashed" ? "Sealed" : "Open"} envelope ${index + 1}`}
                  >
                    <EnvelopeIcon filled={envelope.status === "stashed"} />
                    <span>{formatMoney(envelope.amount)}</span>
                    {envelope.status === "stashed" && (
                      <i>
                        <Check size={11} />
                      </i>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="mm-action-dock" aria-label="Savings actions">
            <button type="button" className="mm-primary" onClick={() => onOpenRitual()} disabled={!canUseActiveTrack}>
              {fund.status === "paused" ? "Resume first" : stats.nextIndex === -1 ? "Complete" : "Stash deposit"}
              {stats.nextIndex === -1 ? <Check size={18} /> : <ArrowRight size={18} />}
            </button>
            <button type="button" className="mm-secondary" onClick={onActivateRecovery} disabled={!canUseActiveTrack}>
              <RotateCcw size={17} />
              Minimum
            </button>
            <button type="button" className="mm-secondary" onClick={onVault}>
              <BookOpen size={17} />
              Vault
            </button>
          </section>
        </main>

        <aside className="mm-side-column">
          <section className="mm-pace-card">
            <div className="mm-card-title">
              <Landmark size={18} />
              Track controls
            </div>
            <div className="mm-pace-list">
              <span>{getRhythmLabel(fund.rhythm)}</span>
              <span>{getPaceLabel(fund.pace)}</span>
              <span>{getHomeLabel(fund.home)}</span>
            </div>
            <div className="mm-status-actions">
              {fund.status === "active" ? (
                <button type="button" className="mm-secondary" onClick={onPause}>
                  <Pause size={16} />
                  Pause
                </button>
              ) : fund.status === "paused" ? (
                <button type="button" className="mm-secondary" onClick={onResume}>
                  <Play size={16} />
                  Resume
                </button>
              ) : (
                <span className="mm-complete-note">Kept in the vault as proof.</span>
              )}
            </div>
          </section>

          <section className="mm-companion-card">
            <div className="mm-card-title">
              <MessageCircle size={18} />
              Companion
            </div>
            <div className="mm-companion-mark" />
            <span className="mm-companion-label">{companion.label}</span>
            <p>{companion.line}</p>
            {companionNote && <div className="mm-companion-context">You said: {companionNote}</div>}
            <div className="mm-companion-input">
              <textarea
                value={companionDraft}
                onChange={(event) => onCompanionDraftChange(event.target.value)}
                rows={3}
                placeholder="Tell the companion what changed..."
              />
              <button type="button" className="mm-secondary" onClick={onCompanionSubmit}>
                Adjust guidance
              </button>
            </div>
            <div className="mm-companion-actions">
              <button type="button" onClick={() => onCompanionSignal("cash-tight")}>
                Cash tight
              </button>
              <button type="button" onClick={() => onCompanionSignal("extra-capacity")}>
                More capacity
              </button>
              <button type="button" onClick={() => onCompanionSignal("behind")}>
                Fell behind
              </button>
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}

function CoverWidget({ icon, label, value, note }: { icon: ReactNode; label: string; value: string; note: string }) {
  return (
    <div className="mm-cover-widget">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}

function PanelHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mm-panel-head">
      <span className="mm-mono">{eyebrow}</span>
      <h3>{title}</h3>
    </div>
  );
}

function TrackCard({ fund, onOpen }: { fund: SavingsFund; onOpen: () => void }) {
  const stats = getSavingsStats(fund);

  return (
    <button type="button" className={`mm-track-card mm-track-card--${fund.status}`} onClick={onOpen}>
      <div className="mm-track-card__top">
        <span className={`mm-state-chip mm-state-chip--${fund.status}`}>{getStatusLabel(fund.status)}</span>
        <small>{stats.percent}% funded</small>
      </div>
      <div className="mm-track-card__main">
        <div>
          <h4>{fund.goalName}</h4>
          <p>{fund.reason}</p>
        </div>
        <strong>{formatMoney(stats.saved)}</strong>
      </div>
      <div className="mm-track-card__bar">
        <span style={{ width: `${stats.percent}%` }} />
      </div>
      <small>
        {stats.sealedCount}/{stats.totalEnvelopes} sealed · {formatMoney(stats.left)} left
      </small>
    </button>
  );
}

function ChallengeCard({
  challenge,
  activeCount,
  onStart,
}: {
  challenge: ChallengeDefinition;
  activeCount: number;
  onStart: () => void;
}) {
  return (
    <div className="mm-challenge-card">
      <div className="mm-challenge-card__icon">
        <PremiumGlyph kind={challenge.id === "quick100" ? "spark" : "vault"} />
      </div>
      <div>
        <h4>{challenge.name}</h4>
        <p>{challenge.promise}</p>
        <small>
          {challenge.envelopeCount} envelopes · {formatMoney(challenge.target)}
        </small>
      </div>
      <button type="button" className="mm-secondary" onClick={onStart}>
        <Plus size={16} />
        {activeCount > 0 ? "Start another" : "Start"}
      </button>
    </div>
  );
}

function Stat({ icon, value, label }: { icon: ReactNode; value: ReactNode; label: string }) {
  return (
    <div className="mm-stat">
      {icon}
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function RitualOverlay({
  ritual,
  amount,
  note,
  home,
  selectedAmount,
  onAmountChange,
  onNoteChange,
  onClose,
  onMove,
  onDecline,
  onSeal,
}: {
  ritual: RitualState;
  amount: string;
  note: string;
  home: string;
  selectedAmount: number;
  onAmountChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onClose: () => void;
  onMove: (step: RitualStep) => void;
  onDecline: () => void;
  onSeal: () => void;
}) {
  const quickAmounts = Array.from(new Set([5, selectedAmount, selectedAmount * 2, 100])).filter((value) => value > 0);

  return (
    <div className="mm-overlay" role="dialog" aria-modal="true" aria-label="Deposit ritual">
      <div className="mm-sheet">
        <button type="button" className="mm-sheet-close" onClick={onClose} aria-label="Close ritual">
          <X size={18} />
        </button>
        <div className="mm-grab" />

        {ritual.step === "amount" && (
          <div className="mm-beat">
            <span className="mm-mono">{ritual.recovery ? "Recovery stash" : "Next deposit"}</span>
            <h3>How much moved?</h3>
            <p>Enter the amount after it has actually left spending and landed in the stash home.</p>
            <label className="mm-amount-field">
              <span>$</span>
              <input
                value={amount}
                onChange={(event) => onAmountChange(event.target.value)}
                inputMode="decimal"
                type="number"
                min="1"
              />
            </label>
            <div className="mm-quick-row">
              {quickAmounts.map((quickAmount) => (
                <button key={quickAmount} type="button" onClick={() => onAmountChange(String(quickAmount))}>
                  {formatMoney(quickAmount)}
                </button>
              ))}
            </div>
            <button type="button" className="mm-primary" onClick={() => onMove("gate")}>
              Continue
              <ChevronRight size={18} />
            </button>
            <button type="button" className="mm-link-btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        )}

        {ritual.step === "gate" && (
          <div className="mm-beat">
            <span className="mm-mono">The one rule</span>
            <h3>Has the money actually moved?</h3>
            <p>
              {formatMoney(Number(amount) || selectedAmount)} into {home.toLowerCase()}, right now.
            </p>
            <div className="mm-rule-box">
              <ShieldCheck size={19} />
              <strong>Intentions do not get sealed. Deposits do.</strong>
              <span>An envelope only counts once the money is genuinely set aside.</span>
            </div>
            <button type="button" className="mm-primary" onClick={() => onMove("note")}>
              Yes, it has moved
              <Check size={18} />
            </button>
            <button type="button" className="mm-link-btn" onClick={onDecline}>
              Not yet, take me back
            </button>
          </div>
        )}

        {ritual.step === "note" && (
          <div className="mm-beat">
            <span className="mm-mono">Mark it</span>
            <h3>What made this one possible?</h3>
            <p>Optional. One line future-you will want to see in the vault.</p>
            <textarea
              value={note}
              onChange={(event) => onNoteChange(event.target.value)}
              rows={4}
              placeholder="Skipped two takeaways this week..."
            />
            <button type="button" className="mm-primary" onClick={onSeal}>
              Seal the envelope
              <Check size={18} />
            </button>
            <button type="button" className="mm-link-btn" onClick={onSeal}>
              Seal without a note
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function MilestoneModal({ milestone, onClose }: { milestone: SavingsMilestone; onClose: () => void }) {
  return (
    <div className="mm-overlay mm-overlay--center" role="dialog" aria-modal="true" aria-label={milestone.title}>
      <div className="mm-milestone">
        <div className="mm-ms-seal">
          <Trophy size={28} />
          <span>{milestone.seal}</span>
        </div>
        <h3>{milestone.title}</h3>
        <p>{milestone.line}</p>
        <button type="button" className="mm-primary" onClick={onClose}>
          Keep going
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

function VaultDrawer({ fund, envelopes, onClose }: { fund: SavingsFund; envelopes: Envelope[]; onClose: () => void }) {
  return (
    <div className="mm-overlay" role="dialog" aria-modal="true" aria-label="Savings vault">
      <aside className="mm-vault">
        <div className="mm-vault-head">
          <div>
            <span className="mm-mono">Vault</span>
            <h3>{fund.goalName}</h3>
          </div>
          <button type="button" onClick={onClose} aria-label="Close vault">
            <X size={18} />
          </button>
        </div>
        {envelopes.length === 0 ? (
          <div className="mm-empty-vault">
            <Wallet size={24} />
            No envelopes sealed yet. Your proof will live here after the first deposit.
          </div>
        ) : (
          <div className="mm-vault-list">
            {envelopes.map((envelope, index) => (
              <div key={`${envelope.stashedOn}-${index}`} className="mm-vault-item">
                <strong>{formatMoney(envelope.amount)}</strong>
                <span>
                  {envelope.stashedOn
                    ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
                        new Date(envelope.stashedOn)
                      )
                    : "Sealed"}
                </span>
                {envelope.note && <p>{envelope.note}</p>}
              </div>
            ))}
          </div>
        )}
      </aside>
    </div>
  );
}

function MiniEnvelopeStack() {
  return (
    <div className="mm-mini-stack" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((item) => (
        <div key={item}>
          <EnvelopeIcon filled={item < 2} />
        </div>
      ))}
    </div>
  );
}

function PremiumGlyph({ kind }: { kind: "vault" | "tracks" | "next" | "spark" }) {
  return (
    <svg className="mm-premium-glyph" viewBox="0 0 48 48" aria-hidden="true">
      <rect x="7" y="7" width="34" height="34" rx="12" fill="rgba(227,179,65,.12)" stroke="rgba(227,179,65,.42)" />
      {kind === "vault" && (
        <>
          <path d="M15 25h18v8H15z" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M18 25v-4a6 6 0 0 1 12 0v4" fill="none" stroke="currentColor" strokeWidth="2" />
        </>
      )}
      {kind === "tracks" && (
        <>
          <path d="M15 17h18M15 24h18M15 31h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="18" cy="17" r="2.5" fill="currentColor" />
          <circle cx="27" cy="24" r="2.5" fill="currentColor" />
          <circle cx="22" cy="31" r="2.5" fill="currentColor" />
        </>
      )}
      {kind === "next" && (
        <>
          <path d="M16 24h15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="m26 18 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
      {kind === "spark" && (
        <>
          <path d="M24 14 27 22 35 24 27 27 24 35 21 27 13 24 21 22z" fill="currentColor" opacity=".92" />
        </>
      )}
    </svg>
  );
}

function EnvelopeIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 70 50" preserveAspectRatio="none" aria-hidden="true">
      <rect
        x="2"
        y="6"
        width="66"
        height="40"
        rx="5"
        fill={filled ? "#E3B341" : "#F8FAF6"}
        stroke={filled ? "#C2922C" : "#9CAF9F"}
        strokeWidth="2"
      />
      <path
        d="M3 9 L35 30 L67 9"
        fill="none"
        stroke={filled ? "#C2922C" : "#8DA393"}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

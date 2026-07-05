export type EnvelopeStatus = "empty" | "stashed";
export type SavingsChallengeId =
  | "quick100"
  | "starter500"
  | "emergency1000"
  | "big2500"
  | "classic100"
  | "week52"
  | "custom";
export type SavingsRhythm = "daily" | "weekly" | "biweekly" | "monthly";
export type SavingsHome = "separate_account" | "cash_envelope" | "bank_pocket" | "other";
export type SavingsPace = "gentle" | "steady" | "intense";
export type FundStatus = "active" | "paused" | "completed";

export interface Envelope {
  amount: number;
  status: EnvelopeStatus;
  stashedOn?: string;
  note?: string;
}

export interface SavingsFund {
  id: string;
  goalName: string;
  reason: string;
  challenge: SavingsChallengeId;
  target: number;
  rhythm: SavingsRhythm;
  home: SavingsHome;
  pace: SavingsPace;
  envelopes: Envelope[];
  momentum: number;
  streak: number;
  status: FundStatus;
  createdAt: string;
  completedAt?: string;
  firedMilestones?: string[];
}

export interface SavingsPortfolio {
  id: string;
  activeFundId: string;
  funds: SavingsFund[];
  createdAt: string;
  updatedAt: string;
}

export type SavingsStats = {
  saved: number;
  left: number;
  percent: number;
  sealedCount: number;
  nextIndex: number;
  momentumScore: number;
  totalEnvelopes: number;
};

export type SavingsMilestone = {
  id: string;
  at: number;
  seal: string;
  title: string;
  line: string;
};

export type CompanionSignal =
  | "entry"
  | "deposit-sealed"
  | "milestone"
  | "recovery"
  | "declined-gate"
  | "cash-tight"
  | "extra-capacity"
  | "behind"
  | "complete";

export type CompanionIntent = "frame" | "acknowledge" | "protect" | "compress" | "de-escalate";

export type CompanionResponse = {
  intent: CompanionIntent;
  label: string;
  line: string;
};

export type ChallengeDefinition = {
  id: SavingsChallengeId;
  name: string;
  target: number;
  envelopeCount: number;
  description: string;
  promise: string;
  amounts: () => number[];
};

export const savingsChallenges: ChallengeDefinition[] = [
  {
    id: "quick100",
    name: "$100 Quick Start",
    target: 100,
    envelopeCount: 10,
    description: "Ten $10 envelopes for proving the habit without pressure.",
    promise: "Build proof fast, then decide if you want a larger fund.",
    amounts: () => Array.from({ length: 10 }, () => 10),
  },
  {
    id: "starter500",
    name: "$500 Starter Fund",
    target: 500,
    envelopeCount: 20,
    description: "Twenty steady $25 deposits for the first real buffer.",
    promise: "Create a real starter cushion without turning the month upside down.",
    amounts: () => Array.from({ length: 20 }, () => 25),
  },
  {
    id: "emergency1000",
    name: "$1,000 Emergency Fund",
    target: 1000,
    envelopeCount: 40,
    description: "Forty $25 envelopes built to become a useful emergency cushion.",
    promise: "Turn small deposits into a practical emergency fund.",
    amounts: () => Array.from({ length: 40 }, () => 25),
  },
  {
    id: "big2500",
    name: "$2,500 Big Buffer",
    target: 2500,
    envelopeCount: 50,
    description: "Fifty $50 deposits for a more serious financial runway.",
    promise: "Build a bigger buffer with visible, repeatable deposits.",
    amounts: () => Array.from({ length: 50 }, () => 50),
  },
  {
    id: "classic100",
    name: "Classic 100 Envelope",
    target: 5050,
    envelopeCount: 100,
    description: "The full $1 to $100 envelope challenge.",
    promise: "Use the classic challenge with a cleaner interactive board.",
    amounts: () => Array.from({ length: 100 }, (_, index) => index + 1),
  },
  {
    id: "week52",
    name: "52 Week Build",
    target: 1378,
    envelopeCount: 52,
    description: "A one-year climb from $1 to $52.",
    promise: "Make the year visible with one envelope per week.",
    amounts: () => Array.from({ length: 52 }, (_, index) => index + 1),
  },
  {
    id: "custom",
    name: "Custom Stash",
    target: 1000,
    envelopeCount: 40,
    description: "A flexible challenge using the current fund target.",
    promise: "Shape the fund around a real-life goal.",
    amounts: () => Array.from({ length: 40 }, () => 25),
  },
];

export const savingsStorageKey = "draftpace-money-momentum-savings-fund";
export const savingsPortfolioStorageKey = "draftpace-money-momentum-savings-portfolio";

export function createEnvelopes(challengeId: SavingsChallengeId): Envelope[] {
  const challenge = getSavingsChallenge(challengeId);
  return challenge.amounts().map((amount) => ({
    amount,
    status: "empty",
  }));
}

export function createSavingsFund(
  challengeId: SavingsChallengeId,
  overrides: Partial<Pick<SavingsFund, "goalName" | "reason" | "rhythm" | "home" | "pace">> = {}
): SavingsFund {
  const challenge = getSavingsChallenge(challengeId);

  return {
    id: `${challenge.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    goalName: overrides.goalName ?? challenge.name,
    reason: overrides.reason ?? challenge.promise,
    challenge: challenge.id,
    target: challenge.target,
    rhythm: overrides.rhythm ?? "weekly",
    home: overrides.home ?? "separate_account",
    pace: overrides.pace ?? "steady",
    envelopes: createEnvelopes(challenge.id),
    momentum: 0,
    streak: 0,
    status: "active",
    createdAt: new Date().toISOString(),
    firedMilestones: [],
  };
}

export function createDefaultSavingsFund(): SavingsFund {
  return createSavingsFund("emergency1000", {
    goalName: "Emergency Fund",
    reason: "a flat tire never ruining a month again",
  });
}

export function createDefaultSavingsPortfolio(): SavingsPortfolio {
  const firstFund = createDefaultSavingsFund();
  const now = new Date().toISOString();

  return {
    id: "money-momentum-savings-portfolio",
    activeFundId: firstFund.id,
    funds: [firstFund],
    createdAt: now,
    updatedAt: now,
  };
}

export function getSavingsChallenge(id: SavingsChallengeId): ChallengeDefinition {
  return (
    savingsChallenges.find((challenge) => challenge.id === id) ??
    savingsChallenges.find((challenge) => challenge.id === "emergency1000") ??
    savingsChallenges[0]
  );
}

export function getPortfolioStats(portfolio: SavingsPortfolio) {
  const fundStats = portfolio.funds.map((fund) => ({ fund, stats: getSavingsStats(fund) }));
  const totalSaved = fundStats.reduce((total, item) => total + item.stats.saved, 0);
  const totalTarget = portfolio.funds.reduce((total, fund) => total + fund.target, 0);
  const activeCount = portfolio.funds.filter((fund) => fund.status === "active").length;
  const pausedCount = portfolio.funds.filter((fund) => fund.status === "paused").length;
  const completedCount = portfolio.funds.filter((fund) => fund.status === "completed").length;
  const nextFund = fundStats.find((item) => item.fund.status === "active" && item.stats.nextIndex !== -1);

  return {
    totalSaved,
    totalTarget,
    totalPercent: totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0,
    totalEnvelopes: portfolio.funds.reduce((total, fund) => total + fund.envelopes.length, 0),
    sealedEnvelopes: fundStats.reduce((total, item) => total + item.stats.sealedCount, 0),
    activeCount,
    pausedCount,
    completedCount,
    nextFund: nextFund?.fund ?? null,
    nextStats: nextFund?.stats ?? null,
  };
}

export function getStatusLabel(status: FundStatus): string {
  const labels: Record<FundStatus, string> = {
    active: "Active",
    paused: "Paused",
    completed: "Complete",
  };

  return labels[status];
}

export function getSavingsStats(fund: SavingsFund): SavingsStats {
  const saved = fund.envelopes
    .filter((envelope) => envelope.status === "stashed")
    .reduce((total, envelope) => total + envelope.amount, 0);
  const sealedCount = fund.envelopes.filter((envelope) => envelope.status === "stashed").length;
  const nextIndex = fund.envelopes.findIndex((envelope) => envelope.status === "empty");
  const percent = fund.target > 0 ? Math.min(100, Math.round((saved / fund.target) * 100)) : 0;
  const envelopeConsistency = fund.envelopes.length > 0 ? (sealedCount / fund.envelopes.length) * 100 : 0;
  const volumeProgress = fund.target > 0 ? (saved / fund.target) * 100 : 0;
  const streakLift = Math.min(fund.streak * 3, 16);
  const momentumScore = Math.min(100, Math.round(envelopeConsistency * 0.58 + volumeProgress * 0.3 + streakLift));

  return {
    saved,
    left: Math.max(0, fund.target - saved),
    percent,
    sealedCount,
    nextIndex,
    momentumScore,
    totalEnvelopes: fund.envelopes.length,
  };
}

export function getHomeLabel(home: SavingsHome): string {
  const labels: Record<SavingsHome, string> = {
    separate_account: "Separate account",
    cash_envelope: "Cash envelope",
    bank_pocket: "Bank pocket",
    other: "Chosen stash home",
  };

  return labels[home];
}

export function getRhythmLabel(rhythm: SavingsRhythm): string {
  const labels: Record<SavingsRhythm, string> = {
    daily: "Daily",
    weekly: "Weekly",
    biweekly: "Biweekly",
    monthly: "Monthly",
  };

  return labels[rhythm];
}

export function getPaceLabel(pace: SavingsPace): string {
  const labels: Record<SavingsPace, string> = {
    gentle: "Gentle",
    steady: "Steady",
    intense: "Intense",
  };

  return labels[pace];
}

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export function getSavingsMilestones(fund: SavingsFund): SavingsMilestone[] {
  const firstEnvelope = fund.envelopes[0]?.amount ?? 25;

  return [
    {
      id: "first",
      at: firstEnvelope,
      seal: "1st",
      title: "First envelope sealed",
      line: "The hardest one is behind you. A fund is just this, repeated.",
    },
    {
      id: "hundred",
      at: Math.min(100, fund.target),
      seal: "$100",
      title: "$100 stashed",
      line: "Not a number. A small buffer between you and a bad week.",
    },
    {
      id: "quarter",
      at: Math.round(fund.target * 0.25),
      seal: "1/4",
      title: "Quarter funded",
      line: "This is no longer an idea. It is a cushion you did not have before.",
    },
    {
      id: "half",
      at: Math.round(fund.target * 0.5),
      seal: "1/2",
      title: "Halfway home",
      line: "The second half is lighter because the rhythm is already real.",
    },
    {
      id: "near",
      at: Math.round(fund.target * 0.75),
      seal: "3/4",
      title: "Almost funded",
      line: "You can see the end from here. Hold the rhythm instead of rushing it.",
    },
    {
      id: "complete",
      at: fund.target,
      seal: "Done",
      title: "Fully stashed",
      line: "You did the quiet work, one honest deposit at a time. The fund is real.",
    },
  ].filter((milestone, index, list) => list.findIndex((item) => item.id === milestone.id) === index);
}

export function getCrossedMilestone(
  fund: SavingsFund,
  previousSaved: number,
  nextSaved: number
): SavingsMilestone | null {
  const fired = new Set(fund.firedMilestones ?? []);

  return (
    getSavingsMilestones(fund).find(
      (milestone) => nextSaved >= milestone.at && previousSaved < milestone.at && !fired.has(milestone.id)
    ) ?? null
  );
}

export function getCompanionResponse(
  fund: SavingsFund,
  signal: CompanionSignal,
  milestone?: SavingsMilestone | null
): CompanionResponse {
  const stats = getSavingsStats(fund);
  const challenge = getSavingsChallenge(fund.challenge);

  if (signal === "declined-gate") {
    return {
      intent: "protect",
      label: "Rule protected",
      line: "Good call. The envelope waits until the money does. Come back the moment it has actually moved.",
    };
  }

  if (signal === "recovery" || signal === "cash-tight") {
    return {
      intent: "compress",
      label: "Recovery mode",
      line: "Move the smallest honest amount you can right now. A smaller real deposit beats a perfect plan that never leaves checking.",
    };
  }

  if (signal === "extra-capacity") {
    return {
      intent: "protect",
      label: "Pace guard",
      line: "Extra capacity is useful, but do not turn one strong week into a new personality. Seal what moved and keep tomorrow livable.",
    };
  }

  if (signal === "behind") {
    return {
      intent: "de-escalate",
      label: "No restart",
      line: "You are not behind a perfect version of yourself. Seal one honest envelope and the system continues from there.",
    };
  }

  if (signal === "milestone" && milestone) {
    return {
      intent: "acknowledge",
      label: milestone.title,
      line: milestone.line,
    };
  }

  if (stats.percent >= 100 || signal === "complete") {
    return {
      intent: "acknowledge",
      label: "Fund complete",
      line: "Fully stashed. You finished what most people only make a spreadsheet for. Archive the proof before you start the next fund.",
    };
  }

  if (stats.sealedCount === 0) {
    return {
      intent: "frame",
      label: "Start clean",
      line: `${challenge.name} starts with one real move. Seal the first envelope only after the money lands in ${getHomeLabel(
        fund.home
      ).toLowerCase()}.`,
    };
  }

  if (stats.percent >= 75) {
    return {
      intent: "protect",
      label: "Near the end",
      line: `${stats.totalEnvelopes - stats.sealedCount} envelopes left. You can see the end from here. Hold the rhythm; do not sprint into burnout.`,
    };
  }

  if (stats.percent >= 50) {
    return {
      intent: "acknowledge",
      label: "Halfway rhythm",
      line: "Past halfway. The fund is real now, and the back half is lighter than the front. Protect the streak.",
    };
  }

  if (fund.streak >= 3) {
    return {
      intent: "acknowledge",
      label: "Streak building",
      line: `${fund.streak} deposits in a row. This is what steady looks like. Seal the next one only after the money moves.`,
    };
  }

  return {
    intent: "frame",
    label: "Next envelope",
    line: "Another envelope home. Small, honest, repeatable. That is the whole system.",
  };
}

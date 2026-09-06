import type { OwnedProductRow } from "./deriveOwnedProducts";

import { computeCapabilities } from "@/products/personal-finance-companion/companion/capability";
import { listAccounts } from "@/products/personal-finance-companion/domain/accounts";
import { listBills } from "@/products/personal-finance-companion/domain/bills";
import { listSubscriptions } from "@/products/personal-finance-companion/domain/subscriptions";

import { deriveHomeState } from "@/products/home-management-companion/attention";
import { describeHomeHeadline } from "@/products/home-management-companion/homeVoice";
import { listHomeItems } from "@/products/home-management-companion/domain/homeItems";
import { listMaintenanceTasks } from "@/products/home-management-companion/domain/maintenanceTasks";
import { listProblems } from "@/products/home-management-companion/domain/problems";

import { deriveAttention, QUIET_LINE } from "@/products/alongside/attention";
import { loadItems as loadAlongsideItems } from "@/products/alongside/domain/alongsideData";

import { deriveAffairsState } from "@/products/personal-life-affairs-companion/sequencer";
import {
  loadProfile as loadAffairsProfile,
  loadSteps as loadAffairsSteps,
  loadItems as loadAffairsItems,
} from "@/products/personal-life-affairs-companion/domain/affairsData";

import { deriveToday } from "@/products/homeschooling-companion/today";
import {
  loadChildren,
  loadPlan,
  loadTaskEvents,
} from "@/products/homeschooling-companion/domain/learningData";

import { loadTrips } from "@/products/travel-companion/domain/travelData";
import { loadMonthlyMoneyResetState } from "@/products/monthly-money-reset/data";

/**
 * One honest, always-present summary per owned product, for Home's
 * life-area tiles.
 *
 * Deliberately a sibling of attentionAdapter.ts rather than an extension
 * of it: that one answers "what is the single most urgent thing across
 * everything" and returns exactly one winner, dropping anything quiet.
 * This one answers "what does each product have to say for itself right
 * now" and must return something for every product, including the
 * genuinely calm answer. Different question, different shape.
 *
 * Every line here comes from a sentence or figure the product already
 * computes and already shows on its own screen — nothing is a second,
 * differently-worded opinion invented at the platform layer.
 */
export type SharedProductSummary = {
  productSlug: string;
  /** A real headline figure, only where the product genuinely has one. */
  valueMinorUnits: number | null;
  currency: string | null;
  /** The one honest sentence. Always present. */
  headline: string;
  /** A next move or a caveat, when the product offers one. Never invented. */
  supporting: string | null;
};

/**
 * Monthly Money Reset caches its own Safe-to-Spend figure and next action
 * onto the shared product_instances row every time it saves (see
 * useInstanceState.ts), so Home already has both in hand from the
 * instances query it runs anyway. Only the currency needs fetching, and
 * the figure shown is explicitly "as of your last save", never implied to
 * be live.
 */
async function summariseMonthlyMoneyReset(row: ReadyRow): Promise<SharedProductSummary | null> {
  const instance = row.instance;
  if (!instance || instance.safeToSpendMinorUnits === null) {
    return summary(row, { headline: "Nothing recorded this month yet" });
  }
  const state = await loadMonthlyMoneyResetState(instance.id);
  const currency = state.status === "ok" ? state.state.currency : null;
  return summary(row, {
    valueMinorUnits: instance.safeToSpendMinorUnits,
    currency,
    headline: "safe to spend now",
    supporting: instance.nextActionLabel,
  });
}

/** Personal Finance Companion's own dominant figure, from the same computeCapabilities row its Workspace shows. */
async function summarisePersonalFinance(row: ReadyRow): Promise<SharedProductSummary | null> {
  const instanceId = row.instance!.id;
  const [accounts, bills, subscriptions] = await Promise.all([
    listAccounts(instanceId),
    listBills(instanceId),
    listSubscriptions(instanceId),
  ]);
  if (!accounts.ok || !bills.ok || !subscriptions.ok) return null;

  const [available] = computeCapabilities({
    accounts: accounts.data,
    bills: bills.data,
    subscriptions: subscriptions.data,
    incomeSources: [],
    transactions: [],
    debts: [],
    savingsGoals: [],
  });

  if (available.status === "waiting" || available.valueMinorUnits === null) {
    return summary(row, { headline: available.detail ?? "Waiting for an account" });
  }
  return summary(row, {
    valueMinorUnits: available.valueMinorUnits,
    currency: accounts.data[0]?.currency ?? null,
    headline: "available money",
    supporting: available.detail,
  });
}

/** Home Base already writes its own one-line headline — reused verbatim. */
async function summariseHomeBase(row: ReadyRow): Promise<SharedProductSummary | null> {
  const instanceId = row.instance!.id;
  const [homeItems, maintenanceTasks, problems] = await Promise.all([
    listHomeItems(instanceId),
    listMaintenanceTasks(instanceId),
    listProblems(instanceId),
  ]);
  if (!homeItems.ok || !maintenanceTasks.ok) return null;

  const home = deriveHomeState(
    {
      homeItems: homeItems.data,
      maintenanceTasks: maintenanceTasks.data,
      problems: problems.ok ? problems.data : [],
      recentEvents: [],
    },
    new Date()
  );
  if (home.nothingTracked) return summary(row, { headline: "Nothing in your home recorded yet" });

  return summary(row, {
    headline: describeHomeHeadline({ wrong: home.somethingWrong.length, worthDoing: home.worthTakingCareOf.length }),
    supporting: home.comingUp[0]?.title ? `Coming up: ${home.comingUp[0].title}` : null,
  });
}

/** Alongside's lines are a fixed, approved set — including its real "nothing needs you" state. */
async function summariseAlongside(row: ReadyRow): Promise<SharedProductSummary | null> {
  const result = await loadAlongsideItems(row.instance!.id);
  if (!result.ok) return null;

  const { signals, quiet } = deriveAttention({ items: result.data }, new Date());
  if (quiet) return summary(row, { headline: QUIET_LINE });

  const top = signals[0];
  const item = result.data.find((i) => i.id === top.itemId);
  return summary(row, { headline: top.line, supporting: item?.title ?? null });
}

/** Personal Life Affairs shows one step at a time — so does its tile. */
async function summariseLifeAffairs(row: ReadyRow): Promise<SharedProductSummary | null> {
  const instanceId = row.instance!.id;
  const [profile, steps, items] = await Promise.all([
    loadAffairsProfile(instanceId),
    loadAffairsSteps(instanceId),
    loadAffairsItems(instanceId),
  ]);
  if (!profile.ok || !steps.ok || !items.ok) return null;

  const state = deriveAffairsState({ profile: profile.data, records: steps.data, items: items.data }, new Date());
  if (!state.next) {
    return summary(row, {
      headline: state.allCaughtUp ? "Everything you have recorded is current" : "Nothing to answer right now",
      supporting: state.establishedCount > 0 ? `${state.establishedCount} recorded` : null,
    });
  }
  return summary(row, {
    headline: state.next.step.instruction,
    supporting: state.establishedCount > 0 ? `${state.establishedCount} recorded` : null,
  });
}

/**
 * Homeschooling's own four-way headline. Curricula and positions are
 * skipped deliberately: they only affect per-task labels, never whether
 * anything is outstanding, and this is the heaviest product to load.
 */
async function summariseHomeschooling(row: ReadyRow): Promise<SharedProductSummary | null> {
  const instanceId = row.instance!.id;
  const [children, plan, events] = await Promise.all([
    loadChildren(instanceId),
    loadPlan(instanceId),
    loadTaskEvents(instanceId),
  ]);
  if (!children.ok || !plan.ok || !events.ok) return null;

  if (children.data.length === 0) return summary(row, { headline: "Nobody added yet" });

  const today = deriveToday(
    { children: children.data, plan: plan.data, curricula: [], positions: [], events: events.data },
    new Date()
  );
  if (today.nothingPlanned) return summary(row, { headline: "Nothing planned yet" });
  if (today.nothingOutstanding) return summary(row, { headline: "Nothing left for today" });
  return summary(row, { headline: "What we are doing today", supporting: `${children.data.length} learning` });
}

/**
 * Travel genuinely has nothing to say between trips — the product's own
 * screens say so too ("No trip yet"). The tile tells that truth rather
 * than manufacturing activity.
 */
async function summariseTravel(row: ReadyRow): Promise<SharedProductSummary | null> {
  const result = await loadTrips(row.instance!.id);
  if (!result.ok) return null;

  const current = result.data.find((t) => t.status === "active") ?? result.data.find((t) => t.status === "planning");
  if (!current) return summary(row, { headline: "No trip yet" });

  const where = current.destinationSummary || current.title;
  if (!current.startsAt) return summary(row, { headline: where, supporting: "No dates yet" });

  const days = daysUntil(current.startsAt);
  if (days > 0) return summary(row, { headline: where, supporting: `Starts ${days === 1 ? "tomorrow" : `in ${days} days`}` });
  return summary(row, { headline: where, supporting: current.status === "active" ? "Under way" : "Starts today" });
}

type ReadyRow = Extract<OwnedProductRow, { kind: "ready" }>;

function summary(row: ReadyRow, fields: Partial<Omit<SharedProductSummary, "productSlug">> & { headline: string }): SharedProductSummary {
  return {
    productSlug: row.productSlug,
    valueMinorUnits: fields.valueMinorUnits ?? null,
    currency: fields.currency ?? null,
    headline: fields.headline,
    supporting: fields.supporting ?? null,
  };
}

function daysUntil(dateIso: string): number {
  const target = new Date(`${dateIso}T00:00:00Z`).getTime();
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.round((target - today) / 86_400_000);
}

/** The one place that switches on productSlug — the same adapter-boundary discipline attentionAdapter.ts already sets. */
async function summariseOne(row: ReadyRow): Promise<SharedProductSummary | null> {
  switch (row.productSlug) {
    case "monthly-money-reset":
      return summariseMonthlyMoneyReset(row);
    case "personal-finance-companion":
      return summarisePersonalFinance(row);
    case "home-management-companion":
      return summariseHomeBase(row);
    case "alongside":
      return summariseAlongside(row);
    case "personal-life-affairs-companion":
      return summariseLifeAffairs(row);
    case "homeschooling-companion":
      return summariseHomeschooling(row);
    case "travel-companion":
      return summariseTravel(row);
    default:
      return null;
  }
}

/**
 * Summaries for every owned product that has something to say, keyed by
 * slug. A rejected or failed loader is dropped silently and its tile
 * falls back to plain status — a summary is enhancement on top of Home's
 * real render, never something that can break or block it (the same
 * "degrade, don't crash" discipline as deriveOwnedProducts).
 */
export async function loadProductSummaries(rows: OwnedProductRow[]): Promise<Record<string, SharedProductSummary>> {
  const eligible = rows.filter(
    (row): row is ReadyRow =>
      row.kind === "ready" && row.instance !== null && row.instance.setupComplete && !row.instance.pausedAt
  );

  const settled = await Promise.allSettled(eligible.map(summariseOne));

  const bySlug: Record<string, SharedProductSummary> = {};
  for (const outcome of settled) {
    if (outcome.status === "fulfilled" && outcome.value) bySlug[outcome.value.productSlug] = outcome.value;
  }
  return bySlug;
}

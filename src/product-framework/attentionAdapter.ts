import { listAccounts } from "@/products/personal-finance-companion/domain/accounts";
import { listIncomeSources } from "@/products/personal-finance-companion/domain/incomeSources";
import { listBills } from "@/products/personal-finance-companion/domain/bills";
import { listSubscriptions } from "@/products/personal-finance-companion/domain/subscriptions";
import { listTransactions } from "@/products/personal-finance-companion/domain/transactions";
import { listDebts } from "@/products/personal-finance-companion/domain/debts";
import { listSavingsGoals } from "@/products/personal-finance-companion/domain/savingsGoals";
import {
  deriveAttentionItems as derivePfcAttentionItems,
  type AttentionItem as PfcAttentionItem,
  type AttentionKind as PfcAttentionKind,
} from "@/products/personal-finance-companion/attention";

import { listHomeItems } from "@/products/home-management-companion/domain/homeItems";
import { listMaintenanceTasks } from "@/products/home-management-companion/domain/maintenanceTasks";
import { listProblems } from "@/products/home-management-companion/domain/problems";
import {
  deriveAttentionItems as deriveHmcAttentionItems,
  type AttentionItem as HmcAttentionItem,
} from "@/products/home-management-companion/attention";

import { loadItems as loadAlongsideItems } from "@/products/alongside/domain/alongsideData";
import {
  deriveAttention as deriveAlongsideAttention,
  type AttentionSignal as AlongsideAttentionSignal,
} from "@/products/alongside/attention";

import type { OwnedProductRow } from "./deriveOwnedProducts";

/**
 * A shared, cross-product shape for "something needs a look" — built once
 * each product's own attention.ts returns a genuinely different shape, so
 * Platform Home can pick a single winner across products it was never
 * written to compare directly (see resolveDestination.ts's own module
 * comment for the same "no family switch statement in the shell" rule;
 * the switch lives here, once, at the adapter boundary, not in the shell).
 */
export type AttentionSeverity = "critical" | "advisory" | "quiet";

export type SharedAttentionItem = {
  id: string;
  productSlug: string;
  severity: AttentionSeverity;
  title: string;
  detail: string;
  href: string;
};

const PFC_TITLE_BY_KIND: Record<PfcAttentionKind, string> = {
  accountStale: "Account balance needs a check",
  billMissingDueDate: "Bill is missing a due date",
  subscriptionReview: "Subscription still marked Review",
  subscriptionCancellationApproaching: "Cancellation window closing",
  subscriptionAnnualRenewalApproaching: "Annual renewal coming up",
  debtMissingRate: "Debt is missing an interest rate",
  savingsMissingTarget: "Savings goal is missing a target date",
  transactionMissingCategory: "Transaction needs a category",
  incomeExpectationOverdue: "Income is overdue",
};

export function mapPfcItem(item: PfcAttentionItem): SharedAttentionItem {
  return {
    id: item.id,
    productSlug: "personal-finance-companion",
    severity: item.urgency === "needsResolution" ? "critical" : "advisory",
    title: PFC_TITLE_BY_KIND[item.kind],
    detail: item.message,
    href: item.deepLink,
  };
}

/** Mirrors AttentionModule.tsx's own load shape — the same data, read the same way, not a second opinion. */
export async function loadPfcAttentionSummary(instanceId: string): Promise<SharedAttentionItem[]> {
  const [accounts, incomeSources, bills, subscriptions, transactions, debts, savingsGoals] = await Promise.all([
    listAccounts(instanceId),
    listIncomeSources(instanceId),
    listBills(instanceId),
    listSubscriptions(instanceId),
    listTransactions(instanceId),
    listDebts(instanceId),
    listSavingsGoals(instanceId),
  ]);
  const results = [accounts, incomeSources, bills, subscriptions, transactions, debts, savingsGoals];
  if (results.some((result) => !result.ok)) return [];

  const items = derivePfcAttentionItems({
    accounts: accounts.ok ? accounts.data : [],
    incomeSources: incomeSources.ok ? incomeSources.data : [],
    bills: bills.ok ? bills.data : [],
    subscriptions: subscriptions.ok ? subscriptions.data : [],
    transactions: transactions.ok ? transactions.data : [],
    debts: debts.ok ? debts.data : [],
    savingsGoals: savingsGoals.ok ? savingsGoals.data : [],
  });
  return items.map(mapPfcItem);
}

function hmcHref(href: string | null, instanceId: string): string {
  return href ?? `/app/products/home-management-companion/item/${instanceId}`;
}

export function mapHmcItem(item: HmcAttentionItem, instanceId: string): SharedAttentionItem {
  return {
    id: item.id,
    productSlug: "home-management-companion",
    severity: item.urgency === "soon" ? "critical" : "advisory",
    title: item.title,
    detail: item.detail,
    href: hmcHref(item.href, instanceId),
  };
}

/** Mirrors HomeModule.tsx's own load shape (minus recentEvents, which only "recently handled" needs). */
export async function loadHmcAttentionSummary(instanceId: string): Promise<SharedAttentionItem[]> {
  const [homeItems, maintenanceTasks, problems] = await Promise.all([
    listHomeItems(instanceId),
    listMaintenanceTasks(instanceId),
    listProblems(instanceId),
  ]);
  if (!homeItems.ok || !maintenanceTasks.ok) return [];

  const items = deriveHmcAttentionItems({
    homeItems: homeItems.data,
    maintenanceTasks: maintenanceTasks.data,
    problems: problems.ok ? problems.data : [],
  });

  return items.map((item) => mapHmcItem(item, instanceId));
}

/**
 * Alongside's signals never carry urgency or a per-item link by design —
 * `weight` is sort-only (its own file is explicit about this) and the
 * product's whole tone is deliberately low-key. Mapping them in at
 * "quiet" rather than skipping them keeps the shared type honest about
 * every product that has attention to report, without inventing an
 * urgency Alongside itself refuses to claim.
 */
export function mapAlongsideSignal(signal: AlongsideAttentionSignal): SharedAttentionItem {
  return {
    id: signal.itemId,
    productSlug: "alongside",
    severity: "quiet",
    title: "Worth a look",
    detail: signal.line,
    href: `/app/products/alongside/item/${signal.itemId}`,
  };
}

export async function loadAlongsideAttentionSummary(instanceId: string): Promise<SharedAttentionItem[]> {
  const result = await loadAlongsideItems(instanceId);
  if (!result.ok) return [];

  const { signals } = deriveAlongsideAttention({ items: result.data }, new Date());
  return signals.map(mapAlongsideSignal);
}

const SEVERITY_RANK: Record<AttentionSeverity, number> = { critical: 2, advisory: 1, quiet: 0 };

export type ProductAttentionResult = {
  items: SharedAttentionItem[];
  lastActivityAt: string;
};

/**
 * The pure decision at the center of loadTopAttentionItem, pulled out so
 * it's unit-testable with fixtures instead of live network calls: given
 * each owned product's own attention items, pick the single winner for
 * Platform Home's hero slot.
 *
 * A product's own top item is its first critical, else first advisory —
 * `quiet` items (Alongside's, always) never win here, matching that
 * product's deliberately low-key voice. Ties break on whichever product
 * was used more recently, preserving today's ordering as the secondary
 * sort.
 */
export function pickTopAttentionItem(perProduct: ProductAttentionResult[]): SharedAttentionItem | null {
  const candidates: { item: SharedAttentionItem; lastActivityAt: string }[] = [];

  for (const { items, lastActivityAt } of perProduct) {
    if (items.length === 0) continue;
    const top = items.find((item) => item.severity === "critical") ?? items.find((item) => item.severity === "advisory");
    if (!top) continue;
    candidates.push({ item: top, lastActivityAt });
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => {
    const bySeverity = SEVERITY_RANK[b.item.severity] - SEVERITY_RANK[a.item.severity];
    if (bySeverity !== 0) return bySeverity;
    return a.lastActivityAt < b.lastActivityAt ? 1 : -1;
  });

  return candidates[0].item;
}

/**
 * Platform Home's single cross-product pick. Scans every owned product,
 * not just the most recently used one (confirmed decision) — a critical
 * item in a product you haven't opened in a week still outranks routine
 * setup progress in the one you used yesterday.
 *
 * A rejected loader is dropped silently, never surfaced as an error:
 * attention is enhancement on top of Home's real render, not something
 * that should ever block or break it (same "degrade, don't crash"
 * discipline as deriveOwnedProducts).
 */
export async function loadTopAttentionItem(rows: OwnedProductRow[]): Promise<SharedAttentionItem | null> {
  const eligible = rows.filter(
    (row): row is Extract<OwnedProductRow, { kind: "ready" }> =>
      row.kind === "ready" &&
      row.instance !== null &&
      row.instance.setupComplete &&
      row.instance.lifecycleState !== "completed" &&
      // Vacation mode means actually quiet — a paused product's own
      // signals shouldn't compete for Home's hero slot either.
      !row.instance.pausedAt
  );

  const settled = await Promise.allSettled(
    eligible.map(async (row) => {
      const instanceId = row.instance!.id;
      if (row.productSlug === "personal-finance-companion") return loadPfcAttentionSummary(instanceId);
      if (row.productSlug === "home-management-companion") return loadHmcAttentionSummary(instanceId);
      if (row.productSlug === "alongside") return loadAlongsideAttentionSummary(instanceId);
      return [] as SharedAttentionItem[];
    })
  );

  const perProduct: ProductAttentionResult[] = [];
  settled.forEach((outcome, index) => {
    if (outcome.status !== "fulfilled") return;
    perProduct.push({ items: outcome.value, lastActivityAt: eligible[index].instance!.lastActivityAt });
  });

  return pickTopAttentionItem(perProduct);
}

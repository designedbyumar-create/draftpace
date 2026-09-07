import { categoryOfType, HOME_ITEM_CATEGORY_LABEL } from "./homeKnowledge";
import type { HomeItem, ServiceProvider } from "./state";

export type ProviderSuggestion = { provider: ServiceProvider; categoryLabel: string };

/**
 * "You've used X for water-category issues before" (Trump Card Memo):
 * the most recently used, non-archived provider who has worked in the
 * same category as the item a problem is being reported about. Wired
 * through ServiceProvider.category, a field that existed in the schema
 * but was never actually populated by any code path until
 * ResolveProblemSheet.tsx started setting it. Returns null, never a
 * fabricated suggestion, whenever the item has no recognised category
 * or no provider has that category yet.
 */
export function suggestProviderForItem(
  itemId: string,
  items: HomeItem[],
  providers: ServiceProvider[]
): ProviderSuggestion | null {
  const item = items.find((candidate) => candidate.id === itemId);
  if (!item) return null;
  const category = categoryOfType(item.type);
  if (!category) return null;

  const inCategory = providers
    .filter((provider) => provider.status !== "archived" && provider.category === category)
    .sort((a, b) => (b.lastUsedAt ?? "").localeCompare(a.lastUsedAt ?? ""));
  if (inCategory.length === 0) return null;

  return { provider: inCategory[0], categoryLabel: HOME_ITEM_CATEGORY_LABEL[category] };
}

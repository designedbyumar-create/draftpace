/**
 * The evaluator's entitlement gate as a pure, testable unit, mirroring
 * PFC's identical entitlementFilter.ts. The cron route's Supabase client
 * uses the service-role key, which bypasses RLS entirely - nothing else
 * in that route stops it from evaluating (and sending to) a user whose
 * Home Base entitlement has since been revoked, since neither the product
 * instance row nor the notification preferences row is deleted by
 * revocation. This is the explicit check that keeps delivery honest.
 */

export interface PreferenceRowIdentity {
  userId: string;
}

export function partitionByEntitlement<T extends PreferenceRowIdentity>(
  rows: T[],
  entitledUserIds: ReadonlySet<string>
): { entitled: T[]; skippedCount: number } {
  const entitled: T[] = [];
  let skippedCount = 0;
  for (const row of rows) {
    if (entitledUserIds.has(row.userId)) entitled.push(row);
    else skippedCount += 1;
  }
  return { entitled, skippedCount };
}

/**
 * The explicit save/read states a financial-data UI must be able to
 * represent — launch spec phase 11's requirement, generalized as platform
 * infrastructure rather than built once inside Personal Finance
 * Companion, since any product handling money needs the identical
 * honesty guarantee: never imply a save succeeded while offline if it did
 * not reach the server.
 *
 * This is a type contract only — no optimistic offline write queue exists
 * or is implied here. See useOnlineStatus() in ./hooks.ts for the raw
 * connectivity signal, and
 * docs/products/PERSONAL-FINANCE-COMPANION-FOUNDATION.md's offline
 * section for why "pendingLocalChange" is deliberately unused by this
 * product: the repository has no proven conflict-safe local-write
 * mechanism to back it (an actual queue is future work if that changes),
 * so it exists in the type only to make the state space complete and
 * documented rather than to be reachable today.
 */
export type DataSaveState =
  | { kind: "online" }
  | { kind: "temporarilyOffline" }
  /** Not currently reachable by any code in this repository — see the module comment. Present so a future conflict-safe local-write mechanism has a state to report into without inventing a new type. */
  | { kind: "pendingLocalChange" }
  | { kind: "saveFailed"; message: string; retryable: boolean }
  | { kind: "staleCachedRead"; asOf: string };

export function isRecoverable(state: DataSaveState): boolean {
  return state.kind === "temporarilyOffline" || (state.kind === "saveFailed" && state.retryable);
}

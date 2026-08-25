import { ok, err, type Result } from "@/product-framework/result";
import type { Playbook } from "./steps";
import type { CompanionRunState } from "./CompanionRun";

export interface ResumableRun<TRun extends CompanionRunState, TPlaybook extends Playbook = Playbook> {
  playbook: TPlaybook;
  run: TRun;
}

/**
 * Resume and begin, as one factory rather than two functions each
 * product writes for itself.
 *
 * Bind it once per product, against that product's own persistence
 * (loadOpenRun/startRun already scoped to its own runs table) and its
 * own playbook library, and it hands back findResumableRun/beginRun
 * ready to call from wherever "Do this with me" lives.
 *
 * WHY beginRun EXISTS AT ALL, RATHER THAN CALLING startRun DIRECTLY
 *
 * It is the one and only place a run gets created, called from the
 * click that chose a playbook, never from inside CompanionRun's own
 * render. A component that creates a database row as a side effect of
 * mounting will do it again on every remount, including the ones React
 * Strict Mode causes on purpose in development to surface exactly this
 * class of bug, which is how Alongside, this engine's first product,
 * ended up with a real orphaned run during its own testing.
 */
export function createRunLookup<TRun extends CompanionRunState, TPlaybook extends Playbook = Playbook>(config: {
  loadOpenRun: (productInstanceId: string, contextId: string) => Promise<Result<TRun | null>>;
  startRun: (productInstanceId: string, playbook: TPlaybook, contextId: string | null) => Promise<Result<TRun>>;
  playbookByKey: Record<string, TPlaybook>;
  playbookKeyOf: (run: TRun) => string;
}) {
  /**
   * Whether opening the Companion for this context means picking up
   * something already in progress, or starting fresh.
   *
   * Checked fresh every time "Do this with me" is pressed rather than
   * kept in state, because a run left open is exactly the kind of fact
   * that goes stale the moment it is cached: it could have been
   * finished, or left, from another tab in the meantime.
   */
  async function findResumableRun(
    productInstanceId: string,
    contextId: string
  ): Promise<ResumableRun<TRun, TPlaybook> | null> {
    const found = await config.loadOpenRun(productInstanceId, contextId);
    if (!found.ok || !found.data) return null;
    const playbook = config.playbookByKey[config.playbookKeyOf(found.data)];
    // Should not happen: playbook keys are content, not user data, and
    // a library only grows. Falling back to "nothing to resume" is
    // safer than crashing the context on an unrecognised key.
    if (!playbook) return null;
    return { playbook, run: found.data };
  }

  async function beginRun(
    productInstanceId: string,
    playbook: TPlaybook,
    contextId: string | null
  ): Promise<Result<TRun>> {
    const started = await config.startRun(productInstanceId, playbook, contextId);
    if (!started.ok) return err(started.error);
    return ok(started.data);
  }

  return { findResumableRun, beginRun };
}

"use client";

import { createRunLookup } from "@/components/product-shell/companion/runLookup";
import { loadOpenRun, startRun } from "../domain/alongsideData";
import { PLAYBOOK_BY_KEY } from "../playbooks";

/**
 * Alongside's own binding of the shared resume/begin factory. See
 * runLookup.ts for what findResumableRun/beginRun actually do and why
 * beginRun is the only place a run is ever created.
 */
export const { findResumableRun, beginRun } = createRunLookup({
  loadOpenRun,
  startRun,
  playbookByKey: PLAYBOOK_BY_KEY,
  playbookKeyOf: (run) => run.playbookKey,
});

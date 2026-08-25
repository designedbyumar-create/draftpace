"use client";

import { createRunLookup } from "@/components/product-shell/companion/runLookup";
import { loadOpenRun, startRun, type RunRecord } from "../domain/travelData";
import { PLAYBOOK_BY_KEY } from "../playbooks";

/**
 * Travel Companion's own binding of the shared resume/begin factory.
 * See src/components/product-shell/companion/runLookup.ts for what
 * findResumableRun/beginRun actually do; this file only supplies this
 * product's own persistence and library, the same shape Alongside's
 * own binding uses.
 */
export const { findResumableRun, beginRun } = createRunLookup({
  loadOpenRun,
  startRun,
  playbookByKey: PLAYBOOK_BY_KEY,
  playbookKeyOf: (run: RunRecord) => run.playbookKey,
});

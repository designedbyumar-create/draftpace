"use client";

import { ok, err, type Result } from "@/product-framework/result";
import { createHomeItem } from "./homeItems";
import { createMaintenanceTask } from "./maintenanceTasks";
import { createServiceProvider } from "./serviceProviders";
import { createProblem } from "./problems";
import { createMaintenanceLogEntry } from "./maintenanceLog";
import { matchHomeItemType } from "../homeKnowledge";
import type {
  ProblemCandidatePayload,
  PastEventCandidatePayload,
  ThingCandidatePayload,
  CandidatePayload,
  ConfirmationSource,
  ExtractionCandidate,
  MaintenanceTaskCandidatePayload,
  ServiceProviderCandidatePayload,
} from "../import/types";

/**
 * The one bridge from a confirmed candidate to a real canonical record,
 * Home Base's own parallel to PFC's domain/confirmCandidate.ts. Calls the
 * exact same createHomeItem/createMaintenanceTask/createServiceProvider
 * functions the direct sections already use. A record created here is
 * stored in the identical hmc_things/hmc_maintenance_tasks/
 * hmc_service_providers row shape as one typed by hand, differing only in
 * its `source`/`importSessionId` provenance fields. Nothing here writes a
 * record without this function being called from a genuine user
 * confirmation action in the review UI, and every record it creates is
 * status "active": it has already been through human review by the time
 * this runs, so there is no separate "needsReview" holding state for an
 * imported record the person just confirmed.
 */

export interface ConfirmCandidateInput {
  instanceId: string;
  candidate: ExtractionCandidate;
  /** The (possibly user-edited) payload to confirm, defaults to the candidate's own stored payload when the user confirmed without editing. */
  payload?: CandidatePayload;
  importSessionId: string;
  source: ConfirmationSource;
}

export interface ConfirmCandidateResult {
  recordType: string;
  recordId: string;
}

export async function confirmCandidate(input: ConfirmCandidateInput): Promise<Result<ConfirmCandidateResult>> {
  const { instanceId, candidate, importSessionId, source } = input;
  const payload = input.payload ?? candidate.payload;
  const provenance = { source, importSessionId, status: "active" as const, needsReviewReason: null };

  switch (candidate.candidateType) {
    case "thing": {
      const p = payload as ThingCandidatePayload;
      // The matcher rarely knows the type, but the knowledge layer often
      // does from the name alone, and a typed item is one whose care can
      // be proposed. An untyped one is just a row.
      const recognised = p.type ? null : matchHomeItemType(p.name, "");
      const created = await createHomeItem(instanceId, {
        name: p.name,
        type: p.type ?? recognised?.id ?? "other",
        brand: p.brand ?? null,
        model: null,
        location: null,
        purchaseDate: p.purchaseDate ?? null,
        installDate: p.installDate ?? null,
        warrantyExpiresAt: p.warrantyExpiresAt ?? null,
        documentLink: null,
        notes: null,
        ...provenance,
      });
      if (!created.ok) return err(created.error);
      return ok({ recordType: "thing", recordId: created.data.id });
    }
    case "maintenanceTask": {
      const p = payload as MaintenanceTaskCandidatePayload;
      if (p.cadenceDays === undefined) {
        return err({ kind: "validation", message: "How often this repeats must be set before confirming." });
      }
      const created = await createMaintenanceTask(instanceId, {
        applianceId: null,
        name: p.name,
        cadenceDays: p.cadenceDays,
        lastDoneAt: null,
        documentLink: null,
        notes: null,
        ...provenance,
      });
      if (!created.ok) return err(created.error);
      return ok({ recordType: "maintenanceTask", recordId: created.data.id });
    }
    case "serviceProvider": {
      const p = payload as ServiceProviderCandidatePayload;
      const created = await createServiceProvider(instanceId, {
        name: p.name,
        category: null,
        phone: p.phone ?? null,
        email: p.email ?? null,
        lastUsedAt: null,
        notes: null,
        ...provenance,
      });
      if (!created.ok) return err(created.error);
      return ok({ recordType: "serviceProvider", recordId: created.data.id });
    }
    case "problem": {
      const p = payload as ProblemCandidatePayload;
      const created = await createProblem(instanceId, {
        thingId: null,
        providerId: null,
        title: p.title,
        description: null,
        resolutionStatus: "open",
        severity: p.severity,
        effort: "moderate",
        estimatedCostMinorUnits: null,
        actualCostMinorUnits: null,
        scheduledAt: null,
        resolvedAt: null,
        snoozedUntil: null,
        notes: null,
        ...provenance,
      });
      if (!created.ok) return err(created.error);
      return ok({ recordType: "problem", recordId: created.data.id });
    }
    case "pastEvent": {
      const p = payload as PastEventCandidatePayload;
      const created = await createMaintenanceLogEntry(instanceId, {
        taskId: null,
        applianceId: null,
        description: p.description,
        performedAt: p.performedAt,
        providerId: null,
        // Kept as free text rather than inventing a provider record from
        // a name in a paste. The person can attach a real one later.
        performedBy: p.providerName ?? null,
        costMinorUnits: null,
        notes: null,
        ...provenance,
      });
      if (!created.ok) return err(created.error);
      return ok({ recordType: "pastEvent", recordId: created.data.id });
    }
    case "unsupported": {
      // Nothing the person wrote is thrown away. A line nobody could
      // classify becomes a note on the home, carrying their exact words.
      const p = payload as { rawText: string };
      const created = await createHomeItem(instanceId, {
        name: p.rawText.slice(0, 120),
        type: "note",
        brand: null,
        model: null,
        location: null,
        purchaseDate: null,
        installDate: null,
        warrantyExpiresAt: null,
        documentLink: null,
        notes: p.rawText,
        ...provenance,
      });
      if (!created.ok) return err(created.error);
      return ok({ recordType: "note", recordId: created.data.id });
    }
  }
}

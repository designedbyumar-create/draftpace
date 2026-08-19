"use client";

import { ok, err, type Result } from "@/product-framework/result";
import { createAppliance } from "./appliances";
import { createMaintenanceTask } from "./maintenanceTasks";
import { createServiceProvider } from "./serviceProviders";
import type {
  ApplianceCandidatePayload,
  CandidatePayload,
  ConfirmationSource,
  ExtractionCandidate,
  MaintenanceTaskCandidatePayload,
  ServiceProviderCandidatePayload,
} from "../import/types";

/**
 * The one bridge from a confirmed candidate to a real canonical record,
 * Home Base's own parallel to PFC's domain/confirmCandidate.ts. Calls the
 * exact same createAppliance/createMaintenanceTask/createServiceProvider
 * functions the direct sections already use. A record created here is
 * stored in the identical hmc_appliances/hmc_maintenance_tasks/
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
    case "appliance": {
      const p = payload as ApplianceCandidatePayload;
      const created = await createAppliance(instanceId, {
        name: p.name,
        category: p.category ?? "appliance",
        brand: p.brand ?? null,
        model: null,
        purchaseDate: p.purchaseDate ?? null,
        installDate: p.installDate ?? null,
        warrantyExpiresAt: p.warrantyExpiresAt ?? null,
        documentLink: null,
        notes: null,
        ...provenance,
      });
      if (!created.ok) return err(created.error);
      return ok({ recordType: "appliance", recordId: created.data.id });
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
    case "unsupported":
      return err({ kind: "validation", message: "This entry wasn't recognized as a supported record type." });
  }
}

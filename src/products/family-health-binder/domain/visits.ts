"use client";

import { visitSchema, type Visit } from "../state";
import { createRecordRepository } from "./repository";

interface VisitRow {
  id: string;
  family_member_id: string;
  visit_on: string;
  with_whom: string | null;
  reason: string;
  questions: string | null;
  notes: string | null;
  visibility: string;
  status: string;
  created_at: string;
  updated_at: string;
}

function fromRow(row: VisitRow) {
  return {
    id: row.id,
    familyMemberId: row.family_member_id,
    visitOn: row.visit_on,
    withWhom: row.with_whom,
    reason: row.reason,
    questions: row.questions,
    notes: row.notes,
    visibility: row.visibility,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(patch: Record<string, unknown>) {
  const row: Record<string, unknown> = {};
  if ("familyMemberId" in patch) row.family_member_id = patch.familyMemberId;
  if ("visitOn" in patch) row.visit_on = patch.visitOn;
  if ("withWhom" in patch) row.with_whom = patch.withWhom;
  if ("reason" in patch) row.reason = patch.reason;
  if ("questions" in patch) row.questions = patch.questions;
  if ("notes" in patch) row.notes = patch.notes;
  if ("visibility" in patch) row.visibility = patch.visibility;
  if ("status" in patch) row.status = patch.status;
  return row;
}

const repository = createRecordRepository<Visit, VisitRow>({
  table: "fhb_visits",
  schema: visitSchema,
  fromRow,
  toRow,
});

export const listVisits = repository.list;
export const createVisit = repository.create;
export const updateVisit = repository.update;
export const archiveVisit = repository.archive;

"use client";

import { useCallback, useEffect, useState } from "react";
import { describeResultError, type Result } from "@/product-framework/result";
import { findFamilyHealthBinderInstanceId } from "../instanceData";
import { listFamilyMembers } from "../domain/familyMembers";
import { listMedicalFacts } from "../domain/medicalFacts";
import { listSymptomEvents } from "../domain/symptomEvents";
import { listProviders } from "../domain/providers";
import { listImmunizations } from "../domain/immunizations";
import { listVisits } from "../domain/visits";
import type { FamilyMember, Immunization, MedicalFact, Provider, SymptomEvent, Visit } from "../state";

export type LoadStatus = "loading" | "ready" | "no-instance" | "error";

type Keyed = { id: string; status: string };

/** Keep a list in step with one record that changed: replace it, or drop it if it was removed. */
function withRecord<T extends Keyed>(list: T[], record: T): T[] {
  if (record.status === "archived") return list.filter((r) => r.id !== record.id);
  return list.some((r) => r.id === record.id) ? list.map((r) => (r.id === record.id ? record : r)) : [...list, record];
}

/**
 * Loading the whole graph, shared by every screen: every family member and
 * every active record about them, in one load, same reasoning as Vehicle
 * Maintenance Companion's own loading hook. Archived rows never reach a
 * screen: a removed record leaves view here and is not erased.
 */
export function useFamilyHealthBinder() {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [facts, setFacts] = useState<MedicalFact[]>([]);
  const [events, setEvents] = useState<SymptomEvent[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [immunizations, setImmunizations] = useState<Immunization[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);

  const load = useCallback(async () => {
    setStatus("loading");
    setErrorMessage(null);
    const found = await findFamilyHealthBinderInstanceId();
    if (found.status === "error") {
      setErrorMessage(found.message);
      setStatus("error");
      return;
    }
    if (found.status === "not-found") {
      setStatus("no-instance");
      return;
    }
    setInstanceId(found.id);

    const results = await Promise.all([
      listFamilyMembers(found.id),
      listMedicalFacts(found.id),
      listSymptomEvents(found.id),
      listProviders(found.id),
      listImmunizations(found.id),
      listVisits(found.id),
    ]);
    const failed = results.find((r): r is Extract<Result<unknown>, { ok: false }> => !r.ok);
    if (failed) {
      setErrorMessage(describeResultError(failed.error));
      setStatus("error");
      return;
    }
    const [m, f, e, p, i, v] = results as [
      Extract<Result<FamilyMember[]>, { ok: true }>,
      Extract<Result<MedicalFact[]>, { ok: true }>,
      Extract<Result<SymptomEvent[]>, { ok: true }>,
      Extract<Result<Provider[]>, { ok: true }>,
      Extract<Result<Immunization[]>, { ok: true }>,
      Extract<Result<Visit[]>, { ok: true }>,
    ];
    setMembers(m.data.filter((x) => x.status === "active"));
    setFacts(f.data);
    setEvents(e.data);
    setProviders(p.data.filter((x) => x.status === "active"));
    setImmunizations(i.data.filter((x) => x.status === "active"));
    setVisits(v.data.filter((x) => x.status === "active"));
    setStatus("ready");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /** Every setter takes a record that was just saved or removed, so screens never refetch after a write. */
  const saveMember = useCallback((r: FamilyMember) => setMembers((c) => withRecord(c, r)), []);
  const saveFact = useCallback((r: MedicalFact) => setFacts((c) => withRecord(c, r)), []);
  const saveEvent = useCallback((r: SymptomEvent) => setEvents((c) => withRecord(c, r)), []);
  const saveProvider = useCallback((r: Provider) => setProviders((c) => withRecord(c, r)), []);
  const saveImmunization = useCallback((r: Immunization) => setImmunizations((c) => withRecord(c, r)), []);
  const saveVisit = useCallback((r: Visit) => setVisits((c) => withRecord(c, r)), []);

  return {
    status,
    errorMessage,
    setErrorMessage,
    instanceId,
    members,
    facts,
    events,
    providers,
    immunizations,
    visits,
    load,
    saveMember,
    saveFact,
    saveEvent,
    saveProvider,
    saveImmunization,
    saveVisit,
  };
}

export type FamilyHealthBinderData = ReturnType<typeof useFamilyHealthBinder>;

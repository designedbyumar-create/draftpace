"use client";

import { useCallback, useEffect, useState } from "react";
import { describeResultError } from "@/product-framework/result";
import { findFamilyHealthBinderInstanceId } from "../instanceData";
import { listFamilyMembers } from "../domain/familyMembers";
import { listMedicalFacts } from "../domain/medicalFacts";
import { listSymptomEvents } from "../domain/symptomEvents";
import type { FamilyMember, MedicalFact, SymptomEvent } from "../state";

export type LoadStatus = "loading" | "ready" | "no-instance" | "error";

/**
 * Loading the whole graph, shared by Overview, Family, Symptoms and the
 * Intake Summary printable: every family member, every active medical
 * fact and every active symptom event across the account, in one load,
 * same reasoning as Vehicle Maintenance Companion's own loading hook.
 */
export function useFamilyHealthBinder() {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [facts, setFacts] = useState<MedicalFact[]>([]);
  const [events, setEvents] = useState<SymptomEvent[]>([]);

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

    const [membersResult, factsResult, eventsResult] = await Promise.all([
      listFamilyMembers(found.id),
      listMedicalFacts(found.id),
      listSymptomEvents(found.id),
    ]);
    if (!membersResult.ok) {
      setErrorMessage(describeResultError(membersResult.error));
      setStatus("error");
      return;
    }
    if (!factsResult.ok) {
      setErrorMessage(describeResultError(factsResult.error));
      setStatus("error");
      return;
    }
    if (!eventsResult.ok) {
      setErrorMessage(describeResultError(eventsResult.error));
      setStatus("error");
      return;
    }
    setMembers(membersResult.data.filter((m) => m.status === "active"));
    setFacts(factsResult.data);
    setEvents(eventsResult.data);
    setStatus("ready");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addMember = useCallback((created: FamilyMember) => {
    setMembers((current) => [...current, created]);
  }, []);
  const replaceMember = useCallback((updated: FamilyMember) => {
    setMembers((current) => current.map((m) => (m.id === updated.id ? updated : m)));
  }, []);

  const addFact = useCallback((created: MedicalFact) => {
    setFacts((current) => [...current, created]);
  }, []);
  const replaceFact = useCallback((updated: MedicalFact) => {
    setFacts((current) => current.map((f) => (f.id === updated.id ? updated : f)));
  }, []);

  const addEvent = useCallback((created: SymptomEvent) => {
    setEvents((current) => [created, ...current]);
  }, []);
  const replaceEvent = useCallback((updated: SymptomEvent) => {
    setEvents((current) => current.map((e) => (e.id === updated.id ? updated : e)));
  }, []);

  return {
    status,
    errorMessage,
    setErrorMessage,
    instanceId,
    members,
    facts,
    events,
    load,
    addMember,
    replaceMember,
    addFact,
    replaceFact,
    addEvent,
    replaceEvent,
  };
}

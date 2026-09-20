"use client";

import { useCallback, useEffect, useState } from "react";
import { describeResultError } from "@/product-framework/result";
import { findVehicleMaintenanceInstanceId } from "../instanceData";
import { listVehicles } from "../domain/vehicles";
import { listMaintenanceItems } from "../domain/maintenanceItems";
import { listServiceEvents } from "../domain/serviceEvents";
import { listRenewals } from "../domain/renewals";
import type { MaintenanceItem, Renewal, ServiceEvent, Vehicle } from "../state";

export type LoadStatus = "loading" | "ready" | "no-instance" | "error";

/**
 * Loading the whole graph, shared by Due, Vehicles and the Boundary
 * printable: every vehicle and every active maintenance item across all
 * of them, since the due view (proposal: "a single ranked what's due
 * view") is computed across the whole account at once, not per vehicle.
 */
export function useVehicleMaintenance() {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  // Closed vehicles stay readable so the record of a car that was sold can still be seen and printed.
  const [closedVehicles, setClosedVehicles] = useState<Vehicle[]>([]);
  const [items, setItems] = useState<MaintenanceItem[]>([]);
  const [events, setEvents] = useState<ServiceEvent[]>([]);
  const [renewals, setRenewals] = useState<Renewal[]>([]);
  // False when these could not be read, for example before their tables exist: Due and Vehicles keep working without them.
  const [historyAvailable, setHistoryAvailable] = useState(true);
  const [renewalsAvailable, setRenewalsAvailable] = useState(true);

  const load = useCallback(async () => {
    setStatus("loading");
    setErrorMessage(null);
    const found = await findVehicleMaintenanceInstanceId();
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

    const [vehiclesResult, itemsResult, eventsResult, renewalsResult] = await Promise.all([
      listVehicles(found.id),
      listMaintenanceItems(found.id),
      listServiceEvents(found.id),
      listRenewals(found.id),
    ]);
    if (!vehiclesResult.ok) {
      setErrorMessage(describeResultError(vehiclesResult.error));
      setStatus("error");
      return;
    }
    if (!itemsResult.ok) {
      setErrorMessage(describeResultError(itemsResult.error));
      setStatus("error");
      return;
    }
    setVehicles(vehiclesResult.data.filter((v) => v.status === "active"));
    setClosedVehicles(vehiclesResult.data.filter((v) => v.status === "archived"));
    setItems(itemsResult.data);
    setHistoryAvailable(eventsResult.ok);
    setEvents(eventsResult.ok ? eventsResult.data : []);
    setRenewalsAvailable(renewalsResult.ok);
    setRenewals(renewalsResult.ok ? renewalsResult.data : []);
    setStatus("ready");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addVehicle = useCallback((created: Vehicle) => {
    setVehicles((current) => [...current, created]);
  }, []);
  const replaceVehicle = useCallback((updated: Vehicle) => {
    setVehicles((current) => current.map((v) => (v.id === updated.id ? updated : v)));
  }, []);

  const addItem = useCallback((created: MaintenanceItem) => {
    setItems((current) => [...current, created]);
  }, []);
  const replaceItem = useCallback((updated: MaintenanceItem) => {
    setItems((current) => current.map((i) => (i.id === updated.id ? updated : i)));
  }, []);

  const addEvent = useCallback((created: ServiceEvent) => {
    setEvents((current) => [created, ...current]);
  }, []);
  /** A replaced event that is now set aside leaves the list; anything else takes its old place. */
  const replaceEvent = useCallback((updated: ServiceEvent) => {
    setEvents((current) => (updated.status === "archived" ? current.filter((e) => e.id !== updated.id) : current.map((e) => (e.id === updated.id ? updated : e))));
  }, []);
  const removeItem = useCallback((id: string) => {
    setItems((current) => current.filter((i) => i.id !== id));
  }, []);
  /** Closing moves a vehicle out of the active list, into the closed one. */
  const removeVehicle = useCallback((closing: Vehicle) => {
    setVehicles((current) => current.filter((v) => v.id !== closing.id));
    setClosedVehicles((closed) => (closed.some((v) => v.id === closing.id) ? closed : [...closed, { ...closing, status: "archived" }]));
  }, []);

  const addRenewal = useCallback((created: Renewal) => {
    setRenewals((current) => [...current, created]);
  }, []);
  const replaceRenewal = useCallback((updated: Renewal) => {
    setRenewals((current) => (updated.status === "archived" ? current.filter((r) => r.id !== updated.id) : current.map((r) => (r.id === updated.id ? updated : r))));
  }, []);

  return {
    status,
    errorMessage,
    setErrorMessage,
    instanceId,
    vehicles,
    closedVehicles,
    items,
    events,
    renewals,
    historyAvailable,
    renewalsAvailable,
    load,
    addVehicle,
    replaceVehicle,
    addItem,
    replaceItem,
    removeItem,
    removeVehicle,
    addEvent,
    replaceEvent,
    addRenewal,
    replaceRenewal,
  };
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { describeResultError } from "@/product-framework/result";
import { findVehicleMaintenanceInstanceId } from "../instanceData";
import { listVehicles } from "../domain/vehicles";
import { listMaintenanceItems } from "../domain/maintenanceItems";
import type { MaintenanceItem, Vehicle } from "../state";

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
  const [items, setItems] = useState<MaintenanceItem[]>([]);

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

    const [vehiclesResult, itemsResult] = await Promise.all([listVehicles(found.id), listMaintenanceItems(found.id)]);
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
    setItems(itemsResult.data);
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

  return {
    status,
    errorMessage,
    setErrorMessage,
    instanceId,
    vehicles,
    items,
    load,
    addVehicle,
    replaceVehicle,
    addItem,
    replaceItem,
  };
}

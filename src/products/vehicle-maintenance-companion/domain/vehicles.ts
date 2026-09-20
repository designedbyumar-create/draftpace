"use client";

import { vehicleSchema, type Vehicle } from "../state";
import { createRecordRepository } from "./repository";

interface VehicleRow {
  id: string;
  label: string;
  year: number | null;
  make: string | null;
  model: string | null;
  current_mileage: number | null;
  mileage_updated_at: string | null;
  history_known: boolean;
  fuel_type: string | null;
  hard_use: boolean;
  plate: string | null;
  vin: string | null;
  tyre_size: string | null;
  oil_spec: string | null;
  insurer: string | null;
  policy_number: string | null;
  roadside_phone: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

function fromRow(row: VehicleRow) {
  return {
    id: row.id,
    label: row.label,
    year: row.year,
    make: row.make,
    model: row.model,
    currentMileage: row.current_mileage,
    mileageUpdatedAt: row.mileage_updated_at,
    historyKnown: row.history_known,
    fuelType: row.fuel_type ?? null,
    hardUse: row.hard_use ?? false,
    plate: row.plate ?? null,
    vin: row.vin ?? null,
    tyreSize: row.tyre_size ?? null,
    oilSpec: row.oil_spec ?? null,
    insurer: row.insurer ?? null,
    policyNumber: row.policy_number ?? null,
    roadsidePhone: row.roadside_phone ?? null,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(patch: Record<string, unknown>) {
  const row: Record<string, unknown> = {};
  if ("label" in patch) row.label = patch.label;
  if ("year" in patch) row.year = patch.year;
  if ("make" in patch) row.make = patch.make;
  if ("model" in patch) row.model = patch.model;
  if ("currentMileage" in patch) row.current_mileage = patch.currentMileage;
  if ("mileageUpdatedAt" in patch) row.mileage_updated_at = patch.mileageUpdatedAt;
  if ("historyKnown" in patch) row.history_known = patch.historyKnown;
  if ("fuelType" in patch) row.fuel_type = patch.fuelType;
  if ("hardUse" in patch) row.hard_use = patch.hardUse;
  if ("plate" in patch) row.plate = patch.plate;
  if ("vin" in patch) row.vin = patch.vin;
  if ("tyreSize" in patch) row.tyre_size = patch.tyreSize;
  if ("oilSpec" in patch) row.oil_spec = patch.oilSpec;
  if ("insurer" in patch) row.insurer = patch.insurer;
  if ("policyNumber" in patch) row.policy_number = patch.policyNumber;
  if ("roadsidePhone" in patch) row.roadside_phone = patch.roadsidePhone;
  if ("status" in patch) row.status = patch.status;
  return row;
}

const repository = createRecordRepository<Vehicle, VehicleRow>({
  table: "vmc_vehicles",
  schema: vehicleSchema,
  fromRow,
  toRow,
});

export const listVehicles = repository.list;
export const createVehicle = repository.create;
export const updateVehicle = repository.update;
export const archiveVehicle = repository.archive;

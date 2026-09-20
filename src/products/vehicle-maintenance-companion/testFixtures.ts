import type { MaintenanceItem, Renewal, ServiceEvent, Vehicle } from "./state";

/** Builders for tests. Every field has a plain default so a test only names what it is about. */
export const vehicle = (over: Partial<Vehicle> = {}): Vehicle => ({
  id: "v1",
  label: "Civic",
  year: 2018,
  make: "Honda",
  model: "Civic",
  currentMileage: 50_000,
  mileageUpdatedAt: "2026-09-01",
  historyKnown: true,
  fuelType: null,
  hardUse: false,
  plate: null,
  vin: null,
  tyreSize: null,
  oilSpec: null,
  insurer: null,
  policyNumber: null,
  roadsidePhone: null,
  status: "active",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  ...over,
});

export const item = (over: Partial<MaintenanceItem> = {}): MaintenanceItem => ({
  id: "i1",
  vehicleId: "v1",
  templateId: "oil-change",
  taskName: "Engine oil and filter change",
  intervalMiles: 5000,
  intervalMonths: 6,
  severeDuty: false,
  lastDoneAt: "2026-03-01",
  lastDoneMileage: 45_000,
  status: "active",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  ...over,
});

export const event = (over: Partial<ServiceEvent> = {}): ServiceEvent => ({
  id: "e1",
  vehicleId: "v1",
  itemId: "i1",
  taskName: "Engine oil and filter change",
  doneOn: "2026-03-01",
  mileage: 45_000,
  shop: null,
  costMinorUnits: null,
  note: null,
  status: "active",
  createdAt: "2026-03-01T10:00:00Z",
  updatedAt: "2026-03-01T10:00:00Z",
  ...over,
});

export const renewal = (over: Partial<Renewal> = {}): Renewal => ({
  id: "r1",
  vehicleId: "v1",
  kind: "registration",
  label: null,
  dueOn: "2026-10-15",
  whereKept: null,
  note: null,
  status: "active",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  ...over,
});

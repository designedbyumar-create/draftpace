import type { PrintablePalette } from "@/design-system/PrintableDocument";
import { vehicleMaintenanceCompanionDefinition as definition } from "../definition";

const accent = definition.theme?.accentScale?.base;
if (!accent) throw new Error("Vehicle Maintenance Companion must declare its accent scale.");

/** Every document this product prints, in this product's own accent, taken from its definition so a re-theme reaches the paper too. */
export const PALETTE: PrintablePalette = {
  accent,
  ink: "#211f1a",
  muted: "#6f6c62",
  line: "#e2e0d8",
  paper: "#ffffff",
};

export function vehicleIdentityLine(vehicle: { label: string; year: number | null; make: string | null; model: string | null }): string {
  const parts = [vehicle.year, vehicle.make, vehicle.model].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : vehicle.label;
}

export async function saveBlob(blob: Blob, filename: string): Promise<void> {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

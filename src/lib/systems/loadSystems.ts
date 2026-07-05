import budgetSystemPack from "../../../content/systems/money-momentum-budget-system/system.json";
import savingsChallengePack from "../../../content/systems/money-momentum-savings-challenge/system.json";
import { validateSystemPack } from "@/lib/systems/validateSystem";
import { SystemBlueprint, SystemCategory } from "@/lib/systems/types";

const rawSystemPacks = [savingsChallengePack, budgetSystemPack];

export const systemBlueprints: SystemBlueprint[] = rawSystemPacks
  .map((pack) => validateSystemPack(pack))
  .sort((a, b) => (a.storeCard.sortOrder || 100) - (b.storeCard.sortOrder || 100));

export const systems = systemBlueprints;

export function getSystem(idOrSlug: string) {
  return systemBlueprints.find((system) => system.id === idOrSlug || system.slug === idOrSlug);
}

export function formatSystemPrice(system: Pick<SystemBlueprint, "access" | "priceCents">) {
  if (system.access === "free") return "Free";
  if (system.access === "membership") return "Membership";
  return `$${(system.priceCents / 100).toFixed(0)}`;
}

export function getStoreSystems(category?: SystemCategory | "all") {
  return systemBlueprints.filter((system) => {
    const publicStatus = system.status === "active" || system.status === "coming_soon";
    const publicVisibility = system.visibility === "public";
    const matchesCategory = !category || category === "all" || system.category === category;
    return publicStatus && publicVisibility && matchesCategory;
  });
}

export function getDashboardSystems(category?: SystemCategory | "all") {
  return systemBlueprints.filter((system) => {
    const dashboardStatus =
      system.status === "active" ||
      system.status === "coming_soon" ||
      (system.status === "archived" && system.ownedStatus === "owned");
    const dashboardVisibility = system.visibility === "public" || system.visibility === "unlisted";
    const matchesCategory = !category || category === "all" || system.category === category;
    return dashboardStatus && dashboardVisibility && matchesCategory;
  });
}

export function getActiveSystems() {
  return systemBlueprints.filter((system) => system.status === "active");
}

export function getComingSoonSystems() {
  return systemBlueprints.filter((system) => system.status === "coming_soon");
}

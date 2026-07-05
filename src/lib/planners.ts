import {
  DraftpaceSystem,
  SystemAccess,
  SystemAssets,
  SystemCategory,
  SystemDashboardCard,
  SystemStatus,
  SystemStoreCard,
  SystemVisibility,
  formatSystemPrice,
  getDashboardSystems,
  getSystem,
  systemCategories,
} from "@/lib/systems";

export type PlannerCategory = SystemCategory;
export type PlannerAccess = SystemAccess;
export type PlannerBlockType =
  | "text"
  | "textarea"
  | "checkbox"
  | "number"
  | "rating"
  | "select"
  | "milestone";

export type PlannerBlock = {
  id: string;
  type: PlannerBlockType;
  label: string;
  helper?: string;
  placeholder?: string;
  options?: string[];
  min?: number;
  max?: number;
  unit?: string;
};

export type PlannerSection = {
  id: string;
  title: string;
  eyebrow?: string;
  description?: string;
  blocks: PlannerBlock[];
};

export type Planner = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  category: PlannerCategory;
  access: PlannerAccess;
  status: SystemStatus;
  visibility: SystemVisibility;
  prototypeUnlocked?: boolean;
  priceCents: number;
  duration: string;
  accent: string;
  estimatedMinutes: number;
  storeCard: SystemStoreCard;
  dashboardCard: SystemDashboardCard;
  assets: SystemAssets;
  sections: PlannerSection[];
};

export const categoryLabels = systemCategories.reduce(
  (labels, category) => ({ ...labels, [category.id]: category.label }),
  {} as Record<PlannerCategory, string>
);

function systemToPlanner(system: DraftpaceSystem): Planner {
  return {
    id: system.id,
    slug: system.slug,
    title: system.name,
    subtitle: system.promise,
    description: system.description,
    category: system.category,
    access: system.access,
    status: system.status,
    visibility: system.visibility,
    prototypeUnlocked: system.prototypeUnlocked,
    priceCents: system.priceCents,
    duration: system.duration,
    accent: system.visualTheme.accent,
    estimatedMinutes: system.estimatedMinutes,
    storeCard: system.storeCard,
    dashboardCard: system.dashboardCard,
    assets: system.assets,
    sections: [],
  };
}

export const planners: Planner[] = getDashboardSystems().map(systemToPlanner);

export function getPlanner(idOrSlug: string) {
  const system = getSystem(idOrSlug);
  return system ? systemToPlanner(system) : undefined;
}

export function formatPlannerPrice(planner: Pick<Planner, "access" | "priceCents">) {
  return formatSystemPrice(planner);
}

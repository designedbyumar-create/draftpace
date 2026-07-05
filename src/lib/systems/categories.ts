import { SystemCategory } from "@/lib/systems/types";

export type SystemCategoryDefinition = {
  id: SystemCategory;
  label: string;
  shortLabel: string;
  description: string;
  accent: string;
};

export const systemCategories: SystemCategoryDefinition[] = [
  {
    id: "money",
    label: "Money",
    shortLabel: "Money",
    description: "Budgeting, saving, spending, and financial momentum.",
    accent: "#0d9488",
  },
  {
    id: "productivity",
    label: "Productivity",
    shortLabel: "Productivity",
    description: "Planning, prioritization, execution, and weekly operating rhythms.",
    accent: "#3730a3",
  },
  {
    id: "focus",
    label: "Focus",
    shortLabel: "Focus",
    description: "Attention, ADHD support, deep work, and task initiation.",
    accent: "#7c3aed",
  },
  {
    id: "health",
    label: "Health",
    shortLabel: "Health",
    description: "Energy, routines, recovery, movement, and wellbeing resets.",
    accent: "#059669",
  },
  {
    id: "habits",
    label: "Habits",
    shortLabel: "Habits",
    description: "Repeatable behaviors, streaks, rituals, and identity-level consistency.",
    accent: "#f97316",
  },
  {
    id: "learning",
    label: "Learning",
    shortLabel: "Learning",
    description: "Study systems, skill building, reading, and knowledge capture.",
    accent: "#2563eb",
  },
  {
    id: "lifestyle",
    label: "Lifestyle",
    shortLabel: "Lifestyle",
    description: "Home, routines, self-management, and personal life organization.",
    accent: "#be185d",
  },
];

export const systemCategoryIds = systemCategories.map((category) => category.id);

export function getSystemCategory(categoryId: SystemCategory) {
  return systemCategories.find((category) => category.id === categoryId);
}

export function isSystemCategory(value: unknown): value is SystemCategory {
  return typeof value === "string" && systemCategoryIds.includes(value as SystemCategory);
}

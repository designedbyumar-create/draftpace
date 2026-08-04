import { notFound } from "next/navigation";
import { productRegistry } from "@/product-framework/registry";
import { registerDevFixtures } from "@/product-framework/fixtures";
import { registerMonthlyMoneyReset } from "@/products/monthly-money-reset/register";
import { resolveWorkspaceLabel } from "@/product-framework/navigationResolver";
import { resolveProductModule } from "@/product-framework/moduleRegistry";
import {
  type DraftpaceIcon,
  Compass,
  GraduationCap,
  ListChecks,
  Settings,
  Target,
  Wrench,
} from "@/design-system/Icon";

const WORKSPACE_FRAMING: Record<string, { icon: DraftpaceIcon; body: string }> = {
  companion: {
    icon: Target,
    body: "The Companion's next action would render here — one dominant action tied to where the user actually is, with a plain-language reason why it's next.",
  },
  learning: {
    icon: GraduationCap,
    body: "The current lesson or activity would render here — content, progress within the lesson, and the path to the next one.",
  },
  automation: {
    icon: Settings,
    body: "The automation builder and current run state would render here — triggers, conditions, actions, and live/last-run status.",
  },
  workspace: {
    icon: Wrench,
    body: "The structured input, live calculation, and output would render here — the tool's actual working surface.",
  },
  "guided-program": {
    icon: ListChecks,
    body: "The current stage's task would render here — one guided step at a time, with reflection where the program calls for it.",
  },
  tracker: {
    icon: Compass,
    body: "Today's entry point would render here — the fastest path to logging what this tracker follows.",
  },
};

export default async function ProductWorkspacePage({
  params,
}: {
  params: Promise<{ productSlug: string }>;
}) {
  // Idempotent, cheap — called here directly rather than assumed to have
  // already run via the outer /app layout, so this segment's own module
  // resolution can never see an under-registered registry.
  registerDevFixtures();
  registerMonthlyMoneyReset();

  const { productSlug } = await params;
  const definition = productRegistry.getBySlug(productSlug);
  if (!definition) notFound();

  const Module = resolveProductModule(definition, "workspace");
  if (Module) return <Module definition={definition} />;

  const framing = WORKSPACE_FRAMING[definition.family] ?? WORKSPACE_FRAMING.workspace;
  const Icon = framing.icon;

  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">
        {resolveWorkspaceLabel(definition)}
      </p>
      <h2 className="mt-2 text-lg font-semibold text-[var(--text)]">The live surface</h2>

      <div className="mt-6 flex flex-col items-start gap-4 rounded-xl border border-[var(--border)] p-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
          <Icon size={19} aria-hidden />
        </div>
        <p className="text-[14px] leading-relaxed text-[var(--text)]">{framing.body}</p>
      </div>

      {definition.devFixture && (
        <p className="mt-5 text-[12px] leading-5 text-[var(--faint)]">
          Internal fixture — this is a structural description, not a working {resolveWorkspaceLabel(definition).toLowerCase()}
          {" "}surface. Real per-family workspace modules are Phase 3+ work (docs/PRODUCT-FRAMEWORK.md).
        </p>
      )}
    </div>
  );
}

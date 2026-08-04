import { notFound } from "next/navigation";
import { productRegistry } from "@/product-framework/registry";
import { registerDevFixtures } from "@/product-framework/fixtures";
import { registerMonthlyMoneyReset } from "@/products/monthly-money-reset/register";
import { resolveProductModule } from "@/product-framework/moduleRegistry";
import Surface from "@/design-system/Surface";
import SettingsRow from "@/components/platform/SettingsRow";
import Badge from "@/design-system/Badge";

export default async function ProductSettingsPage({
  params,
}: {
  params: Promise<{ productSlug: string }>;
}) {
  registerDevFixtures();
  registerMonthlyMoneyReset();

  const { productSlug } = await params;
  const definition = productRegistry.getBySlug(productSlug);
  if (!definition) notFound();

  const Module = resolveProductModule(definition, "settings");
  if (Module) return <Module definition={definition} />;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">Settings</p>
        <h2 className="mt-2 text-lg font-semibold text-[var(--text)]">Configuration scoped to this product only</h2>
      </div>

      <Surface padded={false}>
        <div className="divide-y divide-[var(--border)] px-5">
          <SettingsRow
            label="Configuration"
            description={
              definition.settingsSections.length > 0
                ? definition.settingsSections.join(", ")
                : "No product-specific settings sections declared."
            }
            unavailable
          />
          <SettingsRow label="Notifications" description="Reminders for this product only.">
            <Badge tone={definition.notifications.supported ? "success" : "neutral"}>
              {definition.notifications.supported ? "Supported" : "Not supported"}
            </Badge>
          </SettingsRow>
          <SettingsRow label="Permissions" description={definition.permissions.join(", ") || "None declared."} />
          <SettingsRow label="Integrations" unavailable />
          <SettingsRow label="Offline behavior">
            <Badge tone="neutral">{definition.offline.replace("-", " ")}</Badge>
          </SettingsRow>
          <SettingsRow
            label="Version"
            description={`v${definition.version} · ${definition.migrationPolicy.compatibility.replace(/-/g, " ")}`}
          />
          <SettingsRow label="Archive, reset, or delete this product" unavailable />
        </div>
      </Surface>
    </div>
  );
}

import AdminShell from "@/components/admin/AdminShell";
import Surface from "@/design-system/Surface";
import Badge from "@/design-system/Badge";
import { familyRegistry } from "@/product-framework/families";

export default function AdminProductFamiliesPage() {
  const families = familyRegistry.list();

  return (
    <AdminShell title="Product families">
      <p className="mb-4 text-[12px] text-[var(--muted)]">
        The registered family definitions — data, not code branches (docs/PRODUCT-FRAMEWORK.md). Adding a new family
        means registering one here, not editing the shell.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {families.map((family) => (
          <Surface key={family.id}>
            <div className="flex items-center justify-between gap-2">
              <p className="text-[13px] font-semibold text-[var(--text)]">{family.label}</p>
              <Badge tone="neutral">{family.progressModelKind}</Badge>
            </div>
            <p className="mt-1.5 text-[12px] leading-5 text-[var(--muted)]">{family.description}</p>
            <p className="mt-3 text-[11px] text-[var(--faint)]">
              {family.supportedCapabilities.length} known capabilities · default nav: {family.defaultNavigation.join(", ")}
            </p>
          </Surface>
        ))}
      </div>
    </AdminShell>
  );
}

import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import Surface from "@/design-system/Surface";
import Badge from "@/design-system/Badge";
import { productRegistry } from "@/product-framework/registry";
import { familyRegistry } from "@/product-framework/families";
import { isAdminEnabled, areDevFixturesEnabled } from "@/product-framework/environment";

const SECTIONS = [
  { href: "/admin/products", label: "Products", status: "real" as const },
  { href: "/admin/product-families", label: "Product families", status: "real" as const },
  { href: "/admin/customers", label: "Customers", status: "planned" as const },
  { href: "/admin/entitlements", label: "Entitlements", status: "planned" as const },
  { href: "/admin/commerce", label: "Commerce events", status: "planned" as const },
  { href: "/admin/communications", label: "Communications", status: "planned" as const },
  { href: "/admin/support", label: "Support", status: "planned" as const },
  { href: "/admin/analytics", label: "Analytics", status: "planned" as const },
  { href: "/admin/operations", label: "Operations", status: "real" as const },
  { href: "/admin/audit", label: "Audit history", status: "planned" as const },
];

/**
 * Architecture scaffolding, not a finished admin product — see
 * docs/ADMIN-AND-OPERATIONS.md. Every section below is a real, protected,
 * noindex route; only Products, Product families, and Operations read real
 * data. The rest are honest "not built yet" states, not fabricated data.
 */
export default function AdminOverviewPage() {
  const productCount = productRegistry.list().length;
  const familyCount = familyRegistry.list().length;

  return (
    <AdminShell title="Overview">
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Surface>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">Registered products</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--text)]">{productCount}</p>
        </Surface>
        <Surface>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">Product families</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--text)]">{familyCount}</p>
        </Surface>
        <Surface>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">Environment</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge tone={isAdminEnabled() ? "success" : "neutral"}>Admin {isAdminEnabled() ? "on" : "off"}</Badge>
            <Badge tone={areDevFixturesEnabled() ? "success" : "neutral"}>Fixtures {areDevFixturesEnabled() ? "on" : "off"}</Badge>
          </div>
        </Surface>
      </div>

      <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--faint)]">All sections</h2>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] px-4 py-3 transition-colors hover:border-[var(--border-strong)]"
          >
            <span className="text-[13px] font-semibold text-[var(--text)]">{section.label}</span>
            <Badge tone={section.status === "real" ? "success" : "neutral"}>
              {section.status === "real" ? "Live data" : "Not built"}
            </Badge>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}

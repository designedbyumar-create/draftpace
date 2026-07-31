import AdminShell from "@/components/admin/AdminShell";
import EmptyState from "@/design-system/EmptyState";
import Badge from "@/design-system/Badge";
import { Article } from "@/design-system/Icon";
import { productRegistry } from "@/product-framework/registry";
import { familyRegistry } from "@/product-framework/families";

export default function AdminProductsPage() {
  const products = productRegistry.list();

  return (
    <AdminShell title="Products">
      <p className="mb-4 text-[12px] text-[var(--muted)]">
        Reads directly from the product registry — the same source of truth the customer platform uses. No separate
        admin data store exists (or should exist) for this.
      </p>

      {products.length === 0 ? (
        <EmptyState
          icon={Article}
          title="No products registered"
          description="Nothing is registered in this environment. Enable development fixtures locally to see the registry populated."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-[var(--border)]">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[var(--surface-muted)] text-[11px] uppercase tracking-wide text-[var(--faint)]">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Title</th>
                <th className="px-4 py-2.5 font-semibold">Family</th>
                <th className="px-4 py-2.5 font-semibold">Version</th>
                <th className="px-4 py-2.5 font-semibold">Access</th>
                <th className="px-4 py-2.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {products.map((product) => (
                <tr key={product.slug}>
                  <td className="px-4 py-2.5">
                    <p className="font-semibold text-[var(--text)]">{product.title}</p>
                    <p className="text-[11px] text-[var(--faint)]">{product.slug}</p>
                  </td>
                  <td className="px-4 py-2.5 text-[var(--muted)]">{familyRegistry.get(product.family)?.label ?? product.family}</td>
                  <td className="px-4 py-2.5 text-[var(--muted)]">{product.version}</td>
                  <td className="px-4 py-2.5 text-[var(--muted)]">{product.access.model}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-1.5">
                      <Badge tone={product.status === "active" ? "success" : "neutral"}>{product.status.replace("_", " ")}</Badge>
                      {product.devFixture && <Badge tone="neutral">Fixture</Badge>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}

const ADMIN_PRODUCTS = [
  {
    name: "Product Studio",
    owns: "Create, preview, version, and publish product definitions.",
  },
  {
    name: "Operations Console",
    owns: "Customers, entitlements, activation support, and notification operations.",
  },
  {
    name: "Analytics Workspace",
    owns: "Activation, first value, retention, completion, and product health.",
  },
  {
    name: "Technical Operations",
    owns: "Jobs, webhooks, errors, migrations, flags, and audit log.",
  },
];

/**
 * Static architecture overview only — no data, no actions. See
 * docs/ADMIN-AND-OPERATIONS.md for what's intentionally not built yet.
 */
export default function AdminOverviewPage() {
  return (
    <main className="min-h-screen bg-[var(--app-bg)] px-4 py-10 text-[var(--text)] sm:px-8">
      <div className="mx-auto max-w-2xl">
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--faint)]">
          Internal — architecture scaffolding
        </p>
        <h1 className="mt-2 text-2xl font-black tracking-tight">Admin</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          This route exists to prove the boundary (protected, noindex, unavailable in ordinary
          production configuration) before there is anything sensitive behind it. No admin product
          is implemented yet.
        </p>

        <div className="mt-8 grid gap-3">
          {ADMIN_PRODUCTS.map((product) => (
            <div key={product.name} className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="text-sm font-black text-[var(--text)]">{product.name}</p>
              <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{product.owns}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

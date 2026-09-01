import AdminShell from "@/components/admin/AdminShell";
import Surface from "@/design-system/Surface";
import Badge from "@/design-system/Badge";
import EmptyState from "@/design-system/EmptyState";
import { Landmark } from "@/design-system/Icon";
import { isAdminEnabled, areDevFixturesEnabled } from "@/product-framework/environment";

export default function AdminOperationsPage() {
  const flags = [
    { name: "Admin preview", value: isAdminEnabled(), source: "isAdminEnabled() — NODE_ENV or DRAFTPACE_ADMIN_PREVIEW" },
    { name: "Development fixtures", value: areDevFixturesEnabled(), source: "areDevFixturesEnabled() — NODE_ENV or NEXT_PUBLIC_DEV_FIXTURES" },
  ];

  return (
    <AdminShell title="Operations">
      <section>
        <h2 className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--faint)]">
          Feature flags — live, not simulated
        </h2>
        <Surface padded={false}>
          <div className="divide-y divide-[var(--border)] px-5">
            {flags.map((flag) => (
              <div key={flag.name} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="text-[13px] font-semibold text-[var(--text)]">{flag.name}</p>
                  <p className="mt-0.5 text-[11px] text-[var(--faint)]">{flag.source}</p>
                </div>
                <Badge tone={flag.value ? "success" : "neutral"}>{flag.value ? "Enabled" : "Disabled"}</Badge>
              </div>
            ))}
          </div>
        </Surface>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--faint)]">Jobs and webhooks</h2>
        <EmptyState
          icon={Landmark}
          title="No background jobs exist yet"
          description="Webhook ingestion, notification sends, and scheduled jobs will show queue depth and failure state here once they exist."
        />
      </section>
    </AdminShell>
  );
}

import AdminShell from "@/components/admin/AdminShell";
import EmptyState from "@/design-system/EmptyState";
import Badge from "@/design-system/Badge";
import { LifeBuoy, WarningCircle } from "@/design-system/Icon";
import { listAllSupportReports } from "@/product-framework/adminSupportReports";
import { SUPPORT_CATEGORIES } from "@/product-framework/supportCategories";
import { formatRelativeTime } from "@/lib/formatRelativeTime";

const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  SUPPORT_CATEGORIES.map((c) => [c.value, c.label])
);

/**
 * The real, service-role list of every report a customer has submitted
 * from the Support page (public.support_reports — see its migration).
 * Read-only: there is no admin role yet, so nothing here can be resolved
 * or reassigned, only seen. That matches what was actually asked for —
 * a place to see that a report landed, not a case-management tool.
 */
export default async function AdminSupportPage() {
  const result = await listAllSupportReports();

  return (
    <AdminShell title="Support">
      <p className="mb-4 text-caption text-[var(--muted)]">
        Every report submitted from the Support page's &quot;Report an issue&quot; form, read directly with the
        service-role client — there is no separate admin inbox this is copied into.
      </p>

      {result.status === "not-configured" ? (
        <EmptyState
          icon={WarningCircle}
          title="SUPABASE_SERVICE_ROLE_KEY is not set"
          description="This admin view reads across every user's reports, which needs the service-role client. Set SUPABASE_SERVICE_ROLE_KEY in this environment to see them here."
        />
      ) : result.status === "error" ? (
        <EmptyState icon={WarningCircle} title="Couldn't load reports" description={result.message} />
      ) : result.rows.length === 0 ? (
        <EmptyState
          icon={LifeBuoy}
          title="No reports yet"
          description="When someone submits the Support page's form, it shows up here, newest first."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-[var(--border)]">
          <table className="w-full text-left text-body-sm">
            <thead className="bg-[var(--surface-muted)] text-eyebrow uppercase text-[var(--faint)]">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Reported by</th>
                <th className="px-4 py-2.5 font-semibold">Category</th>
                <th className="px-4 py-2.5 font-semibold">Message</th>
                <th className="px-4 py-2.5 font-semibold">Page</th>
                <th className="px-4 py-2.5 font-semibold">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {result.rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-2.5 text-[var(--text)]">{row.email}</td>
                  <td className="px-4 py-2.5">
                    <Badge tone="neutral">{CATEGORY_LABEL[row.category] ?? row.category}</Badge>
                  </td>
                  <td className="max-w-md px-4 py-2.5 text-[var(--muted)]">{row.message}</td>
                  <td className="px-4 py-2.5 font-mono text-caption text-[var(--faint)]">{row.pageUrl ?? "—"}</td>
                  <td className="px-4 py-2.5 text-[var(--faint)]">{formatRelativeTime(row.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}

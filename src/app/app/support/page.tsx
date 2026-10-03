"use client";

import { useEffect, useState } from "react";
import PlatformShell from "@/design-system/shell/PlatformShell";
import { useSession } from "@/design-system/shell/SessionProvider";
import Surface from "@/design-system/Surface";
import Button from "@/design-system/Button";
import Select from "@/design-system/Select";
import Textarea from "@/design-system/Textarea";
import EmptyState from "@/design-system/EmptyState";
import { SkeletonRow } from "@/design-system/Skeleton";
import { ArrowRight, Check, Lock, MessageCircle, Shield, WarningCircle, Wrench } from "@/design-system/Icon";
import { listMySupportReports, submitSupportReport, type SupportReportRow } from "@/product-framework/supportReports";
import { SUPPORT_CATEGORIES, type SupportCategory } from "@/product-framework/supportCategories";
import { formatRelativeTime } from "@/lib/formatRelativeTime";

const ENTRIES: { icon: typeof Lock; title: string; body: string; category: SupportCategory }[] = [
  {
    icon: Lock,
    title: "Account and access",
    body: "Trouble signing in, resetting a password, or an unfamiliar sign-in.",
    category: "account",
  },
  {
    icon: Wrench,
    title: "Product access",
    body: "A product you own isn't showing up, or looks wrong.",
    category: "product",
  },
  {
    icon: MessageCircle,
    title: "Technical issue",
    body: "Something is broken, slow, or behaving unexpectedly.",
    category: "technical",
  },
  {
    icon: Shield,
    title: "Privacy or data request",
    body: "Ask about your data, or request an export or deletion.",
    category: "privacy",
  },
];

const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(SUPPORT_CATEGORIES.map((c) => [c.value, c.label]));

export default function SupportPage() {
  const user = useSession();
  const [category, setCategory] = useState<SupportCategory>("account");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [justSubmitted, setJustSubmitted] = useState(false);

  const [reports, setReports] = useState<SupportReportRow[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    listMySupportReports().then((result) => {
      if (cancelled) return;
      if (result.status === "error") {
        setLoadError(result.message);
        setReports(null);
        return;
      }
      setLoadError(null);
      setReports(result.rows);
    });
    return () => {
      cancelled = true;
    };
  }, [refreshToken]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!message.trim()) return;

    setSubmitting(true);
    setSubmitError(null);

    const result = await submitSupportReport({
      userId: user.id,
      email: user.email ?? "",
      category,
      message: message.trim(),
      pageUrl: typeof window !== "undefined" ? window.location.pathname : "/app/support",
    });

    setSubmitting(false);

    if (result.status === "error") {
      setSubmitError(result.message);
      return;
    }

    setMessage("");
    setJustSubmitted(true);
    setRefreshToken((t) => t + 1);
  };

  return (
    <PlatformShell title="Support" subtitle="Report a problem and we'll see it directly">
      <div className="space-y-8">
        <section className="grid gap-3 sm:grid-cols-2">
          {ENTRIES.map((entry) => (
            <Surface key={entry.title}>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--surface-muted)] text-[var(--muted)]">
                <entry.icon size={16} aria-hidden />
              </div>
              <p className="mt-3 text-body-sm font-semibold text-[var(--text)]">{entry.title}</p>
              <p className="mt-1 text-caption leading-5 text-[var(--muted)]">{entry.body}</p>
              <Button
                variant="ghost"
                size="sm"
                iconRight={<ArrowRight size={13} aria-hidden />}
                className="mt-3 px-0"
                onClick={() => {
                  setCategory(entry.category);
                  setJustSubmitted(false);
                  document.getElementById("report-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
                  document.getElementById("report-message")?.focus();
                }}
              >
                Report an issue
              </Button>
            </Surface>
          ))}
        </section>

        <section id="report-form">
          <h2 className="mb-1 text-eyebrow font-bold uppercase text-[var(--faint)]">Report an issue</h2>
          <Surface>
            {justSubmitted ? (
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)]">
                  <Check size={16} aria-hidden />
                </span>
                <div>
                  <p className="text-body-sm font-semibold text-[var(--text)]">Report submitted.</p>
                  <p className="mt-0.5 text-caption text-[var(--muted)]">
                    It's in — you can see it below under &quot;Your reports.&quot; There's no support mailbox yet, so
                    this is the real record of it.
                  </p>
                  <Button variant="ghost" size="sm" className="mt-2 px-0" onClick={() => setJustSubmitted(false)}>
                    Report another issue
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Select
                  label="What's this about"
                  value={category}
                  onChange={(event) => setCategory(event.target.value as SupportCategory)}
                >
                  {SUPPORT_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </Select>
                <Textarea
                  id="report-message"
                  label="What's going on"
                  placeholder="The more specific, the easier this is to act on."
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  required
                />
                {submitError && (
                  <p className="text-caption text-[var(--danger)]" role="alert">
                    {submitError}
                  </p>
                )}
                <Button type="submit" variant="action" size="md" disabled={submitting || !message.trim()} className="self-start">
                  {submitting ? "Submitting…" : "Submit report"}
                </Button>
              </form>
            )}
          </Surface>
        </section>

        <section>
          <h2 className="mb-1 text-eyebrow font-bold uppercase text-[var(--faint)]">Your reports</h2>
          {reports === null && !loadError ? (
            <Surface padded={false}>
              <div className="divide-y divide-[var(--border)] px-5">
                {Array.from({ length: 2 }, (_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </div>
            </Surface>
          ) : loadError ? (
            <EmptyState icon={WarningCircle} title="Couldn't load your reports" description={loadError} />
          ) : reports && reports.length === 0 ? (
            <EmptyState
              icon={MessageCircle}
              title="Nothing reported yet"
              description="A report you submit above shows up here, so you can see it was really sent."
            />
          ) : (
            <Surface padded={false}>
              <div className="divide-y divide-[var(--border)] px-5">
                {reports!.map((report) => (
                  <div key={report.id} className="py-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-body-sm font-semibold text-[var(--text)]">
                        {CATEGORY_LABEL[report.category] ?? report.category}
                      </p>
                      <p className="shrink-0 text-caption text-[var(--faint)]">{formatRelativeTime(report.createdAt)}</p>
                    </div>
                    <p className="mt-1 text-caption leading-5 text-[var(--muted)]">{report.message}</p>
                  </div>
                ))}
              </div>
            </Surface>
          )}
        </section>
      </div>
    </PlatformShell>
  );
}

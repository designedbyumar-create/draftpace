import Alert from "@/design-system/Alert";
import Badge from "@/design-system/Badge";
import Button from "@/design-system/Button";
import { PaperPlaneTilt } from "@/design-system/Icon";
import { listGuides } from "~/lib/server/engine";
import { guideEmail } from "~/lib/email";
import { PageHeader, Panel } from "~/components/ui";
import CopyField from "~/components/CopyField";
import GuidePicker from "./GuidePicker";

export const metadata = { title: "Email" };

export default async function EmailPage({ searchParams }: { searchParams: Promise<{ guide?: string }> }) {
  const q = await searchParams;
  const guides = listGuides().filter((g) => g.product);
  const chosen = guides.find((g) => g.slug === q.guide) ?? guides.find((g) => g.startHere)!;
  const draft = guideEmail(chosen.slug);
  const resend = !!process.env.RESEND_API_KEY;
  return (
    <>
      <PageHeader
        title="Email"
        description="Marketing email to people who said yes: app users who opt in, and guide readers who sign up. Every email is built from a guide's own words and links back to it, then to the product it hands over to."
      />
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="flex items-center justify-between text-body-sm font-semibold">Sending <Badge tone={resend ? "success" : "warning"}>{resend ? "Resend key set" : "Not connected"}</Badge></p>
          <p className="mt-1 text-caption text-[var(--muted)]">Through Resend, from a separate marketing address, so a newsletter complaint never touches login email.</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="flex items-center justify-between text-body-sm font-semibold">Contacts <Badge tone="warning">Not built yet</Badge></p>
          <p className="mt-1 text-caption text-[var(--muted)]">Needs the marketing-consent tick at signup and in app Settings, then one synced list. No one is emailed who did not say yes.</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="flex items-center justify-between text-body-sm font-semibold">Drafts <Badge tone="success">Working</Badge></p>
          <p className="mt-1 text-caption text-[var(--muted)]">Any guide becomes an email: its title, summary, real steps and tracked links. Preview it below.</p>
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <div className="space-y-4">
          <Panel title="Build from a guide">
            <GuidePicker guides={guides.map((g) => ({ slug: g.slug, title: g.title, area: g.areaLabel, startHere: g.startHere }))} value={chosen.slug} />
            <div className="mt-4 space-y-3">
              <CopyField label="Subject" value={draft.subject} />
              <CopyField label="Preview line" value={draft.preheader} multiline />
              <CopyField label="Guide link (tracked)" value={draft.cta.url} />
            </div>
          </Panel>
          <Alert tone="info" title="Before the first send">Contacts need consent first (plan, phase 3). US law also needs an unsubscribe link and a postal address in every email; Resend adds the link at send.</Alert>
          <Button variant="commit" disabled iconLeft={<PaperPlaneTilt size={15} />}>Send to a group</Button>
        </div>
        <Panel title="Preview" description={`To: everyone who opted in · Subject: ${draft.subject}`}>
          <iframe title="Email preview" srcDoc={draft.html} className="h-[720px] w-full rounded-lg border border-[var(--border)] bg-white" sandbox="" />
        </Panel>
      </div>
    </>
  );
}

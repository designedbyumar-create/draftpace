/**
 * A marketing email drafted from one guide, in the guide's own words: its
 * title as the subject, its summary as the preview line, a few of its real
 * steps, the link to read the rest, and the product the guide hands over
 * to. Like every Studio draft it is for editing, not for sending as is.
 */
import { guideMaterial, productForGuide, guideBySlug, plain } from "@engine/director/guide";
import { productLine } from "@engine/src/shop-listings";
import { SITE } from "./publish";

export type EmailDraft = {
  guide: string;
  subject: string;
  preheader: string;
  heading: string;
  stepsHeading: string | null;
  /** Real steps: a timeline marker (when there is one) and the first sentence of the step. */
  steps: { when: string | null; text: string }[];
  cta: { label: string; url: string };
  product: { name: string; price: string; url: string };
  html: string;
};

const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function emailLink(url: string, campaign: string): string {
  const u = new URL(url);
  u.searchParams.set("utm_source", "email");
  u.searchParams.set("utm_medium", "newsletter");
  u.searchParams.set("utm_campaign", campaign);
  return u.toString();
}

export function guideEmail(slug: string): EmailDraft {
  const g = guideMaterial(slug);
  const raw = guideBySlug(slug);
  const { product } = productForGuide(slug);
  const line = productLine(product);
  const block = g.blocks.find((b) => b.kind === "checklist" || b.kind === "steps" || b.kind === "timeline") ?? g.blocks[0];
  const steps = (block?.items ?? []).slice(0, 5).map((u, i) => ({ when: block?.when?.[i]?.text ?? null, text: u.text }));
  const campaign = `email-guide-${slug}`;
  const cta = { label: "Read the full guide", url: emailLink(`${SITE}/guides/${slug}`, campaign) };
  const productUrl = emailLink(product === "monthly-money-reset" ? `${SITE}/free` : `${SITE}/shop/${product}`, campaign);
  const draft = {
    guide: slug,
    subject: g.title,
    preheader: plain(raw.dek),
    heading: g.title,
    stepsHeading: block?.heading?.text ?? null,
    steps,
    cta,
    product: { name: line.name, price: line.price, url: productUrl },
  };
  const html = `<!doctype html><html><body style="margin:0;background:#f6f4ee;font-family:Inter,Arial,sans-serif;color:#1b1a16">
<span style="display:none">${esc(draft.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;padding:32px">
<tr><td style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#8a857a;font-weight:700">Draftpace</td></tr>
<tr><td style="padding-top:12px;font-size:26px;line-height:1.2;font-weight:700">${esc(draft.heading)}</td></tr>
<tr><td style="padding-top:12px;font-size:16px;line-height:1.6;color:#66625a">${esc(draft.preheader)}</td></tr>
${draft.stepsHeading ? `<tr><td style="padding-top:24px;font-size:15px;font-weight:700">${esc(draft.stepsHeading)}</td></tr>` : ""}
<tr><td style="padding-top:8px"><ol style="margin:0;padding-left:20px;font-size:16px;line-height:1.7">${steps.map((s) => `<li>${s.when ? `<strong>${esc(s.when)}:</strong> ` : ""}${esc(s.text)}</li>`).join("")}</ol></td></tr>
<tr><td style="padding-top:24px"><a href="${esc(cta.url)}" style="display:inline-block;background:#1b1a16;color:#fff;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:10px">${esc(cta.label)}</a></td></tr>
<tr><td style="padding-top:24px;border-top:1px solid #e8e4da;margin-top:24px;font-size:14px;color:#66625a">The guide pairs with <a href="${esc(productUrl)}" style="color:#1b1a16;font-weight:600">${esc(line.name)}</a> (${esc(line.price)}).</td></tr>
</table>
<p style="font-size:12px;color:#8a857a">Unsubscribe link and postal address are added at send.</p>
</td></tr></table></body></html>`;
  return { ...draft, html };
}

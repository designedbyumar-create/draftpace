import Link from "next/link";

/**
 * The plain-language limit on what a guide is, and the one commercial fact
 * a reader is owed: the publisher sells the Companions these guides lead
 * to. Areas where a wrong step costs real money, health or legal standing
 * say so in their own words; every other area gets the general line.
 */
const AREA_LIMITS: Record<string, string> = {
  money: "This is general information, not financial, tax or legal advice. Rules and rates change, so check the figures against your own accounts and lenders.",
  "affairs-and-endings": "This is general information, not legal advice. Wills, probate and benefits rules differ by state and country, so confirm the steps that matter with the court, an attorney or a solicitor.",
  "family-health": "This is general information, not medical advice. It helps you keep records tidy; it does not replace a clinician, and it never tells you what to do about a symptom.",
  "family-and-learning": "Homeschool requirements differ by state and change. Check your state or district's current rules before you rely on any guide here.",
};

export default function GuideNotice({ areaSlug }: { areaSlug: string | null }) {
  const limit = (areaSlug ? AREA_LIMITS[areaSlug] : undefined) ?? "This is general information written to help you get organized, not professional advice.";
  return (
    <aside aria-label="About this guide" className="mt-8 text-body-sm leading-relaxed text-[var(--muted)]">
      <p>{limit}</p>
      <p className="mt-2">
        Draftpace publishes these guides and also sells the Companions they point to. We say so here, and the guide is written to be useful without buying anything. See{" "}
        <Link href="/editorial-standards" className="font-semibold text-[var(--area)] underline underline-offset-2">
          how we write and correct guides
        </Link>
        .
      </p>
    </aside>
  );
}

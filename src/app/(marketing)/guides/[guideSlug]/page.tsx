import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Container from "@/design-system/Container";
import { GUIDES, getGuideBySlug } from "@/content/guides";
import { getNeedBySlug } from "@/content/needs";

export function generateStaticParams() {
  return GUIDES.map((guide) => ({ guideSlug: guide.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ guideSlug: string }>;
}): Promise<Metadata> {
  const { guideSlug } = await params;
  const guide = getGuideBySlug(guideSlug);
  if (!guide) return {};
  return { title: guide.title, description: guide.dek };
}

export default async function GuidePage({ params }: { params: Promise<{ guideSlug: string }> }) {
  const { guideSlug } = await params;
  const guide = getGuideBySlug(guideSlug);
  if (!guide) notFound();

  return (
    <Container width="narrow" className="pb-24 pt-16 sm:pt-20">
      <Link href="/guides" className="text-[13px] font-semibold text-[var(--muted)] hover:text-[var(--text)]">
        ← All guides
      </Link>

      <p className="mt-6 text-[12px] text-[var(--faint)]">
        {new Date(guide.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}{" "}
        · {guide.readingTime}
      </p>
      <h1 className="mt-2 font-serif text-[32px] font-semibold leading-tight tracking-tight sm:text-[40px]">
        {guide.title}
      </h1>
      <p className="mt-4 text-[16px] leading-relaxed text-[var(--muted)]">{guide.dek}</p>

      <div className="prose-content mt-10 flex flex-col gap-6">
        {guide.body.map((block, index) => (
          <div key={index}>
            {block.heading && <h2 className="mb-3 text-[17px] font-semibold text-[var(--text)]">{block.heading}</h2>}
            {block.paragraphs.map((paragraph, paragraphIndex) => (
              <p key={paragraphIndex} className="mb-4 text-[15px] leading-relaxed text-[var(--text)] last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        ))}
      </div>

      {guide.relatedNeedSlugs.length > 0 && (
        <div className="mt-12 border-t border-[var(--border)] pt-8">
          <p className="text-[13px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">Related</p>
          <div className="mt-3 flex flex-col gap-1.5">
            {guide.relatedNeedSlugs.map((slug) => {
              const need = getNeedBySlug(slug);
              if (!need) return null;
              return (
                <Link key={slug} href={`/help-with/${slug}`} className="text-[14px] font-semibold text-[var(--primary)] hover:underline">
                  {need.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </Container>
  );
}

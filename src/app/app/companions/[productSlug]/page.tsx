import type { Metadata } from "next";
import Link from "next/link";
import PlatformShell from "@/design-system/shell/PlatformShell";
import EmptyState from "@/design-system/EmptyState";
import Button from "@/design-system/Button";
import Accordion, { type AccordionItem } from "@/design-system/Accordion";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2 } from "@/design-system/Icon";
import { screenTourFor } from "@/app/(marketing)/shop/productScreens";
import { LIFE_AREAS } from "@/content/areas";
import { shopRegistry } from "@/shop/registry";
import { ensureShopRegistered } from "@/shop/ensureRegistered";
import { questionsForStage, type ShopProduct } from "@/shop/definition";
import ManualTasks from "@/components/platform/manual/ManualTasks";
import ManualFaq from "@/components/platform/manual/ManualFaq";
import ManualOwnershipBar from "@/components/platform/manual/ManualOwnershipBar";
import ManualScreenTour from "@/components/platform/manual/ManualScreenTour";

/**
 * A product's own home — reached from the sidebar's "My Companions" (or the
 * command palette), one click after choosing a product and one click
 * before the tool itself. This is the screen somebody lands on right
 * after buying: the hero states what this is, shows it, says exactly
 * where things stand, and gets out of the way with one clear way in.
 * Everything else an owner might want — how to use it, what's inside,
 * saving, privacy, the questions people ask — is real, is the product's
 * own published content (nothing written fresh for this page), and is
 * collapsed to its own heading until wanted, so this never reads as a
 * wall of text to someone who just wants to open the thing they bought.
 *
 * force-dynamic because shopRegistry is populated at request time by
 * module-level singletons — see ensureShopRegistered's own note on why a
 * cached render can otherwise serve an empty registry.
 */
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ productSlug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { productSlug } = await params;
  ensureShopRegistered();
  const product = shopRegistry.getBySlug(productSlug);
  return { title: product ? product.title : "Your product" };
}

export default async function ProductOverviewPage({ params }: Params) {
  const { productSlug } = await params;
  ensureShopRegistered();
  const product = shopRegistry.getBySlug(productSlug);

  if (!product) {
    return (
      <PlatformShell title="Your product">
        <BackLink />
        <div className="mt-6">
          <EmptyState
            icon={BookOpen}
            title="Nothing published for this one yet"
            description="This product doesn't have a published listing. You can still open it from the sidebar."
            action={
              <Button href="/app" variant="action" size="md">
                Back to Home
              </Button>
            }
          />
        </div>
      </PlatformShell>
    );
  }

  const area = LIFE_AREAS.find((a) => a.productSlugs.includes(product.slug)) ?? null;
  const screens = screenTourFor(product.slug);
  // A listing that has been given tasks gets the task index; the rest keep
  // the document until they are migrated too.
  const taskShaped = product.tasks.length > 0;
  const owningQuestions = questionsForStage(product, "owning");
  const related = product.relatedProductSlugs
    .map((slug) => shopRegistry.getBySlug(slug))
    .filter((p): p is ShopProduct => Boolean(p));

  const highlights = product.problemsSolved.slice(0, 4);
  const accordionItems = buildAccordionItems(product, taskShaped, screens, owningQuestions, related);

  return (
    <PlatformShell title={product.title} subtitle="Your product">
      <BackLink />

      {/* The hero: identity, value and the way in, beside a visual —
          bounded on purpose, not a title-and-promise header followed by a
          tall screenshot column that pushes everything below it down
          regardless of how short the text column actually is. Both
          columns stretch to the row's own height and the visual centers
          within it (compact: no caption, no back/next — those belong to
          the full tour in the accordion below), so the two sides read as
          a matched pair instead of the left ending early and the right
          trailing off into whitespace. */}
      <div className="mt-5 grid gap-10 lg:grid-cols-[1fr_260px] lg:items-stretch lg:gap-12">
        <div className="min-w-0">
          {area && <p className="text-[11.5px] font-bold uppercase tracking-[0.12em] text-[var(--primary)]">{area.label}</p>}
          <h1 className="mt-2 text-[26px] font-semibold leading-tight tracking-tight text-[var(--text)] sm:text-[32px]">
            {product.title}
          </h1>
          <p className="mt-3 max-w-xl text-[15.5px] leading-relaxed text-[var(--muted)]">{product.promise}</p>

          <div className="mt-6">
            <ManualOwnershipBar productSlug={product.slug} productTitle={product.title} />
          </div>

          {highlights.length > 0 && (
            <div className="mt-8 rounded-2xl bg-[var(--surface-sunken)] p-5 sm:p-6">
              <p className="text-body-sm font-semibold text-[var(--text)]">Why people use this</p>
              <div className="mt-3.5 grid gap-3 sm:grid-cols-2">
                {highlights.map((item) => (
                  <div key={item.solution} className="flex gap-2.5">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[var(--success)]" aria-hidden />
                    <div className="min-w-0">
                      <p className="text-body-sm font-semibold leading-snug text-[var(--text)]">{item.label ?? item.solution}</p>
                      {item.label && <p className="mt-0.5 text-caption leading-relaxed text-[var(--muted)]">{item.solution}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {screens && (
          <div className="lg:flex lg:h-full lg:flex-col lg:justify-center">
            <ManualScreenTour screens={screens} compact />
          </div>
        )}
      </div>

      {/* A real section start, not a continuation of the hero: a rule
          above it, a heading the same weight the accordion's own section
          titles use, room before it — the opposite of an eyebrow label
          floating in leftover space. */}
      <div className="mt-12 max-w-2xl space-y-12 border-t border-[var(--border)] pt-10">
        {taskShaped ? (
          <Section title="What do you want to do?">
            <ManualTasks tasks={product.tasks} productSlug={product.slug} />
          </Section>
        ) : (
          <Section title="What it's for">
            <p className="text-[15px] leading-relaxed text-[var(--text)]">{product.problem}</p>
          </Section>
        )}

        {accordionItems.length > 0 && <Accordion items={accordionItems} />}

        <div className="border-t border-[var(--border)] pt-6">
          <Link
            href={`/shop/${product.slug}`}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--primary)]"
          >
            See this product&apos;s public page
            <ArrowRight size={14} aria-hidden />
          </Link>
        </div>
      </div>
    </PlatformShell>
  );
}

/**
 * Everything past "what it's for" and the hero, as accordion items. Built
 * from the same fields the old flat sections rendered — nothing new is
 * written, only how densely it's shown.
 */
function buildAccordionItems(
  product: ShopProduct,
  taskShaped: boolean,
  screens: { node: React.ReactNode; caption: string | null }[] | null,
  owningQuestions: { question: string; answer: string }[],
  related: ShopProduct[]
): AccordionItem[] {
  const items: AccordionItem[] = [];

  // The full, steppable tour — the hero only ever shows one screen,
  // compact and uncaptioned. Anyone who wants to browse the rest opens
  // this instead of it competing with the hero's own text column.
  if (screens) {
    items.push({
      id: "what-it-looks-like",
      title: "What it looks like",
      content: <ManualScreenTour screens={screens} />,
    });
  }

  if (!taskShaped && product.howItWorks.length > 0) {
    items.push({
      id: "how-to-use-it",
      title: "How to use it",
      content: (
        <ol className="space-y-4">
          {product.howItWorks.map((step, i) => (
            <li key={step} className="flex gap-4">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[12px] font-bold text-[var(--primary)]">
                {i + 1}
              </span>
              <p className="text-[14.5px] leading-relaxed text-[var(--text)]">{step}</p>
            </li>
          ))}
        </ol>
      ),
    });
  }

  if (!taskShaped && product.outcomes.length > 0) {
    items.push({ id: "what-you-should-get", title: "What you should get out of it", content: <Bullets items={product.outcomes} /> });
  }

  if (!taskShaped && product.inclusions.length > 0) {
    items.push({ id: "whats-inside", title: "What's inside", content: <Bullets items={product.inclusions} /> });
  }

  if (!taskShaped && (product.expectedInputs.length > 0 || product.expectedOutputs.length > 0)) {
    items.push({
      id: "what-it-needs",
      title: "What it needs from you, and what it gives back",
      content: (
        <div className="grid gap-4 sm:grid-cols-2">
          {product.expectedInputs.length > 0 && (
            <Panel heading="What it asks you for">
              <Bullets items={product.expectedInputs} compact />
            </Panel>
          )}
          {product.expectedOutputs.length > 0 && (
            <Panel heading="What it gives back">
              <Bullets items={product.expectedOutputs} compact />
            </Panel>
          )}
        </div>
      ),
    });
  }

  if (!taskShaped && (product.savingBehavior || product.compatibility.length > 0)) {
    items.push({
      id: "saving-and-devices",
      title: "Saving, and where it works",
      content: (
        <>
          {product.savingBehavior && <p className="text-[14.5px] leading-relaxed text-[var(--text)]">{product.savingBehavior}</p>}
          {product.compatibility.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {product.compatibility.map((item) => (
                <li key={item} className="rounded-full border border-[var(--border)] px-3 py-1.5 text-[12.5px] text-[var(--muted)]">
                  {item}
                </li>
              ))}
            </ul>
          )}
        </>
      ),
    });
  }

  if (!taskShaped && product.privacyNotes) {
    items.push({ id: "privacy", title: "What stays private", content: <p className="text-[14.5px] leading-relaxed text-[var(--text)]">{product.privacyNotes}</p> });
  }

  // Where a migrated, task-shaped listing puts saving and privacy: one
  // line, with the detail a click away, rather than two dense paragraphs.
  if (taskShaped) {
    items.push({
      id: "saving-and-privacy",
      title: "Saving and privacy",
      content: (
        <>
          <p className="text-[14.5px] leading-relaxed text-[var(--text)]">
            Everything saves to your account as you go, on every device you sign in on. Nothing here is read by an AI model, and
            nothing is sold.
          </p>
          <Link href="/trust" className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--primary)]">
            How Draftpace handles your data
            <ArrowRight size={14} aria-hidden />
          </Link>
        </>
      ),
    });
  }

  if (owningQuestions.length > 0) {
    items.push({ id: "questions", title: "Questions owners ask", content: <ManualFaq faqs={owningQuestions} /> });
  }

  if (related.length > 0) {
    items.push({
      id: "what-it-works-with",
      title: "What it works with",
      content: (
        <>
          <p className="mb-4 text-[14px] leading-relaxed text-[var(--muted)]">
            Each product holds only what belongs to it. These are the ones this product deliberately hands things over to.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {related.map((other) => (
              <Link
                key={other.slug}
                href={`/app/companions/${other.slug}`}
                className="flex items-start justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors hover:border-[var(--border-strong)]"
              >
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-[var(--text)]">{other.title}</p>
                  <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-[var(--muted)]">{other.promise}</p>
                </div>
                <ArrowRight size={15} className="mt-0.5 shrink-0 text-[var(--faint)]" aria-hidden />
              </Link>
            ))}
          </div>
        </>
      ),
    });
  }

  return items;
}

function BackLink() {
  return (
    <Link
      href="/app"
      className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--muted)] transition-colors hover:text-[var(--text)]"
    >
      <ArrowLeft size={14} aria-hidden />
      Home
    </Link>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-[12px] font-bold uppercase tracking-[0.13em] text-[var(--faint)]">{title}</h2>
      <div className="mt-3.5">{children}</div>
    </section>
  );
}

function Panel({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <p className="text-[13px] font-semibold text-[var(--text)]">{heading}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Bullets({ items, compact = false }: { items: string[]; compact?: boolean }) {
  return (
    <ul className={compact ? "space-y-2" : "space-y-2.5"}>
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" aria-hidden />
          <span className={`leading-relaxed text-[var(--text)] ${compact ? "text-[13.5px]" : "text-[14.5px]"}`}>{item}</span>
        </li>
      ))}
    </ul>
  );
}

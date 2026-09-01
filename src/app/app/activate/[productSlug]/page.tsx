import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { productRegistry } from "@/product-framework/registry";
import { ensureProductsRegistered } from "@/products/manifest";
import { familyRegistry } from "@/product-framework/families";
import { shopRegistry } from "@/shop/registry";
import { ensureShopRegistered } from "@/shop/ensureRegistered";
import Container from "@/design-system/Container";
import Surface from "@/design-system/Surface";
import Badge from "@/design-system/Badge";
import Alert from "@/design-system/Alert";
import Button from "@/design-system/Button";
import { ArrowRight, Check, Lock } from "@/design-system/Icon";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Required by ensureShopRegistered's contract: the shop registry is
 * populated by module-level singletons at request time, and without this
 * Next.js can cache a render made against an empty registry and serve it
 * until the next deploy. That failure was seen in production once
 * already, as "hard refresh always works, client-side nav occasionally
 * shows an empty Store".
 */
export const dynamic = "force-dynamic";

/**
 * A safe, side-effect-free confirmation screen. Reading this page grants
 * nothing. The actual grant only happens if the visitor submits the
 * <form method="POST"> below, which is the only thing on this page that
 * mutates anything. Sits under /app/**, so src/proxy.ts already requires a
 * real session to reach it, redirecting a signed-out visitor to
 * /login?redirectTo=/app/activate/[productSlug] and back here afterward.
 *
 * THIS PAGE SERVES BOTH ACCESS MODELS, and did not always.
 *
 * It is where [productSlug]/layout.tsx sends any signed-in visitor who
 * reaches a product they have no entitlement for, whatever its price. It
 * used to notFound() unless the product was free, which meant every paid
 * product bounced a signed-in visitor to a dead page: the person most
 * likely to buy, shown a 404. Four paid products shipped with that.
 *
 * The free path is unchanged, including the POST. The paid path renders
 * no form at all, so there is no route by which this page can grant a
 * paid product. The API route it posts to refuses anything that is not
 * free regardless, which is where the actual boundary lives.
 */
export default async function ActivateProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ productSlug: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  ensureProductsRegistered();
  ensureShopRegistered();
  const { productSlug } = await params;
  const { error } = await searchParams;

  const definition = productRegistry.getBySlug(productSlug);
  if (!definition) notFound();

  const family = familyRegistry.get(definition.family);
  const isFree = definition.access.model === "free";

  // Only when there is a real, published listing to send them to. A
  // product can be registered and reachable before its Shop listing
  // exists (creating that listing is the release gate), and a buy link
  // into a 404 would be worse than no buy link.
  const listing = isFree ? undefined : shopRegistry.getBySlug(definition.slug);
  const purchasable = listing?.publicationStatus === "published";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--app-bg)] px-4 py-16">
      <Container width="narrow" className="w-full">
        <Surface className="p-8 text-center">
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {isFree ? <Badge tone="success">Free</Badge> : <Badge tone="neutral">Paid</Badge>}
            <Badge tone="neutral">{family?.label ?? definition.family}</Badge>
          </div>

          <h1 className="mt-4 text-xl font-semibold tracking-tight text-[var(--text)]">
            {isFree ? `Add ${definition.title} to your library` : `You do not have ${definition.title} yet`}
          </h1>
          {definition.tagline && (
            <p className="mx-auto mt-2 max-w-md text-[14px] leading-relaxed text-[var(--muted)]">
              {definition.tagline}
            </p>
          )}

          {error && (
            <div className="mt-5 text-left">
              <Alert tone="danger">
                Something went wrong adding this to your library. Please try again.
              </Alert>
            </div>
          )}

          {isFree && (
            <div className="mx-auto mt-6 flex max-w-xs flex-col gap-2 text-left text-[13px] text-[var(--text)]">
              <div className="flex items-start gap-2">
                <Check size={15} className="mt-0.5 shrink-0 text-[var(--success)]" aria-hidden />
                No payment required, now or later for this product.
              </div>
              <div className="flex items-start gap-2">
                <Check size={15} className="mt-0.5 shrink-0 text-[var(--success)]" aria-hidden />
                Your progress saves to your account automatically.
              </div>
            </div>
          )}

          {isFree ? (
            <form method="POST" action={`/api/products/${definition.slug}/activate`} className="mt-7">
              <Button type="submit" size="lg" fullWidth iconRight={<ArrowRight size={15} aria-hidden />}>
                Add to my library
              </Button>
            </form>
          ) : purchasable ? (
            <div className="mt-7">
              <Button
                href={`/shop/${definition.slug}`}
                size="lg"
                fullWidth
                iconRight={<ArrowRight size={15} aria-hidden />}
              >
                See what it does
              </Button>
            </div>
          ) : (
            /*
              Registered, reachable, and not on sale yet. Says so, rather
              than offering a link into a page that does not exist.
            */
            <p className="mt-7 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-4 text-[13px] leading-relaxed text-[var(--muted)]">
              This one is not on sale yet. If somebody gave you access to it, sign in with the account it was added to.
            </p>
          )}

          <Link
            href={isFree ? "/shop" : "/app/library"}
            className="mt-4 inline-block text-[12px] font-semibold text-[var(--muted)] hover:text-[var(--text)]"
          >
            {isFree ? "Not right now" : "Back to your library"}
          </Link>

          <p className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-[var(--faint)]">
            <Lock size={12} aria-hidden />
            Only you can see your data for this product.
          </p>
        </Surface>
      </Container>
    </div>
  );
}

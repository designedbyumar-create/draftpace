import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { productRegistry } from "@/product-framework/registry";
import { ensureProductsRegistered } from "@/products/manifest";
import { familyRegistry } from "@/product-framework/families";
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
 * A safe, side-effect-free confirmation screen — reading this page grants
 * nothing. The actual grant only happens if the visitor submits the
 * <form method="POST"> below, which is the only thing on this page that
 * mutates anything. Sits under /app/**, so src/proxy.ts already requires a
 * real session to reach it, redirecting a signed-out visitor to
 * /login?redirectTo=/app/activate/[productSlug] and back here afterward.
 */
export default async function ActivateProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ productSlug: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  ensureProductsRegistered();
  const { productSlug } = await params;
  const { error } = await searchParams;

  const definition = productRegistry.getBySlug(productSlug);
  if (!definition || definition.access.model !== "free") notFound();

  const family = familyRegistry.get(definition.family);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--app-bg)] px-4 py-16">
      <Container width="narrow" className="w-full">
        <Surface className="p-8 text-center">
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <Badge tone="success">Free</Badge>
            <Badge tone="neutral">{family?.label ?? definition.family}</Badge>
          </div>

          <h1 className="mt-4 text-xl font-semibold tracking-tight text-[var(--text)]">
            Add {definition.title} to your library
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

          <form method="POST" action={`/api/products/${definition.slug}/activate`} className="mt-7">
            <Button type="submit" size="lg" fullWidth iconRight={<ArrowRight size={15} aria-hidden />}>
              Add to my library
            </Button>
          </form>

          <Link
            href="/shop"
            className="mt-4 inline-block text-[12px] font-semibold text-[var(--muted)] hover:text-[var(--text)]"
          >
            Not right now
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

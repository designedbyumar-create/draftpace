import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { productRegistry } from "@/product-framework/registry";
import { ensureProductsRegistered } from "@/products/manifest";
import { shopRegistry } from "@/shop/registry";
import { ensureShopRegistered } from "@/shop/ensureRegistered";
import { productThemeStyle, PRODUCT_THEME_ATTRIBUTE } from "@/product-framework/themeExtension";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Container from "@/design-system/Container";
import Surface from "@/design-system/Surface";
import Button from "@/design-system/Button";
import { ArrowRight, Check } from "@/design-system/Icon";
import AwaitingGrant from "@/components/platform/AwaitingGrant";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Required by ensureShopRegistered's contract: the registries are
 * populated by module-level singletons at request time, and without this
 * Next.js can cache a render made against an empty registry. Doubly so
 * here, where the entitlement read must be live on every request.
 */
export const dynamic = "force-dynamic";

/**
 * The screen a customer lands on straight after paying.
 *
 * WHY THIS PAGE EXISTS AT ALL
 *
 * Without it, Lemon Squeezy's overlay closes and the customer is returned
 * to the Shop page they were already reading, which now still says "Get
 * it". Nothing tells them the purchase worked, nothing tells them where
 * the product went, and the obvious next click is the buy button again.
 *
 * Sending them directly to the product instead loses a race: the grant
 * arrives by webhook, asynchronously, and if it has not landed yet the
 * product layout redirects them to an activation page telling them they
 * do not own what they just bought. So this page waits for the grant
 * (AwaitingGrant polls) and only then offers the way in.
 *
 * WHAT IT DELIBERATELY DOES NOT DO
 *
 * It grants nothing. Reaching this URL, with any slug, gives no access:
 * the entitlement read below is the only thing that decides what renders,
 * and only the signature-verified Lemon Squeezy webhook can create one.
 * Somebody who navigates here without buying simply waits, then gets the
 * honest timed-out state.
 *
 * It also makes no claim about the payment beyond what is true. It never
 * shows an amount, a card, or a receipt: Lemon Squeezy is the merchant of
 * record and emails the real receipt, so restating any of it here would
 * be a second, unverified copy of a financial record.
 */
export default async function WelcomePage({ params }: { params: Promise<{ productSlug: string }> }) {
  ensureProductsRegistered();
  ensureShopRegistered();

  const { productSlug } = await params;
  const definition = productRegistry.getBySlug(productSlug);
  if (!definition) notFound();

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // src/proxy.ts already guarantees a session for /app/**; defense in depth.
  if (!user) redirect(`/login?redirectTo=${encodeURIComponent(`/app/welcome/${productSlug}`)}`);

  const { data: entitlement } = await supabase
    .from("entitlements")
    .select("id")
    .eq("product_slug", productSlug)
    .eq("is_active", true)
    .is("revoked_at", null)
    .maybeSingle();

  const granted = Boolean(entitlement);
  const listing = shopRegistry.getBySlug(productSlug);
  const title = definition.title;

  return (
    // The product's own accent, from the first screen they see after
    // paying. This is the handover from Draftpace-the-shop to the thing
    // they actually bought, so it wears that thing's colour rather than
    // platform teal.
    <div {...{ [PRODUCT_THEME_ATTRIBUTE]: "" }} style={productThemeStyle(definition.theme)}>
      <Container className="py-16 sm:py-24">
        <div className="mx-auto max-w-[560px]">
          {granted ? (
            <>
              {/* Solid accent, not the soft wash it was: at this moment the
                  customer's actual question is whether their card went
                  through, and a pale tint does not answer it. Scales in
                  once, which is as much celebration as these products can
                  carry. One of them is about dying; confetti would be
                  grotesque on it, so there is none on any of them. */}
              <span className="inline-flex h-12 w-12 animate-[welcome-mark_420ms_cubic-bezier(0.16,1,0.3,1)] items-center justify-center rounded-full bg-[var(--primary)] motion-reduce:animate-none">
                <Check size={24} className="text-[var(--primary-contrast)]" aria-hidden />
              </span>
              {/* States the transaction plainly. "X is yours" implies the
                  payment worked; it never says so. */}
              <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">
                Payment complete
              </p>
              <h1 className="mt-2 font-serif text-[30px] leading-[1.15] tracking-[-0.01em] text-[var(--text)] sm:text-[36px]">
                {title} is yours.
              </h1>
              <p className="mt-3 text-[16px] leading-relaxed text-[var(--muted)]">
                {listing?.promise ??
                  "It is in your library now, and it stays there. Nothing to renew, nothing to keep paying."}
              </p>

              <Surface className="mt-8 p-5">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">
                  What happens now
                </h2>
                <ul className="mt-3 flex flex-col gap-2.5 text-[14px] leading-relaxed text-[var(--text)]">
                  <li className="flex gap-2.5">
                    <Check size={15} className="mt-1 shrink-0 text-[var(--primary)]" aria-hidden />
                    <span>
                      It is in <Link href="/app" className="font-semibold text-[var(--primary)] hover:underline">your
                      library</Link> permanently, on every device you sign in on.
                    </span>
                  </li>
                  <li className="flex gap-2.5">
                    <Check size={15} className="mt-1 shrink-0 text-[var(--primary)]" aria-hidden />
                    <span>Your receipt is on its way by email, from Lemon Squeezy, who handled the payment.</span>
                  </li>
                  <li className="flex gap-2.5">
                    <Check size={15} className="mt-1 shrink-0 text-[var(--primary)]" aria-hidden />
                    <span>
                      The first screen sets it up with you. It takes a few minutes and you can leave it half done.
                    </span>
                  </li>
                </ul>
              </Surface>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button
                  href={`/app/products/${productSlug}/start`}
                  variant="commit"
                  size="lg"
                  iconRight={<ArrowRight size={16} aria-hidden />}
                >
                  Open {title}
                </Button>
                <Button href="/app" variant="ghost" size="lg">
                  Not now
                </Button>
              </div>
            </>
          ) : (
            <>
              <h1 className="font-serif text-[30px] leading-[1.15] tracking-[-0.01em] text-[var(--text)] sm:text-[36px]">
                Thank you.
              </h1>
              <Surface className="mt-6 p-5">
                <AwaitingGrant productSlug={productSlug} productTitle={title} />
              </Surface>
            </>
          )}
        </div>
      </Container>
    </div>
  );
}

import { notFound } from "next/navigation";
import { productRegistry } from "@/product-framework/registry";
import { registerDevFixtures } from "@/product-framework/fixtures";
import { registerMonthlyMoneyReset } from "@/products/monthly-money-reset/register";
import ProductShell from "@/components/product-shell/ProductShell";

export default async function ProductLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ productSlug: string }>;
}) {
  // Registration is idempotent and cheap. Called here directly, not assumed
  // to have already run via the outer /app layout, because this segment's
  // server module can be resolved independently of that layout's module
  // instance (e.g. a destination visited for the first time in a dev
  // session) — see docs for the client-navigation 404 this guards against.
  registerDevFixtures();
  registerMonthlyMoneyReset();

  const { productSlug } = await params;
  const definition = productRegistry.getBySlug(productSlug);
  if (!definition) notFound();

  return <ProductShell definition={definition}>{children}</ProductShell>;
}

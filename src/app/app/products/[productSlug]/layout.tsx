import { notFound } from "next/navigation";
import { productRegistry } from "@/product-framework/registry";
import ProductShell from "@/components/product-shell/ProductShell";

export default async function ProductLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ productSlug: string }>;
}) {
  const { productSlug } = await params;
  const definition = productRegistry.getBySlug(productSlug);
  if (!definition) notFound();

  return <ProductShell definition={definition}>{children}</ProductShell>;
}

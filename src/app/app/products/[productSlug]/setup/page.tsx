import { notFound } from "next/navigation";
import { productRegistry } from "@/product-framework/registry";
import DestinationPlaceholder from "@/components/product-shell/DestinationPlaceholder";

export default async function ProductSetupPage({
  params,
}: {
  params: Promise<{ productSlug: string }>;
}) {
  const { productSlug } = await params;
  const definition = productRegistry.getBySlug(productSlug);
  if (!definition) notFound();

  return (
    <DestinationPlaceholder
      definition={definition}
      eyebrow="Setup"
      description="Product-specific configuration, using registered schemas and modules — progressive, autosaved, and skippable where the product allows."
    />
  );
}

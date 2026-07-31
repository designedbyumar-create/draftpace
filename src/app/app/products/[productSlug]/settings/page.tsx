import { notFound } from "next/navigation";
import { productRegistry } from "@/product-framework/registry";
import DestinationPlaceholder from "@/components/product-shell/DestinationPlaceholder";

export default async function ProductSettingsPage({
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
      eyebrow="Settings"
      description="Product-specific configuration, notification preferences, permissions, connected data, and reset/archive/delete — scoped to this product only."
    />
  );
}

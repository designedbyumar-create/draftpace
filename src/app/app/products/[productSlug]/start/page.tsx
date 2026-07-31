import { notFound } from "next/navigation";
import { productRegistry } from "@/product-framework/registry";
import DestinationPlaceholder from "@/components/product-shell/DestinationPlaceholder";

export default async function ProductStartPage({
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
      eyebrow="Start"
      description="The product's entry surface — cover, promise, ownership status, and the primary start or continue action."
    />
  );
}

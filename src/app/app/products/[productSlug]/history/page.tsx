import { notFound } from "next/navigation";
import { productRegistry } from "@/product-framework/registry";
import DestinationPlaceholder from "@/components/product-shell/DestinationPlaceholder";

export default async function ProductHistoryPage({
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
      eyebrow="History"
      description="Family-appropriate history — sessions, outcomes, reports, automation runs, completed lessons, saved calculations, previous cycles, or exports."
    />
  );
}

import { notFound } from "next/navigation";
import { productRegistry } from "@/product-framework/registry";
import DestinationPlaceholder from "@/components/product-shell/DestinationPlaceholder";

export default async function ProductProgressPage({
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
      eyebrow="Progress"
      description="Family-appropriate progress — momentum and milestones, course mastery, automation run health, program stages, or tracker consistency. Never a forced percentage or streak."
    />
  );
}

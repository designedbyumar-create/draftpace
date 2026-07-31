import { notFound } from "next/navigation";
import { productRegistry } from "@/product-framework/registry";
import { resolveWorkspaceLabel } from "@/product-framework/navigationResolver";
import DestinationPlaceholder from "@/components/product-shell/DestinationPlaceholder";

export default async function ProductWorkspacePage({
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
      eyebrow={resolveWorkspaceLabel(definition)}
      description="The product's main live surface — its Companion next action, automation builder, lesson, calculator, guided task, or tracker entry, depending on family."
    />
  );
}

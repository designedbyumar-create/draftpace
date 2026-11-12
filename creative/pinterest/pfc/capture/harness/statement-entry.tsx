// Runs the product's own downloadSharedStatement() in the browser (its real runtime), with the fixture's shared items.
import { downloadSharedStatement } from "@/products/personal-finance-companion/printables/generateSharedStatement";
import { BILLS, SUBSCRIPTIONS } from "./fixtures";

(window as unknown as { run: () => Promise<void> }).run = () =>
  downloadSharedStatement({
    generatedLabel: new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }),
    items: [...BILLS, ...SUBSCRIPTIONS].filter((item) => item.shared),
    origin: "https://draftpace.com",
    slug: "personal-finance-companion",
  });

import { createRoot } from "react-dom/client";
import SubscriptionsModule from "@/products/personal-finance-companion/components/SubscriptionsModule";
import Shell from "./Shell";
import "@/app/globals.css";

createRoot(document.getElementById("root")!).render(
  <Shell>
    <SubscriptionsModule />
  </Shell>
);

import { createRoot } from "react-dom/client";
import SavingsModule from "@/products/personal-finance-companion/components/SavingsModule";
import Shell from "./Shell";
import "@/app/globals.css";

createRoot(document.getElementById("root")!).render(
  <Shell>
    <SavingsModule />
  </Shell>
);

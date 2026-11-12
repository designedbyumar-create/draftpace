import { createRoot } from "react-dom/client";
import AttentionModule from "@/products/personal-finance-companion/components/AttentionModule";
import Shell from "./Shell";
import "@/app/globals.css";

createRoot(document.getElementById("root")!).render(
  <Shell>
    <AttentionModule />
  </Shell>
);

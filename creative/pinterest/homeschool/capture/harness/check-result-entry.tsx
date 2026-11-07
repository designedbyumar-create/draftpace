import { createRoot } from "react-dom/client";
import CheckModule from "@/products/homeschooling-companion/components/CheckModule";
import Shell from "./Shell";
import "@/app/globals.css";

createRoot(document.getElementById("root")!).render(
  <Shell>
    <CheckModule childId="ava" />
  </Shell>
);

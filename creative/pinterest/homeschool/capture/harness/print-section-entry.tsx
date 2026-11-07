import { createRoot } from "react-dom/client";
import ChildDetailModule from "@/products/homeschooling-companion/components/ChildDetailModule";
import Shell from "./Shell";
import "@/app/globals.css";

createRoot(document.getElementById("root")!).render(
  <Shell>
    <ChildDetailModule childId="ava" />
  </Shell>
);

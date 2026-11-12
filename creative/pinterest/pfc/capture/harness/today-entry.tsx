import { createRoot } from "react-dom/client";
import WorkspaceModule from "@/products/personal-finance-companion/components/WorkspaceModule";
import Shell from "./Shell";
import "@/app/globals.css";

createRoot(document.getElementById("root")!).render(
  <Shell>
    <WorkspaceModule />
  </Shell>
);

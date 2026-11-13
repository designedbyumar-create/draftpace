import { createRoot } from "react-dom/client";
import ReportProblemSheet from "@/products/home-management-companion/components/problems/ReportProblemSheet";
import Shell from "./Shell";
import { SHEET_ITEMS } from "./fixtures";
import "@/app/globals.css";

createRoot(document.getElementById("root")!).render(
  <Shell>
    <ReportProblemSheet open instanceId="demo-instance" items={SHEET_ITEMS} onClose={() => {}} onSaved={() => {}} />
  </Shell>
);

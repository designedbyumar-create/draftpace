import { createRoot } from "react-dom/client";
import SettingsModule from "@/products/alongside/components/SettingsModule";
import Shell from "./Shell";
import "@/app/globals.css";

createRoot(document.getElementById("root")!).render(<Shell><SettingsModule /></Shell>);

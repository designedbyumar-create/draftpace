import { createRoot } from "react-dom/client";
import SetupModule from "@/products/home-management-companion/components/SetupModule";
import Shell from "./Shell";
import "@/app/globals.css";

createRoot(document.getElementById("root")!).render(<Shell><SetupModule /></Shell>);

import { createRoot } from "react-dom/client";
import ImportModule from "@/products/home-management-companion/components/ImportModule";
import Shell from "./Shell";
import "@/app/globals.css";

createRoot(document.getElementById("root")!).render(<Shell><ImportModule /></Shell>);

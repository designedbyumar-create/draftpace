import { createRoot } from "react-dom/client";
import NowModule from "@/products/alongside/components/NowModule";
import Shell from "./Shell";
import "@/app/globals.css";

createRoot(document.getElementById("root")!).render(<Shell><NowModule /></Shell>);

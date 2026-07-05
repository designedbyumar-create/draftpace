import { redirect } from "next/navigation";

export default function DashboardLibraryRedirect() {
  redirect("/dashboard/drafts");
}

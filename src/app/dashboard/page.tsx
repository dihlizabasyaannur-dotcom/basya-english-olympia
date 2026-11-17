import { redirect } from "next/navigation";
import { getCurrentProfile, homeFor } from "@/lib/auth";

// Sends each user to the dashboard for their role.
export default async function DashboardRedirect() {
  const profile = await getCurrentProfile();
  redirect(profile ? homeFor(profile.role) : "/login");
}

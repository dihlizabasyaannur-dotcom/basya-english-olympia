import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/lib/auth";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole(["student"]);
  return <AppShell role="student" name={profile.full_name}>{children}</AppShell>;
}

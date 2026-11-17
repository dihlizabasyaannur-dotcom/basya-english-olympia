import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/lib/auth";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole(["teacher"]);
  return <AppShell role="teacher" name={profile.full_name}>{children}</AppShell>;
}

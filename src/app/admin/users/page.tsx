import type { Metadata } from "next";
import { Search, Users } from "lucide-react";
import { Badge, Card, CardBody, CardHeader, EmptyState, PageHeader } from "@/components/ui/card";
import { Button, LinkButton } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { CreateClassForm, RoleSelect } from "./user-forms";

export const metadata: Metadata = { title: "Users & Classes" };

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ q?: string; role?: string }> }) {
  const me = await requireRole(["admin"]);
  const sp = await searchParams;
  const supabase = await createClient();
  let query = supabase.from("profiles").select("id, full_name, role, school_level, grade, school_name, cefr_level, xp, created_at").order("created_at", { ascending: false }).limit(200);
  if (sp.q) query = query.ilike("full_name", `%${sp.q.replace(/[%,()]/g, " ")}%`);
  if (sp.role === "student" || sp.role === "teacher" || sp.role === "admin") query = query.eq("role", sp.role);
  const [{ data: users }, { data: teachers }, { data: classes }] = await Promise.all([
    query,
    supabase.from("profiles").select("id, full_name").eq("role", "teacher").order("full_name"),
    supabase.from("classes").select("id, name, school_level, join_code, created_at, teacher:profiles!classes_teacher_id_fkey(full_name), enrollments(count)").order("created_at", { ascending: false }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Administration" title="Users & classes" description="Promote teachers, and create classes with a join code for students." />

      <Card>
        <CardHeader title="Classes" description="Share the join code with students — they enter it on their Profile page." />
        <CardBody className="space-y-4">
          <CreateClassForm teachers={teachers ?? []} />
          {(classes ?? []).length === 0 ? <p className="text-sm text-muted">No classes yet.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead className="text-left text-xs uppercase tracking-wide text-muted"><tr><th className="py-2">Class</th><th>Teacher</th><th>Students</th><th>Join code</th><th>Created</th></tr></thead>
                <tbody className="divide-y divide-line">
                  {classes!.map((c) => (
                    <tr key={c.id}>
                      <td className="py-2 font-semibold">{c.name} {c.school_level && <Badge tone="neutral">{c.school_level}</Badge>}</td>
                      <td>{c.teacher?.full_name ?? <span className="text-warning">Unassigned</span>}</td>
                      <td>{c.enrollments?.[0]?.count ?? 0}</td>
                      <td className="font-mono font-bold tracking-widest text-brand">{c.join_code}</td>
                      <td className="text-muted">{formatDate(c.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Users" description="New accounts are always students. Change roles here." />
        <CardBody>
          <form className="mb-4 flex flex-wrap gap-2" action="/admin/users">
            <div className="relative min-w-56 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input name="q" defaultValue={sp.q} placeholder="Search by name" className="pl-9" aria-label="Search users" />
            </div>
            <Select name="role" defaultValue={sp.role ?? ""} className="w-40" aria-label="Role"><option value="">All roles</option><option value="student">Students</option><option value="teacher">Teachers</option><option value="admin">Admins</option></Select>
            <Button type="submit">Search</Button>
            {(sp.q || sp.role) && <LinkButton href="/admin/users" variant="ghost">Reset</LinkButton>}
          </form>
          {(users ?? []).length === 0 ? <EmptyState icon={<Users className="h-5 w-5" />} title="No users found" /> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="text-left text-xs uppercase tracking-wide text-muted"><tr><th className="py-2">Name</th><th>School</th><th>CEFR</th><th>XP</th><th>Joined</th><th className="w-40">Role</th></tr></thead>
                <tbody className="divide-y divide-line">
                  {users!.map((u) => (
                    <tr key={u.id}>
                      <td className="py-2 font-semibold">{u.full_name}{u.id === me.id && <span className="ml-1 text-xs text-muted">(you)</span>}</td>
                      <td className="text-muted">{[u.school_level && `${u.school_level} ${u.grade ?? ""}`, u.school_name].filter(Boolean).join(" · ") || "—"}</td>
                      <td>{u.cefr_level ?? "—"}</td>
                      <td>{u.xp}</td>
                      <td className="text-muted">{formatDate(u.created_at)}</td>
                      <td><RoleSelect userId={u.id} role={u.role} disabled={u.id === me.id} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

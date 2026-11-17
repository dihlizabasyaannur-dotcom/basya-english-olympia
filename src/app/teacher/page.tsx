import type { Metadata } from "next";
import { School, Users } from "lucide-react";
import { Badge, Card, CardBody, CardHeader, EmptyState, PageHeader, StatCard } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Teacher Dashboard" };

export default async function TeacherDashboard() {
  const profile = await requireRole(["teacher"]);
  const supabase = await createClient();
  // RLS limits every query below to this teacher's own classes and enrolled students.
  const { data: classes } = await supabase
    .from("classes")
    .select("id, name, school_level, join_code, enrollments(student_id, joined_at, profiles(id, full_name, cefr_level, xp, current_streak))")
    .eq("teacher_id", profile.id)
    .order("name");
  const studentIds = [...new Set((classes ?? []).flatMap((c) => c.enrollments.map((e) => e.student_id)))];
  const { data: attempts } = studentIds.length
    ? await supabase.from("quiz_attempts").select("student_id, score, submitted_at").in("student_id", studentIds).eq("status", "submitted")
    : { data: [] };

  const perStudent = new Map<string, { n: number; sum: number; last: string | null }>();
  for (const a of attempts ?? []) {
    const s = perStudent.get(a.student_id) ?? { n: 0, sum: 0, last: null };
    s.n++; s.sum += Number(a.score);
    if (!s.last || a.submitted_at! > s.last) s.last = a.submitted_at;
    perStudent.set(a.student_id, s);
  }
  const allScores = (attempts ?? []).map((a) => Number(a.score));
  const avg = allScores.length ? Math.round(allScores.reduce((x, y) => x + y, 0) / allScores.length) : null;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Teacher" title={`Hello, ${profile.full_name}`} description="Your classes and students. You can only see classes Ma'am Basya has assigned to you." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard label="Classes" value={classes?.length ?? 0} icon={<School className="h-5 w-5" />} />
        <StatCard label="Students" value={studentIds.length} icon={<Users className="h-5 w-5" />} />
        <StatCard label="Average quiz score" value={avg !== null ? `${avg}%` : "—"} hint={`${allScores.length} submitted quizzes`} tone="gold" />
      </div>
      {(classes ?? []).length === 0 ? (
        <EmptyState icon={<School className="h-5 w-5" />} title="No classes assigned yet" description="Ma'am Basya assigns classes from the admin dashboard." />
      ) : classes!.map((c) => (
        <Card key={c.id}>
          <CardHeader title={<>{c.name} {c.school_level && <Badge tone="neutral">{c.school_level}</Badge>}</>} description={<>Join code: <span className="font-mono font-bold tracking-widest text-brand">{c.join_code}</span> · {c.enrollments.length} student(s)</>} />
          <CardBody>
            {c.enrollments.length === 0 ? <p className="text-sm text-muted">No students yet — share the join code.</p> : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead className="text-left text-xs uppercase tracking-wide text-muted"><tr><th className="py-2">Student</th><th>CEFR</th><th>Quizzes</th><th>Average</th><th>XP / streak</th><th>Last activity</th></tr></thead>
                  <tbody className="divide-y divide-line">
                    {c.enrollments.map((e) => {
                      const s = perStudent.get(e.student_id);
                      return (
                        <tr key={e.student_id}>
                          <td className="py-2 font-semibold">{e.profiles?.full_name}</td>
                          <td>{e.profiles?.cefr_level ?? "Not placed"}</td>
                          <td>{s?.n ?? 0}</td>
                          <td>{s ? `${Math.round(s.sum / s.n)}%` : "—"}</td>
                          <td>{e.profiles?.xp} XP · {e.profiles?.current_streak}d</td>
                          <td className="text-muted">{formatDate(s?.last)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

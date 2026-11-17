import type { Metadata } from "next";
import { Activity, BookCheck, ClipboardList, GraduationCap, LibraryBig, Users } from "lucide-react";
import { Card, CardBody, CardHeader, EmptyState, PageHeader, StatCard } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { CategoryBarChart } from "@/components/charts";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin Overview" };

type Overview = {
  students: number; teachers: number; questions: number; published_questions: number; published_packages: number;
  classes: number; active_sessions: number; submitted_attempts: number; avg_score: number | null;
  questions_by_category: { name: string; total: number }[];
  signups_by_week: { week: string; total: number }[];
};

export default async function AdminOverview() {
  const profile = await requireRole(["admin"]);
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_admin_overview");
  const o = data as unknown as Overview;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Super Admin" title={`Welcome, ${profile.full_name}`} description="Platform overview from live database data." action={<LinkButton href="/admin/questions/new">New question</LinkButton>} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Students" value={o.students} icon={<GraduationCap className="h-5 w-5" />} />
        <StatCard label="Teachers" value={o.teachers} hint={`${o.classes} classes`} icon={<Users className="h-5 w-5" />} />
        <StatCard label="Questions" value={o.questions} hint={`${o.published_questions} published`} icon={<LibraryBig className="h-5 w-5" />} tone="gold" />
        <StatCard label="Published assessments" value={o.published_packages} icon={<BookCheck className="h-5 w-5" />} tone="ink" />
        <StatCard label="Active sessions" value={o.active_sessions} hint="Quizzes in progress (last 2 h)" icon={<Activity className="h-5 w-5" />} />
        <StatCard label="Completed quizzes" value={o.submitted_attempts} hint={o.avg_score !== null ? `Average score ${o.avg_score}%` : "No submissions yet"} icon={<ClipboardList className="h-5 w-5" />} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Question bank by category" description="All questions, drafts included." />
          <CardBody><CategoryBarChart unit="" data={o.questions_by_category.map((c) => ({ name: c.name, value: c.total, detail: `${c.total} questions` }))} /></CardBody>
        </Card>
        <Card>
          <CardHeader title="New accounts per week" description="Last 12 weeks." />
          <CardBody>
            {o.signups_by_week.length === 0 ? <EmptyState title="No sign-ups yet" /> : (
              <CategoryBarChart unit="" data={o.signups_by_week.map((w) => ({ name: `Week of ${formatDate(w.week)}`, value: w.total, detail: `${w.total} new accounts` }))} />
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

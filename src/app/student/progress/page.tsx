import type { Metadata } from "next";
import { LineChart } from "lucide-react";
import { Card, CardBody, CardHeader, EmptyState, PageHeader, StatCard } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { CategoryBarChart, ScoreTrendChart } from "@/components/charts";
import { CefrPathway } from "@/components/student/cefr-pathway";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { CefrLevel } from "@/lib/constants";
import { pct } from "@/lib/utils";
import type { StudentStats } from "@/lib/types";

export const metadata: Metadata = { title: "My Progress" };

export default async function ProgressPage() {
  const profile = await requireRole(["student"]);
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_student_stats");
  const stats = data as unknown as StudentStats;

  if (stats.totals.attempts === 0) {
    return (
      <div>
        <PageHeader eyebrow="Analytics" title="My progress" />
        <EmptyState icon={<LineChart className="h-5 w-5" />} title="No data yet" description="Your analytics are built only from your real answers. Finish a quiz to see your progress." action={<LinkButton href="/student/learn">Start a quiz</LinkButton>} />
      </div>
    );
  }

  const skills = stats.by_category.map((c) => ({ ...c, accuracy: pct(c.correct, c.answered) }));
  const evidence = skills.filter((s) => s.answered >= 3);
  const strengths = [...evidence].sort((a, b) => b.accuracy - a.accuracy).filter((s) => s.accuracy >= 70).slice(0, 3);
  const weaknesses = [...evidence].sort((a, b) => a.accuracy - b.accuracy).filter((s) => s.accuracy < 70).slice(0, 3);
  const trend = stats.trend.map((t, i) => ({ label: `#${i + 1}`, title: t.title, score: Math.round(Number(t.score)) }));

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Analytics" title="My progress" description="Every number here comes from your own submitted quizzes." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Average score" value={`${stats.totals.avg_score ?? 0}%`} />
        <StatCard label="Best score" value={`${Math.round(Number(stats.totals.best_score ?? 0))}%`} />
        <StatCard label="Quizzes passed" value={`${stats.totals.passed}/${stats.totals.attempts}`} />
        <StatCard label="Questions answered" value={stats.answers.answered} hint={`${pct(stats.answers.correct, stats.answers.answered)}% correct`} />
      </div>

      <Card>
        <CardHeader title="CEFR progress" description="Accuracy at each level you have practised." />
        <CardBody><CefrPathway current={profile.cefr_level as CefrLevel | null} byLevel={stats.by_level} /></CardBody>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Score trend" description={`Your last ${trend.length} submitted quizzes, oldest to newest.`} />
          <CardBody><ScoreTrendChart data={trend} /></CardBody>
        </Card>
        <Card>
          <CardHeader title="Skill performance" description="Accuracy by question category." />
          <CardBody>
            <CategoryBarChart max={100} data={skills.map((s) => ({ name: s.name, value: s.accuracy, detail: `${s.accuracy}% · ${s.correct}/${s.answered} correct` }))} />
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader title="Strengths" description="Skills at 70%+ accuracy (min. 3 answers)." />
          <CardBody>
            {strengths.length ? (
              <ul className="space-y-2">{strengths.map((s) => <li key={s.slug} className="flex justify-between rounded-xl bg-success-50 px-3 py-2 text-sm"><span className="font-semibold">{s.name}</span><span>{s.accuracy}%</span></li>)}</ul>
            ) : <p className="text-sm text-muted">Keep practising — strengths appear once you reach 70% in a skill.</p>}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Focus areas" description="Skills below 70% accuracy — recommended practice." />
          <CardBody>
            {weaknesses.length ? (
              <ul className="space-y-2">{weaknesses.map((s) => <li key={s.slug} className="flex justify-between rounded-xl bg-warning-50 px-3 py-2 text-sm"><span className="font-semibold">{s.name}</span><span>{s.accuracy}%</span></li>)}</ul>
            ) : <p className="text-sm text-muted">No weak areas detected yet. Great work!</p>}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

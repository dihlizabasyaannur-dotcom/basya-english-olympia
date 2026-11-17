import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, ClipboardList, Flame, GraduationCap, Sparkles, Star, Target, Trophy } from "lucide-react";
import { Badge, Card, CardBody, CardHeader, EmptyState, ProgressBar, StatCard } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { Alert } from "@/components/ui/field";
import { CefrPathway } from "@/components/student/cefr-pathway";
import { StartQuizButton } from "@/components/student/start-quiz-button";
import { BadgeIcon } from "@/components/student/badge-icon";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { CEFR_META, type CefrLevel } from "@/lib/constants";
import { buildRecommendations } from "@/lib/recommendations";
import { formatDate, pct } from "@/lib/utils";
import type { StudentStats } from "@/lib/types";

export const metadata: Metadata = { title: "Dashboard" };

export default async function StudentDashboard({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const { welcome } = await searchParams;
  const profile = await requireRole(["student"]);
  const supabase = await createClient();

  const [statsRes, recentRes, achievementsRes, earnedRes, diagRes, progressRes] = await Promise.all([
    supabase.rpc("get_student_stats"),
    supabase.from("quiz_attempts").select("id, title, score, passed, submitted_at, mode").eq("student_id", profile.id).eq("status", "submitted").order("submitted_at", { ascending: false }).limit(5),
    supabase.from("achievements").select("*").order("id"),
    supabase.from("student_achievements").select("achievement_id, earned_at").eq("student_id", profile.id),
    supabase.from("quiz_packages").select("id").eq("assessment_type", "diagnostic").eq("status", "published").limit(1).maybeSingle(),
    supabase.from("quiz_attempts").select("id, title").eq("student_id", profile.id).eq("status", "in_progress").order("started_at", { ascending: false }).limit(1).maybeSingle(),
  ]);

  const stats = statsRes.data as unknown as StudentStats;
  const level = profile.cefr_level as CefrLevel | null;
  const earned = new Map((earnedRes.data ?? []).map((e) => [e.achievement_id, e.earned_at]));
  const achievements = achievementsRes.data ?? [];
  const recent = recentRes.data ?? [];
  const recs = buildRecommendations({
    level,
    schoolLevel: profile.school_level,
    stats,
    diagnosticPackageId: diagRes.data?.id ?? null,
    inProgress: progressRes.data ?? null,
  });
  const accuracy = pct(stats.answers.correct, stats.answers.answered);
  const firstName = profile.full_name.split(" ")[0] || "there";

  return (
    <div className="space-y-6">
      {welcome && <Alert tone="success">Welcome to Basya English Olympia! Start with the placement test to find your level.</Alert>}

      {/* Welcome + profile */}
      <section className="bg-hero relative overflow-hidden rounded-[1.5rem] p-6 text-white sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white/10 font-display text-2xl font-semibold text-gold ring-1 ring-white/15">
              {profile.full_name.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <p className="text-sm text-lavender/80">Welcome back,</p>
              <h1 className="font-display text-2xl font-semibold sm:text-3xl">{firstName} 👋</h1>
              <p className="mt-1 text-sm text-lavender/80">
                {[profile.school_level && `${profile.school_level} · Grade ${profile.grade}`, profile.school_name].filter(Boolean).join(" · ") || "Complete your profile"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-white/[0.07] p-3 ring-1 ring-white/10">
            <span className="grid h-14 w-14 place-items-center rounded-xl bg-gold font-display text-xl font-semibold text-ink">{level ?? "?"}</span>
            <div>
              <p className="text-xs uppercase tracking-wide text-lavender/70">Current CEFR level</p>
              <p className="font-semibold">{level ? CEFR_META[level].name : "Not placed yet"}</p>
              {profile.cefr_placed_at && <p className="text-xs text-lavender/60">Placed {formatDate(profile.cefr_placed_at)}</p>}
            </div>
          </div>
        </div>
      </section>

      {/* Key stats (all from real data) */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="XP points" value={profile.xp.toLocaleString()} icon={<Star className="h-5 w-5" />} tone="gold" />
        <StatCard label="Day streak" value={profile.current_streak} hint={`Best: ${profile.longest_streak} day${profile.longest_streak === 1 ? "" : "s"}`} icon={<Flame className="h-5 w-5" />} tone="ink" />
        <StatCard label="Quizzes done" value={stats.totals.attempts} hint={stats.totals.avg_score !== null ? `Average score ${stats.totals.avg_score}%` : "No quizzes yet"} icon={<ClipboardList className="h-5 w-5" />} />
        <StatCard label="Accuracy" value={stats.answers.answered ? `${accuracy}%` : "—"} hint={`${stats.answers.correct}/${stats.answers.answered} correct answers`} icon={<Target className="h-5 w-5" />} />
      </section>

      {/* CEFR pathway */}
      <Card>
        <CardHeader title="Your CEFR pathway" description="A1 → A2 → B1 → B2. Your level comes from the placement test, not your school grade." action={<LinkButton href="/student/learn" variant="secondary" size="sm">All levels</LinkButton>} />
        <CardBody><CefrPathway current={level} byLevel={stats.by_level} /></CardBody>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Recommendations */}
        <Card>
          <CardHeader title="Recommended next" description="Based on your own results." />
          <CardBody className="space-y-3">
            {recs.map((r) => (
              <div key={r.key} className="flex flex-col gap-3 rounded-2xl border border-line p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-lavender text-brand"><Sparkles className="h-5 w-5" /></div>
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">{r.title}</p>
                    <p className="text-sm text-muted">{r.reason}</p>
                  </div>
                </div>
                {"href" in r.action ? (
                  <LinkButton href={r.action.href} size="sm" variant="secondary" className="shrink-0">{r.cta} <ArrowRight className="h-4 w-4" /></LinkButton>
                ) : "packageId" in r.action ? (
                  <StartQuizButton packageId={r.action.packageId} size="sm" className="shrink-0">{r.cta}</StartQuizButton>
                ) : (
                  <StartQuizButton practice={r.action.practice} size="sm" className="shrink-0">{r.cta}</StartQuizButton>
                )}
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Quick access */}
        <Card>
          <CardHeader title="Learning programs" />
          <CardBody className="space-y-3">
            <Link href="/student/learn#proficiency" className="flex items-center gap-4 rounded-2xl bg-lavender-50 p-4 transition-colors hover:bg-lavender">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand text-white"><GraduationCap className="h-5 w-5" /></div>
              <div className="flex-1"><p className="font-semibold">English Proficiency</p><p className="text-xs text-muted">A1 · A2 · B1 · B2</p></div>
              <ArrowRight className="h-4 w-4 text-brand" />
            </Link>
            <Link href="/student/learn#olympiad" className="flex items-center gap-4 rounded-2xl bg-gold-50 p-4 transition-colors hover:bg-[#f6ecc9]">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gold text-ink"><Trophy className="h-5 w-5" /></div>
              <div className="flex-1"><p className="font-semibold">English Olympiad</p><p className="text-xs text-muted">SMP · SMA tracks</p></div>
              <ArrowRight className="h-4 w-4 text-gold-600" />
            </Link>
            <Link href="/student/assessments" className="flex items-center gap-4 rounded-2xl border border-line p-4 transition-colors hover:bg-lavender-50">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-ink text-gold"><BookOpen className="h-5 w-5" /></div>
              <div className="flex-1"><p className="font-semibold">Assessments</p><p className="text-xs text-muted">Placement, simulations & tests</p></div>
              <ArrowRight className="h-4 w-4 text-ink" />
            </Link>
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent results */}
        <Card>
          <CardHeader title="Recent quiz results" action={recent.length > 0 && <LinkButton href="/student/history" variant="ghost" size="sm">View all</LinkButton>} />
          <CardBody>
            {recent.length === 0 ? (
              <EmptyState icon={<ClipboardList className="h-5 w-5" />} title="No results yet" description="Finish your first quiz to see your scores here." />
            ) : (
              <ul className="divide-y divide-line">
                {recent.map((a) => (
                  <li key={a.id}>
                    <Link href={`/student/results/${a.id}`} className="flex items-center justify-between gap-3 py-3 hover:text-brand">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{a.title}</p>
                        <p className="text-xs text-muted">{formatDate(a.submitted_at, true)} · {a.mode === "exam" ? "Exam" : "Practice"}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <ProgressBar value={Number(a.score)} className="hidden w-20 sm:block" tone={a.passed ? "success" : "brand"} label={`Score ${a.score}%`} />
                        <Badge tone={a.passed ? "success" : "neutral"}>{Math.round(Number(a.score))}%</Badge>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        {/* Badges */}
        <Card>
          <CardHeader title="Achievement badges" description={`${earned.size} of ${achievements.length} earned`} />
          <CardBody>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {achievements.map((a) => {
                const got = earned.get(a.id);
                return (
                  <li key={a.id} className={`rounded-2xl border p-3 text-center ${got ? "border-gold/60 bg-gold-50" : "border-line bg-white opacity-70"}`} title={a.description}>
                    <div className={`mx-auto grid h-11 w-11 place-items-center rounded-full ${got ? "bg-gold text-ink" : "bg-[#f1eff7] text-muted"}`}>
                      <BadgeIcon icon={a.icon} className="h-5 w-5" />
                    </div>
                    <p className="mt-2 text-xs font-semibold text-ink">{a.name}</p>
                    <p className="mt-0.5 text-[11px] leading-tight text-muted">{got ? `Earned ${formatDate(got)}` : a.description}</p>
                  </li>
                );
              })}
            </ul>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

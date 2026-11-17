import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2, MinusCircle, RotateCcw, Star, Trophy, XCircle } from "lucide-react";
import { Badge, Card, CardBody, CardHeader, PageHeader, ProgressBar } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { BadgeIcon } from "@/components/student/badge-icon";
import { StartQuizButton } from "@/components/student/start-quiz-button";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { CEFR_META } from "@/lib/constants";
import { cn, formatDate, pct } from "@/lib/utils";
import type { AttemptData } from "@/lib/types";

export const metadata: Metadata = { title: "Results" };
const LETTERS = ["A", "B", "C", "D"];

export default async function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await requireRole(["student"]);
  const supabase = await createClient();
  const { data: res, error } = await supabase.rpc("get_attempt", { p_attempt_id: id });
  if (error || !res) notFound();
  const { attempt, questions } = res as unknown as AttemptData;
  if (attempt.status !== "submitted") redirect(`/student/quiz/${id}`);

  // Badges earned when this attempt was submitted
  const submitted = new Date(attempt.submitted_at!).getTime();
  const { data: badges } = await supabase
    .from("student_achievements")
    .select("earned_at, achievements(name, description, icon, xp_reward)")
    .eq("student_id", profile.id)
    .gte("earned_at", new Date(submitted - 5000).toISOString())
    .lte("earned_at", new Date(submitted + 5000).toISOString());

  const score = Math.round(Number(attempt.score));
  const bySkill = new Map<string, { total: number; correct: number }>();
  for (const q of questions) {
    const s = bySkill.get(q.category) ?? { total: 0, correct: 0 };
    s.total++;
    if (q.feedback?.is_correct) s.correct++;
    bySkill.set(q.category, s);
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Results" title={attempt.title} description={`Submitted ${formatDate(attempt.submitted_at, true)} · ${attempt.mode === "exam" ? "Exam mode" : "Practice mode"}`} />

      <div className="grid gap-4 md:grid-cols-[1.1fr_1fr]">
        <Card className="bg-hero border-none p-6 text-white sm:p-8">
          <div className="flex items-center gap-6">
            <div className="relative grid h-28 w-28 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(#E5C779 ${score * 3.6}deg, rgb(255 255 255 / 0.12) 0deg)` }} aria-label={`Score ${score}%`}>
              <div className="grid h-[5.5rem] w-[5.5rem] place-items-center rounded-full bg-ink">
                <span className="font-display text-3xl font-semibold">{score}%</span>
              </div>
            </div>
            <div>
              <p className={cn("text-sm font-semibold", attempt.passed ? "text-gold" : "text-lavender/80")}>{attempt.passed ? "Passed 🎉" : `Pass mark ${attempt.passing_score}% — keep going!`}</p>
              <p className="mt-1 text-2xl font-semibold">{attempt.correct_count} / {attempt.total_questions} correct</p>
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-sm"><Star className="h-4 w-4 text-gold" /> +{attempt.xp_earned} XP</p>
            </div>
          </div>
          {attempt.placement_result && (
            <div className="mt-6 rounded-2xl bg-white/[0.08] p-4">
              <p className="text-xs uppercase tracking-wide text-lavender/70">Your placement</p>
              <p className="mt-1 text-lg font-semibold"><span className="text-gold">{attempt.placement_result}</span> · {CEFR_META[attempt.placement_result].name}</p>
              <p className="mt-1 text-sm text-lavender/80">{CEFR_META[attempt.placement_result].canDo}</p>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Skill breakdown" />
          <CardBody className="space-y-3">
            {[...bySkill.entries()].map(([skill, s]) => (
              <div key={skill}>
                <div className="mb-1 flex justify-between text-sm"><span className="font-medium">{skill}</span><span className="text-muted">{s.correct}/{s.total} · {pct(s.correct, s.total)}%</span></div>
                <ProgressBar value={pct(s.correct, s.total)} tone={pct(s.correct, s.total) >= 70 ? "success" : "brand"} label={`${skill} accuracy`} />
              </div>
            ))}
            {(badges ?? []).length > 0 && (
              <div className="mt-4 space-y-2 border-t border-line pt-4">
                <p className="text-sm font-semibold">New badges</p>
                {badges!.map((b, i) => b.achievements && (
                  <div key={i} className="flex items-center gap-3 rounded-xl bg-gold-50 p-2.5">
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-gold text-ink"><BadgeIcon icon={b.achievements.icon} className="h-4 w-4" /></div>
                    <div className="text-sm"><p className="font-semibold">{b.achievements.name} <span className="text-gold-600">+{b.achievements.xp_reward} XP</span></p><p className="text-xs text-muted">{b.achievements.description}</p></div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <LinkButton href="/student" variant="secondary">Back to dashboard</LinkButton>
        {attempt.placement_result && <LinkButton href={`/student/learn/proficiency/${CEFR_META[attempt.placement_result].slug}`}><Trophy className="h-4 w-4" /> Go to my level</LinkButton>}
        {attempt.learning_mode === "proficiency" && !attempt.placement_result && (
          <StartQuizButton practice={{ p_learning_mode: "proficiency", p_cefr: questions[0]?.cefr_level ?? undefined, p_count: attempt.total_questions, p_mode: attempt.mode }} variant="primary">
            <RotateCcw className="h-4 w-4" /> Try another set
          </StartQuizButton>
        )}
      </div>

      {/* Answer review */}
      <Card>
        <CardHeader title="Answer review" description="Every question with the correct answer and explanation." />
        <CardBody>
          <ol className="space-y-4">
            {questions.map((q, i) => {
              const fb = q.feedback!;
              const status = !q.selected_option_id ? "skipped" : fb.is_correct ? "correct" : "wrong";
              return (
                <li key={q.id} className="rounded-2xl border border-line p-4 sm:p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-ink">Q{i + 1}</span>
                    {status === "correct" && <Badge tone="success"><CheckCircle2 className="h-3.5 w-3.5" /> Correct</Badge>}
                    {status === "wrong" && <Badge tone="danger"><XCircle className="h-3.5 w-3.5" /> Incorrect</Badge>}
                    {status === "skipped" && <Badge tone="warning"><MinusCircle className="h-3.5 w-3.5" /> Not answered</Badge>}
                    <Badge tone="neutral">{q.category}</Badge>
                    {q.cefr_level && <Badge tone="neutral">{q.cefr_level}</Badge>}
                  </div>
                  {q.passage && <p className="mt-3 whitespace-pre-line rounded-xl bg-gold-50/60 p-3 text-sm">{q.passage}</p>}
                  <p className="mt-3 font-semibold">{q.question_text}</p>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {q.options.map((o, j) => {
                      const correct = o.id === fb.correct_option_id;
                      const picked = o.id === q.selected_option_id;
                      return (
                        <li key={o.id} className={cn("flex items-start gap-2 rounded-xl border px-3 py-2 text-sm", correct ? "border-success bg-success-50" : picked ? "border-danger bg-danger-50" : "border-line")}>
                          <span className="font-bold">{LETTERS[j]}.</span>
                          <span className="flex-1">{o.text}</span>
                          {picked && <span className="text-xs font-semibold text-muted">Your answer</span>}
                        </li>
                      );
                    })}
                  </ul>
                  <div className="mt-3 space-y-1.5 text-sm">
                    <p><strong>Explanation:</strong> {fb.explanation}</p>
                    {fb.distractor_analysis && <p className="text-ink/80"><strong>Distractor analysis:</strong> {fb.distractor_analysis}</p>}
                    {fb.learning_objective && <p className="text-xs text-muted">Learning objective: {fb.learning_objective}{fb.skill_assessed ? ` · Skill: ${fb.skill_assessed}` : ""}</p>}
                  </div>
                </li>
              );
            })}
          </ol>
        </CardBody>
      </Card>
    </div>
  );
}

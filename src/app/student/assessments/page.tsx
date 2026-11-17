import type { Metadata } from "next";
import { ClipboardCheck, Clock } from "lucide-react";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui/card";
import { StartQuizButton } from "@/components/student/start-quiz-button";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ASSESSMENT_TYPES } from "@/lib/constants";

export const metadata: Metadata = { title: "Assessments" };

export default async function AssessmentsPage() {
  const profile = await requireRole(["student"]);
  const supabase = await createClient();
  const [{ data: packages }, { data: attempts }] = await Promise.all([
    supabase.from("quiz_packages").select("*").eq("status", "published").order("assessment_type").order("title"),
    supabase.from("quiz_attempts").select("package_id, score, submitted_at").eq("student_id", profile.id).eq("status", "submitted").not("package_id", "is", null).order("submitted_at", { ascending: false }),
  ]);
  const best = new Map<string, number>();
  for (const a of attempts ?? []) best.set(a.package_id!, Math.max(best.get(a.package_id!) ?? 0, Number(a.score)));

  // Show the student's own school track first; hide the other track's simulations
  const visible = (packages ?? []).filter((p) => !p.school_level || !profile.school_level || p.school_level === profile.school_level);

  return (
    <div>
      <PageHeader eyebrow="Assessments" title="Assessments & simulations" description="Configured by Ma'am Basya. Exam-mode assessments reveal answers and explanations only after you submit." />
      {visible.length === 0 ? (
        <EmptyState icon={<ClipboardCheck className="h-5 w-5" />} title="No assessments published yet" description="Check back soon — new assessments will appear here." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {visible.map((p) => (
            <Card key={p.id} className="flex flex-col p-6">
              <div className="flex flex-wrap gap-2">
                <Badge tone={p.assessment_type === "diagnostic" ? "gold" : p.assessment_type === "olympiad_simulation" ? "ink" : "lavender"}>{ASSESSMENT_TYPES[p.assessment_type]}</Badge>
                {p.target_cefr && <Badge tone="neutral">{p.target_cefr}</Badge>}
                {p.school_level && <Badge tone="neutral">{p.school_level}</Badge>}
              </div>
              <h2 className="mt-3 text-lg font-bold">{p.title}</h2>
              <p className="mt-1 flex-1 text-sm text-muted">{p.description}</p>
              <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-muted">
                <Clock className="h-3.5 w-3.5" /> {p.question_count} questions · {p.time_limit_minutes ? `${p.time_limit_minutes} min` : "untimed"} · pass {p.passing_score}%
              </p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="text-sm text-muted">{best.has(p.id) ? <>Best score: <strong className="text-ink">{Math.round(best.get(p.id)!)}%</strong></> : "Not attempted yet"}</span>
                <StartQuizButton packageId={p.id} variant={p.assessment_type === "diagnostic" ? "gold" : "primary"} size="sm">{best.has(p.id) ? "Retake" : "Start"}</StartQuizButton>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

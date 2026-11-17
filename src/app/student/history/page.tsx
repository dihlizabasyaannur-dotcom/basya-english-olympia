import type { Metadata } from "next";
import Link from "next/link";
import { History } from "lucide-react";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ASSESSMENT_TYPES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "History" };
const PAGE = 20;

export default async function HistoryPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const profile = await requireRole(["student"]);
  const supabase = await createClient();
  const { data, count } = await supabase
    .from("quiz_attempts")
    .select("id, title, status, mode, assessment_type, score, passed, total_questions, correct_count, xp_earned, started_at, submitted_at", { count: "exact" })
    .eq("student_id", profile.id)
    .order("started_at", { ascending: false })
    .range((page - 1) * PAGE, page * PAGE - 1);
  const rows = data ?? [];
  const pages = Math.max(1, Math.ceil((count ?? 0) / PAGE));

  return (
    <div>
      <PageHeader eyebrow="Learning history" title="Your quiz history" description={`${count ?? 0} attempts in total.`} />
      {rows.length === 0 ? (
        <EmptyState icon={<History className="h-5 w-5" />} title="No quizzes yet" description="Your attempts will be listed here." action={<LinkButton href="/student/learn">Start learning</LinkButton>} />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-lavender-50 text-left text-xs uppercase tracking-wide text-muted">
                <tr><th className="px-5 py-3">Quiz</th><th className="px-3 py-3">Type</th><th className="px-3 py-3">Date</th><th className="px-3 py-3">Score</th><th className="px-3 py-3">XP</th><th className="px-5 py-3 text-right">Action</th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((a) => (
                  <tr key={a.id}>
                    <td className="px-5 py-3 font-semibold">{a.title}</td>
                    <td className="px-3 py-3"><Badge tone="neutral">{ASSESSMENT_TYPES[a.assessment_type]} · {a.mode === "exam" ? "Exam" : "Practice"}</Badge></td>
                    <td className="px-3 py-3 text-muted">{formatDate(a.submitted_at ?? a.started_at, true)}</td>
                    <td className="px-3 py-3">
                      {a.status === "submitted" ? <Badge tone={a.passed ? "success" : "neutral"}>{Math.round(Number(a.score))}% · {a.correct_count}/{a.total_questions}</Badge> : <Badge tone="warning">In progress</Badge>}
                    </td>
                    <td className="px-3 py-3 text-muted">{a.status === "submitted" ? `+${a.xp_earned}` : "—"}</td>
                    <td className="px-5 py-3 text-right">
                      <Link href={a.status === "submitted" ? `/student/results/${a.id}` : `/student/quiz/${a.id}`} className="font-semibold text-brand hover:underline">
                        {a.status === "submitted" ? "Review" : "Resume"}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pages > 1 && (
            <div className="flex items-center justify-between border-t border-line px-5 py-3 text-sm">
              <span className="text-muted">Page {page} of {pages}</span>
              <div className="flex gap-2">
                {page > 1 && <LinkButton href={`?page=${page - 1}`} variant="secondary" size="sm">Previous</LinkButton>}
                {page < pages && <LinkButton href={`?page=${page + 1}`} variant="secondary" size="sm">Next</LinkButton>}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

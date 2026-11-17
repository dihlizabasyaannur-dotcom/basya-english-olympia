"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Clock, Flag, Loader2, XCircle } from "lucide-react";
import { Badge, Card, ProgressBar } from "@/components/ui/card";
import { Button, LinkButton } from "@/components/ui/button";
import { Alert } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import { cn, friendlyError } from "@/lib/utils";
import type { AttemptData, Feedback } from "@/lib/types";

const LETTERS = ["A", "B", "C", "D"];

export function QuizPlayer({ attemptId }: { attemptId: string }) {
  const router = useRouter();
  const toast = useToast();
  const supabase = useMemo(() => createClient(), []);

  const [data, setData] = useState<AttemptData | null>(null);
  const [loadError, setLoadError] = useState<string>();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, Feedback>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const submittedRef = useRef(false);

  // ---------- Load ----------
  useEffect(() => {
    (async () => {
      const { data: res, error } = await supabase.rpc("get_attempt", { p_attempt_id: attemptId });
      if (error || !res) return setLoadError(friendlyError(error?.message));
      const d = res as unknown as AttemptData;
      if (d.attempt.status === "submitted") return router.replace(`/student/results/${attemptId}`);
      setData(d);
      setAnswers(Object.fromEntries(d.questions.filter((q) => q.selected_option_id).map((q) => [q.id, q.selected_option_id!])));
      setFeedback(Object.fromEntries(d.questions.filter((q) => q.feedback).map((q) => [q.id, q.feedback!])));
      const firstOpen = d.questions.findIndex((q) => !q.selected_option_id);
      setIndex(firstOpen === -1 ? 0 : firstOpen);
    })();
  }, [attemptId, router, supabase]);

  // ---------- Submit ----------
  const submit = useCallback(async (auto = false) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    const { error } = await supabase.rpc("submit_attempt", { p_attempt_id: attemptId });
    if (error) {
      submittedRef.current = false;
      setSubmitting(false);
      toast(friendlyError(error.message), "error");
      return;
    }
    if (auto) toast("Time is up! Your answers were submitted automatically.", "info");
    router.replace(`/student/results/${attemptId}`);
  }, [attemptId, router, supabase, toast]);

  // ---------- Countdown (synced to server clock) ----------
  useEffect(() => {
    if (!data?.attempt.expires_at) return;
    const offset = new Date(data.attempt.server_now).getTime() - Date.now();
    const end = new Date(data.attempt.expires_at).getTime();
    const tick = () => {
      const left = Math.max(0, Math.round((end - (Date.now() + offset)) / 1000));
      setRemaining(left);
      if (left === 0) submit(true);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [data, submit]);

  if (loadError) {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-10">
        <Alert>{loadError}</Alert>
        <LinkButton href="/student" variant="secondary">Back to dashboard</LinkButton>
      </div>
    );
  }
  if (!data) {
    return <div className="flex items-center justify-center gap-2 py-24 text-muted"><Loader2 className="h-5 w-5 animate-spin" /> Loading your quiz…</div>;
  }

  const { attempt, questions } = data;
  const isPractice = attempt.mode === "practice";
  const q = questions[index];
  const answeredCount = Object.keys(answers).length;
  const fb = feedback[q.id];
  const locked = isPractice && !!fb;

  async function choose(optionId: string) {
    if (locked || saving || submitting) return;
    const previous = answers[q.id];
    setAnswers((a) => ({ ...a, [q.id]: optionId }));
    setSaving(q.id);
    const { data: res, error } = await supabase.rpc("answer_question", { p_attempt_id: attemptId, p_question_id: q.id, p_option_id: optionId });
    setSaving(null);
    if (error) {
      setAnswers((a) => {
        const next = { ...a };
        if (previous) next[q.id] = previous; else delete next[q.id];
        return next;
      });
      toast(friendlyError(error.message), "error");
      if (error.message.includes("TIME_IS_UP")) submit(true);
      return;
    }
    const r = res as { feedback?: Feedback };
    if (r.feedback) setFeedback((f) => ({ ...f, [q.id]: r.feedback! }));
  }

  const toggleFlag = () =>
    setFlagged((s) => {
      const n = new Set(s);
      if (n.has(q.id)) n.delete(q.id); else n.add(q.id);
      return n;
    });

  const mm = remaining !== null ? `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}` : null;

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={isPractice ? "lavender" : "ink"}>{isPractice ? "Practice mode" : "Exam mode"}</Badge>
            <Badge tone="neutral">{q.category}</Badge>
            {q.cefr_level && <Badge tone="neutral">{q.cefr_level}</Badge>}
          </div>
          <h1 className="mt-2 truncate font-display text-xl font-semibold text-ink sm:text-2xl">{attempt.title}</h1>
        </div>
        {mm && (
          <div className={cn("flex items-center gap-2 rounded-xl px-3 py-2 font-mono text-lg font-semibold", remaining! <= 60 ? "bg-danger-50 text-danger" : "bg-lavender text-ink")} role="timer" aria-live={remaining! <= 60 ? "assertive" : "off"}>
            <Clock className="h-4 w-4" /> {mm}
          </div>
        )}
      </div>

      <div className="mb-5 flex items-center gap-3">
        <ProgressBar value={(answeredCount / questions.length) * 100} label="Quiz progress" />
        <span className="shrink-0 text-xs font-semibold text-muted">{answeredCount}/{questions.length} answered</span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_220px]">
        <Card className="p-5 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">Question {index + 1} of {questions.length}</p>
          {q.passage && (
            <div className="mt-4 whitespace-pre-line rounded-2xl border-l-4 border-gold bg-gold-50/60 p-4 text-[15px] leading-relaxed text-ink">{q.passage}</div>
          )}
          <p className="mt-4 text-lg font-semibold leading-snug text-ink">{q.question_text}</p>

          <ul className="mt-5 space-y-2.5" role="radiogroup" aria-label="Answer options">
            {q.options.map((o, i) => {
              const selected = answers[q.id] === o.id;
              const isCorrect = fb && fb.correct_option_id === o.id;
              const isWrongPick = fb && selected && !fb.is_correct;
              return (
                <li key={o.id}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    disabled={locked || submitting}
                    onClick={() => choose(o.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl border-2 p-3.5 text-left text-[15px] transition-colors",
                      !fb && selected && "border-brand bg-lavender-50",
                      !fb && !selected && "border-line hover:border-brand/40 hover:bg-lavender-50/50",
                      isCorrect && "border-success bg-success-50",
                      isWrongPick && "border-danger bg-danger-50",
                      fb && !isCorrect && !isWrongPick && "border-line opacity-70",
                    )}
                  >
                    <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm font-bold", selected || isCorrect ? "bg-brand text-white" : "bg-lavender text-brand", isCorrect && "bg-success", isWrongPick && "bg-danger")}>
                      {LETTERS[i]}
                    </span>
                    <span className="flex-1 text-ink">{o.text}</span>
                    {saving === q.id && selected && <Loader2 className="h-4 w-4 animate-spin text-brand" />}
                    {isCorrect && <CheckCircle2 className="h-5 w-5 text-success" />}
                    {isWrongPick && <XCircle className="h-5 w-5 text-danger" />}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Practice feedback */}
          {fb && (
            <div className={cn("mt-5 rounded-2xl p-4", fb.is_correct ? "bg-success-50" : "bg-danger-50")} role="status">
              <p className={cn("flex items-center gap-2 font-semibold", fb.is_correct ? "text-success" : "text-danger")}>
                {fb.is_correct ? <><CheckCircle2 className="h-5 w-5" /> Correct! +2 XP when you finish</> : <><XCircle className="h-5 w-5" /> Not quite — the correct answer is {LETTERS[q.options.findIndex((o) => o.id === fb.correct_option_id)]}.</>}
              </p>
              <p className="mt-2 text-sm text-ink"><strong>Explanation:</strong> {fb.explanation}</p>
              {fb.distractor_analysis && <p className="mt-1.5 text-sm text-ink/80"><strong>Why not the others:</strong> {fb.distractor_analysis}</p>}
            </div>
          )}
          {!isPractice && <p className="mt-4 text-xs text-muted">Exam mode: you can change answers until you submit. Results and explanations appear after submission.</p>}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
            <Button variant="secondary" onClick={() => setIndex((i) => i - 1)} disabled={index === 0}><ChevronLeft className="h-4 w-4" /> Previous</Button>
            {!isPractice && (
              <Button variant="ghost" size="sm" onClick={toggleFlag} aria-pressed={flagged.has(q.id)}>
                <Flag className={cn("h-4 w-4", flagged.has(q.id) && "fill-gold text-gold-600")} /> {flagged.has(q.id) ? "Flagged" : "Flag for review"}
              </Button>
            )}
            {index < questions.length - 1 ? (
              <Button onClick={() => setIndex((i) => i + 1)}>Next <ChevronRight className="h-4 w-4" /></Button>
            ) : (
              <Button variant="gold" onClick={() => setConfirmOpen(true)}>Finish & submit</Button>
            )}
          </div>
        </Card>

        {/* Navigator */}
        <Card className="h-fit p-4 lg:sticky lg:top-6">
          <p className="text-sm font-semibold text-ink">Questions</p>
          <ol className="mt-3 grid grid-cols-6 gap-1.5 sm:grid-cols-10 lg:grid-cols-5">
            {questions.map((qq, i) => {
              const f = feedback[qq.id];
              return (
                <li key={qq.id}>
                  <button
                    onClick={() => setIndex(i)}
                    aria-label={`Question ${i + 1}${answers[qq.id] ? ", answered" : ""}${flagged.has(qq.id) ? ", flagged" : ""}`}
                    aria-current={i === index ? "step" : undefined}
                    className={cn(
                      "relative grid h-9 w-full place-items-center rounded-lg text-xs font-bold transition-colors",
                      i === index && "ring-2 ring-brand ring-offset-1",
                      f ? (f.is_correct ? "bg-success text-white" : "bg-danger text-white") : answers[qq.id] ? "bg-brand text-white" : "bg-lavender text-ink hover:bg-[#e2d9ff]",
                    )}
                  >
                    {i + 1}
                    {flagged.has(qq.id) && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-gold ring-2 ring-white" />}
                  </button>
                </li>
              );
            })}
          </ol>
          <Button variant="gold" className="mt-4 w-full" onClick={() => setConfirmOpen(true)} disabled={submitting}>Submit quiz</Button>
          <p className="mt-2 text-center text-xs text-muted">Pass mark: {attempt.passing_score}%</p>
        </Card>
      </div>

      {/* Submit confirmation */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
          <Card className="w-full max-w-md p-6">
            <h2 id="confirm-title" className="font-display text-xl font-semibold">Submit your quiz?</h2>
            <p className="mt-2 text-sm text-muted">You answered <strong className="text-ink">{answeredCount}</strong> of {questions.length} questions.</p>
            {answeredCount < questions.length && (
              <Alert tone="warning" className="mt-3 flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {questions.length - answeredCount} unanswered question(s) will be marked incorrect.
              </Alert>
            )}
            {flagged.size > 0 && <p className="mt-2 text-sm text-warning">{flagged.size} question(s) are flagged for review.</p>}
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setConfirmOpen(false)} disabled={submitting}>Keep working</Button>
              <Button variant="primary" onClick={() => submit(false)} loading={submitting}>Yes, submit</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

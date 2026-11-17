"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { CATEGORIES, CEFR_LEVELS, DIFFICULTIES } from "@/lib/constants";
import { questionSchema, type QuestionInput } from "@/lib/validation";
import { saveQuestion } from "../actions";

export function QuestionForm({ initial }: { initial?: QuestionInput }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<QuestionInput>({
    resolver: zodResolver(questionSchema),
    defaultValues: initial ?? { learning_mode: "proficiency", difficulty: "medium", status: "draft", correct_answer: "A", category: "grammar", cefr_level: "A1", school_level: "" },
  });
  const mode = watch("learning_mode");
  const correct = watch("correct_answer");

  const onSubmit = (v: QuestionInput) =>
    start(async () => {
      const res = await saveQuestion({ ...v, id: initial?.id });
      if (res.error) return toast(res.error, "error");
      toast(initial ? "Question updated." : "Question created.");
      router.push("/admin/questions");
      router.refresh();
    });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <Card>
        <CardHeader title="Classification" />
        <CardBody className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Question ID" htmlFor="code" hint="Leave empty to auto-generate (BEO-00001…)"><Input id="code" {...register("code")} /></Field>
          <Field label="Learning mode" htmlFor="learning_mode" required>
            <Select id="learning_mode" {...register("learning_mode")}><option value="proficiency">Proficiency</option><option value="olympiad">Olympiad</option></Select>
          </Field>
          <Field label="CEFR level" htmlFor="cefr_level" required={mode === "proficiency"} error={errors.cefr_level?.message} hint={mode === "olympiad" ? "Optional for Olympiad questions" : undefined}>
            <Select id="cefr_level" aria-invalid={!!errors.cefr_level} {...register("cefr_level")}><option value="">— None —</option>{CEFR_LEVELS.map((l) => <option key={l}>{l}</option>)}</Select>
          </Field>
          <Field label="School level" htmlFor="school_level" hint="Empty = suitable for SMP and SMA">
            <Select id="school_level" {...register("school_level")}><option value="">SMP & SMA</option><option>SMP</option><option>SMA</option></Select>
          </Field>
          <Field label="Category" htmlFor="category" required>
            <Select id="category" {...register("category")}>{CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</Select>
          </Field>
          <Field label="Subcategory" htmlFor="subcategory"><Input id="subcategory" placeholder="e.g. past simple" {...register("subcategory")} /></Field>
          <Field label="Difficulty" htmlFor="difficulty" required>
            <Select id="difficulty" {...register("difficulty")}>{DIFFICULTIES.map((d) => <option key={d} value={d}>{d[0].toUpperCase() + d.slice(1)}</option>)}</Select>
          </Field>
          <Field label="Status" htmlFor="status" required>
            <Select id="status" {...register("status")}><option value="draft">Draft</option><option value="published">Published</option></Select>
          </Field>
          <Field label="Tags" htmlFor="tags" hint="Comma-separated"><Input id="tags" {...register("tags")} /></Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Question" />
        <CardBody className="space-y-4">
          <Field label="Reading passage" htmlFor="passage" hint="Optional — shown above the question"><Textarea id="passage" rows={4} {...register("passage")} /></Field>
          <Field label="Question text" htmlFor="question_text" required error={errors.question_text?.message}><Textarea id="question_text" rows={2} aria-invalid={!!errors.question_text} {...register("question_text")} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            {(["a", "b", "c", "d"] as const).map((l) => (
              <Field key={l} label={`Option ${l.toUpperCase()}${correct === l.toUpperCase() ? " ✓ correct" : ""}`} htmlFor={`option_${l}`} required={l === "a" || l === "b"} error={errors[`option_${l}`]?.message}>
                <Input id={`option_${l}`} className={correct === l.toUpperCase() ? "border-success ring-2 ring-success/15" : ""} {...register(`option_${l}`)} />
              </Field>
            ))}
          </div>
          <Field label="Correct answer" htmlFor="correct_answer" required error={errors.correct_answer?.message} className="max-w-xs">
            <Select id="correct_answer" {...register("correct_answer")}>{["A", "B", "C", "D"].map((l) => <option key={l}>{l}</option>)}</Select>
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Teaching notes" description="Shown to students after they answer (practice) or submit (exam)." />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <Field label="Detailed explanation" htmlFor="explanation" required error={errors.explanation?.message} className="sm:col-span-2"><Textarea id="explanation" aria-invalid={!!errors.explanation} {...register("explanation")} /></Field>
          <Field label="Distractor analysis" htmlFor="distractor_analysis" className="sm:col-span-2"><Textarea id="distractor_analysis" {...register("distractor_analysis")} /></Field>
          <Field label="Learning objective" htmlFor="learning_objective"><Input id="learning_objective" {...register("learning_objective")} /></Field>
          <Field label="Skill assessed" htmlFor="skill_assessed"><Input id="skill_assessed" {...register("skill_assessed")} /></Field>
        </CardBody>
      </Card>

      <div className="flex justify-end gap-2">
        <LinkButton href="/admin/questions" variant="secondary">Cancel</LinkButton>
        <Button type="submit" loading={pending}>{initial ? "Save changes" : "Create question"}</Button>
      </div>
    </form>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { EXPORT_SELECT, toExportRow } from "@/lib/question-io";
import type { QuestionInput } from "@/lib/validation";
import { QuestionForm } from "../question-form";

export const metadata: Metadata = { title: "Edit question" };

export default async function EditQuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireRole(["admin"]);
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const supabase = await createClient();
  const { data } = await supabase.from("questions").select(`id, ${EXPORT_SELECT}`).eq("id", id).maybeSingle();
  if (!data) notFound();
  const row = toExportRow(data as unknown as Parameters<typeof toExportRow>[0]);
  const { question_id, ...rest } = row;
  const initial = { ...rest, id, code: question_id } as unknown as QuestionInput;

  return (
    <div>
      <PageHeader eyebrow="Question bank" title={`Edit ${row.question_id}`} />
      <QuestionForm initial={initial} />
    </div>
  );
}

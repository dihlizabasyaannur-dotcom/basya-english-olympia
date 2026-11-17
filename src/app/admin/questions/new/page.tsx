import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { QuestionForm } from "../question-form";

export const metadata: Metadata = { title: "New question" };

export default async function NewQuestionPage() {
  await requireRole(["admin"]);
  return (
    <div>
      <PageHeader eyebrow="Question bank" title="New question" />
      <QuestionForm />
    </div>
  );
}

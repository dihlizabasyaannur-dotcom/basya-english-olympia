import type { Metadata } from "next";
import { Card, CardBody, CardHeader, PageHeader } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { IMPORT_COLUMNS, REQUIRED_COLUMNS } from "@/lib/question-io";
import { ExportButton } from "../question-actions";
import { Importer } from "./importer";

export const metadata: Metadata = { title: "Import / Export" };

export default async function ImportPage() {
  await requireRole(["admin"]);
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Question bank" title="Import & export" description="Bulk-add questions from Excel or CSV. Rows with an existing Question ID update that question." action={<ExportButton label="Export all questions" />} />
      <Importer />
      <Card>
        <CardHeader title="Template columns" description="Column names are case-insensitive. Required columns are marked *." />
        <CardBody>
          <ul className="flex flex-wrap gap-2 text-xs">
            {IMPORT_COLUMNS.map((c) => (
              <li key={c} className="rounded-lg bg-lavender-50 px-2.5 py-1 font-mono">{c}{(REQUIRED_COLUMNS as readonly string[]).includes(c) && <span className="text-danger">*</span>}</li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-muted">
            learning_mode: proficiency | olympiad · cefr_level: A1–B2 (required for proficiency) · school_level: SMP | SMA | empty for both ·
            category: grammar, vocabulary, reading, language-use, text-analysis, hots, olympiad-reasoning · difficulty: easy | medium | hard | advanced ·
            correct_answer: A–D · status: draft | published · tags: comma-separated
          </p>
        </CardBody>
      </Card>
    </div>
  );
}

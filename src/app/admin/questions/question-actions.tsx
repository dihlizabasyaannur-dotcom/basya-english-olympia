"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import { EXPORT_SELECT, IMPORT_COLUMNS, toExportRow } from "@/lib/question-io";
import { deleteQuestion, setQuestionStatus } from "../actions";

export function QuestionRowActions({ id, code, status }: { id: string; code: string; status: string }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [confirm, setConfirm] = useState(false);

  const toggle = () =>
    start(async () => {
      const next = status === "published" ? "draft" : "published";
      const res = await setQuestionStatus(id, next);
      if (res.error) toast(res.error, "error");
      else { toast(`${code} ${next === "published" ? "published" : "moved to draft"}.`); router.refresh(); }
    });

  const remove = () =>
    start(async () => {
      const res = await deleteQuestion(id);
      setConfirm(false);
      if (res.error) toast(res.error, "error");
      else { toast(`${code} deleted.`); router.refresh(); }
    });

  return (
    <div className="flex justify-end gap-1.5">
      <Link href={`/admin/questions/${id}`} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-brand hover:bg-lavender">Edit</Link>
      <button onClick={toggle} disabled={pending} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-ink hover:bg-lavender disabled:opacity-50">
        {status === "published" ? "Unpublish" : "Publish"}
      </button>
      <button onClick={() => setConfirm(true)} disabled={pending} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-danger hover:bg-danger-50 disabled:opacity-50">Delete</button>
      {confirm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4" role="dialog" aria-modal="true">
          <Card className="w-full max-w-sm p-6 text-left">
            <h2 className="text-lg font-bold">Delete {code}?</h2>
            <p className="mt-2 text-sm text-muted">This permanently removes the question and its answer history from past quizzes. Consider unpublishing instead.</p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setConfirm(false)}>Cancel</Button>
              <Button variant="danger" onClick={remove} loading={pending}>Delete</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

/** Exports questions (optionally filtered) to an Excel file using the import template columns. */
export function ExportButton({ filters = {}, label = "Export" }: { filters?: Record<string, string | undefined>; label?: string }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    try {
      const supabase = createClient();
      let q = supabase.from("questions").select(EXPORT_SELECT).order("code");
      if (filters.mode === "proficiency" || filters.mode === "olympiad") q = q.eq("learning_mode", filters.mode);
      if (filters.status === "draft" || filters.status === "published") q = q.eq("status", filters.status);
      if (filters.cefr) q = q.eq("cefr_level", filters.cefr as "A1");
      if (filters.school === "SMP" || filters.school === "SMA") q = q.eq("school_level", filters.school);
      const { data, error } = await q.limit(5000);
      if (error) throw error;
      const rows = (data ?? []).map((r) => toExportRow(r as unknown as Parameters<typeof toExportRow>[0]));
      const XLSX = await import("xlsx");
      const ws = XLSX.utils.json_to_sheet(rows, { header: [...IMPORT_COLUMNS] });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Questions");
      XLSX.writeFile(wb, `beo-question-bank-${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast(`Exported ${rows.length} question(s).`);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Export failed.", "error");
    } finally {
      setLoading(false);
    }
  }
  return <Button variant="secondary" onClick={run} loading={loading}><Download className="h-4 w-4" /> {label}</Button>;
}

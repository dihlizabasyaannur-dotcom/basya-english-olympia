"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { AlertTriangle, CheckCircle2, FileSpreadsheet, Upload, XCircle } from "lucide-react";
import { Badge, Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button, LinkButton } from "@/components/ui/button";
import { Alert } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import { checkColumns, validateRows, type ParsedRow } from "@/lib/question-io";
import { cn } from "@/lib/utils";
import { importQuestions } from "../../actions";

type Stage = "upload" | "preview" | "done";
const MAX_BYTES = 5 * 1024 * 1024;

export function Importer() {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<Stage>("upload");
  const [fileName, setFileName] = useState("");
  const [columnError, setColumnError] = useState<string>();
  const [unknownCols, setUnknownCols] = useState<string[]>([]);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [existing, setExisting] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<"all" | "valid" | "invalid">("all");
  const [result, setResult] = useState<{ created: number; updated: number; skipped: number }>();
  const [reading, setReading] = useState(false);
  const [pending, start] = useTransition();

  const valid = useMemo(() => rows.filter((r) => r.data), [rows]);
  const invalid = rows.length - valid.length;
  const shown = rows.filter((r) => filter === "all" || (filter === "valid" ? r.data : !r.data));

  async function onFile(file: File) {
    setColumnError(undefined);
    if (!/\.(xlsx|xls|csv)$/i.test(file.name)) return setColumnError("Please upload an .xlsx, .xls or .csv file.");
    if (file.size > MAX_BYTES) return setColumnError("File is larger than 5 MB.");
    setReading(true);
    try {
      const XLSX = await import("xlsx");
      const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const headers = (XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 })[0] ?? []).map(String);
      const { missing, unknown } = checkColumns(headers);
      if (missing.length) {
        setColumnError(`Missing required column(s): ${missing.join(", ")}. Download the template to see the expected columns.`);
        return;
      }
      const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "", raw: false })
        .filter((r) => Object.values(r).some((v) => String(v).trim() !== ""));
      if (data.length === 0) return setColumnError("The file has no question rows.");
      if (data.length > 2000) return setColumnError("Import at most 2,000 questions per file.");
      const parsed = validateRows(data);
      // Which Question IDs already exist (those rows will update instead of create)
      const codes = parsed.map((r) => r.data?.code).filter(Boolean) as string[];
      const found = new Set<string>();
      for (let i = 0; i < codes.length; i += 200) {
        const { data: ex } = await createClient().from("questions").select("code").in("code", codes.slice(i, i + 200));
        ex?.forEach((e) => found.add(e.code));
      }
      setExisting(found);
      setUnknownCols(unknown);
      setRows(parsed);
      setFileName(file.name);
      setStage("preview");
    } catch {
      setColumnError("This file could not be read. Make sure it is a valid Excel or CSV file.");
    } finally {
      setReading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const confirm = () =>
    start(async () => {
      const res = await importQuestions(valid.map((r) => r.data!));
      if (res.error) return toast(res.error, "error");
      setResult({ created: res.created ?? 0, updated: res.updated ?? 0, skipped: invalid });
      setStage("done");
      toast("Import complete.");
    });

  const reset = () => { setStage("upload"); setRows([]); setResult(undefined); setFilter("all"); };

  return (
    <div className="space-y-6">
      <ol className="flex flex-wrap gap-2 text-xs font-semibold">
        {["1 Upload", "2 Validate & preview", "3 Confirm & import"].map((s, i) => (
          <li key={s} className={cn("rounded-full px-3 py-1", i === ["upload", "preview", "done"].indexOf(stage) ? "bg-brand text-white" : "bg-lavender text-muted")}>{s}</li>
        ))}
      </ol>

      {stage === "upload" && (
        <Card>
          <CardBody>
            <label
              htmlFor="import-file"
              className="flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-brand/30 bg-lavender-50 px-6 py-12 text-center hover:border-brand"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) onFile(f); }}
            >
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-brand shadow-[var(--shadow-soft)]"><Upload className="h-6 w-6" /></div>
              <p className="mt-4 font-semibold">{reading ? "Reading file…" : "Drop an Excel or CSV file here, or click to choose"}</p>
              <p className="mt-1 text-sm text-muted">.xlsx, .xls or .csv · up to 2,000 questions · max 5 MB</p>
              <input ref={fileRef} id="import-file" type="file" accept=".xlsx,.xls,.csv" className="sr-only" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
            </label>
            {columnError && <Alert className="mt-4">{columnError}</Alert>}
            <div className="mt-5 flex flex-wrap gap-2">
              <a href="/templates/beo-question-import-template.csv" download className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold hover:bg-lavender-50"><FileSpreadsheet className="h-4 w-4 text-brand" /> Download template (CSV)</a>
              <a href="/templates/beo-starter-questions.csv" download className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold hover:bg-lavender-50"><FileSpreadsheet className="h-4 w-4 text-gold-600" /> Starter question set (40 questions)</a>
            </div>
          </CardBody>
        </Card>
      )}

      {stage === "preview" && (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Card className="p-4"><p className="text-xs uppercase text-muted">Rows in {fileName}</p><p className="text-2xl font-bold">{rows.length}</p></Card>
            <Card className="p-4"><p className="text-xs uppercase text-muted">Ready to import</p><p className="text-2xl font-bold text-success">{valid.length}</p><p className="text-xs text-muted">{valid.filter((r) => r.data?.code && existing.has(r.data.code)).length} will update existing questions</p></Card>
            <Card className="p-4"><p className="text-xs uppercase text-muted">Rows with errors</p><p className={cn("text-2xl font-bold", invalid ? "text-danger" : "text-ink")}>{invalid}</p><p className="text-xs text-muted">Skipped unless fixed in the file</p></Card>
          </div>
          {unknownCols.length > 0 && <Alert tone="warning">Ignored unknown column(s): {unknownCols.join(", ")}</Alert>}

          <Card className="overflow-hidden">
            <CardHeader title="Preview" description="Check the data before saving. Nothing is saved yet." action={
              <div className="flex gap-1 rounded-xl bg-lavender-50 p-1 text-xs font-semibold">
                {(["all", "valid", "invalid"] as const).map((f) => (
                  <button key={f} onClick={() => setFilter(f)} className={cn("rounded-lg px-3 py-1.5 capitalize", filter === f ? "bg-white shadow-sm" : "text-muted")} aria-pressed={filter === f}>{f}</button>
                ))}
              </div>
            } />
            <div className="mt-4 max-h-[28rem] overflow-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead className="sticky top-0 bg-lavender-50 text-left text-xs uppercase tracking-wide text-muted">
                  <tr><th className="px-4 py-2">Row</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">ID</th><th className="px-3 py-2">Mode / level</th><th className="px-3 py-2">Category</th><th className="px-3 py-2">Question</th><th className="px-3 py-2">Key</th></tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {shown.map((r) => (
                    <tr key={r.rowNumber} className={cn("align-top", !r.data && "bg-danger-50/50")}>
                      <td className="px-4 py-2 font-mono text-xs">{r.rowNumber}</td>
                      <td className="px-3 py-2">
                        {r.data ? (
                          <Badge tone="success"><CheckCircle2 className="h-3 w-3" /> {r.data.code && existing.has(r.data.code) ? "Update" : "New"}</Badge>
                        ) : (
                          <div><Badge tone="danger"><XCircle className="h-3 w-3" /> Error</Badge><ul className="mt-1 space-y-0.5 text-xs text-danger">{r.errors.map((e) => <li key={e}>{e}</li>)}</ul></div>
                        )}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs">{String(r.raw.question_id ?? "") || "auto"}</td>
                      <td className="px-3 py-2 text-xs">{String(r.raw.learning_mode ?? "")} {String(r.raw.cefr_level ?? "")} {String(r.raw.school_level ?? "")}</td>
                      <td className="px-3 py-2 text-xs">{String(r.raw.category ?? "")}</td>
                      <td className="max-w-sm px-3 py-2"><span className="line-clamp-2">{String(r.raw.question_text ?? "")}</span></td>
                      <td className="px-3 py-2 font-bold">{String(r.raw.correct_answer ?? "")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="flex flex-wrap items-center justify-end gap-2">
            {invalid > 0 && <p className="mr-auto flex items-center gap-1.5 text-sm text-warning"><AlertTriangle className="h-4 w-4" /> {invalid} row(s) with errors will be skipped.</p>}
            <Button variant="secondary" onClick={reset}>Choose another file</Button>
            <Button onClick={confirm} loading={pending} disabled={valid.length === 0}>Import {valid.length} question{valid.length === 1 ? "" : "s"}</Button>
          </div>
        </>
      )}

      {stage === "done" && result && (
        <Card className="p-8 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
          <h2 className="mt-3 font-display text-2xl font-semibold">Import complete</h2>
          <p className="mt-2 text-muted"><strong className="text-ink">{result.created}</strong> created · <strong className="text-ink">{result.updated}</strong> updated · <strong className="text-ink">{result.skipped}</strong> skipped with errors</p>
          <div className="mt-6 flex justify-center gap-2">
            <Button variant="secondary" onClick={reset}>Import another file</Button>
            <LinkButton href="/admin/questions">View question bank</LinkButton>
          </div>
        </Card>
      )}
    </div>
  );
}

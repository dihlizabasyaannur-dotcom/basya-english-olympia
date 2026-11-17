import type { Metadata } from "next";
import Link from "next/link";
import { LibraryBig, Plus, Search } from "lucide-react";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui/card";
import { Button, LinkButton } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES, CEFR_LEVELS, DIFFICULTIES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { QuestionRowActions, ExportButton } from "./question-actions";

export const metadata: Metadata = { title: "Question Bank" };
const PAGE = 25;
const SORTS = { newest: ["updated_at", false], oldest: ["updated_at", true], code: ["code", true], difficulty: ["difficulty", true] } as const;

type SP = { q?: string; mode?: string; cefr?: string; school?: string; category?: string; difficulty?: string; status?: string; sort?: string; page?: string };

export default async function QuestionsPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireRole(["admin"]);
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const supabase = await createClient();
  const { data: cats } = await supabase.from("question_categories").select("id, slug");
  const catId = cats?.find((c) => c.slug === sp.category)?.id;

  let query = supabase
    .from("questions")
    .select("id, code, learning_mode, cefr_level, school_level, difficulty, question_text, status, updated_at, question_categories(name)", { count: "exact" });
  if (sp.q) {
    const term = sp.q.replace(/[%,()]/g, " ").trim();
    query = query.or(`question_text.ilike.%${term}%,code.ilike.%${term}%,subcategory.ilike.%${term}%`);
  }
  if (sp.mode === "proficiency" || sp.mode === "olympiad") query = query.eq("learning_mode", sp.mode);
  if (sp.cefr && (CEFR_LEVELS as readonly string[]).includes(sp.cefr)) query = query.eq("cefr_level", sp.cefr as "A1");
  if (sp.school === "SMP" || sp.school === "SMA") query = query.eq("school_level", sp.school);
  if (catId) query = query.eq("category_id", catId);
  if (sp.difficulty && (DIFFICULTIES as readonly string[]).includes(sp.difficulty)) query = query.eq("difficulty", sp.difficulty as "easy");
  if (sp.status === "draft" || sp.status === "published") query = query.eq("status", sp.status);
  const [col, asc] = SORTS[(sp.sort as keyof typeof SORTS) ?? "newest"] ?? SORTS.newest;
  const { data, count, error } = await query.order(col, { ascending: asc }).range((page - 1) * PAGE, page * PAGE - 1);
  const rows = data ?? [];
  const pages = Math.max(1, Math.ceil((count ?? 0) / PAGE));
  const qs = (extra: Partial<SP>) => "?" + new URLSearchParams(Object.entries({ ...sp, ...extra }).filter(([, v]) => v) as [string, string][]).toString();

  return (
    <div>
      <PageHeader
        eyebrow="Question bank"
        title="Questions"
        description={`${count ?? 0} question(s) match your filters.`}
        action={<div className="flex flex-wrap gap-2"><ExportButton filters={sp} /><LinkButton href="/admin/questions/import" variant="secondary">Import</LinkButton><LinkButton href="/admin/questions/new"><Plus className="h-4 w-4" /> New question</LinkButton></div>}
      />

      {/* Filters (GET form → shareable URLs) */}
      <Card className="mb-4 p-4">
        <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" action="/admin/questions">
          <div className="relative sm:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <label htmlFor="q" className="sr-only">Search</label>
            <Input id="q" name="q" defaultValue={sp.q} placeholder="Search text, Question ID or subcategory" className="pl-9" />
          </div>
          <Select name="mode" defaultValue={sp.mode ?? ""} aria-label="Learning mode"><option value="">All modes</option><option value="proficiency">Proficiency</option><option value="olympiad">Olympiad</option></Select>
          <Select name="category" defaultValue={sp.category ?? ""} aria-label="Category"><option value="">All categories</option>{CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</Select>
          <Select name="cefr" defaultValue={sp.cefr ?? ""} aria-label="CEFR level"><option value="">All CEFR levels</option>{CEFR_LEVELS.map((l) => <option key={l}>{l}</option>)}</Select>
          <Select name="school" defaultValue={sp.school ?? ""} aria-label="School level"><option value="">SMP & SMA</option><option>SMP</option><option>SMA</option></Select>
          <Select name="difficulty" defaultValue={sp.difficulty ?? ""} aria-label="Difficulty"><option value="">All difficulties</option>{DIFFICULTIES.map((d) => <option key={d} value={d}>{d[0].toUpperCase() + d.slice(1)}</option>)}</Select>
          <Select name="status" defaultValue={sp.status ?? ""} aria-label="Status"><option value="">Draft & published</option><option value="draft">Draft</option><option value="published">Published</option></Select>
          <Select name="sort" defaultValue={sp.sort ?? "newest"} aria-label="Sort"><option value="newest">Recently updated</option><option value="oldest">Oldest updated</option><option value="code">Question ID</option><option value="difficulty">Difficulty</option></Select>
          <div className="flex gap-2 lg:col-span-3 lg:justify-end">
            <LinkButton href="/admin/questions" variant="ghost">Reset</LinkButton>
            <Button type="submit">Apply filters</Button>
          </div>
        </form>
      </Card>

      {error ? <EmptyState title="Could not load questions" description={error.message} /> : rows.length === 0 ? (
        <EmptyState icon={<LibraryBig className="h-5 w-5" />} title="No questions found" description="Change the filters or add a new question." action={<LinkButton href="/admin/questions/new">New question</LinkButton>} />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="bg-lavender-50 text-left text-xs uppercase tracking-wide text-muted">
                <tr><th className="px-4 py-3">ID</th><th className="px-3 py-3">Question</th><th className="px-3 py-3">Mode / level</th><th className="px-3 py-3">Category</th><th className="px-3 py-3">Difficulty</th><th className="px-3 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((q) => (
                  <tr key={q.id} className="align-top">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted">{q.code}</td>
                    <td className="max-w-md px-3 py-3"><Link href={`/admin/questions/${q.id}`} className="line-clamp-2 font-medium hover:text-brand">{q.question_text}</Link><span className="text-xs text-muted">Updated {formatDate(q.updated_at)}</span></td>
                    <td className="px-3 py-3"><span className="capitalize">{q.learning_mode}</span><span className="block text-xs text-muted">{[q.cefr_level, q.school_level ?? "SMP & SMA"].filter(Boolean).join(" · ")}</span></td>
                    <td className="px-3 py-3">{q.question_categories?.name}</td>
                    <td className="px-3 py-3 capitalize">{q.difficulty}</td>
                    <td className="px-3 py-3"><Badge tone={q.status === "published" ? "success" : "neutral"}>{q.status}</Badge></td>
                    <td className="px-4 py-3"><QuestionRowActions id={q.id} code={q.code} status={q.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pages > 1 && (
            <div className="flex items-center justify-between border-t border-line px-4 py-3 text-sm">
              <span className="text-muted">Page {page} of {pages}</span>
              <div className="flex gap-2">
                {page > 1 && <LinkButton href={qs({ page: String(page - 1) })} variant="secondary" size="sm">Previous</LinkButton>}
                {page < pages && <LinkButton href={qs({ page: String(page + 1) })} variant="secondary" size="sm">Next</LinkButton>}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

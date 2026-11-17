import { CATEGORIES } from "./constants";
import { questionSchema, type QuestionInput } from "./validation";

/** Column order of the Excel/CSV import & export template. */
export const IMPORT_COLUMNS = [
  "question_id", "learning_mode", "cefr_level", "school_level", "category", "subcategory", "difficulty",
  "question_text", "passage", "option_a", "option_b", "option_c", "option_d", "correct_answer",
  "explanation", "distractor_analysis", "learning_objective", "skill_assessed", "tags", "status",
] as const;
export const REQUIRED_COLUMNS = ["learning_mode", "category", "difficulty", "question_text", "option_a", "option_b", "correct_answer", "explanation"] as const;

export type RawRow = Record<string, unknown>;
export type ParsedRow = { rowNumber: number; data?: QuestionInput; errors: string[]; raw: RawRow };

const normKey = (k: string) => k.trim().toLowerCase().replace(/[\s-]+/g, "_");
const str = (v: unknown) => (v === null || v === undefined ? "" : String(v).trim());

/** Accept friendly variants (e.g. "Reading Comprehension", "Published", "smp"). */
function normalise(raw: RawRow): Record<string, string> {
  const r: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) r[normKey(k)] = str(v);
  const cat = r.category?.toLowerCase();
  const match = CATEGORIES.find((c) => c.slug === cat || c.name.toLowerCase() === cat || (cat === "reading" && c.slug === "reading"));
  return {
    code: r.question_id ?? "",
    learning_mode: (r.learning_mode ?? "").toLowerCase(),
    cefr_level: (r.cefr_level ?? "").toUpperCase(),
    school_level: (r.school_level ?? "").toUpperCase().replace(/^(ALL|BOTH|-)$/, ""),
    category: match?.slug ?? cat ?? "",
    subcategory: r.subcategory ?? "",
    difficulty: (r.difficulty ?? "").toLowerCase() || "medium",
    question_text: r.question_text ?? "",
    passage: r.passage ?? "",
    option_a: r.option_a ?? "",
    option_b: r.option_b ?? "",
    option_c: r.option_c ?? "",
    option_d: r.option_d ?? "",
    correct_answer: (r.correct_answer ?? "").toUpperCase(),
    explanation: r.explanation ?? "",
    distractor_analysis: r.distractor_analysis ?? "",
    learning_objective: r.learning_objective ?? "",
    skill_assessed: r.skill_assessed ?? "",
    tags: r.tags ?? "",
    status: (r.status ?? "").toLowerCase() || "draft",
  };
}

export function checkColumns(headers: string[]) {
  const keys = headers.map(normKey);
  return {
    missing: REQUIRED_COLUMNS.filter((c) => !keys.includes(c)),
    unknown: headers.filter((h) => !(IMPORT_COLUMNS as readonly string[]).includes(normKey(h))),
  };
}

export function validateRows(rows: RawRow[]): ParsedRow[] {
  const seen = new Map<string, number>();
  return rows.map((raw, i) => {
    const rowNumber = i + 2; // row 1 is the header in the spreadsheet
    const norm = normalise(raw);
    const result = questionSchema.safeParse(norm);
    const errors = result.success ? [] : result.error.issues.map((iss) => `${iss.path.join(".") || "row"}: ${iss.message}`);
    // Zod skips cross-field refinements when basic fields fail — report them anyway so every problem shows at once.
    const add = (e: string) => { if (!errors.includes(e)) errors.push(e); };
    if (norm.learning_mode === "proficiency" && !norm.cefr_level) add("cefr_level: Proficiency questions need a CEFR level");
    if (/^[ABCD]$/.test(norm.correct_answer) && !norm[`option_${norm.correct_answer.toLowerCase()}`]) add("correct_answer: The correct answer points to an empty option");
    const code = str(raw.question_id ?? raw["Question ID"]);
    if (code) {
      if (seen.has(code)) errors.push(`question_id: duplicate of row ${seen.get(code)}`);
      else seen.set(code, rowNumber);
    }
    return { rowNumber, raw, errors, data: result.success && errors.length === 0 ? result.data : undefined };
  });
}

/** Database question (with options & tags) → template row for export. */
export function toExportRow(q: {
  code: string; learning_mode: string; cefr_level: string | null; school_level: string | null; subcategory: string | null;
  difficulty: string; question_text: string; passage: string | null; explanation: string; distractor_analysis: string | null;
  learning_objective: string | null; skill_assessed: string | null; status: string;
  question_categories: { slug: string } | null;
  question_options: { label: string; option_text: string; is_correct: boolean }[];
  question_tags: { tag: string }[];
}) {
  const opt = (l: string) => q.question_options.find((o) => o.label === l)?.option_text ?? "";
  return {
    question_id: q.code, learning_mode: q.learning_mode, cefr_level: q.cefr_level ?? "", school_level: q.school_level ?? "",
    category: q.question_categories?.slug ?? "", subcategory: q.subcategory ?? "", difficulty: q.difficulty,
    question_text: q.question_text, passage: q.passage ?? "", option_a: opt("A"), option_b: opt("B"), option_c: opt("C"), option_d: opt("D"),
    correct_answer: q.question_options.find((o) => o.is_correct)?.label ?? "", explanation: q.explanation,
    distractor_analysis: q.distractor_analysis ?? "", learning_objective: q.learning_objective ?? "", skill_assessed: q.skill_assessed ?? "",
    tags: q.question_tags.map((t) => t.tag).join(","), status: q.status,
  };
}

export const EXPORT_SELECT =
  "code, learning_mode, cefr_level, school_level, subcategory, difficulty, question_text, passage, explanation, distractor_analysis, learning_objective, skill_assessed, status, question_categories(slug), question_options(label, option_text, is_correct), question_tags(tag)";

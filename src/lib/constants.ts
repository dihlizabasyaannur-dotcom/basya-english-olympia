export const CEFR_LEVELS = ["A1", "A2", "B1", "B2"] as const;
export type CefrLevel = (typeof CEFR_LEVELS)[number];

export const CEFR_META: Record<CefrLevel, { name: string; slug: string; summary: string; canDo: string }> = {
  A1: {
    name: "Beginner",
    slug: "a1",
    summary: "Everyday words, simple sentences and basic personal information.",
    canDo: "Introduce yourself, understand short notices and simple messages.",
  },
  A2: {
    name: "Elementary",
    slug: "a2",
    summary: "Routine topics, past events, simple descriptions and requests.",
    canDo: "Describe your day, read short messages and make polite requests.",
  },
  B1: {
    name: "Intermediate",
    slug: "b1",
    summary: "Opinions, conditions, inference and connected texts on familiar topics.",
    canDo: "Follow the main points of texts and express and justify opinions.",
  },
  B2: {
    name: "Upper Intermediate",
    slug: "b2",
    summary: "Complex structures, academic vocabulary and critical reading.",
    canDo: "Understand complex texts, writer attitude and argument structure.",
  },
};

export function levelFromSlug(slug: string): CefrLevel | null {
  const up = slug.toUpperCase();
  return (CEFR_LEVELS as readonly string[]).includes(up) ? (up as CefrLevel) : null;
}

export const SCHOOL_TRACKS = ["SMP", "SMA"] as const;
export type SchoolTrack = (typeof SCHOOL_TRACKS)[number];

export const CATEGORIES = [
  { slug: "grammar", name: "Grammar", icon: "puzzle", blurb: "Sentence structure, tenses and accuracy." },
  { slug: "vocabulary", name: "Vocabulary", icon: "languages", blurb: "Word meaning, collocation and word formation." },
  { slug: "reading", name: "Reading Comprehension", icon: "book-open", blurb: "Main ideas, details and inference." },
  { slug: "language-use", name: "Language Use", icon: "message-circle", blurb: "The right expression for the context." },
  { slug: "text-analysis", name: "Text Analysis", icon: "scan-text", blurb: "Purpose, structure and language features." },
  { slug: "hots", name: "HOTS", icon: "lightbulb", blurb: "Analyse, evaluate and reason." },
  { slug: "olympiad-reasoning", name: "Olympiad Reasoning", icon: "brain", blurb: "Logic challenges in English." },
] as const;
export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

/** Skills offered inside each CEFR level (Proficiency mode). */
export const PROFICIENCY_SKILLS: CategorySlug[] = ["grammar", "vocabulary", "reading", "language-use", "text-analysis"];
/** Skills offered in Olympiad mode. */
export const OLYMPIAD_SKILLS: CategorySlug[] = ["reading", "vocabulary", "grammar", "text-analysis", "hots", "olympiad-reasoning"];

export function categoryName(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
}

export const DIFFICULTIES = ["easy", "medium", "hard", "advanced"] as const;
export const ASSESSMENT_TYPES = {
  diagnostic: "Diagnostic",
  formative: "Formative",
  summative: "Summative",
  daily_practice: "Daily Practice",
  olympiad_simulation: "Olympiad Simulation",
} as const;

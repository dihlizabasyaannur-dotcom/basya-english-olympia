import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    full_name: z.string().trim().min(2, "Enter your full name").max(80),
    email: z.string().trim().email("Enter a valid email address"),
    school_level: z.enum(["SMP", "SMA"], { message: "Choose SMP or SMA" }),
    grade: z.string().regex(/^(7|8|9|10|11|12)$/, "Choose your grade"),
    school_name: z.string().trim().max(120).optional(),
    password: z.string().min(8, "Use at least 8 characters"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords do not match" })
  .refine((v) => (v.school_level === "SMP" ? Number(v.grade) <= 9 : Number(v.grade) >= 10), {
    path: ["grade"],
    message: "SMP is grade 7–9 and SMA is grade 10–12",
  });
export type RegisterInput = z.infer<typeof registerSchema>;

export const profileSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(80),
  school_level: z.enum(["SMP", "SMA"]),
  grade: z.string().regex(/^(7|8|9|10|11|12)$/, "Choose your grade"),
  school_name: z.string().trim().max(120).optional(),
  bio: z.string().trim().max(280, "Keep it under 280 characters").optional(),
});
export type ProfileInput = z.infer<typeof profileSchema>;

const optText = z.string().trim().optional().or(z.literal(""));

/** One question as edited in the admin form or imported from Excel/CSV. */
export const questionSchema = z
  .object({
    id: z.string().uuid().optional(),
    code: optText,
    learning_mode: z.enum(["proficiency", "olympiad"], { message: "Must be proficiency or olympiad" }),
    cefr_level: z.enum(["A1", "A2", "B1", "B2"]).optional().or(z.literal("")),
    school_level: z.enum(["SMP", "SMA"]).optional().or(z.literal("")),
    category: z.enum(["grammar", "vocabulary", "reading", "language-use", "text-analysis", "hots", "olympiad-reasoning"], {
      message: "Unknown category",
    }),
    subcategory: optText,
    difficulty: z.enum(["easy", "medium", "hard", "advanced"], { message: "Must be easy, medium, hard or advanced" }),
    question_text: z.string().trim().min(3, "Question text is required"),
    passage: optText,
    option_a: z.string().trim().min(1, "Option A is required"),
    option_b: z.string().trim().min(1, "Option B is required"),
    option_c: optText,
    option_d: optText,
    correct_answer: z.enum(["A", "B", "C", "D"], { message: "Correct answer must be A, B, C or D" }),
    explanation: z.string().trim().min(3, "An explanation is required"),
    distractor_analysis: optText,
    learning_objective: optText,
    skill_assessed: optText,
    tags: optText,
    status: z.enum(["draft", "published"], { message: "Status must be draft or published" }),
  })
  .refine((q) => q.learning_mode !== "proficiency" || !!q.cefr_level, {
    path: ["cefr_level"],
    message: "Proficiency questions need a CEFR level",
  })
  .refine((q) => !!q[`option_${q.correct_answer.toLowerCase()}` as "option_a"], {
    path: ["correct_answer"],
    message: "The correct answer points to an empty option",
  });
export type QuestionInput = z.infer<typeof questionSchema>;

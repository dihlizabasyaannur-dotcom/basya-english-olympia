import type { CefrLevel } from "./constants";

export type StudentStats = {
  totals: { attempts: number; avg_score: number | null; best_score: number | null; passed: number };
  answers: { answered: number; correct: number };
  by_level: { level: CefrLevel; answered: number; correct: number }[];
  by_category: { slug: string; name: string; answered: number; correct: number }[];
  trend: { id: string; title: string; score: number; submitted_at: string }[];
};

export type Feedback = {
  is_correct: boolean;
  correct_option_id: string;
  explanation: string;
  distractor_analysis: string | null;
  learning_objective: string | null;
  skill_assessed: string | null;
};

export type AttemptQuestion = {
  id: string;
  code: string;
  position: number;
  question_text: string;
  passage: string | null;
  difficulty: string;
  cefr_level: CefrLevel | null;
  category: string;
  category_slug: string;
  options: { id: string; text: string }[];
  selected_option_id: string | null;
  feedback: Feedback | null;
};

export type AttemptData = {
  attempt: {
    id: string;
    student_id: string;
    title: string;
    mode: "practice" | "exam";
    assessment_type: string;
    learning_mode: "proficiency" | "olympiad";
    status: "in_progress" | "submitted";
    started_at: string;
    expires_at: string | null;
    submitted_at: string | null;
    total_questions: number;
    correct_count: number | null;
    score: number | null;
    passed: boolean | null;
    passing_score: number;
    xp_earned: number;
    placement_result: CefrLevel | null;
    time_limit_minutes: number | null;
    server_now: string;
    category_name: string | null;
  };
  questions: AttemptQuestion[];
};

export type PracticeParams = {
  p_learning_mode: "proficiency" | "olympiad";
  p_cefr?: CefrLevel;
  p_school_level?: "SMP" | "SMA";
  p_category_slug?: string;
  p_count?: number;
  p_mode?: "practice" | "exam";
  p_time_limit?: number;
  p_assessment_type?: "diagnostic" | "formative" | "summative" | "daily_practice" | "olympiad_simulation";
  p_title?: string;
};

import "server-only";
import { createClient } from "@/lib/supabase/server";

export type AvailabilityRow = { learning_mode: string; cefr_level: string | null; school_level: string | null; category_slug: string; total: number };

/** Counts of published questions (no content) so we can show what is available. */
export async function getAvailability() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_question_availability");
  const rows = (data ?? []) as AvailabilityRow[];
  return {
    count(filter: { mode: string; cefr?: string; school?: string; category?: string }) {
      return rows
        .filter((r) => r.learning_mode === filter.mode)
        .filter((r) => !filter.cefr || r.cefr_level === filter.cefr)
        .filter((r) => !filter.school || r.school_level === null || r.school_level === filter.school)
        .filter((r) => !filter.category || r.category_slug === filter.category)
        .reduce((n, r) => n + Number(r.total), 0);
    },
  };
}

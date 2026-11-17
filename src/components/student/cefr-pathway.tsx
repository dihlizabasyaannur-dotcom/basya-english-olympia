import Link from "next/link";
import { Check, Lock, MapPin } from "lucide-react";
import { CEFR_LEVELS, CEFR_META, type CefrLevel } from "@/lib/constants";
import { cn, pct } from "@/lib/utils";
import type { StudentStats } from "@/lib/types";

/** Visual A1 → A2 → B1 → B2 pathway built from the student's real placement and answers. */
export function CefrPathway({ current, byLevel }: { current: CefrLevel | null; byLevel: StudentStats["by_level"] }) {
  const currentIdx = current ? CEFR_LEVELS.indexOf(current) : -1;

  return (
    <ol className="grid gap-3 sm:grid-cols-4" aria-label="CEFR pathway">
      {CEFR_LEVELS.map((lvl, i) => {
        const s = byLevel.find((b) => b.level === lvl);
        const accuracy = s ? pct(s.correct, s.answered) : null;
        const state = currentIdx < 0 ? "open" : i < currentIdx ? "done" : i === currentIdx ? "current" : "next";
        return (
          <li key={lvl} className="relative">
            {i < 3 && <span aria-hidden className="absolute left-[calc(50%+2rem)] right-[calc(-50%+2rem)] top-7 hidden h-0.5 bg-line sm:block" />}
            <Link
              href={`/student/learn/proficiency/${CEFR_META[lvl].slug}`}
              className={cn(
                "relative flex items-center gap-3 rounded-2xl border p-3 transition-colors sm:flex-col sm:text-center",
                state === "current" ? "border-brand bg-lavender-50 shadow-[var(--shadow-soft)]" : "border-line bg-white hover:border-brand/40",
              )}
            >
              <span
                className={cn(
                  "grid h-14 w-14 shrink-0 place-items-center rounded-2xl font-display text-xl font-semibold",
                  state === "done" && "bg-success-50 text-success",
                  state === "current" && "bg-brand text-white",
                  state === "next" && "bg-[#f1eff7] text-muted",
                  state === "open" && "bg-lavender text-brand",
                )}
              >
                {lvl}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-ink">{CEFR_META[lvl].name}</span>
                <span className="mt-0.5 flex items-center gap-1 text-xs text-muted sm:justify-center">
                  {state === "done" && <><Check className="h-3.5 w-3.5 text-success" /> Below your level</>}
                  {state === "current" && <><MapPin className="h-3.5 w-3.5 text-brand" /> You are here</>}
                  {state === "next" && <><Lock className="h-3 w-3" /> Next goal</>}
                  {state === "open" && "Not placed yet"}
                </span>
                <span className="mt-1 block text-xs text-muted">
                  {accuracy === null ? "No answers yet" : `${accuracy}% accuracy · ${s!.answered} answered`}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

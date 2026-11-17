import { CEFR_LEVELS, CEFR_META, PROFICIENCY_SKILLS, categoryName, type CefrLevel } from "./constants";
import type { PracticeParams, StudentStats } from "./types";
import { pct } from "./utils";

export type Recommendation = {
  key: string;
  title: string;
  reason: string;
  cta: string;
  action: { packageId: string } | { practice: PracticeParams } | { href: string };
};

/**
 * Rule-based next steps from the student's own data:
 * 1) Not placed → placement test. 2) Weakest skill at current level → targeted practice.
 * 3) Strong at current level → try the next level. 4) Olympiad track for their school level.
 */
export function buildRecommendations(opts: {
  level: CefrLevel | null;
  schoolLevel: "SMP" | "SMA" | null;
  stats: StudentStats;
  diagnosticPackageId: string | null;
  inProgress: { id: string; title: string } | null;
}): Recommendation[] {
  const { level, schoolLevel, stats, diagnosticPackageId, inProgress } = opts;
  const recs: Recommendation[] = [];

  if (inProgress) {
    recs.push({ key: "resume", title: `Resume: ${inProgress.title}`, reason: "You have an unfinished quiz.", cta: "Resume", action: { href: `/student/quiz/${inProgress.id}` } });
  }

  if (!level) {
    if (diagnosticPackageId) {
      recs.push({
        key: "placement",
        title: "Take the BEO Placement Test",
        reason: "Find your real CEFR level so we can recommend the right practice.",
        cta: "Start placement test",
        action: { packageId: diagnosticPackageId },
      });
    }
    recs.push({
      key: "a1-mixed",
      title: "Warm up with A1–A2 practice",
      reason: "Get used to the quiz format while you prepare for placement.",
      cta: "Practise A1",
      action: { practice: { p_learning_mode: "proficiency", p_cefr: "A1", p_count: 10, p_mode: "practice" } },
    });
    return recs;
  }

  // Weakest skill with enough evidence (≥3 answers)
  const skills = stats.by_category.filter((c) => PROFICIENCY_SKILLS.includes(c.slug as never) && c.answered >= 3);
  const weakest = [...skills].sort((a, b) => pct(a.correct, a.answered) - pct(b.correct, b.answered))[0];
  if (weakest && pct(weakest.correct, weakest.answered) < 80) {
    recs.push({
      key: "weakest",
      title: `Strengthen ${weakest.name} (${level})`,
      reason: `${pct(weakest.correct, weakest.answered)}% accuracy across your ${weakest.answered} ${weakest.name} answers — your lowest skill so far.`,
      cta: "Practise now",
      action: { practice: { p_learning_mode: "proficiency", p_cefr: level, p_category_slug: weakest.slug, p_count: 10, p_mode: "practice" } },
    });
  } else {
    const untried = PROFICIENCY_SKILLS.find((s) => !stats.by_category.some((c) => c.slug === s));
    if (untried) {
      recs.push({
        key: "untried",
        title: `Try ${categoryName(untried)} at ${level}`,
        reason: "You haven't practised this skill yet.",
        cta: "Start practice",
        action: { practice: { p_learning_mode: "proficiency", p_cefr: level, p_category_slug: untried, p_count: 10, p_mode: "practice" } },
      });
    }
  }

  const atLevel = stats.by_level.find((b) => b.level === level);
  const idx = CEFR_LEVELS.indexOf(level);
  if (atLevel && atLevel.answered >= 10 && pct(atLevel.correct, atLevel.answered) >= 75 && idx < 3) {
    const next = CEFR_LEVELS[idx + 1];
    recs.push({
      key: "next-level",
      title: `Ready for ${next} ${CEFR_META[next].name}?`,
      reason: `You're scoring ${pct(atLevel.correct, atLevel.answered)}% at ${level}. Challenge yourself with the next level.`,
      cta: `Explore ${next}`,
      action: { href: `/student/learn/proficiency/${CEFR_META[next].slug}` },
    });
  } else {
    recs.push({
      key: "level-mixed",
      title: `${level} mixed practice quiz`,
      reason: "Practise all skills at your level with instant explanations.",
      cta: "Start quiz",
      action: { practice: { p_learning_mode: "proficiency", p_cefr: level, p_count: 10, p_mode: "practice" } },
    });
  }

  if (schoolLevel) {
    recs.push({
      key: "olympiad",
      title: `${schoolLevel} Olympiad challenge`,
      reason: "Train HOTS, reasoning and reading in Olympiad style.",
      cta: "Open Olympiad track",
      action: { href: `/student/learn/olympiad/${schoolLevel.toLowerCase()}` },
    });
  }
  return recs.slice(0, 4);
}

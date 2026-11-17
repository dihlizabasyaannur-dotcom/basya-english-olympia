import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClipboardCheck, Shuffle } from "lucide-react";
import { Card, PageHeader } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { SkillCard } from "@/components/student/skill-card";
import { StartQuizButton } from "@/components/student/start-quiz-button";
import { requireRole } from "@/lib/auth";
import { getAvailability } from "@/lib/availability";
import { CATEGORIES, CEFR_META, PROFICIENCY_SKILLS, levelFromSlug } from "@/lib/constants";

export async function generateMetadata({ params }: { params: Promise<{ level: string }> }): Promise<Metadata> {
  const lvl = levelFromSlug((await params).level);
  return { title: lvl ? `${lvl} ${CEFR_META[lvl].name}` : "Level" };
}

export default async function LevelPage({ params }: { params: Promise<{ level: string }> }) {
  const level = levelFromSlug((await params).level);
  if (!level) notFound();
  const profile = await requireRole(["student"]);
  const avail = await getAvailability();
  const total = avail.count({ mode: "proficiency", cefr: level });
  const meta = CEFR_META[level];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={`English Proficiency · ${profile.cefr_level === level ? "Your level" : "CEFR level"}`}
        title={`${level} ${meta.name}`}
        description={<>{meta.summary} <span className="block pt-1 text-sm">By the end of this level you can: {meta.canDo}</span></>}
        action={<LinkButton href="/student/learn" variant="secondary" size="sm">All programs</LinkButton>}
      />

      <section>
        <h2 className="mb-3 text-lg font-bold">Skills</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PROFICIENCY_SKILLS.map((slug) => {
            const c = CATEGORIES.find((x) => x.slug === slug)!;
            return (
              <SkillCard key={slug} name={c.name} blurb={c.blurb} icon={c.icon} available={avail.count({ mode: "proficiency", cefr: level, category: slug })}
                practice={{ p_learning_mode: "proficiency", p_cefr: level, p_category_slug: slug, p_count: 10, p_mode: "practice" }} />
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-lavender text-brand"><Shuffle className="h-5 w-5" /></div><p className="font-semibold">Practice Quiz</p></div>
          <p className="mt-3 text-sm text-muted">10 mixed questions from every {level} skill. Immediate feedback and explanations after each answer.</p>
          <StartQuizButton practice={{ p_learning_mode: "proficiency", p_cefr: level, p_count: 10, p_mode: "practice", p_title: `${level} Practice Quiz` }} className="mt-5 w-full" disabled={total === 0}>Start practice quiz</StartQuizButton>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-gold"><ClipboardCheck className="h-5 w-5" /></div><p className="font-semibold">Progress Assessment</p></div>
          <p className="mt-3 text-sm text-muted">20 questions · 25 minutes · exam mode. Answers and explanations are revealed after you submit.</p>
          <StartQuizButton practice={{ p_learning_mode: "proficiency", p_cefr: level, p_count: 20, p_mode: "exam", p_time_limit: 25, p_assessment_type: "formative", p_title: `${level} Progress Assessment` }} variant="gold" className="mt-5 w-full" disabled={total === 0}>Start assessment</StartQuizButton>
        </Card>
      </section>
      {total === 0 && <p className="text-sm text-muted">No {level} questions have been published yet. Ma&apos;am Basya is preparing them.</p>}
    </div>
  );
}

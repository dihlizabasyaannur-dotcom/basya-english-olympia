import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Shuffle, Timer } from "lucide-react";
import { Card, PageHeader } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { SkillCard } from "@/components/student/skill-card";
import { StartQuizButton } from "@/components/student/start-quiz-button";
import { requireRole } from "@/lib/auth";
import { getAvailability } from "@/lib/availability";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES, OLYMPIAD_SKILLS } from "@/lib/constants";

export async function generateMetadata({ params }: { params: Promise<{ track: string }> }): Promise<Metadata> {
  return { title: `${(await params).track.toUpperCase()} Olympiad` };
}

export default async function OlympiadTrackPage({ params }: { params: Promise<{ track: string }> }) {
  const track = (await params).track.toUpperCase();
  if (track !== "SMP" && track !== "SMA") notFound();
  await requireRole(["student"]);
  const avail = await getAvailability();
  const supabase = await createClient();
  const { data: simulations } = await supabase
    .from("quiz_packages")
    .select("id, title, description, question_count, time_limit_minutes, passing_score")
    .eq("status", "published")
    .eq("assessment_type", "olympiad_simulation")
    .eq("school_level", track);
  const total = avail.count({ mode: "olympiad", school: track });

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="English Olympiad" title={`${track} Olympiad Track`} description="Olympiad-style challenges that stretch reasoning and critical reading. Difficulty here is independent of CEFR level." action={<LinkButton href="/student/learn" variant="secondary" size="sm">All programs</LinkButton>} />

      <section>
        <h2 className="mb-3 text-lg font-bold">Challenge areas</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {OLYMPIAD_SKILLS.map((slug) => {
            const c = CATEGORIES.find((x) => x.slug === slug)!;
            return (
              <SkillCard key={slug} name={c.name} blurb={c.blurb} icon={c.icon} available={avail.count({ mode: "olympiad", school: track, category: slug })}
                practice={{ p_learning_mode: "olympiad", p_school_level: track, p_category_slug: slug, p_count: 10, p_mode: "practice" }} />
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-lavender text-brand"><Shuffle className="h-5 w-5" /></div><p className="font-semibold">Mixed Olympiad Practice</p></div>
          <p className="mt-3 text-sm text-muted">10 questions from all challenge areas with instant explanations.</p>
          <StartQuizButton practice={{ p_learning_mode: "olympiad", p_school_level: track, p_count: 10, p_mode: "practice", p_title: `${track} Olympiad Mixed Practice` }} className="mt-5 w-full" disabled={total === 0}>Start practice</StartQuizButton>
        </Card>
        {(simulations ?? []).map((s) => (
          <Card key={s.id} className="p-6">
            <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-gold text-ink"><Timer className="h-5 w-5" /></div><p className="font-semibold">{s.title}</p></div>
            <p className="mt-3 text-sm text-muted">{s.description}</p>
            <p className="mt-2 text-xs font-semibold text-muted">{s.question_count} questions · {s.time_limit_minutes ? `${s.time_limit_minutes} minutes` : "untimed"} · pass {s.passing_score}%</p>
            <StartQuizButton packageId={s.id} variant="gold" className="mt-5 w-full" disabled={total === 0}>Start timed simulation</StartQuizButton>
          </Card>
        ))}
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, GraduationCap, Trophy } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getAvailability } from "@/lib/availability";
import { CEFR_LEVELS, CEFR_META, SCHOOL_TRACKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Learning Programs" };

export default async function LearnPage() {
  const profile = await requireRole(["student"]);
  const avail = await getAvailability();

  return (
    <div className="space-y-10">
      <PageHeader eyebrow="Learning programs" title="Choose your path" description="Build general proficiency level by level, or train for the English Olympiad in your school track." />

      <section id="proficiency" className="scroll-mt-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-white"><GraduationCap className="h-5 w-5" /></div>
          <div><h2 className="text-lg font-bold">English Proficiency</h2><p className="text-sm text-muted">CEFR levels A1–B2</p></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CEFR_LEVELS.map((lvl) => {
            const n = avail.count({ mode: "proficiency", cefr: lvl });
            const mine = profile.cefr_level === lvl;
            return (
              <Link key={lvl} href={`/student/learn/proficiency/${CEFR_META[lvl].slug}`} className="group">
                <Card className={cn("h-full p-5 transition-shadow group-hover:shadow-[var(--shadow-lift)]", mine && "border-brand ring-2 ring-brand/20")}>
                  <div className="flex items-center justify-between">
                    <span className="grid h-12 w-12 place-items-center rounded-xl bg-lavender font-display text-xl font-semibold text-brand">{lvl}</span>
                    {mine && <Badge tone="gold">Your level</Badge>}
                  </div>
                  <p className="mt-4 font-semibold">{CEFR_META[lvl].name}</p>
                  <p className="mt-1 text-sm text-muted">{CEFR_META[lvl].summary}</p>
                  <p className="mt-4 flex items-center justify-between text-xs font-semibold text-brand">{n} questions available <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></p>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <section id="olympiad" className="scroll-mt-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gold text-ink"><Trophy className="h-5 w-5" /></div>
          <div><h2 className="text-lg font-bold">English Olympiad</h2><p className="text-sm text-muted">Olympiad difficulty is independent of CEFR level</p></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {SCHOOL_TRACKS.map((t) => {
            const n = avail.count({ mode: "olympiad", school: t });
            const mine = profile.school_level === t;
            return (
              <Link key={t} href={`/student/learn/olympiad/${t.toLowerCase()}`} className="group">
                <Card className="bg-hero h-full border-none p-6 text-white transition-shadow group-hover:shadow-[var(--shadow-lift)]">
                  <div className="flex items-center justify-between">
                    <p className="font-display text-2xl font-semibold">{t} English Olympiad</p>
                    {mine && <Badge tone="gold">Your track</Badge>}
                  </div>
                  <p className="mt-2 text-sm text-lavender/80">{t === "SMP" ? "Junior high" : "Senior high"} · HOTS, reading, vocabulary, grammar, text analysis, reasoning and timed simulations.</p>
                  <p className="mt-5 flex items-center gap-1 text-sm font-semibold text-gold">{n} questions available <ArrowRight className="h-4 w-4" /></p>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

import Link from "next/link";
import { ArrowRight, BookOpenCheck, ChartLine, Flame, GraduationCap, ShieldCheck, Sparkles, Target, Trophy } from "lucide-react";
import { Logo, LogoMark } from "@/components/brand/logo";
import { LinkButton } from "@/components/ui/button";
import { CEFR_LEVELS, CEFR_META } from "@/lib/constants";
import { getCurrentProfile } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function LandingPage() {
  const profile = isSupabaseConfigured() ? await getCurrentProfile() : null;

  return (
    <div className="min-h-dvh bg-surface">
      {/* ---------- Hero ---------- */}
      <header className="bg-hero relative overflow-hidden text-white">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <Link href="/" aria-label="Basya English Olympia home"><Logo tone="light" className="[&_span.block:first-child]:hidden sm:[&_span.block:first-child]:block" /></Link>
          <div className="flex items-center gap-2">
            {profile ? (
              <LinkButton href="/dashboard" variant="gold" size="sm">Go to dashboard <ArrowRight className="h-4 w-4" /></LinkButton>
            ) : (
              <>
                <LinkButton href="/login" variant="outline-light" size="sm">Sign in</LinkButton>
                <LinkButton href="/register" variant="gold" size="sm">Join free</LinkButton>
              </>
            )}
          </div>
        </nav>

        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:pb-28 lg:pt-16">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-lavender">
              <Sparkles className="h-3.5 w-3.5 text-gold" /> For SMP &amp; SMA students across Indonesia
            </p>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-6xl">
              Learn. Practise.<br /><span className="text-gold">Compete.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-lavender/85 sm:text-lg">
              Build real English proficiency from A1 to B2 and train for the English Olympiad — with instant explanations,
              honest progress tracking and a placement test that measures your actual level, not your school grade.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href={profile ? "/dashboard" : "/register"} variant="gold" size="lg">
                {profile ? "Continue learning" : "Start with the placement test"} <ArrowRight className="h-4 w-4" />
              </LinkButton>
              <LinkButton href="#programs" variant="outline-light" size="lg">Explore programs</LinkButton>
            </div>
            <p className="mt-6 text-sm text-lavender/70">An English Learning Platform by Ma&apos;am Basya.</p>
          </div>

          {/* CEFR pathway visual */}
          <div className="relative">
            <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-sm sm:p-8">
              <div className="flex items-center gap-3">
                <LogoMark className="h-12 w-12" />
                <div>
                  <p className="text-sm font-semibold">Your CEFR pathway</p>
                  <p className="text-xs text-lavender/70">Placed by ability, grown by practice</p>
                </div>
              </div>
              <ol className="mt-6 space-y-3">
                {CEFR_LEVELS.map((lvl, i) => (
                  <li key={lvl} className="flex items-center gap-4 rounded-2xl bg-white/[0.06] p-3">
                    <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl font-display text-lg font-semibold ${i === 3 ? "bg-gold text-ink" : "bg-brand text-white"}`}>{lvl}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{CEFR_META[lvl].name}</p>
                      <p className="truncate text-xs text-lavender/70">{CEFR_META[lvl].canDo}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </header>

      {/* ---------- Programs ---------- */}
      <section id="programs" className="mx-auto max-w-6xl scroll-mt-8 px-4 py-20 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">Two learning programs</p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">One platform, two goals</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <ProgramCard
            icon={<GraduationCap className="h-6 w-6" />}
            title="English Proficiency"
            text="Four CEFR levels — A1 Beginner, A2 Elementary, B1 Intermediate and B2 Upper Intermediate. Each level covers Grammar, Vocabulary, Reading, Language Use and Text Analysis, plus practice quizzes and progress assessments."
            points={["Placement by real ability", "Skill-by-skill practice", "Progress assessments per level"]}
          />
          <ProgramCard
            gold
            icon={<Trophy className="h-6 w-6" />}
            title="English Olympiad"
            text="Separate SMP and SMA tracks with HOTS, reading, vocabulary and grammar challenges, text analysis, Olympiad reasoning and timed simulation tests."
            points={["SMP & SMA tracks", "HOTS & reasoning questions", "Timed Olympiad simulations"]}
          />
        </div>
      </section>

      {/* ---------- Features ---------- */}
      <section className="border-y border-line bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          <Feature icon={<Target />} title="Honest placement" text="A balanced A1–B2 diagnostic places you where you actually are." />
          <Feature icon={<BookOpenCheck />} title="Learn from every answer" text="Detailed explanations and distractor analysis for each question." />
          <Feature icon={<ChartLine />} title="Real progress" text="Analytics built only from your own answers — never invented numbers." />
          <Feature icon={<Flame />} title="Stay motivated" text="XP, daily streaks and badges for meaningful learning." />
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="bg-hero flex flex-col items-start justify-between gap-6 rounded-[1.75rem] p-8 text-white sm:p-12 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-3xl font-semibold">Ready to find your level?</h2>
            <p className="mt-2 text-lavender/80">Create a free student account and take the BEO Placement Test.</p>
          </div>
          <LinkButton href={profile ? "/dashboard" : "/register"} variant="gold" size="lg">
            {profile ? "Open dashboard" : "Create my account"} <ArrowRight className="h-4 w-4" />
          </LinkButton>
        </div>
      </section>

      <footer className="border-t border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:px-6">
          <Logo showSignature />
          <p className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-brand" /> Student results are private to students, their teachers and the admin.</p>
        </div>
      </footer>
    </div>
  );
}

function ProgramCard({ icon, title, text, points, gold }: { icon: React.ReactNode; title: string; text: string; points: string[]; gold?: boolean }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-white p-7 shadow-[var(--shadow-soft)]">
      <div className={`grid h-12 w-12 place-items-center rounded-2xl ${gold ? "bg-gold-50 text-gold-600" : "bg-lavender text-brand"}`}>{icon}</div>
      <h3 className="mt-5 font-display text-2xl font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-muted">{text}</p>
      <ul className="mt-5 space-y-2">
        {points.map((p) => (
          <li key={p} className="flex items-center gap-2 text-sm font-medium text-ink">
            <span className={`h-1.5 w-1.5 rounded-full ${gold ? "bg-gold" : "bg-brand"}`} /> {p}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div>
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-lavender text-brand [&_svg]:h-5 [&_svg]:w-5">{icon}</div>
      <h3 className="mt-4 font-semibold text-ink">{title}</h3>
      <p className="mt-1 text-sm text-muted">{text}</p>
    </div>
  );
}

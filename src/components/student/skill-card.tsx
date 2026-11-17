import { Brain, BookOpen, Languages, Lightbulb, MessageCircle, Puzzle, ScanText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StartQuizButton } from "./start-quiz-button";
import type { PracticeParams } from "@/lib/types";

const ICONS = { puzzle: Puzzle, languages: Languages, "book-open": BookOpen, "message-circle": MessageCircle, "scan-text": ScanText, lightbulb: Lightbulb, brain: Brain } as const;

export function SkillCard({ name, blurb, icon, available, practice }: { name: string; blurb: string; icon: string; available: number; practice: PracticeParams }) {
  const Icon = ICONS[icon as keyof typeof ICONS] ?? BookOpen;
  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-lavender text-brand"><Icon className="h-5 w-5" /></div>
        <div className="min-w-0"><p className="font-semibold">{name}</p><p className="text-xs text-muted">{available} question{available === 1 ? "" : "s"} available</p></div>
      </div>
      <p className="mt-3 flex-1 text-sm text-muted">{blurb}</p>
      {available > 0 ? (
        <StartQuizButton practice={practice} variant="secondary" size="sm" className="mt-4 w-full">Practise {name}</StartQuizButton>
      ) : (
        <p className="mt-4 rounded-xl bg-lavender-50 px-3 py-2 text-center text-xs text-muted">Questions coming soon</p>
      )}
    </Card>
  );
}

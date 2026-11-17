import { Award, BookOpen, Flame, Footprints, Languages, Puzzle, Trophy } from "lucide-react";

const MAP = { footprints: Footprints, puzzle: Puzzle, "book-open": BookOpen, languages: Languages, trophy: Trophy, flame: Flame } as const;

export function BadgeIcon({ icon, className }: { icon: string; className?: string }) {
  const Icon = MAP[icon as keyof typeof MAP] ?? Award;
  return <Icon className={className} aria-hidden />;
}

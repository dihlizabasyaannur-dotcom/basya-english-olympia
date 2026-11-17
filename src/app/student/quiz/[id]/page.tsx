import type { Metadata } from "next";
import { QuizPlayer } from "./quiz-player";

export const metadata: Metadata = { title: "Quiz" };

export default async function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <QuizPlayer attemptId={id} />;
}

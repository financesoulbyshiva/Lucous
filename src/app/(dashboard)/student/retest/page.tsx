import type { Metadata } from "next";
import { StudentQuizPage } from "@/components/student/quiz-runner";

export const metadata: Metadata = {
  title: "Retest — LUCOUS",
};

export default async function StudentRetestPage({
  searchParams,
}: {
  searchParams: Promise<{ topicId?: string; mode?: string }>;
}) {
  const { topicId, mode } = await searchParams;

  const parsed = topicId ? Number(topicId) : NaN;
  const presetTopicId = Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  const quizMode = mode === "PRACTICE" ? "PRACTICE" : "RETEST";

  return <StudentQuizPage mode={quizMode} presetTopicId={presetTopicId} />;
}

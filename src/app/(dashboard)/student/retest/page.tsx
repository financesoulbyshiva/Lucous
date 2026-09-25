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

  // Topic ids are MongoDB ObjectIds (opaque strings) — pass through as-is.
  const presetTopicId = topicId && topicId.trim() ? topicId : null;
  const quizMode = mode === "PRACTICE" ? "PRACTICE" : "RETEST";

  return <StudentQuizPage mode={quizMode} presetTopicId={presetTopicId} />;
}

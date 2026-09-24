import type { Metadata } from "next";
import { StudentQuizPage } from "@/components/student/quiz-runner";

export const metadata: Metadata = {
  title: "Play — LUCOUS",
};

export default function StudentPlayPage() {
  return <StudentQuizPage mode="PLAY" />;
}

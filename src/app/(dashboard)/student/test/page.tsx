import type { Metadata } from "next";
import { StudentQuizPage } from "@/components/student/quiz-runner";

export const metadata: Metadata = {
  title: "Test — LUCOUS",
};

export default function StudentTestPage() {
  return <StudentQuizPage mode="TEST" />;
}

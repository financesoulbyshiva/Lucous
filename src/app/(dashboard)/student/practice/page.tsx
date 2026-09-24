import type { Metadata } from "next";
import { StudentQuizPage } from "@/components/student/quiz-runner";

export const metadata: Metadata = {
  title: "Practice — LUCOUS",
};

export default function StudentPracticePage() {
  return <StudentQuizPage mode="PRACTICE" />;
}

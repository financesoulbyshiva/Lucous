import type { Metadata } from "next";
import { TutorView } from "@/components/student/tutor-view";

export const metadata: Metadata = {
  title: "AI Tutor — LUCOUS",
};

export default function StudentTutorPage() {
  return <TutorView />;
}

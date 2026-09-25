import type { Metadata } from "next";
import { CoursesView } from "@/components/student/courses-view";

export const metadata: Metadata = {
  title: "Courses — LUCOUS",
};

export default function StudentCoursesPage() {
  return <CoursesView />;
}

import type { Metadata } from "next";
import { LearnFlow } from "@/components/student/learn-flow";

export const metadata: Metadata = {
  title: "Learn — LUCOUS",
};

export default function StudentLearnPage() {
  return <LearnFlow />;
}

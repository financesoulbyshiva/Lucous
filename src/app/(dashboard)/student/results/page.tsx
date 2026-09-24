import type { Metadata } from "next";
import { ResultsView } from "@/components/student/results-view";

export const metadata: Metadata = {
  title: "Results — LUCOUS",
};

export default function StudentResultsPage() {
  return <ResultsView />;
}

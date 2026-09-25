import type { Metadata } from "next";
import { GamesView } from "@/components/student/games-view";

export const metadata: Metadata = {
  title: "Games — LUCOUS",
};

export default function StudentGamesPage() {
  return <GamesView />;
}

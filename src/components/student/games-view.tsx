"use client";

import * as React from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RequireStudent } from "@/components/student/require-student";
import { TopicPicker } from "@/components/student/topic-picker";
import {
  apiFetch,
  optionText,
  type Game,
  type GameStats,
  type LeaderboardEntry,
  type Question,
  type Topic,
} from "@/lib/api";
import { cn } from "cn";

type Tab = "play" | "leaderboard" | "stats";

export function GamesView() {
  const [tab, setTab] = React.useState<Tab>("play");

  return (
    <RequireStudent title="Games">
      <div className="grid gap-5">
        <section>
          <h1 className="font-heading text-2xl font-semibold">Learning games</h1>
          <p className="text-sm text-muted-foreground">
            Play topic games, earn XP and climb the leaderboard.
          </p>
        </section>

        <div className="flex flex-wrap gap-2">
          {(["play", "leaderboard", "stats"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                tab === t && "border-primary bg-primary/5 text-primary"
              )}
            >
              {t === "play" ? "Play" : t === "leaderboard" ? "Leaderboard" : "My stats"}
            </button>
          ))}
        </div>

        {tab === "play" ? <PlayPanel /> : null}
        {tab === "leaderboard" ? <LeaderboardPanel /> : null}
        {tab === "stats" ? <StatsPanel /> : null}
      </div>
    </RequireStudent>
  );
}

function PlayPanel() {
  const [games, setGames] = React.useState<Game[]>([]);
  const [game, setGame] = React.useState<Game | null>(null);
  const [topic, setTopic] = React.useState<Topic | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const d = await apiFetch<{ games: Game[] }>("/games");
        if (active) setGames(d.games);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Failed to load games");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (game && topic) {
    return (
      <GameRunner
        game={game}
        topic={topic}
        onExit={() => {
          setGame(null);
          setTopic(null);
        }}
      />
    );
  }

  if (game) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{game.title}</CardTitle>
          <CardDescription>Pick a topic to play</CardDescription>
        </CardHeader>
        <CardContent>
          <TopicPicker onSelect={setTopic} />
          <Button variant="outline" size="sm" className="mt-3" onClick={() => setGame(null)}>
            Back to games
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        games.map((g) => (
          <Card key={g.id} className="h-full">
            <CardHeader>
              <CardTitle className="text-base">{g.title}</CardTitle>
              <CardDescription>{g.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="sm" className="w-full" onClick={() => setGame(g)}>
                Start game
              </Button>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

function GameRunner({
  game,
  topic,
  onExit,
}: {
  game: Game;
  topic: Topic;
  onExit: () => void;
}) {
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [index, setIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, number>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<{ correct: number; total: number; score: number; xp: number; totalXp: number } | null>(null);

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const d = await apiFetch<{ questions: Question[] }>(
          `/student/questions?topicId=${topic.id}&limit=${game.limit}`
        );
        if (active) setQuestions(d.questions);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Failed to load questions");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [topic.id, game.limit]);

  const total = questions.length;
  const question = questions[index];
  const answered = Object.keys(answers).length;

  async function submit() {
    setSubmitting(true);
    setError("");
    try {
      const payload = questions.map((q) => ({ questionId: q.id, selected: answers[String(q.id)] ?? -1 }));
      const d = await apiFetch<{ correct: number; total: number; score: number; xp: number; totalXp: number }>(
        "/games/submit",
        { method: "POST", body: { gameId: game.id, topicId: topic.id, answers: payload } }
      );
      setResult(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading questions…</p>;
  if (total === 0) {
    return (
      <div className="grid gap-3">
        <p className="text-sm text-muted-foreground">No questions available for this topic yet.</p>
        <Button variant="outline" size="sm" onClick={onExit}>Back to games</Button>
      </div>
    );
  }

  if (result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{game.title} complete</CardTitle>
          <CardDescription>{topic.name}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={result.score >= 60 ? "secondary" : "destructive"}>Score {result.score}%</Badge>
            <Badge variant="outline">+{result.xp} XP</Badge>
            <span className="text-sm text-muted-foreground">
              {result.correct}/{result.total} correct · total {result.totalXp} XP
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onExit}>Play another</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="text-muted-foreground">Question {index + 1} of {total}</span>
        <span className="text-muted-foreground">{answered}/{total} answered</span>
      </div>
      <Progress value={Math.round((answered / total) * 100)} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{question?.text}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          {question
            ? [0, 1, 2, 3].map((oi) => {
                const selected = answers[String(question.id)] === oi;
                return (
                  <button
                    key={oi}
                    type="button"
                    onClick={() => setAnswers((p) => ({ ...p, [String(question.id)]: oi }))}
                    className={
                      "rounded-lg border px-3 py-2 text-left text-sm transition-colors " +
                      (selected ? "border-primary bg-primary/5" : "hover:bg-muted")
                    }
                  >
                    {optionText(question, oi)}
                  </button>
                );
              })
            : null}
        </CardContent>
      </Card>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex items-center justify-between gap-2">
        <Button variant="outline" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}>
          Previous
        </Button>
        <div className="flex gap-2">
          {index < total - 1 ? (
            <Button variant="outline" onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}>
              Next
            </Button>
          ) : null}
          <Button onClick={() => void submit()} disabled={submitting || answered < total}>
            {submitting ? "Submitting…" : "Submit"}
          </Button>
        </div>
      </div>
      {answered < total ? (
        <p className="text-center text-xs text-muted-foreground">Answer all questions to submit.</p>
      ) : null}
    </div>
  );
}

function LeaderboardPanel() {
  const [rows, setRows] = React.useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const d = await apiFetch<{ leaderboard: LeaderboardEntry[] }>("/games/leaderboard");
        if (active) setRows(d.leaderboard);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Failed to load leaderboard");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leaderboard</CardTitle>
        <CardDescription>Top students by XP</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No scores yet. Play a game to get on the board!</p>
        ) : (
          rows.map((r, i) => (
            <div key={r.id} className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2">
              <span className="text-sm font-medium">#{i + 1} · {r.name}</span>
              <Badge variant="secondary">{r.xp} XP</Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function StatsPanel() {
  const [stats, setStats] = React.useState<GameStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const d = await apiFetch<GameStats>("/games/me");
        if (active) setStats(d);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Failed to load stats");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>My game stats</CardTitle>
        <CardDescription>
          {stats ? `${stats.totalXp} XP · ${stats.gamesPlayed} games · best ${stats.bestScore}%` : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : stats && stats.recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">No games played yet.</p>
        ) : (
          stats?.recent.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2">
              <div>
                <p className="text-sm font-medium">{r.gameId}</p>
                <p className="text-xs text-muted-foreground">
                  {r.topic?.name ?? ""} · {r.correct}/{r.total} correct
                </p>
              </div>
              <Badge variant="outline">+{r.xp} XP</Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

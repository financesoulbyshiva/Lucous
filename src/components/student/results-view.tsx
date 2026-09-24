"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "cn";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { RequireStudent } from "@/components/student/require-student";
import { apiFetch, type Attempt, type WeakTopic } from "@/lib/api";

export function ResultsView() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [attempts, setAttempts] = React.useState<Attempt[]>([]);
  const [weakTopics, setWeakTopics] = React.useState<WeakTopic[]>([]);

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [res, weak] = await Promise.all([
          apiFetch<{ attempts: Attempt[] }>("/student/results"),
          apiFetch<{ weakTopics: WeakTopic[] }>("/student/weak-topics"),
        ]);
        if (!active) return;
        setAttempts(res.attempts);
        setWeakTopics(weak.weakTopics);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const topicsAttempted = new Set(attempts.map((a) => a.topicId)).size;
  const totalCorrect = attempts.reduce((sum, a) => sum + a.correct, 0);
  const totalQuestions = attempts.reduce((sum, a) => sum + a.total, 0);
  const avgScore =
    attempts.length > 0
      ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length)
      : 0;

  return (
    <RequireStudent title="Results">
      <div className="grid gap-5">
        <section>
          <h1 className="font-heading text-2xl font-semibold">Results</h1>
          <p className="text-sm text-muted-foreground">
            Your attempt history and weak topics.
          </p>
        </section>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Attempts" value={loading ? "—" : String(attempts.length)} />
          <Stat label="Topics attempted" value={loading ? "—" : String(topicsAttempted)} />
          <Stat
            label="Total correct"
            value={loading ? "—" : `${totalCorrect}/${totalQuestions}`}
          />
          <Stat label="Average score" value={loading ? "—" : `${avgScore}%`} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Weak topics</CardTitle>
            <CardDescription>Latest score below 60%</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : weakTopics.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No weak topics. Nice work!
              </p>
            ) : (
              weakTopics.map((w) => (
                <div
                  key={w.topicId}
                  className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium">{w.topicName}</p>
                    <p className="text-xs text-muted-foreground">
                      {w.chapterName} · Last score {w.score}%
                    </p>
                  </div>
                  <Link
                    href={`/student/retest?topicId=${w.topicId}&mode=${
                      w.action === "Retest" ? "RETEST" : "PRACTICE"
                    }`}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  >
                    {w.action}
                  </Link>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attempt history</CardTitle>
            <CardDescription>Most recent first</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : attempts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No attempts yet.</p>
            ) : (
              attempts.map((a) => (
                <div
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium">{a.topic.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.topic.chapter.name} · {a.mode} · {a.correct} correct ·{" "}
                      {a.total - a.correct} incorrect ·{" "}
                      {new Date(a.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={a.score >= 60 ? "secondary" : "destructive"}>
                    {a.score}%
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </RequireStudent>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card size="sm">
      <CardContent className="grid gap-0.5">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="font-heading text-xl font-semibold">{value}</span>
      </CardContent>
    </Card>
  );
}

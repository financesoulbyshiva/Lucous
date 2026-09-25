"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  type Attempt,
  type PerQuestion,
  type Question,
  type Topic,
} from "@/lib/api";

type QuizMode = "PLAY" | "PRACTICE" | "TEST" | "RETEST";

const MODE_CONFIG: Record<
  QuizMode,
  { title: string; blurb: string; limit: number; immediate: boolean }
> = {
  PLAY: {
    title: "Play",
    blurb: "Quick round with instant feedback. Earn 10 points per correct answer.",
    limit: 5,
    immediate: true,
  },
  PRACTICE: {
    title: "Practice",
    blurb: "Pick a topic, answer the questions, then check your score.",
    limit: 8,
    immediate: false,
  },
  TEST: {
    title: "Test",
    blurb: "Topic test. Submit at the end to see your score and answers.",
    limit: 30,
    immediate: false,
  },
  RETEST: {
    title: "Retest",
    blurb: "Retake the questions from a weak topic to update your progress.",
    limit: 30,
    immediate: false,
  },
};

export function isQuizMode(value: string | null): value is QuizMode {
  return (
    value === "PLAY" || value === "PRACTICE" || value === "TEST" || value === "RETEST"
  );
}

// Page-level component. When presetTopicId is supplied (e.g. from a weak-topic
// Retest link) the cascade is skipped and the quiz starts immediately.
export function StudentQuizPage({
  mode,
  presetTopicId,
}: {
  mode: QuizMode;
  presetTopicId?: string | number | null;
}) {
  const config = MODE_CONFIG[mode];
  const [topic, setTopic] = React.useState<Topic | null>(null);

  const activeTopicId = presetTopicId ?? topic?.id ?? null;

  return (
    <RequireStudent title={config.title}>
      <div className="grid gap-5">
        <section>
          <h1 className="font-heading text-2xl font-semibold">{config.title}</h1>
          <p className="text-sm text-muted-foreground">{config.blurb}</p>
        </section>

        {activeTopicId ? (
          <QuizRunner mode={mode} topicId={activeTopicId} limit={config.limit} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Select topic</CardTitle>
              <CardDescription>Choose what to work on</CardDescription>
            </CardHeader>
            <CardContent>
              <TopicPicker onSelect={setTopic} />
            </CardContent>
          </Card>
        )}
      </div>
    </RequireStudent>
  );
}

interface Feedback {
  correct: boolean;
  correctIndex: number;
  explanation: string | null;
}

function QuizRunner({
  mode,
  topicId,
  limit,
}: {
  mode: QuizMode;
  topicId: string | number;
  limit: number;
}) {
  const router = useRouter();
  const immediate = MODE_CONFIG[mode].immediate;

  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [index, setIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<number, number>>({});
  const [feedback, setFeedback] = React.useState<Record<number, Feedback>>({});
  const [phase, setPhase] = React.useState<"quiz" | "result">("quiz");
  const [submitting, setSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<{
    attempt: Attempt;
    perQuestion: PerQuestion[];
  } | null>(null);

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await apiFetch<{ questions: Question[] }>(
          `/student/questions?topicId=${topicId}&limit=${limit}`
        );
        if (active) setQuestions(data.questions);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [topicId, limit]);

  const question = questions[index];
  const total = questions.length;
  const answeredCount = Object.keys(answers).length;
  const points = Object.values(feedback).filter((f) => f.correct).length * 10;

  async function selectOption(optionIndex: number) {
    if (!question) return;
    if (immediate && feedback[question.id]) return;

    setAnswers((prev) => ({ ...prev, [question.id]: optionIndex }));

    if (immediate) {
      try {
        const data = await apiFetch<{
          correct: boolean;
          correctIndex: number;
          explanation: string | null;
        }>("/student/check", {
          method: "POST",
          body: { questionId: question.id, selected: optionIndex },
        });
        setFeedback((prev) => ({
          ...prev,
          [question.id]: {
            correct: data.correct,
            correctIndex: data.correctIndex,
            explanation: data.explanation,
          },
        }));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to check answer");
      }
    }
  }

  async function submit() {
    if (total === 0) return;
    setSubmitting(true);
    setError("");
    try {
      const payload = questions.map((q) => ({
        questionId: q.id,
        selected: answers[q.id] ?? -1,
      }));
      const data = await apiFetch<{ attempt: Attempt; perQuestion: PerQuestion[] }>(
        "/student/attempts",
        { method: "POST", body: { topicId, mode, answers: payload } }
      );
      setResult(data);
      setPhase("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading questions…</p>;
  }

  if (error && total === 0) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  if (total === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No questions available for this topic yet.
      </p>
    );
  }

  if (phase === "result" && result) {
    const { attempt, perQuestion } = result;
    const byId = new Map(questions.map((q) => [q.id, q]));
    return (
      <div className="grid gap-5">
        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
            <CardDescription>{MODE_CONFIG[mode].title} complete</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={attempt.score >= 60 ? "secondary" : "destructive"}>
                Score {attempt.score}%
              </Badge>
              <span className="text-sm text-muted-foreground">
                {attempt.correct}/{attempt.total} correct
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/student/results")}
              >
                View all results
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/student/dashboard")}
              >
                Back to dashboard
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-3">
          {perQuestion.map((pq, i) => {
            const q = byId.get(pq.questionId);
            if (!q) return null;
            return (
              <Card key={pq.questionId}>
                <CardContent className="grid gap-2 pt-1">
                  <p className="text-sm font-medium">
                    {i + 1}. {q.text}
                  </p>
                  <ul className="grid gap-1">
                    {[0, 1, 2, 3].map((oi) => {
                      const isCorrect = oi === pq.correctIndex;
                      const isChosen = oi === pq.selected;
                      return (
                        <li
                          key={oi}
                          className={
                            "flex items-center gap-2 rounded-md px-2 py-1 text-sm " +
                            (isCorrect
                              ? "bg-brand-green/10 text-brand-green"
                              : isChosen
                                ? "bg-destructive/10 text-destructive"
                                : "text-muted-foreground")
                          }
                        >
                          {isCorrect ? <Check className="size-4" aria-hidden /> : null}
                          {isChosen && !isCorrect ? <X className="size-4" aria-hidden /> : null}
                          {optionText(q, oi)}
                        </li>
                      );
                    })}
                  </ul>
                  {pq.explanation ? (
                    <p className="text-xs text-muted-foreground">
                      {pq.explanation}
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Quiz phase
  const fb = question ? feedback[question.id] : undefined;
  const isLast = index === total - 1;
  const canSubmit = !immediate && answeredCount === total;

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="text-muted-foreground">
          Question {index + 1} of {total}
        </span>
        {immediate ? (
          <Badge variant="secondary">{points} pts</Badge>
        ) : (
          <span className="text-muted-foreground">
            {answeredCount}/{total} answered
          </span>
        )}
      </div>

      <Progress value={Math.round((answeredCount / total) * 100)} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{question?.text}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          {question
            ? [0, 1, 2, 3].map((oi) => {
                const selected = answers[question.id] === oi;
                const showCorrect = fb && oi === fb.correctIndex;
                const showWrong = fb && selected && !fb.correct;
                return (
                  <button
                    key={oi}
                    type="button"
                    disabled={immediate && !!fb}
                    onClick={() => selectOption(oi)}
                    className={
                      "flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors disabled:cursor-default " +
                      (showCorrect
                        ? "border-brand-green bg-brand-green/10 text-brand-green"
                        : showWrong
                          ? "border-destructive bg-destructive/10 text-destructive"
                          : selected
                            ? "border-primary bg-primary/5"
                            : "hover:bg-muted")
                    }
                  >
                    <span>{optionText(question, oi)}</span>
                    {showCorrect ? <Check className="size-4" aria-hidden /> : null}
                    {showWrong ? <X className="size-4" aria-hidden /> : null}
                  </button>
                );
              })
            : null}

          {immediate && fb ? (
            <div className="grid gap-1">
              <p
                className={
                  "text-sm font-medium " +
                  (fb.correct ? "text-brand-green" : "text-destructive")
                }
              >
                {fb.correct ? "Correct! +10 points" : "Not quite."}
              </p>
              {fb.explanation ? (
                <p className="text-xs text-muted-foreground">{fb.explanation}</p>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
        >
          Previous
        </Button>

        {immediate ? (
          <Button
            onClick={() => {
              if (isLast) void submit();
              else setIndex((i) => Math.min(total - 1, i + 1));
            }}
            disabled={!fb}
          >
            {isLast ? "Finish" : "Next"}
          </Button>
        ) : (
          <div className="flex gap-2">
            {!isLast ? (
              <Button
                variant="outline"
                onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
              >
                Next
              </Button>
            ) : null}
            <Button onClick={() => void submit()} disabled={submitting || !canSubmit}>
              {submitting ? "Submitting…" : "Submit"}
            </Button>
          </div>
        )}
      </div>

      {!immediate && !canSubmit ? (
        <p className="text-center text-xs text-muted-foreground">
          Answer all questions to submit.
        </p>
      ) : null}
    </div>
  );
}

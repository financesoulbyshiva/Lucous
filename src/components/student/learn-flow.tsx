"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RequireStudent } from "@/components/student/require-student";
import { TopicPicker } from "@/components/student/topic-picker";
import { apiFetch, type ContentItem, type Topic } from "@/lib/api";

export function LearnFlow() {
  const [topic, setTopic] = React.useState<Topic | null>(null);
  const [contents, setContents] = React.useState<ContentItem[]>([]);
  const [completedIds, setCompletedIds] = React.useState<number[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const topicId = topic?.id;

  React.useEffect(() => {
    if (!topicId) return;
    let active = true;
    (async () => {
      try {
        const data = await apiFetch<{
          contents: ContentItem[];
          completedIds: number[];
        }>(`/student/content?topicId=${topicId}`);
        if (active) {
          setContents(data.contents);
          setCompletedIds(data.completedIds);
        }
      } catch (err) {
        if (active)
          setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [topicId]);

  function handleSelectTopic(next: Topic) {
    setTopic(next);
    setContents([]);
    setCompletedIds([]);
    setError("");
    setLoading(true);
  }

  async function markComplete(contentId: number) {
    try {
      await apiFetch("/student/progress", {
        method: "POST",
        body: { contentId },
      });
      setCompletedIds((prev) =>
        prev.includes(contentId) ? prev : [...prev, contentId]
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save progress");
    }
  }

  return (
    <RequireStudent title="Learn">
      <div className="grid gap-5">
        <section>
          <h1 className="font-heading text-2xl font-semibold">Learn</h1>
          <p className="text-sm text-muted-foreground">
            Choose a board, class, subject, chapter and topic, then study the
            lessons.
          </p>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Select topic</CardTitle>
          </CardHeader>
          <CardContent>
            <TopicPicker onSelect={handleSelectTopic} />
          </CardContent>
        </Card>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        {topic ? (
          loading ? (
            <p className="text-sm text-muted-foreground">Loading lessons…</p>
          ) : contents.length > 0 ? (
            <div className="grid gap-3">
              {contents.map((item) => {
                const done = completedIds.includes(item.id);
                return (
                  <Card key={item.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {item.title}
                        {done ? (
                          <span className="text-xs font-normal text-brand-green">
                            Completed
                          </span>
                        ) : null}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                      <p className="whitespace-pre-line text-sm text-muted-foreground">
                        {item.body}
                      </p>
                      <div>
                        <Button
                          variant={done ? "secondary" : "default"}
                          size="sm"
                          disabled={done}
                          onClick={() => markComplete(item.id)}
                        >
                          {done ? <Check aria-hidden /> : null}
                          {done ? "Completed" : "Mark as completed"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No lessons available for this topic yet.
            </p>
          )
        ) : null}
      </div>
    </RequireStudent>
  );
}

"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RequireStudent } from "@/components/student/require-student";
import { apiFetch, type TutorResponse } from "@/lib/api";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function TutorView() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = React.useState<string | null>(null);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const endRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);
    setError("");
    try {
      const d = await apiFetch<TutorResponse>("/ai/tutor", {
        method: "POST",
        body: { message: text, conversationId: conversationId ?? undefined },
      });
      setConversationId(d.conversationId);
      setMessages((prev) => [...prev, { role: "assistant", content: d.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tutor request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <RequireStudent title="AI Tutor">
      <div className="grid gap-5">
        <section>
          <h1 className="font-heading text-2xl font-semibold">AI Tutor</h1>
          <p className="text-sm text-muted-foreground">
            Ask for explanations, worked examples and study guidance.
          </p>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Chat</CardTitle>
            <CardDescription>
              {conversationId ? `Session ${conversationId}` : "Start a conversation"}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="grid max-h-[50vh] gap-2 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No messages yet. Ask a question to begin.
                </p>
              ) : (
                messages.map((m, i) => (
                  <div
                    key={i}
                    className={
                      "max-w-[85%] rounded-lg px-3 py-2 text-sm " +
                      (m.role === "user"
                        ? "ml-auto bg-primary/10 text-foreground"
                        : "bg-muted text-foreground")
                    }
                  >
                    {m.content}
                  </div>
                ))
              )}
              {loading ? (
                <div className="max-w-[85%] rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                  Thinking…
                </div>
              ) : null}
              <div ref={endRef} />
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <form className="flex gap-2" onSubmit={send}>
              <Input
                className="h-10 flex-1"
                value={input}
                disabled={loading}
                placeholder="Ask your tutor a question…"
                onChange={(e) => setInput(e.target.value)}
              />
              <Button type="submit" disabled={loading || !input.trim()}>
                {loading ? "Sending…" : "Send"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </RequireStudent>
  );
}

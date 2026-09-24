"use client";

import * as React from "react";
import {
  apiFetch,
  type Board,
  type Chapter,
  type Grade,
  type Subject,
  type Topic,
} from "@/lib/api";

const selectClass =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function msg(e: unknown): string {
  return e instanceof Error ? e.message : "Failed to load";
}

// Reusable data-driven cascade: Board -> Class -> Subject -> Chapter -> Topic.
// Nothing is hardcoded to a specific board/class/subject; every level is
// fetched from the backend. Calls onSelect once a topic is chosen.
export function TopicPicker({
  onSelect,
}: {
  onSelect: (topic: Topic) => void;
}) {
  const [boards, setBoards] = React.useState<Board[]>([]);
  const [grades, setGrades] = React.useState<Grade[]>([]);
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [chapters, setChapters] = React.useState<Chapter[]>([]);
  const [topics, setTopics] = React.useState<Topic[]>([]);

  const [boardId, setBoardId] = React.useState("");
  const [gradeId, setGradeId] = React.useState("");
  const [subjectId, setSubjectId] = React.useState("");
  const [chapterId, setChapterId] = React.useState("");
  const [topicId, setTopicId] = React.useState("");

  const [loadingBoards, setLoadingBoards] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const d = await apiFetch<{ boards: Board[] }>("/student/boards");
        if (active) setBoards(d.boards);
      } catch (e) {
        if (active) setError(msg(e));
      } finally {
        if (active) setLoadingBoards(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  React.useEffect(() => {
    if (!boardId) return;
    let active = true;
    (async () => {
      try {
        const d = await apiFetch<{ classes: Grade[] }>(
          `/student/classes?boardId=${boardId}`
        );
        if (active) setGrades(d.classes);
      } catch (e) {
        if (active) setError(msg(e));
      }
    })();
    return () => {
      active = false;
    };
  }, [boardId]);

  React.useEffect(() => {
    if (!boardId || !gradeId) return;
    let active = true;
    (async () => {
      try {
        const d = await apiFetch<{ subjects: Subject[] }>(
          `/student/subjects?boardId=${boardId}&gradeId=${gradeId}`
        );
        if (active) setSubjects(d.subjects);
      } catch (e) {
        if (active) setError(msg(e));
      }
    })();
    return () => {
      active = false;
    };
  }, [boardId, gradeId]);

  React.useEffect(() => {
    if (!subjectId) return;
    let active = true;
    (async () => {
      try {
        const d = await apiFetch<{ chapters: Chapter[] }>(
          `/student/chapters?subjectId=${subjectId}`
        );
        if (active) setChapters(d.chapters);
      } catch (e) {
        if (active) setError(msg(e));
      }
    })();
    return () => {
      active = false;
    };
  }, [subjectId]);

  React.useEffect(() => {
    if (!chapterId) return;
    let active = true;
    (async () => {
      try {
        const d = await apiFetch<{ topics: Topic[] }>(
          `/student/topics?chapterId=${chapterId}`
        );
        if (active) setTopics(d.topics);
      } catch (e) {
        if (active) setError(msg(e));
      }
    })();
    return () => {
      active = false;
    };
  }, [chapterId]);

  function onBoardChange(value: string) {
    setBoardId(value);
    setGrades([]);
    setSubjects([]);
    setChapters([]);
    setTopics([]);
    setGradeId("");
    setSubjectId("");
    setChapterId("");
    setTopicId("");
  }

  function onGradeChange(value: string) {
    setGradeId(value);
    setSubjects([]);
    setChapters([]);
    setTopics([]);
    setSubjectId("");
    setChapterId("");
    setTopicId("");
  }

  function onSubjectChange(value: string) {
    setSubjectId(value);
    setChapters([]);
    setTopics([]);
    setChapterId("");
    setTopicId("");
  }

  function onChapterChange(value: string) {
    setChapterId(value);
    setTopics([]);
    setTopicId("");
  }

  function onTopicChange(value: string) {
    setTopicId(value);
    const topic = topics.find((t) => String(t.id) === value);
    if (topic) onSelect(topic);
  }

  return (
    <div className="grid gap-3">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <label className="grid gap-1.5 text-sm font-medium">
        Board
        <select
          className={selectClass}
          value={boardId}
          onChange={(e) => onBoardChange(e.target.value)}
          disabled={loadingBoards}
        >
          <option value="">
            {loadingBoards ? "Loading…" : "Select a board"}
          </option>
          {boards.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1.5 text-sm font-medium">
        Class
        <select
          className={selectClass}
          value={gradeId}
          onChange={(e) => onGradeChange(e.target.value)}
          disabled={!boardId || grades.length === 0}
        >
          <option value="">
            {boardId ? "Select a class" : "Choose a board first"}
          </option>
          {grades.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1.5 text-sm font-medium">
        Subject
        <select
          className={selectClass}
          value={subjectId}
          onChange={(e) => onSubjectChange(e.target.value)}
          disabled={!gradeId || subjects.length === 0}
        >
          <option value="">
            {gradeId ? "Select a subject" : "Choose a class first"}
          </option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s._count.chapters} chapters)
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1.5 text-sm font-medium">
        Chapter
        <select
          className={selectClass}
          value={chapterId}
          onChange={(e) => onChapterChange(e.target.value)}
          disabled={!subjectId || chapters.length === 0}
        >
          <option value="">
            {subjectId ? "Select a chapter" : "Choose a subject first"}
          </option>
          {chapters.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c._count.topics} topics)
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1.5 text-sm font-medium">
        Topic
        <select
          className={selectClass}
          value={topicId}
          onChange={(e) => onTopicChange(e.target.value)}
          disabled={!chapterId || topics.length === 0}
        >
          <option value="">
            {chapterId ? "Select a topic" : "Choose a chapter first"}
          </option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({t._count.contents} lessons · {t._count.questions} questions)
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

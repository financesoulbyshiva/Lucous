// Shared helpers for talking to the LUCOUS Express backend from student pages.

const API_URL = "http://localhost:5000/api";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    window.localStorage.getItem("lucous_token") ??
    window.sessionStorage.getItem("lucous_token")
  );
}

export function getStoredUser(): { id?: number; name?: string; email?: string } | null {
  if (typeof window === "undefined") return null;
  const raw =
    window.localStorage.getItem("lucous_user") ??
    window.sessionStorage.getItem("lucous_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { id?: number; name?: string; email?: string };
  } catch {
    return null;
  }
}

export function clearStoredAuth() {
  if (typeof window === "undefined") return;
  for (const storage of [window.localStorage, window.sessionStorage]) {
    storage.removeItem("lucous_token");
    storage.removeItem("lucous_user");
  }
}

export async function apiFetch<T>(
  path: string,
  options: { method?: string; body?: unknown } = {}
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const data: unknown = await res.json().catch(() => ({}));
  const payload = (data ?? {}) as { success?: boolean; message?: string };

  if (!res.ok || !payload.success) {
    throw new Error(payload.message || "Request failed");
  }

  return data as T;
}

export interface Board {
  id: number;
  name: string;
}

export interface Grade {
  id: number;
  name: string;
}

export interface Subject {
  id: number;
  name: string;
  boardId: number;
  gradeId: number;
  _count: { chapters: number };
  board?: { name: string };
  grade?: { name: string };
}

export interface Chapter {
  id: number;
  subjectId: number;
  name: string;
  _count: { topics: number };
}

export interface Topic {
  id: number;
  chapterId: number;
  name: string;
  _count: { questions: number; contents: number };
}

export interface ContentItem {
  id: number;
  topicId: number;
  title: string;
  body: string;
  order: number;
}

export interface Question {
  id: number;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
}

export interface Attempt {
  id: number;
  userId: number;
  topicId: number;
  mode: "PLAY" | "PRACTICE" | "TEST" | "RETEST";
  correct: number;
  total: number;
  score: number;
  createdAt: string;
  topic: { id: number; name: string; chapter: { id: number; name: string } };
}

export interface PerQuestion {
  questionId: number;
  selected: number;
  correctIndex: number | null;
  wasCorrect: boolean;
  explanation: string | null;
}

export interface WeakTopic {
  topicId: number;
  topicName: string;
  chapterName: string;
  score: number;
  action: "Practice" | "Retest";
}

export const OPTION_KEYS = ["optionA", "optionB", "optionC", "optionD"] as const;

export function optionText(question: Question, index: number): string {
  return question[OPTION_KEYS[index]] ?? "";
}

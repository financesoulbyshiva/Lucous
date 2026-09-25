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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RequireRole } from "@/components/auth/require-role";
import {
  apiFetch,
  getStoredUser,
  type Course,
  type GeneratedQuestion,
  type ProfileUser,
} from "@/lib/api";
import { cn } from "cn";

type Tab = "courses" | "students" | "ai" | "profile";

const TABS: { id: Tab; label: string }[] = [
  { id: "courses", label: "Courses" },
  { id: "students", label: "Students" },
  { id: "ai", label: "AI Generator" },
  { id: "profile", label: "Profile" },
];

interface TeacherStudent {
  id: string;
  name: string;
  email: string;
  grade?: string | null;
  board?: string | null;
  attempts: number;
  averageScore: number;
  courses: string[];
}

export function TeacherHome() {
  const [tab, setTab] = React.useState<Tab>("courses");
  const user = getStoredUser();

  return (
    <RequireRole role="teacher" title="Teacher">
      <div className="grid gap-5">
        <section>
          <h1 className="font-heading text-2xl font-semibold">
            Welcome, {user?.name ?? "Teacher"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {user?.email ?? ""} · Manage your courses, students and content.
          </p>
        </section>

        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                tab === t.id && "border-primary bg-primary/5 text-primary"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "courses" ? <CoursesPanel /> : null}
        {tab === "students" ? <StudentsPanel /> : null}
        {tab === "ai" ? <AiPanel /> : null}
        {tab === "profile" ? <ProfilePanel /> : null}
      </div>
    </RequireRole>
  );
}

function CoursesPanel() {
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [editing, setEditing] = React.useState<Course | null>(null);
  const [form, setForm] = React.useState({ title: "", description: "", subject: "", board: "", price: "0" });
  const [saving, setSaving] = React.useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const d = await apiFetch<{ courses: Course[] }>("/teacher/courses");
      setCourses(d.courses);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load courses");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    void load();
  }, []);

  function startEdit(c: Course) {
    setEditing(c);
    setForm({
      title: c.title,
      description: c.description,
      subject: c.subject,
      board: c.board,
      price: String(c.price ?? 0),
    });
  }

  function startCreate() {
    setEditing(null);
    setForm({ title: "", description: "", subject: "", board: "", price: "0" });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body = {
        title: form.title,
        description: form.description,
        subject: form.subject,
        board: form.board,
        price: Number(form.price) || 0,
      };
      if (editing) {
        await apiFetch(`/courses/${editing.id}`, { method: "PUT", body });
      } else {
        await apiFetch("/courses", { method: "POST", body });
      }
      startCreate();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save course");
    } finally {
      setSaving(false);
    }
  }

  const field = "h-10";

  return (
    <div className="grid gap-5">
      <Card>
        <CardHeader>
          <CardTitle>{editing ? "Edit course" : "Create course"}</CardTitle>
          <CardDescription>
            {editing ? `Editing “${editing.title}”` : "Add a new course to your catalogue"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3.5" onSubmit={save}>
            <label className="grid gap-1.5 text-sm font-medium">
              Title
              <Input required className={field} value={form.title} disabled={saving}
                onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Description
              <Input required className={field} value={form.description} disabled={saving}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </label>
            <div className="grid gap-3.5 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-medium">
                Subject
                <Input required className={field} value={form.subject} disabled={saving}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })} />
              </label>
              <label className="grid gap-1.5 text-sm font-medium">
                Board
                <Input required className={field} value={form.board} disabled={saving}
                  onChange={(e) => setForm({ ...form, board: e.target.value })} />
              </label>
            </div>
            <label className="grid gap-1.5 text-sm font-medium">
              Price (paise, 0 = free)
              <Input type="number" min={0} className={field} value={form.price} disabled={saving}
                onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </label>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : editing ? "Update course" : "Create course"}
              </Button>
              {editing ? (
                <Button type="button" variant="outline" onClick={startCreate}>
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your courses</CardTitle>
          <CardDescription>{courses.length} total</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : error && courses.length === 0 ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : courses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No courses yet. Create your first above.</p>
          ) : (
            courses.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{c.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.subject} · {c.board} · {c._count?.enrollments ?? 0} enrolled
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={c.price > 0 ? "secondary" : "outline"}>
                    {c.price > 0 ? `₹${(c.price / 100).toFixed(0)}` : "Free"}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => startEdit(c)}>
                    Edit
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StudentsPanel() {
  const [students, setStudents] = React.useState<TeacherStudent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const d = await apiFetch<{ students: TeacherStudent[] }>("/teacher/students");
        if (active) setStudents(d.students);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Failed to load students");
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
        <CardTitle>Enrolled students</CardTitle>
        <CardDescription>Students across all your courses</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : students.length === 0 ? (
          <p className="text-sm text-muted-foreground">No students enrolled yet.</p>
        ) : (
          students.map((s) => (
            <div key={s.id} className="rounded-lg border px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{s.name}</p>
                <Badge variant={s.averageScore >= 60 ? "secondary" : "destructive"}>
                  avg {s.averageScore}%
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {s.email}
                {s.grade ? ` · ${s.grade}` : ""}
                {s.board ? ` · ${s.board}` : ""} · {s.attempts} attempts
              </p>
              {s.courses.length > 0 ? (
                <p className="mt-1 text-xs text-muted-foreground">Courses: {s.courses.join(", ")}</p>
              ) : null}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function AiPanel() {
  const [form, setForm] = React.useState({
    subject: "", chapter: "", topic: "", difficulty: "MEDIUM", count: "5", topicId: "", save: false,
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [info, setInfo] = React.useState("");
  const [questions, setQuestions] = React.useState<GeneratedQuestion[]>([]);
  const [saved, setSaved] = React.useState(0);

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");
    setQuestions([]);
    try {
      const d = await apiFetch<{ questions: GeneratedQuestion[]; saved: number }>("/ai/generate-content", {
        method: "POST",
        body: {
          subject: form.subject || undefined,
          chapter: form.chapter || undefined,
          topic: form.topic,
          difficulty: form.difficulty,
          count: Number(form.count) || 5,
          topicId: form.topicId || undefined,
          save: form.save,
        },
      });
      setQuestions(d.questions);
      setSaved(d.saved);
      if (d.saved > 0) setInfo(`Saved ${d.saved} draft questions for teacher review.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Generation failed";
      // The backend returns a clear "not configured" message in dev mode.
      if (/not configured/i.test(msg)) setInfo(msg);
      else setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI content generation</CardTitle>
        <CardDescription>
          Generate MCQs for a topic. Saved questions are stored as drafts for your review.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-3.5" onSubmit={generate}>
          <div className="grid gap-3.5 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium">
              Subject
              <Input className="h-10" value={form.subject} disabled={loading}
                onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Chapter
              <Input className="h-10" value={form.chapter} disabled={loading}
                onChange={(e) => setForm({ ...form, chapter: e.target.value })} />
            </label>
          </div>
          <label className="grid gap-1.5 text-sm font-medium">
            Topic
            <Input required className="h-10" value={form.topic} disabled={loading}
              onChange={(e) => setForm({ ...form, topic: e.target.value })} />
          </label>
          <div className="grid gap-3.5 sm:grid-cols-3">
            <label className="grid gap-1.5 text-sm font-medium">
              Difficulty
              <select
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
                value={form.difficulty}
                disabled={loading}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Count
              <Input type="number" min={1} max={20} className="h-10" value={form.count} disabled={loading}
                onChange={(e) => setForm({ ...form, count: e.target.value })} />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Topic ID (to save)
              <Input className="h-10" value={form.topicId} disabled={loading}
                placeholder="optional"
                onChange={(e) => setForm({ ...form, topicId: e.target.value })} />
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.save} disabled={loading || !form.topicId}
              onChange={(e) => setForm({ ...form, save: e.target.checked })} />
            Save as draft questions (requires a Topic ID)
          </label>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {info ? <p className="text-sm text-muted-foreground">{info}</p> : null}

          <Button type="submit" disabled={loading}>
            {loading ? "Generating…" : "Generate questions"}
          </Button>
        </form>

        {questions.length > 0 ? (
          <div className="mt-4 grid gap-2">
            {questions.map((q, i) => (
              <div key={i} className="rounded-lg border px-3 py-2">
                <p className="text-sm font-medium">{i + 1}. {q.text}</p>
                <ul className="mt-1 grid gap-0.5 text-xs text-muted-foreground">
                  <li>A. {q.optionA}</li>
                  <li>B. {q.optionB}</li>
                  <li>C. {q.optionC}</li>
                  <li>D. {q.optionD}</li>
                </ul>
                {q.explanation ? <p className="mt-1 text-xs">{q.explanation}</p> : null}
              </div>
            ))}
            {saved > 0 ? <p className="text-xs text-muted-foreground">{saved} saved as drafts.</p> : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ProfilePanel() {
  const [me, setMe] = React.useState<ProfileUser | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const [saved, setSaved] = React.useState(false);
  const [form, setForm] = React.useState({ name: "", phone: "", school: "", subject: "" });

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const d = await apiFetch<{ user: ProfileUser }>("/auth/me");
        if (!active) return;
        setMe(d.user);
        setForm({
          name: d.user.name ?? "",
          phone: d.user.phone ?? "",
          school: d.user.school ?? "",
          subject: d.user.subject ?? "",
        });
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Failed to load profile");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const d = await apiFetch<{ user: ProfileUser }>("/auth/profile", { method: "PATCH", body: form });
      setMe(d.user);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading profile…</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>{me?.email} · {me?.role}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-3.5" onSubmit={save}>
          <label className="grid gap-1.5 text-sm font-medium">
            Name
            <Input className="h-10" value={form.name} disabled={saving}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            Phone
            <Input className="h-10" value={form.phone} disabled={saving}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </label>
          <div className="grid gap-3.5 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium">
              School
              <Input className="h-10" value={form.school} disabled={saving}
                onChange={(e) => setForm({ ...form, school: e.target.value })} />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Subject
              <Input className="h-10" value={form.subject} disabled={saving}
                onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            </label>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {saved ? <p className="text-sm text-brand-green">Profile updated.</p> : null}
          <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save profile"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}

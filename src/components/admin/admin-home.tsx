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
  type AdminStats,
  type AdminUser,
  type Course,
  type ProfileUser,
} from "@/lib/api";
import { cn } from "cn";

type Tab = "overview" | "users" | "courses" | "profile";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "users", label: "Users" },
  { id: "courses", label: "Courses" },
  { id: "profile", label: "Profile" },
];

export function AdminHome() {
  const [tab, setTab] = React.useState<Tab>("overview");
  const user = getStoredUser();

  return (
    <RequireRole role="admin" title="Admin">
      <div className="grid gap-5">
        <section>
          <h1 className="font-heading text-2xl font-semibold">
            {user?.name ?? "Admin"} · Platform console
          </h1>
          <p className="text-sm text-muted-foreground">{user?.email ?? ""}</p>
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

        {tab === "overview" ? <OverviewPanel /> : null}
        {tab === "users" ? <UsersPanel /> : null}
        {tab === "courses" ? <CoursesPanel /> : null}
        {tab === "profile" ? <ProfilePanel /> : null}
      </div>
    </RequireRole>
  );
}

function OverviewPanel() {
  const [stats, setStats] = React.useState<AdminStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const d = await apiFetch<{ stats: AdminStats }>("/admin/stats");
        if (active) setStats(d.stats);
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

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!stats) return null;

  const tiles: { label: string; value: number }[] = [
    { label: "Users", value: stats.users },
    { label: "Students", value: stats.students },
    { label: "Teachers", value: stats.teachers },
    { label: "Parents", value: stats.parents },
    { label: "Admins", value: stats.admins },
    { label: "Courses", value: stats.courses },
    { label: "Enrollments", value: stats.enrollments },
    { label: "Attempts", value: stats.attempts },
    { label: "Questions", value: stats.questions },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {tiles.map((t) => (
        <Card key={t.label}>
          <CardContent className="pt-1">
            <p className="text-xs text-muted-foreground">{t.label}</p>
            <p className="font-heading text-2xl font-semibold">{t.value}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

function UsersPanel() {
  const [role, setRole] = React.useState("");
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const q = role ? `?role=${role}` : "";
        const d = await apiFetch<{ users: AdminUser[] }>(`/admin/users${q}`);
        if (active) setUsers(d.users);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Failed to load users");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [role]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
        <CardDescription>
          <select
            className="mt-1 h-9 rounded-lg border border-input bg-background px-2 text-sm"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="">All roles</option>
            <option value="STUDENT">Students</option>
            <option value="TEACHER">Teachers</option>
            <option value="PARENT">Parents</option>
            <option value="ADMIN">Admins</option>
          </select>
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-muted-foreground">No users found.</p>
        ) : (
          users.map((u) => (
            <div key={u.id} className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{u.name}</p>
                <p className="truncate text-xs text-muted-foreground">{u.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{u.role}</Badge>
                {u.isVerified ? <Badge variant="secondary">verified</Badge> : null}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function CoursesPanel() {
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const d = await apiFetch<{ courses: (Course & { teacher?: { name: string } })[] }>("/admin/courses");
        if (active) setCourses(d.courses);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Failed to load courses");
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
        <CardTitle>All courses</CardTitle>
        <CardDescription>{courses.length} total</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : courses.length === 0 ? (
          <p className="text-sm text-muted-foreground">No courses yet.</p>
        ) : (
          courses.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{c.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {c.subject} · {c.board} · by {c.teacher?.name ?? "—"} · {c._count?.enrollments ?? 0} enrolled
                </p>
              </div>
              <Badge variant={c.price > 0 ? "secondary" : "outline"}>
                {c.price > 0 ? `₹${(c.price / 100).toFixed(0)}` : "Free"}
              </Badge>
            </div>
          ))
        )}
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
  const [form, setForm] = React.useState({ name: "", phone: "" });

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const d = await apiFetch<{ user: ProfileUser }>("/auth/me");
        if (!active) return;
        setMe(d.user);
        setForm({ name: d.user.name ?? "", phone: d.user.phone ?? "" });
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
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {saved ? <p className="text-sm text-brand-green">Profile updated.</p> : null}
          <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save profile"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}

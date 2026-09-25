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
  type Child,
  type ChildOverview,
  type ProfileUser,
} from "@/lib/api";
import { cn } from "cn";

type Tab = "children" | "profile";

export function ParentHome() {
  const [tab, setTab] = React.useState<Tab>("children");
  const user = getStoredUser();

  return (
    <RequireRole role="parent" title="Parent">
      <div className="grid gap-5">
        <section>
          <h1 className="font-heading text-2xl font-semibold">
            Welcome, {user?.name ?? "Parent"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {user?.email ?? ""} · Track your child&apos;s learning.
          </p>
        </section>

        <div className="flex flex-wrap gap-2">
          {(["children", "profile"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                tab === t && "border-primary bg-primary/5 text-primary"
              )}
            >
              {t === "children" ? "Children" : "Profile"}
            </button>
          ))}
        </div>

        {tab === "children" ? <ChildrenPanel /> : null}
        {tab === "profile" ? <ProfilePanel /> : null}
      </div>
    </RequireRole>
  );
}

function ChildrenPanel() {
  const [children, setChildren] = React.useState<Child[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [linking, setLinking] = React.useState(false);
  const [selected, setSelected] = React.useState<string | null>(null);

  async function load() {
    try {
      const d = await apiFetch<{ children: Child[] }>("/parent/children");
      setChildren(d.children);
      if (d.children.length > 0 && !selected) setSelected(d.children[0].id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load children");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function link(e: React.FormEvent) {
    e.preventDefault();
    setLinking(true);
    setError("");
    try {
      await apiFetch("/parent/link", { method: "POST", body: { studentEmail: email } });
      setEmail("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to link student");
    } finally {
      setLinking(false);
    }
  }

  return (
    <div className="grid gap-5">
      <Card>
        <CardHeader>
          <CardTitle>Link a child</CardTitle>
          <CardDescription>
            Enter your child&apos;s student email to connect their progress.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={link}>
            <label className="grid flex-1 gap-1.5 text-sm font-medium">
              Student email
              <Input required type="email" className="h-10" value={email} disabled={linking}
                placeholder="child@example.com"
                onChange={(e) => setEmail(e.target.value)} />
            </label>
            <Button type="submit" disabled={linking}>{linking ? "Linking…" : "Link child"}</Button>
          </form>
          {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your children</CardTitle>
          <CardDescription>{children.length} linked</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : children.length === 0 ? (
            <p className="text-sm text-muted-foreground">No children linked yet.</p>
          ) : (
            children.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelected(c.id)}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left transition-colors hover:bg-muted",
                  selected === c.id && "border-primary bg-primary/5"
                )}
              >
                <div>
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.email}
                    {c.grade ? ` · ${c.grade}` : ""}
                    {c.board ? ` · ${c.board}` : ""}
                  </p>
                </div>
              </button>
            ))
          )}
        </CardContent>
      </Card>

      {selected ? <ChildOverviewPanel studentId={selected} /> : null}
    </div>
  );
}

function ChildOverviewPanel({ studentId }: { studentId: string }) {
  const [data, setData] = React.useState<ChildOverview | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const d = await apiFetch<ChildOverview>(`/parent/child/${studentId}/overview`);
        if (active) setData(d);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Failed to load child data");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [studentId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{data?.student.name ?? "Child"} — progress</CardTitle>
        <CardDescription>
          {data ? `${data.completedCount} lessons completed · ${data.student.xp} XP` : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : data ? (
          <>
            <div className="grid gap-2">
              <span className="text-xs font-medium text-muted-foreground">Weak topics</span>
              {data.weakTopics.length === 0 ? (
                <p className="text-sm text-muted-foreground">No weak topics. Great job!</p>
              ) : (
                data.weakTopics.map((w) => (
                  <div key={w.topicId} className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2">
                    <div>
                      <p className="text-sm font-medium">{w.topicName}</p>
                      <p className="text-xs text-muted-foreground">{w.chapterName}</p>
                    </div>
                    <Badge variant="destructive">{w.score}%</Badge>
                  </div>
                ))
              )}
            </div>
            <div className="grid gap-2">
              <span className="text-xs font-medium text-muted-foreground">Recent results</span>
              {data.attempts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No attempts yet.</p>
              ) : (
                data.attempts.slice(0, 8).map((a) => (
                  <div key={a.id} className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2">
                    <div>
                      <p className="text-sm font-medium">{a.topic.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {a.topic.chapter.name} · {a.mode} · {a.correct}/{a.total}
                      </p>
                    </div>
                    <Badge variant={a.score >= 60 ? "secondary" : "destructive"}>{a.score}%</Badge>
                  </div>
                ))
              )}
            </div>
          </>
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

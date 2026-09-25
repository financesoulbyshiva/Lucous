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
import { Badge } from "@/components/ui/badge";
import { RequireStudent } from "@/components/student/require-student";
import { apiFetch, type ProfileUser } from "@/lib/api";

export function ProfileView() {
  return (
    <RequireStudent title="Profile">
      <div className="grid gap-5">
        <section>
          <h1 className="font-heading text-2xl font-semibold">Profile</h1>
          <p className="text-sm text-muted-foreground">
            Manage your account details.
          </p>
        </section>
        <ProfilePanel />
      </div>
    </RequireStudent>
  );
}

function ProfilePanel() {
  const [me, setMe] = React.useState<ProfileUser | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const [saved, setSaved] = React.useState(false);
  const [form, setForm] = React.useState({ name: "", phone: "", grade: "", board: "", school: "" });

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
          grade: d.user.grade ?? "",
          board: d.user.board ?? "",
          school: d.user.school ?? "",
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
      <CardContent className="grid gap-4">
        {typeof me?.xp === "number" ? (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{me.xp} XP</Badge>
          </div>
        ) : null}
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
              Grade
              <Input className="h-10" value={form.grade} disabled={saving}
                onChange={(e) => setForm({ ...form, grade: e.target.value })} />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Board
              <Input className="h-10" value={form.board} disabled={saving}
                onChange={(e) => setForm({ ...form, board: e.target.value })} />
            </label>
          </div>
          <label className="grid gap-1.5 text-sm font-medium">
            School
            <Input className="h-10" value={form.school} disabled={saving}
              onChange={(e) => setForm({ ...form, school: e.target.value })} />
          </label>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {saved ? <p className="text-sm text-brand-green">Profile updated.</p> : null}
          <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save profile"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}

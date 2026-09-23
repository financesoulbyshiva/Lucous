"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ROLE_CONFIG, setSession, type AuthRole } from "@/lib/auth";

const API_URL = "http://localhost:5000/api";

const ROLE_MAP: Record<AuthRole, string> = {
  student: "STUDENT",
  parent: "PARENT",
  teacher: "TEACHER",
  admin: "ADMIN",
};

export function LoginForm({ role }: { role: AuthRole }) {
  const router = useRouter();
  const config = ROLE_CONFIG[role];

  const [remember, setRemember] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    const fd = new FormData(e.currentTarget);

    const email = String(fd.get("identifier") ?? "").trim();
    const password = String(fd.get("password") ?? "");

    if (!email || !password) {
      setError("Email and password are required.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Login failed.");
        setLoading(false);
        return;
      }

      const user = data.user;

      if (user.role !== ROLE_MAP[role]) {
        setError(
          `This account is registered as ${user.role.toLowerCase()}, not ${role}.`
        );
        setLoading(false);
        return;
      }

      const storage = remember ? localStorage : sessionStorage;

      storage.setItem("lucous_token", data.token);
      storage.setItem("lucous_user", JSON.stringify(user));

      setSession({
        role,
        email: user.email,
        name: user.name,
      });

      router.replace(config.dashboardPath);
    } catch (err) {
      console.error("Login error:", err);
      setError(
        "Unable to connect to LUCOUS server. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">{config.label} login</CardTitle>
        <CardDescription>Sign in to continue to LUCOUS</CardDescription>
      </CardHeader>

      <CardContent>
        <form className="grid gap-3.5" onSubmit={onSubmit}>
          <label className="grid gap-1.5 text-sm font-medium">
            Email / ID
            <Input
              required
              name="identifier"
              type="text"
              autoComplete="username"
              placeholder={
                role === "admin"
                  ? "Enter your admin email or ID"
                  : "Enter your email"
              }
              className="h-10"
              disabled={loading}
            />
          </label>

          <label className="grid gap-1.5 text-sm font-medium">
            Password
            <Input
              required
              name="password"
              type="password"
              minLength={8}
              autoComplete="current-password"
              placeholder="Enter your password"
              className="h-10"
              disabled={loading}
            />
          </label>

          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Switch
                checked={remember}
                onCheckedChange={setRemember}
                aria-label="Remember me"
                disabled={loading}
              />
              Remember me
            </span>

            <Link
              href={`/auth/${role}/forgot-password`}
              className="rounded text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              Forgot password?
            </Link>
          </div>

          {error ? (
            <p className="text-sm font-normal text-destructive">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            className="mt-1 h-10 w-full text-sm"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log in"}
          </Button>
        </form>

        {config.allowsSignup ? (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href={`/auth/${role}/signup`}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Sign up
            </Link>
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
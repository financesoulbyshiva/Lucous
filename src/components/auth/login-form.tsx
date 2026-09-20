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

export function LoginForm({ role }: { role: AuthRole }) {
  const router = useRouter();
  const config = ROLE_CONFIG[role];
  const [remember, setRemember] = React.useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const identifier = String(fd.get("identifier") ?? "").trim();
    if (!identifier) return;
    // No auth backend yet — record a frontend session so role routing works.
    setSession({ role, email: identifier });
    router.replace(config.dashboardPath);
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
            />
          </label>

          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Switch
                checked={remember}
                onCheckedChange={setRemember}
                aria-label="Remember me"
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

          <Button type="submit" className="mt-1 h-10 w-full text-sm">
            Log in
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

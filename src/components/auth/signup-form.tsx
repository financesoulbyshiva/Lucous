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
import {
  ROLE_CONFIG,
  SIGNUP_FIELDS,
  type AuthRole,
} from "@/lib/auth";

const API_URL = "http://localhost:5000/api";

const REGISTER_PATH: Partial<Record<AuthRole, string>> = {
  student: "/auth/register/student",
  teacher: "/auth/register/teacher",
  parent: "/auth/register/parent",
};

export function SignupForm({ role }: { role: AuthRole }) {
  const router = useRouter();
  const config = ROLE_CONFIG[role];
  const fields = SIGNUP_FIELDS[role];
  const [confirmError, setConfirmError] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") ?? "");
    const confirm = String(fd.get("confirmPassword") ?? "");
    if (password !== confirm) {
      setConfirmError(true);
      return;
    }
    setConfirmError(false);

    const email = String(fd.get("email") ?? "").trim();
    const name = String(fd.get("fullName") ?? fd.get("parentName") ?? "").trim();

    const optional = (key: string) => {
      const v = String(fd.get(key) ?? "").trim();
      return v ? v : undefined;
    };

    const path = REGISTER_PATH[role];
    if (!path) {
      setError("Signup is not available for this role.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          phone: optional("mobile"),
          grade: optional("grade"),
          board: optional("board"),
          school: optional("school"),
          subject: optional("subject"),
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Signup failed. Please try again.");
        return;
      }

      // Registration succeeded — continue to login to obtain a session token.
      router.replace(`/auth/${role}/login`);
    } catch (err) {
      console.error("Signup error:", err);
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
        <CardTitle className="text-lg">
          Create your {config.label.toLowerCase()} account
        </CardTitle>
        <CardDescription>
          Join LUCOUS as a {config.label.toLowerCase()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-3.5"
          onSubmit={onSubmit}
          onChange={() => confirmError && setConfirmError(false)}
        >
          {fields.map((field) => (
            <label key={field.name} className="grid gap-1.5 text-sm font-medium">
              {field.label}
              <Input
                required
                name={field.name}
                type={field.type}
                placeholder={field.placeholder}
                autoComplete={field.autoComplete}
                minLength={field.type === "password" ? 8 : undefined}
                aria-invalid={
                  field.name === "confirmPassword" && confirmError
                    ? true
                    : undefined
                }
                className="h-10"
                disabled={loading}
              />
              {field.name === "confirmPassword" && confirmError ? (
                <span className="text-xs font-normal text-destructive">
                  Passwords do not match
                </span>
              ) : null}
            </label>
          ))}

          {error ? (
            <p className="text-sm font-normal text-destructive">{error}</p>
          ) : null}

          <Button
            type="submit"
            className="mt-1 h-10 w-full text-sm"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href={`/auth/${role}/login`}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

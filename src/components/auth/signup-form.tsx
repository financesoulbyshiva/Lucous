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
  setSession,
  type AuthRole,
} from "@/lib/auth";

export function SignupForm({ role }: { role: AuthRole }) {
  const router = useRouter();
  const config = ROLE_CONFIG[role];
  const fields = SIGNUP_FIELDS[role];
  const [confirmError, setConfirmError] = React.useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") ?? "");
    const confirm = String(fd.get("confirmPassword") ?? "");
    if (password !== confirm) {
      setConfirmError(true);
      return;
    }
    const email = String(fd.get("email") ?? "").trim();
    const name = String(fd.get("fullName") ?? fd.get("parentName") ?? "").trim();
    // No auth backend yet — record a frontend session so role routing works.
    setSession({ role, email, name: name || undefined });
    router.replace(config.dashboardPath);
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
              />
              {field.name === "confirmPassword" && confirmError ? (
                <span className="text-xs font-normal text-destructive">
                  Passwords do not match
                </span>
              ) : null}
            </label>
          ))}

          <Button type="submit" className="mt-1 h-10 w-full text-sm">
            Create account
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

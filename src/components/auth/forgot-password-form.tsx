"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ROLE_CONFIG, type AuthRole } from "@/lib/auth";

export function ForgotPasswordForm({ role }: { role: AuthRole }) {
  const config = ROLE_CONFIG[role];
  const [sent, setSent] = React.useState(false);

  return (
    <Card className="w-full">
      {sent ? (
        <>
          <CardHeader>
            <CardTitle className="text-lg">Check your email</CardTitle>
            <CardDescription>
              We&apos;ve sent a password reset link to your email address.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Didn&apos;t receive it? Check your spam folder or try again.
            </p>
            <Button
              variant="outline"
              className="mt-4 h-10 w-full text-sm"
              onClick={() => setSent(false)}
            >
              Try again
            </Button>
            <Link
              href={`/auth/${role}/login`}
              className="mt-3 block text-center text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Back to Login
            </Link>
          </CardContent>
        </>
      ) : (
        <>
          <CardHeader>
            <CardTitle className="text-lg">Forgot your password?</CardTitle>
            <CardDescription>
              Enter your email and we&apos;ll send you a password reset link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-3.5"
              onSubmit={(e) => {
                e.preventDefault();
                // No reset backend yet — show the confirmation state only.
                setSent(true);
              }}
            >
              <label className="grid gap-1.5 text-sm font-medium">
                Email
                <Input
                  required
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  className="h-10"
                />
              </label>
              <Button type="submit" className="mt-1 h-10 w-full text-sm">
                Send Reset Link
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Remember your password?{" "}
              <Link
                href={`/auth/${role}/login`}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Back to Login
              </Link>
            </p>
          </CardContent>
        </>
      )}
    </Card>
  );
}

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

const API_URL = "http://localhost:5000/api";

type Step = "email" | "reset" | "done";

export function ForgotPasswordForm({ role }: { role: AuthRole }) {
  const config = ROLE_CONFIG[role];
  const [step, setStep] = React.useState<Step>("email");
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [devOtp, setDevOtp] = React.useState("");

  async function onSendOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setDevOtp("");

    const value = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    if (!value) {
      setError("Email is required.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Could not send the reset code.");
        return;
      }

      setEmail(value);
      if (typeof data.otp === "string" && data.otp) setDevOtp(data.otp);
      setStep("reset");
    } catch (err) {
      console.error("Forgot password error:", err);
      setError(
        "Unable to connect to LUCOUS server. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  async function onReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const fd = new FormData(e.currentTarget);
    const code = String(fd.get("code") ?? "").trim();
    const newPassword = String(fd.get("newPassword") ?? "");
    const confirm = String(fd.get("confirmPassword") ?? "");

    if (!code || !newPassword) {
      setError("Reset code and new password are required.");
      return;
    }
    if (newPassword !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Could not reset the password.");
        return;
      }

      setStep("done");
    } catch (err) {
      console.error("Reset password error:", err);
      setError(
        "Unable to connect to LUCOUS server. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  if (step === "done") {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Password reset</CardTitle>
          <CardDescription>
            Your password has been updated. You can now log in with your new
            password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href={`/auth/${role}/login`}
            className="block text-center text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Back to {config.label} login
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (step === "reset") {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Enter reset code</CardTitle>
          <CardDescription>
            We sent a 6-digit code to {email}. Enter it along with your new
            password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3.5" onSubmit={onReset}>
            <label className="grid gap-1.5 text-sm font-medium">
              Reset code
              <Input
                required
                name="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="Enter 6-digit code"
                className="h-10"
                disabled={loading}
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium">
              New password
              <Input
                required
                name="newPassword"
                type="password"
                minLength={8}
                autoComplete="new-password"
                placeholder="Enter new password"
                className="h-10"
                disabled={loading}
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium">
              Confirm new password
              <Input
                required
                name="confirmPassword"
                type="password"
                minLength={8}
                autoComplete="new-password"
                placeholder="Confirm new password"
                className="h-10"
                disabled={loading}
              />
            </label>

            {devOtp ? (
              <p className="text-xs font-normal text-muted-foreground">
                Development code: <span className="font-mono">{devOtp}</span>
              </p>
            ) : null}

            {error ? (
              <p className="text-sm font-normal text-destructive">{error}</p>
            ) : null}

            <Button
              type="submit"
              className="mt-1 h-10 w-full text-sm"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset password"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Wrong email?{" "}
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setError("");
                setDevOtp("");
              }}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Start over
            </button>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Forgot your password?</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send you a password reset code.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-3.5" onSubmit={onSendOtp}>
          <label className="grid gap-1.5 text-sm font-medium">
            Email
            <Input
              required
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              className="h-10"
              disabled={loading}
            />
          </label>

          {error ? (
            <p className="text-sm font-normal text-destructive">{error}</p>
          ) : null}

          <Button
            type="submit"
            className="mt-1 h-10 w-full text-sm"
            disabled={loading}
          >
            {loading ? "Sending code..." : "Send reset code"}
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
    </Card>
  );
}

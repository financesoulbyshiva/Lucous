"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LucousLogo } from "@/components/logo";
import {
  ROLE_CONFIG,
  clearSession,
  getSession,
  type AuthRole,
} from "@/lib/auth";
import { useSession } from "@/lib/use-session";

export function RoleGate({ role }: { role: AuthRole }) {
  const router = useRouter();
  const config = ROLE_CONFIG[role];
  const session = useSession();
  const allowed = session !== null && session.role === role;

  React.useEffect(() => {
    // Read the live session (not the render snapshot) so the redirect only
    // fires against real client state after hydration.
    const current = getSession();
    if (!current || current.role !== role) {
      router.replace("/auth");
    }
  }, [role, router]);

  if (!allowed || !session) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Checking session…</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh flex-col items-center bg-background px-4 py-10 sm:py-14">
      <Link
        href="/"
        aria-label="Lucous — home"
        className="rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <LucousLogo className="text-3xl" />
      </Link>

      <div className="mt-8 w-full max-w-md sm:mt-10">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-lg">{config.label} dashboard</CardTitle>
            <CardDescription>
              Signed in as {session.email} · {config.tagline}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your {config.label.toLowerCase()} workspace will appear here once
              the dashboard is connected to the backend.
            </p>
            <Button
              variant="outline"
              className="mt-4 h-9 w-full text-sm"
              onClick={() => {
                clearSession();
                router.replace("/auth");
              }}
            >
              <LogOut aria-hidden />
              Sign out
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

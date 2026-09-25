"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { LucousLogo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { ROLE_CONFIG, clearSession, getSession, type AuthRole } from "@/lib/auth";
import { useSession } from "@/lib/use-session";
import { clearStoredAuth } from "@/lib/api";

// Shared authenticated shell for the teacher / parent / admin workspaces.
// Mirrors the student shell (RequireStudent) so the visual language is identical.
export function RequireRole({
  role,
  title,
  children,
}: {
  role: AuthRole;
  title?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const config = ROLE_CONFIG[role];
  const session = useSession();

  React.useEffect(() => {
    const current = getSession();
    if (!current || current.role !== role) {
      router.replace("/auth");
    }
  }, [role, router]);

  if (!session || session.role !== role) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Checking session…</p>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between gap-3 px-4">
          <Link
            href={config.dashboardPath}
            aria-label={`Lucous — ${config.label.toLowerCase()} dashboard`}
            className="rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <LucousLogo className="text-2xl" />
          </Link>
          <div className="flex items-center gap-2">
            {title ? (
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {title}
              </span>
            ) : null}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                clearStoredAuth();
                clearSession();
                router.replace(`/auth/${role}/login`);
              }}
            >
              <LogOut aria-hidden />
              Sign out
            </Button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">{children}</div>
    </main>
  );
}

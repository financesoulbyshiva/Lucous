"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { LucousLogo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { clearSession, getSession } from "@/lib/auth";
import { useSession } from "@/lib/use-session";
import { clearStoredAuth } from "@/lib/api";

export function RequireStudent({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const session = useSession();

  React.useEffect(() => {
    const current = getSession();
    if (!current || current.role !== "student") {
      router.replace("/auth");
    }
  }, [router]);

  if (!session || session.role !== "student") {
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
            href="/student/dashboard"
            aria-label="Lucous — student dashboard"
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
                router.replace("/auth/student/login");
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

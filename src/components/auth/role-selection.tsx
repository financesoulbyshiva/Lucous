import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AUTH_ROLES, ROLE_CONFIG } from "@/lib/auth";

export function RoleSelection() {
  return (
    <div className="w-full text-center">
      <h1 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
        Welcome to LUCOUS
      </h1>
      <p className="mt-2 text-sm text-muted-foreground sm:text-base">
        Choose your role to continue
      </p>

      <div className="mt-8 grid gap-3 text-left sm:grid-cols-2">
        {AUTH_ROLES.map((role) => {
          const { label, tagline, icon: Icon } = ROLE_CONFIG[role];
          return (
            <Link
              key={role}
              href={`/auth/${role}/login`}
              className="group flex items-start gap-3.5 rounded-xl bg-card p-4 shadow-soft ring-1 ring-foreground/10 transition-shadow hover:shadow-lift hover:ring-primary/40 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1 font-heading text-sm font-semibold text-card-foreground">
                  {label}
                  <ArrowUpRight
                    className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                    aria-hidden
                  />
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {tagline}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

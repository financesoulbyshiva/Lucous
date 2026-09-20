import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LucousLogo } from "@/components/logo";
import { cn } from "cn";

export function AuthLayout({
  children,
  showChangeRole = true,
  containerClassName,
}: {
  children: React.ReactNode;
  showChangeRole?: boolean;
  containerClassName?: string;
}) {
  return (
    <main className="flex min-h-dvh flex-col items-center bg-background px-4 py-10 sm:py-14">
      <Link
        href="/"
        aria-label="Lucous — home"
        className="rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <LucousLogo className="text-3xl" />
      </Link>

      <div
        className={cn(
          "mt-8 flex w-full max-w-md flex-col items-center gap-5 sm:mt-10",
          containerClassName
        )}
      >
        {children}
      </div>

      {showChangeRole ? (
        <Link
          href="/auth"
          className="mt-8 inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Change role
        </Link>
      ) : null}
    </main>
  );
}

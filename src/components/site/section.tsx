import { cn } from "cn";
import type { LucideIcon } from "lucide-react";
import { Reveal } from "@/components/site/anim";

export type BrandColor = "blue" | "red" | "yellow" | "green" | "slate";

export const brandText: Record<BrandColor, string> = {
  blue: "text-brand-blue",
  red: "text-brand-red",
  yellow: "text-amber-600 dark:text-brand-yellow",
  green: "text-brand-green",
  slate: "text-foreground",
};

export const brandTile: Record<BrandColor, string> = {
  blue: "bg-brand-blue/10 text-brand-blue dark:bg-brand-blue/15",
  red: "bg-brand-red/10 text-brand-red dark:bg-brand-red/15",
  yellow:
    "bg-brand-yellow/15 text-amber-600 dark:bg-brand-yellow/15 dark:text-brand-yellow",
  green: "bg-brand-green/10 text-brand-green dark:bg-brand-green/15",
  slate: "bg-muted text-foreground",
};

export const brandBar: Record<BrandColor, string> = {
  blue: "bg-brand-blue",
  red: "bg-brand-red",
  yellow: "bg-brand-yellow",
  green: "bg-brand-green",
  slate: "bg-muted-foreground",
};

export function Section({
  id,
  className,
  innerClassName,
  children,
}: {
  id?: string;
  className?: string;
  innerClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={cn("relative py-16 sm:py-20 lg:py-24", className)}>
      <div
        className={cn(
          "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8",
          innerClassName
        )}
      >
        {children}
      </div>
    </section>
  );
}

export function Eyebrow({
  icon: Icon,
  tone = "blue",
  children,
  className,
}: {
  icon?: LucideIcon;
  tone?: BrandColor;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide uppercase",
        tone === "blue" &&
          "border-brand-blue/20 bg-brand-blue/10 text-brand-blue dark:bg-brand-blue/15",
        tone === "red" &&
          "border-brand-red/20 bg-brand-red/10 text-brand-red dark:bg-brand-red/15",
        tone === "yellow" &&
          "border-brand-yellow/30 bg-brand-yellow/15 text-amber-700 dark:text-brand-yellow",
        tone === "green" &&
          "border-brand-green/20 bg-brand-green/10 text-brand-green dark:bg-brand-green/15",
        tone === "slate" && "border-border bg-muted text-muted-foreground",
        className
      )}
    >
      {Icon ? <Icon className="size-3.5" aria-hidden /> : null}
      {children}
    </span>
  );
}

export function FilterChips<T extends string>({
  items,
  value,
  onChange,
  label,
  className,
}: {
  items: readonly T[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn("flex flex-wrap items-center gap-1.5", className)}
    >
      {items.map((item) => {
        const isActive = value === item;
        return (
          <button
            key={item}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(item)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
              isActive
                ? "border-primary bg-primary text-primary-foreground shadow-soft"
                : "border-border bg-background text-muted-foreground hover:border-foreground/25 hover:text-foreground"
            )}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  eyebrowIcon,
  tone = "blue",
  title,
  description,
  align = "center",
  className,
}: {
  eyebrow?: string;
  eyebrowIcon?: LucideIcon;
  tone?: BrandColor;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  const centered = align === "center";
  return (
    <Reveal
      className={cn(
        "mb-10 flex max-w-3xl flex-col gap-4 sm:mb-12",
        centered && "mx-auto items-center text-center",
        className
      )}
    >
      {eyebrow ? (
        <Eyebrow icon={eyebrowIcon} tone={tone}>
          {eyebrow}
        </Eyebrow>
      ) : null}
      <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="text-base text-muted-foreground text-pretty sm:text-lg">
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}

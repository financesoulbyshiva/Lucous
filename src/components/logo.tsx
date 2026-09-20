import { cn } from "cn";

const LETTERS: { ch: string; className: string }[] = [
  { ch: "L", className: "text-brand-blue" },
  { ch: "u", className: "text-brand-red" },
  { ch: "c", className: "text-brand-yellow" },
  { ch: "o", className: "text-brand-blue" },
  { ch: "u", className: "text-brand-green" },
  { ch: "s", className: "text-brand-red" },
];

export function LucousLogo({ className }: { className?: string }) {
  return (
    <span
      aria-label="Lucous"
      role="img"
      className={cn(
        "inline-flex items-baseline font-extrabold leading-none tracking-tight select-none",
        className
      )}
    >
      {LETTERS.map(({ ch, className: color }, i) => (
        <span key={i} className={color}>
          {ch}
        </span>
      ))}
    </span>
  );
}

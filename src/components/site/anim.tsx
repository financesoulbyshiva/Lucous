"use client";

import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import { cn } from "cn";

const EASE: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98];

export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? { opacity: 1 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-64px" }}
      transition={{ duration: 0.55, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export function Counter({
  to,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1.2,
  className,
}: {
  to: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-32px" });
  const reduce = useReducedMotion();

  const format = (v: number) =>
    `${prefix}${v.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}${suffix}`;

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView) return;
    if (reduce) {
      el.textContent = format(to);
      return;
    }
    const controls = animate(0, to, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => {
        el.textContent = format(v);
      },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce, to, decimals, prefix, suffix, duration]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {format(0)}
    </span>
  );
}

export function AnimatedBar({
  value,
  className,
  barClassName,
  delay = 0,
  duration = 0.9,
}: {
  value: number;
  className?: string;
  barClassName?: string;
  delay?: number;
  duration?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <div
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-muted",
        className
      )}
    >
      <motion.div
        className={cn("h-full rounded-full", barClassName)}
        initial={{ width: reduce ? `${value}%` : "0%" }}
        whileInView={{ width: `${value}%` }}
        viewport={{ once: true, margin: "-32px" }}
        transition={{ duration, delay, ease: EASE }}
      />
    </div>
  );
}

export function AnimatedRing({
  value,
  size = 96,
  strokeWidth = 9,
  className,
  delay = 0,
  children,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  delay?: number;
  children?: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const target = c * (1 - Math.min(Math.max(value, 0), 100) / 100);

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={strokeWidth}
          className="fill-none stroke-muted"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          stroke="currentColor"
          strokeDasharray={c}
          initial={{ strokeDashoffset: reduce ? target : c }}
          whileInView={{ strokeDashoffset: target }}
          viewport={{ once: true, margin: "-32px" }}
          transition={{ duration: 1.2, delay, ease: EASE }}
        />
      </svg>
      {children ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {children}
        </div>
      ) : null}
    </div>
  );
}

"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  ArrowRight,
  Bot,
  CalendarCheck,
  ChartLine,
  Flame,
  Gamepad2,
  Home,
  Map,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { AnimatedBar, Reveal } from "@/components/site/anim"
import { Section, SectionHeader } from "@/components/site/section"
import { useDialogs } from "@/components/site/dialogs"

const EASE: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98]

const FEATURES = [
  {
    icon: Trophy,
    title: "XP, levels & badges",
    description: "Every lesson, game and test feeds one progress system.",
  },
  {
    icon: CalendarCheck,
    title: "Streaks & smart revision",
    description: "Daily goals plus spaced-repetition windows that know what's fading.",
  },
  {
    icon: Map,
    title: "Mastery map",
    description: "Topic-level coverage across the whole syllabus, always current.",
  },
  {
    icon: Target,
    title: "Weak-topic radar",
    description: "The next best action, ranked by what an exam would punish most.",
  },
]

const WEEK = [
  { label: "M", value: 42 },
  { label: "T", value: 58 },
  { label: "W", value: 36 },
  { label: "T", value: 72 },
  { label: "F", value: 55 },
  { label: "S", value: 88 },
  { label: "S", value: 48 },
]

/* 6×3 syllabus heat grid: 3=strong, 2=ok, 1=weak, 0=not started */
const HEAT: number[] = [
  3, 3, 2, 3, 1, 3, 2, 3, 3, 2, 1, 3, 3, 2, 0, 1, 3, 2,
  3, 2, 3, 1, 2, 3, 3, 1, 2, 3, 2, 0, 2, 1, 3, 2, 3, 1,
  2, 3, 1, 3, 3, 2, 1, 2, 3, 3, 0, 2, 1, 3, 2, 3, 1, 2,
]

const HEAT_STYLE: Record<number, string> = {
  0: "bg-muted",
  1: "bg-brand-red/70",
  2: "bg-brand-yellow/80",
  3: "bg-brand-green/80",
}

function DashboardMock() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-lift">
      {/* Window chrome */}
      <div className="flex items-center gap-3 border-b bg-muted/40 px-4 py-2.5">
        <div className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-brand-red/70" />
          <span className="size-2.5 rounded-full bg-brand-yellow/70" />
          <span className="size-2.5 rounded-full bg-brand-green/70" />
        </div>
        <span className="mx-auto rounded-md border bg-background px-3 py-0.5 font-mono text-[10px] text-muted-foreground">
          app.lucous.com/dashboard
        </span>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="hidden w-12 flex-col items-center gap-1 border-r p-2 sm:flex">
          {[
            { icon: Home, active: true, label: "Home" },
            { icon: Gamepad2, active: false, label: "Games" },
            { icon: Bot, active: false, label: "AI team" },
            { icon: ChartLine, active: false, label: "Progress" },
            { icon: Trophy, active: false, label: "Rewards" },
          ].map((item) => (
            <span
              key={item.label}
              title={item.label}
              className={cn(
                "grid size-8 place-items-center rounded-lg",
                item.active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground/60"
              )}
            >
              <item.icon className="size-4" aria-hidden />
            </span>
          ))}
        </div>

        {/* Main */}
        <div className="min-w-0 flex-1 p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">This week</p>
              <p className="text-[11px] text-muted-foreground">
                1,240 XP earned · 6 lessons · 4 games
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-red/10 px-2.5 py-1 text-[11px] font-bold text-brand-red">
              <Flame className="size-3.5" aria-hidden />
              12-day streak
            </span>
          </div>

          {/* Weekly XP chart */}
          <div className="mt-4 rounded-xl border p-3">
            <div className="flex h-20 items-end gap-1.5 sm:gap-2">
              {WEEK.map((day, i) => (
                <div
                  key={i}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-1"
                >
                  <motion.div
                    style={{ height: `${day.value}%` }}
                    initial={{ scaleY: 0.05 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true, margin: "-32px" }}
                    transition={{ duration: 0.7, delay: 0.06 * i, ease: EASE }}
                    className={cn(
                      "w-full origin-bottom rounded-t-sm",
                      i === 5 ? "bg-brand-green" : "bg-primary/75"
                    )}
                  />
                  <span className="text-[9px] font-medium text-muted-foreground">
                    {day.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {/* Syllabus heat map */}
            <div className="rounded-xl border p-3">
              <p className="text-[11px] font-semibold">
                Syllabus coverage — Class 10 Maths
              </p>
              <div className="mt-2.5 grid grid-cols-[repeat(18,minmax(0,1fr))] gap-[3px]">
                {HEAT.map((level, i) => (
                  <span
                    key={i}
                    className={cn("aspect-square rounded-[3px]", HEAT_STYLE[level])}
                  />
                ))}
              </div>
              <div className="mt-2.5 flex items-center gap-3 text-[9px] font-medium text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="size-1.5 rounded-[2px] bg-brand-green/80" />
                  Strong
                </span>
                <span className="flex items-center gap-1">
                  <span className="size-1.5 rounded-[2px] bg-brand-yellow/80" />
                  Shaky
                </span>
                <span className="flex items-center gap-1">
                  <span className="size-1.5 rounded-[2px] bg-brand-red/70" />
                  Weak
                </span>
              </div>
            </div>

            {/* Next best action */}
            <div className="flex flex-col rounded-xl border border-brand-blue/25 bg-brand-blue/5 p-3">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-brand-blue">
                <Sparkles className="size-3.5" aria-hidden />
                Next best action
              </p>
              <p className="mt-2 text-xs leading-relaxed">
                Revise{" "}
                <span className="font-semibold">Trigonometry identities</span>{" "}
                — 15 minutes today keeps Sunday&apos;s mock on track.
              </p>
              <div className="mt-auto flex items-center justify-between pt-3">
                <AnimatedBar
                  value={62}
                  className="h-1.5 flex-1"
                  barClassName="bg-brand-blue"
                />
                <span className="ml-3 shrink-0 text-[10px] font-bold text-brand-blue">
                  Start →
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function StudentDashboard() {
  const { openAuth } = useDialogs()

  return (
    <Section id="student-dashboard">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeader
            align="left"
            eyebrow="Student dashboard"
            title="Your whole learning life, on one screen."
            description="No more guessing what to study. The dashboard turns every result into the next move."
            className="mb-8"
          />

          <ul className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map((feature, i) => (
              <Reveal key={feature.title} delay={0.06 * i}>
                <li className="flex gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <feature.icon className="size-4.5" aria-hidden />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold">{feature.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={0.25}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" className="h-11 px-6 text-[15px]" onClick={() => openAuth("signup")}>
                See it live
                <ArrowRight data-icon="inline-end" aria-hidden />
              </Button>
              <p className="text-xs text-muted-foreground">
                Free plan includes full dashboards.
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1} y={32}>
          <DashboardMock />
        </Reveal>
      </div>
    </Section>
  )
}

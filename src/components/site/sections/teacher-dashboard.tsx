"use client"

import {
  ArrowRight,
  Bell,
  Check,
  ClipboardCheck,
  FileText,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { AnimatedRing, Reveal } from "@/components/site/anim"
import { Section, SectionHeader, brandBar } from "@/components/site/section"
import { useDialogs } from "@/components/site/dialogs"

const TOPIC_MASTERY = [
  { topic: "Quadratic Equations", value: 78, color: "blue" },
  { topic: "Trigonometry", value: 44, color: "red" },
  { topic: "Chemical Bonding", value: 66, color: "green" },
  { topic: "Electricity", value: 71, color: "yellow" },
] as const

const AT_RISK = [
  { name: "Aarav S.", topic: "Trigonometry — identities", tone: "red" },
  { name: "Meera J.", topic: "Electricity — circuits", tone: "yellow" },
  { name: "Karan V.", topic: "Quadratics — word problems", tone: "yellow" },
] as const

const KPIS = [
  { label: "Assignments auto-graded", value: "96%", tone: "text-brand-green" },
  { label: "At-risk students", value: "3", tone: "text-brand-red" },
  { label: "Hours saved / week", value: "6.2", tone: "text-brand-blue" },
]

const FEATURES = [
  {
    icon: ClipboardCheck,
    title: "Auto-graded assignments",
    description: "Homework graded overnight, with per-question class insights.",
  },
  {
    icon: Users,
    title: "Class weak-topic radar",
    description: "See exactly which concept the class is losing, while there's still time to fix it.",
  },
  {
    icon: Sparkles,
    title: "Teacher Copilot",
    description: "Lesson-plan drafts and question banks in your style — you approve, it assembles.",
  },
  {
    icon: FileText,
    title: "Parent-ready reports",
    description: "One-click progress reports parents actually understand.",
  },
]

function TeacherMock() {
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
          app.lucous.com/teacher/class-10b
        </span>
      </div>

      <div className="p-4">
        {/* Class header */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">Class 10-B · Mathematics</p>
            <p className="text-[11px] text-muted-foreground">
              34 students · CBSE boards in 6 weeks
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
            <Bell className="size-3.5" aria-hidden />
            3 alerts
          </span>
        </div>

        {/* KPI row */}
        <div className="mt-4 flex items-center gap-3 rounded-xl border p-3">
          <AnimatedRing value={71} size={56} strokeWidth={7} className="text-brand-blue">
            <span className="text-xs font-bold">71%</span>
          </AnimatedRing>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold">Class average mastery</p>
            <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">
              up 9 points since last unit test
            </p>
          </div>
          <div className="ml-auto hidden shrink-0 grid-cols-1 gap-2 sm:grid">
            {KPIS.map((kpi) => (
              <div
                key={kpi.label}
                className="flex items-center justify-end gap-2 text-right"
              >
                <span className="text-[10px] leading-tight text-muted-foreground">
                  {kpi.label}
                </span>
                <span className={cn("w-10 text-sm font-bold tabular-nums", kpi.tone)}>
                  {kpi.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {/* Topic mastery */}
          <div className="rounded-xl border p-3">
            <p className="text-[11px] font-semibold">Mastery by topic</p>
            <div className="mt-3 space-y-2.5">
              {TOPIC_MASTERY.map((row) => (
                <div key={row.topic}>
                  <div className="mb-1 flex items-center justify-between text-[11px]">
                    <span className="truncate font-medium">{row.topic}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {row.value}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn("h-full rounded-full", brandBar[row.color])}
                      style={{ width: `${row.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Needs attention */}
          <div className="flex flex-col rounded-xl border border-brand-red/25 bg-brand-red/5 p-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-brand-red">
              Needs attention
            </p>
            <ul className="mt-2.5 space-y-2">
              {AT_RISK.map((student) => (
                <li
                  key={student.name}
                  className="flex items-center justify-between gap-2 text-[11px]"
                >
                  <span className="shrink-0 font-semibold">{student.name}</span>
                  <span className="truncate text-muted-foreground">
                    {student.topic}
                  </span>
                  <span
                    className={cn(
                      "size-1.5 shrink-0 rounded-full",
                      student.tone === "red" ? "bg-brand-red" : "bg-brand-yellow"
                    )}
                    aria-hidden
                  />
                </li>
              ))}
            </ul>
              <p className="mt-auto flex items-center gap-1.5 pt-3 text-[10px] font-medium text-muted-foreground">
                <Check className="size-3 shrink-0 text-brand-green" aria-hidden />
                42 submissions auto-graded overnight
              </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function TeacherDashboard() {
  const { openAuth } = useDialogs()

  return (
    <Section id="teacher-dashboard" className="bg-muted/40">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal y={32} className="lg:order-1">
          <TeacherMock />
        </Reveal>

        <div className="lg:order-2">
          <SectionHeader
            align="left"
            eyebrow="Teacher dashboard"
            tone="red"
            title="Teach more. Grade less."
            description="Everything a teacher does after class — grading, spotting strugglers, reporting — compressed into minutes."
            className="mb-8"
          />

          <ul className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map((feature, i) => (
              <Reveal key={feature.title} delay={0.06 * i}>
                <li className="flex gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-red/10 text-brand-red">
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
              <Button
                size="lg"
                className="h-11 px-6 text-[15px]"
                onClick={() => openAuth("signup")}
              >
                Get Teacher Pro
                <ArrowRight data-icon="inline-end" aria-hidden />
              </Button>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="size-3.5" aria-hidden />
                Student data stays private — never sold, no ads.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  )
}

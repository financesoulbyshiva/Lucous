"use client"

import { motion } from "framer-motion"
import {
  ArrowRight,
  Flame,
  Gamepad2,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { LucousLogo } from "@/components/logo"
import { useDialogs } from "@/components/site/dialogs"
import { AnimatedBar, AnimatedRing, Counter, Reveal } from "@/components/site/anim"
import { Eyebrow, Section } from "@/components/site/section"

const TOPIC_BARS = [
  { label: "Quadratic Equations", value: 86, bar: "bg-brand-blue" },
  { label: "Chemical Bonding", value: 64, bar: "bg-brand-green" },
  { label: "Trigonometry", value: 41, bar: "bg-brand-red" },
]

const MASTERY = [
  { label: "Maths", value: 82, color: "text-brand-blue" },
  { label: "Science", value: 68, color: "text-brand-green" },
  { label: "English", value: 74, color: "text-amber-600 dark:text-brand-yellow" },
]

function DashboardMock() {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-tr from-brand-blue/25 via-brand-yellow/10 to-brand-green/25 blur-2xl"
      />

      <div className="rounded-2xl border bg-card/95 p-4 shadow-lift sm:p-5">
        {/* Student header */}
        <div className="flex items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            AR
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Aarav S.</p>
            <p className="truncate text-xs text-muted-foreground">
              Class 10 · CBSE
            </p>
          </div>
          <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-yellow/15 px-2.5 py-1 text-xs font-bold text-amber-600 dark:text-brand-yellow">
            <Trophy className="size-3.5" aria-hidden /> Lv 12
          </span>
        </div>

        {/* XP to next level */}
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="font-semibold">
              <Counter to={2840} suffix=" XP" />
            </span>
            <span className="text-muted-foreground">160 XP to Lv 13</span>
          </div>
          <AnimatedBar
            value={95}
            className="h-2"
            barClassName="bg-gradient-to-r from-brand-blue to-brand-green"
          />
        </div>

        {/* Stat chips */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-xl border bg-background/70 p-2.5 text-center">
            <Flame className="mx-auto size-4 text-brand-red" aria-hidden />
            <p className="mt-1 text-sm font-bold leading-none">12</p>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              day streak
            </p>
          </div>
          <div className="rounded-xl border bg-background/70 p-2.5 text-center">
            <Trophy className="mx-auto size-4 text-amber-600 dark:text-brand-yellow" aria-hidden />
            <p className="mt-1 text-sm font-bold leading-none">5/8</p>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              badges
            </p>
          </div>
          <div className="rounded-xl border bg-background/70 p-2.5 text-center">
            <Trophy className="mx-auto size-4 text-brand-blue" aria-hidden />
            <p className="mt-1 text-sm font-bold leading-none">#4</p>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              class rank
            </p>
          </div>
        </div>

        {/* Mastery rings */}
        <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl border bg-muted/40 p-3 sm:p-4">
          {MASTERY.map((m, i) => (
            <AnimatedRing
              key={m.label}
              value={m.value}
              size={62}
              strokeWidth={7}
              delay={0.2 + i * 0.15}
              className={m.color}
            >
              <span className="text-[11px] font-bold">{m.value}%</span>
              <span className="text-[9px] font-medium text-muted-foreground">
                {m.label}
              </span>
            </AnimatedRing>
          ))}
        </div>

        {/* Topic progress */}
        <div className="mt-4 space-y-3">
          {TOPIC_BARS.map((t, i) => (
            <div key={t.label}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium">{t.label}</span>
                <span className="tabular-nums text-muted-foreground">
                  {t.value}%
                </span>
              </div>
              <AnimatedBar
                value={t.value}
                delay={0.15 * i}
                className="h-1.5"
                barClassName={t.bar}
              />
            </div>
          ))}
        </div>

        {/* Weak topics */}
        <div className="mt-4 rounded-xl border border-brand-red/25 bg-brand-red/5 p-3">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-brand-red">
            <Target className="size-3.5" aria-hidden /> Focus next
          </p>
          <ul className="mt-2 space-y-1.5">
            {["Trigonometry — identities", "Chemical bonding — shapes"].map(
              (topic) => (
                <li
                  key={topic}
                  className="flex items-center justify-between gap-2 text-xs"
                >
                  <span className="truncate">{topic}</span>
                  <span className="shrink-0 font-semibold text-brand-red">
                    Drill →
                  </span>
                </li>
              )
            )}
          </ul>
        </div>
      </div>

      {/* Floating XP toast */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-6 right-2 hidden items-center gap-2.5 rounded-xl border bg-card p-3 shadow-lift sm:flex lg:-right-6"
      >
        <span className="grid size-8 place-items-center rounded-lg bg-brand-green/15 text-brand-green">
          <Zap className="size-4" aria-hidden />
        </span>
        <span>
          <span className="block text-xs font-bold">+120 XP</span>
          <span className="block text-[10px] text-muted-foreground">
            Boss Challenge cleared
          </span>
        </span>
      </motion.div>

      {/* Floating AI bubble */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -bottom-7 left-1 hidden max-w-[13.5rem] rounded-xl border bg-card p-3 shadow-lift md:block lg:-left-8"
      >
        <p className="flex gap-2 text-[11px] leading-snug">
          <Sparkles className="mt-0.5 size-3.5 shrink-0 text-brand-blue" aria-hidden />
          <span>
            Trigonometry is your weak spot this week — want a 10-minute drill?
          </span>
        </p>
        <p className="mt-1.5 pl-5.5 text-[10px] font-bold text-brand-blue">
          Start drill →
        </p>
      </motion.div>
    </div>
  )
}

export function Hero() {
  const { openAuth } = useDialogs()

  return (
    <Section
      id="home"
      className="overflow-hidden pt-14 pb-16 sm:pt-20 sm:pb-20 lg:pt-24 lg:pb-24"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-dots [mask-image:radial-gradient(ellipse_55%_45%_at_50%_0%,black,transparent)]" />
        <div className="absolute -top-40 left-1/2 h-[30rem] w-[46rem] -translate-x-1/2 rounded-full bg-brand-blue/10 blur-3xl" />
        <div className="absolute top-24 -left-32 size-72 rounded-full bg-brand-green/10 blur-3xl" />
        <div className="absolute -right-32 top-40 size-72 rounded-full bg-brand-red/10 blur-3xl" />
      </div>

      <div className="grid items-center gap-14 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10 xl:gap-16">
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow icon={Sparkles} tone="blue">
              Learn · Play · Test · Improve
            </Eyebrow>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-[3.4rem] lg:leading-[1.08]">
              Learning should feel like{" "}
              <span className="bg-gradient-to-r from-brand-blue to-brand-green bg-clip-text text-transparent">
                progress.
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="mt-5 max-w-xl text-base text-pretty text-muted-foreground sm:text-lg">
              LUCOUS turns any syllabus into bite-sized lessons, ten learning
              games and a personal AI team — then shows you exactly what to
              improve next. Every single day.
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                className="h-11 px-6 text-[15px]"
                onClick={() => openAuth("signup")}
              >
                Start Learning
                <ArrowRight data-icon="inline-end" aria-hidden />
              </Button>
              <a
                href="#games"
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-input bg-background px-6 text-[15px] font-medium whitespace-nowrap transition-colors outline-none hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <Gamepad2 className="size-4" aria-hidden />
                Explore Games
              </a>
            </div>
            <p className="mt-3.5 text-xs text-muted-foreground">
              Free forever plan · No credit card · Works on any device
            </p>
          </Reveal>

          <Reveal delay={0.32}>
            <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4 sm:gap-x-12">
              {[
                { to: 10, suffix: "", label: "learning games" },
                { to: 8, suffix: "", label: "AI teammates" },
                { to: 990, suffix: "+", label: "bite-sized lessons" },
              ].map((stat) => (
                <div key={stat.label}>
                  <dd className="text-2xl font-bold tracking-tight sm:text-3xl">
                    <Counter to={stat.to} suffix={stat.suffix} />
                  </dd>
                  <dt className="mt-0.5 text-xs font-medium text-muted-foreground">
                    {stat.label}
                  </dt>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <Reveal delay={0.15} y={32}>
          <DashboardMock />
        </Reveal>
      </div>
    </Section>
  )
}

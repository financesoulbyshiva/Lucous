"use client"

import {
  Crown,
  Flame,
  Lock,
  Minus,
  Swords,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react"
import { cn } from "cn"

import { Reveal } from "@/components/site/anim"
import {
  Section,
  SectionHeader,
  brandTile,
  brandText,
} from "@/components/site/section"
import { BADGES, LEADERBOARD } from "@/lib/data"

const MECHANICS = [
  "XP & levels",
  "Daily streaks",
  "Weekly challenges",
  "Seasons & ranks",
  "Boss fights",
  "Class leaderboards",
]

const TREND_ICON = {
  up: TrendingUp,
  down: TrendingDown,
  same: Minus,
} as const

const TREND_STYLE: Record<"up" | "down" | "same", string> = {
  up: "text-brand-green",
  down: "text-brand-red",
  same: "text-muted-foreground/60",
}

function BadgeCard({ badge, i }: { badge: (typeof BADGES)[number]; i: number }) {
  return (
    <Reveal delay={0.04 * i} className="h-full">
      <article
        className={cn(
          "flex h-full flex-col items-center rounded-2xl border p-4 text-center transition-all duration-300",
          badge.unlocked
            ? "bg-card hover:-translate-y-1 hover:shadow-lift"
            : "border-dashed bg-muted/30"
        )}
      >
        <span
          className={cn(
            "grid size-12 place-items-center rounded-2xl",
            badge.unlocked
              ? cn(brandTile[badge.color], "shadow-soft")
              : "bg-muted text-muted-foreground/50"
          )}
        >
          {badge.unlocked ? (
            <badge.icon className="size-5.5" aria-hidden />
          ) : (
            <Lock className="size-4" aria-hidden />
          )}
        </span>
        <h3 className="mt-2.5 text-xs font-semibold">{badge.name}</h3>
        <p className="mt-1 text-[10px] leading-snug text-muted-foreground">
          {badge.description}
        </p>
        {!badge.unlocked && (
          <span className="mt-1.5 text-[9px] font-bold uppercase tracking-wide text-muted-foreground/60">
            locked
          </span>
        )}
      </article>
    </Reveal>
  )
}

export function Gamification() {
  return (
    <Section id="gamification" className="bg-muted/40">
      <SectionHeader
        eyebrow="Gamification"
        tone="yellow"
        title="Progress you can feel."
        description="XP, streaks, badges, bosses and leaderboards — motivation engineering tuned for learners, not casinos."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Badge wall */}
        <div className="rounded-2xl border bg-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Crown className="size-4 text-amber-600 dark:text-brand-yellow" aria-hidden />
              Badge wall
            </h3>
            <span className="text-xs font-medium text-muted-foreground tabular-nums">
              5 of {BADGES.length} unlocked
            </span>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {BADGES.map((badge, i) => (
              <BadgeCard key={badge.name} badge={badge} i={i} />
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-1.5 border-t pt-4">
            {MECHANICS.map((mechanic) => (
              <span
                key={mechanic}
                className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold text-muted-foreground"
              >
                {mechanic}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* Streak card */}
          <Reveal delay={0.1}>
            <div className="rounded-2xl border bg-card p-5">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <Flame className="size-4 text-brand-red" aria-hidden />
                  Daily streak
                </h3>
                <span className="text-lg font-bold tabular-nums text-brand-red">
                  12 days
                </span>
              </div>
              <div className="mt-4 flex items-center gap-1.5">
                {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <span
                      className={cn(
                        "grid size-7 place-items-center rounded-lg text-[10px] font-bold",
                        i < 5
                          ? "bg-gradient-to-b from-brand-red/20 to-brand-red/10 text-brand-red"
                          : "bg-muted text-muted-foreground/50"
                      )}
                    >
                      {i < 5 ? <Zap className="size-3" aria-hidden /> : "–"}
                    </span>
                    <span className="text-[9px] font-medium text-muted-foreground">
                      {day}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground">
                5 active days this week — two more keeps the streak alive.
              </p>
            </div>
          </Reveal>

          {/* Leaderboard */}
          <Reveal delay={0.15} className="flex-1">
            <div className="flex h-full flex-col rounded-2xl border bg-card p-5">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <Swords className="size-4 text-brand-blue" aria-hidden />
                  Class leaderboard
                </h3>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  this week
                </span>
              </div>
              <ul className="mt-4 flex-1 space-y-1.5">
                {LEADERBOARD.map((row) => {
                  const TrendIcon = TREND_ICON[row.trend]
                  return (
                    <li
                      key={row.rank}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-2.5 py-2",
                        row.isYou && "bg-primary/10 ring-1 ring-primary/25"
                      )}
                    >
                      <span className="w-4 text-xs font-bold tabular-nums text-muted-foreground">
                        {row.rank}
                      </span>
                      <span
                        className={cn(
                          "grid size-7 shrink-0 place-items-center rounded-full text-[9px] font-bold",
                          brandTile[row.color]
                        )}
                      >
                        {row.initials}
                      </span>
                      <span
                        className={cn(
                          "min-w-0 flex-1 truncate text-xs",
                          row.isYou ? "font-bold" : "font-medium"
                        )}
                      >
                        {row.name}
                      </span>
                      <span className="text-xs font-bold tabular-nums">
                        {row.xp.toLocaleString("en-US")}
                      </span>
                      <TrendIcon
                        className={cn("size-3.5 shrink-0", TREND_STYLE[row.trend])}
                        aria-label={`${row.trend} in rank`}
                      />
                    </li>
                  )
                })}
              </ul>
              <p className={cn("mt-3 border-t pt-3 text-[11px] font-medium", brandText.yellow)}>
                260 XP to rank 3 — a Boss Challenge would do it.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  )
}

"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight, Zap } from "lucide-react"
import { cn } from "cn"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Reveal } from "@/components/site/anim"
import {
  FilterChips,
  Section,
  SectionHeader,
  brandText,
  brandTile,
} from "@/components/site/section"
import { useDialogs } from "@/components/site/dialogs"
import { GAMES, GAME_CATEGORIES, type Game, type GameCategory } from "@/lib/data"

function GameCard({ game }: { game: Game }) {
  return (
    <article className="group flex h-full flex-col rounded-2xl border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-foreground/20 hover:shadow-lift">
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "grid size-11 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-110",
            brandTile[game.color]
          )}
        >
          <game.icon className="size-5.5" aria-hidden />
        </span>
        <div className="flex flex-col items-end gap-1">
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-yellow/15 px-2 py-0.5 text-[11px] font-bold text-amber-600 dark:text-brand-yellow">
            <Zap className="size-3" aria-hidden />+{game.xp} XP
          </span>
          <span className="text-[11px] font-medium text-muted-foreground">
            {game.mode}
          </span>
        </div>
      </div>

      <h3 className="mt-4 text-base font-semibold">{game.name}</h3>
      <p className={cn("mt-0.5 text-xs font-semibold", brandText[game.color])}>
        {game.tagline}
      </p>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
        {game.description}
      </p>

      <div className="mt-4 flex items-center justify-between gap-2 border-t pt-3.5">
        <div className="flex flex-wrap gap-1.5">
          {game.categories.map((category) => (
            <span
              key={category}
              className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground"
            >
              {category}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            toast.info(`${game.name} — frontend preview`, {
              description:
                "The game engine is API-ready: connect the gameplay service to make it playable.",
            })
          }
          className="inline-flex shrink-0 items-center gap-1 rounded-sm text-xs font-bold text-primary outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Preview
          <ArrowRight className="size-3" aria-hidden />
        </button>
      </div>
    </article>
  )
}

export function Games() {
  const [filter, setFilter] = React.useState<"All" | GameCategory>("All")
  const { openAuth } = useDialogs()

  const filtered =
    filter === "All" ? GAMES : GAMES.filter((g) => g.categories.includes(filter))

  return (
    <Section id="games">
      <SectionHeader
        eyebrow="Games"
        tone="green"
        title="Practice that feels like play."
        description="Ten game modes built on active recall and spaced repetition — the two best-studied ways to make knowledge stick. XP, streaks and leaderboards do the motivating."
      />

      <Reveal delay={0.05}>
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <FilterChips
            items={GAME_CATEGORIES}
            value={filter}
            onChange={setFilter}
            label="Filter games by category"
          />
          <p className="text-xs font-medium text-muted-foreground tabular-nums" aria-live="polite">
            {filtered.length} of {GAMES.length} games
          </p>
        </div>
      </Reveal>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {filtered.map((game) => (
            <motion.div
              key={game.name}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="h-full"
            >
              <GameCard game={game} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Reveal delay={0.1}>
        <div className="mt-10 flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-muted-foreground">
            New game modes ship every month — team seasons, story quests and
            regional tournaments.
          </p>
          <Button variant="outline" size="lg" className="h-10 px-5" onClick={() => openAuth("signup")}>
            Unlock all games
            <ArrowRight data-icon="inline-end" aria-hidden />
          </Button>
        </div>
      </Reveal>
    </Section>
  )
}

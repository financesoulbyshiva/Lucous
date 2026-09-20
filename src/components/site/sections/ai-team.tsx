"use client"

import { Check, Sparkles } from "lucide-react"
import { cn } from "cn"

import { Reveal } from "@/components/site/anim"
import { Section, SectionHeader, brandTile } from "@/components/site/section"
import { AI_BOTS } from "@/lib/data"

export function AiTeam() {
  return (
    <Section id="ai-team" className="bg-muted/40">
      <SectionHeader
        eyebrow="AI Learning Team"
        tone="blue"
        title="Eight AI teammates. One goal: you."
        description="A full crew of specialized assistants around every learner and teacher — each one API-ready. Connect your LLM provider and they go live; nothing on this page pretends to be live AI."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {AI_BOTS.map((bot, i) => (
          <Reveal key={bot.name} delay={0.05 * i} className="h-full">
            <article className="group flex h-full flex-col rounded-2xl border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "grid size-11 shrink-0 place-items-center rounded-full transition-transform duration-300 group-hover:scale-110",
                    brandTile[bot.color]
                  )}
                >
                  <bot.icon className="size-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold">{bot.name}</h3>
                  <p className="truncate text-xs text-muted-foreground">
                    {bot.role}
                  </p>
                </div>
              </div>

              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {bot.description}
              </p>

              <ul className="mt-4 space-y-1.5 border-t pt-3.5">
                {bot.capabilities.map((capability) => (
                  <li
                    key={capability}
                    className="flex items-start gap-2 text-xs text-muted-foreground"
                  >
                    <Check
                      className="mt-0.5 size-3.5 shrink-0 text-brand-green"
                      aria-hidden
                    />
                    {capability}
                  </li>
                ))}
              </ul>

              <span className="mt-3.5 inline-flex items-center gap-1 self-start rounded-full border border-dashed px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                <Sparkles className="size-3" aria-hidden />
                API-ready
              </span>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}

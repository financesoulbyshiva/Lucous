"use client"

import { RefreshCw } from "lucide-react"
import { cn } from "cn"

import { Reveal } from "@/components/site/anim"
import { Section, SectionHeader, brandTile } from "@/components/site/section"
import { HOW_IT_WORKS } from "@/lib/data"

export function HowItWorks() {
  return (
    <Section id="how-it-works">
      <SectionHeader
        eyebrow="How LUCOUS works"
        title="From syllabus to mastery, in one loop."
        description="Eight steps that repeat forever — and every cycle is smarter than the last, because the AI re-plans around your latest results."
      />

      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {HOW_IT_WORKS.map((step, i) => {
          const isLast = step.step === HOW_IT_WORKS.length
          return (
            <Reveal key={step.step} delay={0.05 * i} className="h-full">
              <li className="group relative flex h-full flex-col rounded-2xl border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
                {isLast && (
                  <span
                    className="absolute -top-2.5 -right-2.5 grid size-7 place-items-center rounded-full bg-brand-green text-white shadow-lift"
                    title="…and the loop repeats"
                  >
                    <RefreshCw className="size-3.5" aria-hidden />
                  </span>
                )}
                <div className="flex items-start justify-between">
                  <span
                    className={cn(
                      "grid size-10 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-110",
                      brandTile[step.color]
                    )}
                  >
                    <step.icon className="size-5" aria-hidden />
                  </span>
                  <span
                    className="text-3xl font-extrabold tabular-nums text-muted-foreground/15 select-none"
                    aria-hidden
                  >
                    {String(step.step).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold">
                  <span className="text-muted-foreground/60 mr-1.5 text-sm font-bold tabular-nums sm:hidden">
                    {step.step}.
                  </span>
                  {step.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </li>
            </Reveal>
          )
        })}
      </ol>

      <Reveal delay={0.15}>
        <p className="mx-auto mt-8 flex max-w-lg items-center justify-center gap-2 rounded-full border bg-muted/50 px-5 py-3 text-center text-sm text-muted-foreground">
          <RefreshCw className="size-4 shrink-0 text-brand-green" aria-hidden />
          Test results feed the next plan — improve, then start the loop again
          one level higher.
        </p>
      </Reveal>
    </Section>
  )
}

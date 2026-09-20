"use client"

import { ArrowRight } from "lucide-react"
import { cn } from "cn"

import { buttonVariants } from "@/components/ui/button"
import { Reveal } from "@/components/site/anim"
import { Section, SectionHeader } from "@/components/site/section"
import { PAIN_POINTS } from "@/lib/data"

export function Problem() {
  return (
    <Section id="problem" className="bg-muted/40">
      <SectionHeader
        eyebrow="The problem"
        tone="red"
        title="Traditional learning leaves gaps that quietly grow."
        description="Most classrooms and study apps share the same blind spots — and students pay for them on exam day."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PAIN_POINTS.map((point, i) => (
          <Reveal key={point.title} delay={0.07 * i} className="h-full">
            <article className="group flex h-full flex-col rounded-2xl border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-brand-red/30 hover:shadow-lift">
              <span className="grid size-10 place-items-center rounded-xl bg-brand-red/10 text-brand-red transition-transform duration-300 group-hover:scale-110">
                <point.icon className="size-5" aria-hidden />
              </span>
              <h3 className="mt-4 text-base font-semibold">{point.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {point.description}
              </p>
            </article>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.1}>
        <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border bg-gradient-to-r from-brand-red/10 via-transparent to-brand-blue/10 p-5 sm:flex-row sm:p-6">
          <p className="max-w-xl text-center text-sm font-medium sm:text-left sm:text-[15px]">
            The compounding result: students memorize, forget, and never see
            the gap — until the exam finds it for them.
          </p>
          <a
            href="#how-it-works"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "h-10 shrink-0 px-5"
            )}
          >
            See how LUCOUS fixes it
            <ArrowRight data-icon="inline-end" aria-hidden />
          </a>
        </div>
      </Reveal>
    </Section>
  )
}

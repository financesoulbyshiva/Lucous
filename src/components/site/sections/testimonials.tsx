"use client"

import { Quote } from "lucide-react"
import { cn } from "cn"

import { Reveal } from "@/components/site/anim"
import { Section, SectionHeader, brandTile } from "@/components/site/section"
import { TESTIMONIALS } from "@/lib/data"

export function Testimonials() {
  return (
    <Section id="testimonials">
      <SectionHeader
        eyebrow="Testimonials"
        tone="green"
        title="Loved by learners. Soon: proven, too."
        description="We're pre-launch — these are design placeholders. Real stories from early-access classrooms will replace every card below."
      />

      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {TESTIMONIALS.map((testimonial, i) => (
          <Reveal key={testimonial.name} delay={0.05 * i} className="mb-4 break-inside-avoid">
            <figure className="relative rounded-2xl border bg-card p-5 transition-all duration-300 hover:border-foreground/20 hover:shadow-lift">
              <span className="absolute top-4 right-4 rounded-full border border-dashed border-amber-600/40 bg-brand-yellow/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-700 dark:text-brand-yellow">
                Placeholder
              </span>
              <Quote
                className="size-5 text-muted-foreground/40"
                aria-hidden
              />
              <blockquote className="mt-3 text-sm leading-relaxed text-foreground/90">
                {testimonial.quote}
              </blockquote>
              <figcaption className="mt-4 flex items-center gap-3 border-t pt-4">
                <span
                  className={cn(
                    "grid size-9 place-items-center rounded-full text-xs font-bold",
                    brandTile[testimonial.color]
                  )}
                >
                  {testimonial.initials}
                </span>
                <div>
                  <p className="text-sm font-semibold">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}

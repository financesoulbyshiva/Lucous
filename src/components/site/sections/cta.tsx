"use client"

import { ArrowRight } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { Reveal } from "@/components/site/anim"
import { Section } from "@/components/site/section"
import { useDialogs } from "@/components/site/dialogs"

const WORDS = [
  { word: "Learn", dot: "bg-brand-yellow" },
  { word: "Play", dot: "bg-brand-red" },
  { word: "Test", dot: "bg-brand-green" },
  { word: "Improve", dot: "bg-white" },
]

export function FinalCta() {
  const { openAuth } = useDialogs()

  return (
    <Section id="about">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#12336e] via-[#0e254f] to-[#0a1832] px-6 py-14 text-center text-white sm:px-10 sm:py-16 lg:px-16 lg:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-dots opacity-40 [mask-image:radial-gradient(ellipse_60%_70%_at_50%_30%,black,transparent)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/3 size-72 rounded-full bg-brand-blue/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 right-1/4 size-72 rounded-full bg-brand-green/20 blur-3xl"
        />

        <div className="relative mx-auto max-w-2xl">
          <Reveal>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {WORDS.map((item) => (
                <span
                  key={item.word}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur"
                >
                  <span
                    className={cn("size-1.5 rounded-full", item.dot)}
                    aria-hidden
                  />
                  {item.word}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl">
              Ready to learn differently?
            </h2>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="mx-auto mt-5 max-w-xl text-base text-pretty text-white/70 sm:text-lg">
              LUCOUS is an AI-powered, gamified learning platform built by
              educators, game designers and engineers on one mission: make
              progress feel as good as playing. Join early access and be one of
              the first to feel it.
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                size="lg"
                className="h-11 bg-white px-6 text-[15px] text-[#0e254f] hover:bg-white/85"
                onClick={() => openAuth("signup")}
              >
                Get Started — it&apos;s free
                <ArrowRight data-icon="inline-end" aria-hidden />
              </Button>
              <a
                href="#schools"
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-6 text-[15px] font-medium whitespace-nowrap backdrop-blur transition-colors outline-none hover:bg-white/20 focus-visible:border-white/60 focus-visible:ring-3 focus-visible:ring-white/30"
              >
                Book a school demo
              </a>
            </div>
            <p className="mt-4 text-xs text-white/50">
              Free forever plan · No credit card · Cancel anytime
            </p>
          </Reveal>
        </div>
      </div>
    </Section>
  )
}

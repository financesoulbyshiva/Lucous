"use client"

import { MessagesSquare } from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Reveal } from "@/components/site/anim"
import { Section, SectionHeader } from "@/components/site/section"
import { useDialogs } from "@/components/site/dialogs"
import { FAQS } from "@/lib/data"

export function Faq() {
  const { openSearch } = useDialogs()

  return (
    <Section id="faq" className="bg-muted/40">
      <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div>
          <SectionHeader
            align="left"
            eyebrow="FAQ"
            title="Questions, answered."
            description="Everything learners, teachers and schools usually ask before their first day on Lucous."
            className="mb-6"
          />
          <Reveal delay={0.1}>
            <div className="rounded-2xl border bg-card p-5">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <MessagesSquare className="size-4 text-primary" aria-hidden />
                Still curious?
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Press{" "}
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-semibold">
                  /
                </kbd>{" "}
                anywhere to search the whole site — or ask the AI Tutor once
                you&apos;re in.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => openSearch()}
              >
                Search the site
              </Button>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.08}>
          <Accordion className="rounded-2xl border bg-card px-5 py-2">
            {FAQS.map((faq, i) => (
              <AccordionItem key={faq.q} value={`faq-${i}`}>
                <AccordionTrigger className="py-4 text-[15px]">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="pb-4 leading-relaxed text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </Section>
  )
}

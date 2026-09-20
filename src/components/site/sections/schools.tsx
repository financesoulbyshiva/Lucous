"use client"

import {
  ArrowRight,
  Building2,
  FileText,
  GraduationCap,
  KeyRound,
  Palette,
  ShieldCheck,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Reveal } from "@/components/site/anim"
import { Section, SectionHeader } from "@/components/site/section"
import { useDialogs } from "@/components/site/dialogs"

const FEATURES = [
  {
    icon: Building2,
    title: "Campus-wide analytics",
    description:
      "Mastery across classes, sections and years — spotted early, not at term end.",
  },
  {
    icon: Palette,
    title: "White-label branding",
    description:
      "Your school's logo, colors and domain on every screen students touch.",
  },
  {
    icon: GraduationCap,
    title: "Teacher training & onboarding",
    description:
      "Structured onboarding so every teacher is assigning games in week one.",
  },
  {
    icon: FileText,
    title: "Parent reports",
    description:
      "Automatic, jargon-free progress reports for every parent-teacher cycle.",
  },
  {
    icon: ShieldCheck,
    title: "Child-safe by design",
    description:
      "COPPA and DPDP-aligned: encrypted data, no ads, never sold.",
  },
  {
    icon: KeyRound,
    title: "SSO & bulk deployment",
    description:
      "Google Workspace or custom SSO, roster sync and LMS integrations.",
  },
]

export function Schools() {
  const { openAuth } = useDialogs()

  return (
    <Section id="schools">
      <SectionHeader
        eyebrow="For schools & institutions"
        title="A campus that learns together."
        description="Lucous for Schools brings the same games, AI team and mastery analytics to every classroom — with the controls and reporting an institution needs."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature, i) => (
          <Reveal key={feature.title} delay={0.05 * i} className="h-full">
            <article className="flex h-full gap-4 rounded-2xl border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-foreground/20 hover:shadow-lift">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <feature.icon className="size-5" aria-hidden />
              </span>
              <div>
                <h3 className="text-sm font-semibold">{feature.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.1}>
        <div className="mt-8 flex flex-col items-center justify-between gap-5 rounded-2xl border bg-gradient-to-r from-brand-blue/10 via-transparent to-brand-green/10 p-6 sm:p-8 lg:flex-row">
          <div className="max-w-xl text-center lg:text-left">
            <h3 className="text-lg font-semibold">
              Bring Lucous to your school
            </h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              From ₹99 per student / month — teacher training, white-labeling
              and a dedicated success manager included. Placeholder pricing;
              final quotes are per campus.
            </p>
          </div>
          <Button
            size="lg"
            className="h-11 shrink-0 px-6 text-[15px]"
            onClick={() => openAuth("signup")}
          >
            Book a demo
            <ArrowRight data-icon="inline-end" aria-hidden />
          </Button>
        </div>
      </Reveal>
    </Section>
  )
}

"use client"

import * as React from "react"
import { ArrowRight, BadgeCheck, Check, Sparkles } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Reveal } from "@/components/site/anim"
import { Section, SectionHeader } from "@/components/site/section"
import { useDialogs } from "@/components/site/dialogs"
import { PRICING_PLANS, type PricingPlan } from "@/lib/data"

const PLAN_GRID = "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"

function PricingCard({ plan, yearly }: { plan: PricingPlan; yearly: boolean }) {
  const { openAuth } = useDialogs()
  const price = yearly ? plan.yearlyMonthly : plan.monthly
  const isCustom = price === null

  return (
    <article
      className={cn(
        "relative flex h-full flex-col rounded-2xl border bg-card p-5 transition-all duration-300",
        plan.highlighted
          ? "border-primary shadow-lift ring-2 ring-primary/25 lg:-translate-y-2"
          : "hover:-translate-y-1 hover:border-foreground/20 hover:shadow-lift"
      )}
    >
      {plan.badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[11px] font-bold whitespace-nowrap text-primary-foreground shadow-soft">
          {plan.badge}
        </span>
      )}

      <h3 className="text-base font-semibold">{plan.name}</h3>
      <p className="mt-1 min-h-8 text-xs leading-snug text-muted-foreground">
        {plan.tagline}
      </p>

      <div className="mt-4 flex items-baseline gap-1.5">
        {isCustom ? (
          <span className="text-2xl font-bold tracking-tight">Custom</span>
        ) : (
          <>
            <span className="text-sm font-semibold text-muted-foreground">₹</span>
            <span className="text-3xl font-bold tracking-tight tabular-nums">
              {price}
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              /mo
            </span>
          </>
        )}
      </div>
      <p className="mt-1 h-4 text-[11px] text-muted-foreground">
        {isCustom
          ? "Volume pricing for groups & networks"
          : plan.monthly === 0
            ? "Free forever"
            : yearly
              ? `billed yearly — ₹${(plan.yearlyMonthly ?? 0) * 12}/yr`
              : "billed monthly"}
      </p>
      {plan.unit && (
        <p className="text-[11px] font-medium text-muted-foreground">
          {plan.unit}
        </p>
      )}

      <ul className="mt-5 flex-1 space-y-2.5 border-t pt-4">
        {plan.features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2 text-sm text-muted-foreground"
          >
            <Check
              className={cn(
                "mt-0.5 size-4 shrink-0",
                plan.highlighted ? "text-primary" : "text-brand-green"
              )}
              aria-hidden
            />
            {feature}
          </li>
        ))}
      </ul>

      <Button
        variant={plan.ctaVariant}
        onClick={() => openAuth("signup")}
        className={cn(
          "mt-5 w-full",
          plan.highlighted ? "h-10" : "h-9"
        )}
      >
        {plan.cta}
        <ArrowRight data-icon="inline-end" aria-hidden />
      </Button>
    </article>
  )
}

export function Pricing() {
  const [yearly, setYearly] = React.useState(true)
  const { openAuth } = useDialogs()

  return (
    <Section id="pricing">
      <SectionHeader
        eyebrow="Pricing"
        title="Start free. Upgrade when it hurts to wait."
        description="Every plan includes the core loop — lessons, games, tests and progress. Paid plans unlock the full AI team and unlimited everything."
      />

      <Reveal delay={0.05}>
        <div className="mb-8 flex items-center justify-center gap-3">
          <span
            className={cn(
              "text-sm font-medium",
              !yearly ? "text-foreground" : "text-muted-foreground"
            )}
          >
            Monthly
          </span>
          <Switch
            checked={yearly}
            onCheckedChange={setYearly}
            aria-label="Toggle yearly billing"
          />
          <span
            className={cn(
              "inline-flex items-center gap-1.5 text-sm font-medium",
              yearly ? "text-foreground" : "text-muted-foreground"
            )}
          >
            Yearly
            <span className="rounded-full bg-brand-green/15 px-2 py-0.5 text-[11px] font-bold text-brand-green">
              save up to 20%
            </span>
          </span>
        </div>
      </Reveal>

      <div className={cn("grid gap-4 pt-3", PLAN_GRID)}>
        {PRICING_PLANS.map((plan, i) => (
          <Reveal key={plan.id} delay={0.05 * i} className="h-full">
            <PricingCard plan={plan} yearly={yearly} />
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.15}>
        <div className="mt-8 flex flex-col items-center gap-2 text-center">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="size-3.5 shrink-0" aria-hidden />
            Launch pricing shown in ₹ — placeholders for planning; final
            numbers land before public launch.
          </p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <BadgeCheck className="size-3.5 shrink-0" aria-hidden />
            Schools & groups: every plan includes teacher training and a
            success manager.
          </p>
          <button
            type="button"
            onClick={() => openAuth("signup")}
            className="mt-2 rounded-sm text-sm font-semibold text-primary outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Start on the free plan →
          </button>
        </div>
      </Reveal>
    </Section>
  )
}

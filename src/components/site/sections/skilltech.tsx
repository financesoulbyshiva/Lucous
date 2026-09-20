"use client"

import { ArrowRight, FolderGit2 } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { Reveal } from "@/components/site/anim"
import { Section, SectionHeader, brandTile } from "@/components/site/section"
import { useDialogs } from "@/components/site/dialogs"
import { SKILL_TRACKS } from "@/lib/data"

function SkillChip({ skill }: { skill: string }) {
  return (
    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
      {skill}
    </span>
  )
}

function TrackCard({
  track,
  large = false,
}: {
  track: (typeof SKILL_TRACKS)[number];
  large?: boolean;
}) {
  return (
    <article
      className={cn(
        "group flex h-full flex-col rounded-2xl border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-foreground/20 hover:shadow-lift",
        large && "sm:col-span-2 lg:row-span-2 sm:p-6"
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "grid place-items-center rounded-xl transition-transform duration-300 group-hover:scale-110",
            large ? "size-12" : "size-10",
            brandTile[track.color]
          )}
        >
          <track.icon className={large ? "size-6" : "size-5"} aria-hidden />
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
          <FolderGit2 className="size-3.5" aria-hidden />
          {track.projects} projects
        </span>
      </div>

      <h3 className={cn("font-semibold", large ? "mt-5 text-lg" : "mt-4 text-base")}>
        {track.name}
      </h3>
      <p className="mt-0.5 text-sm text-muted-foreground">{track.tagline}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {track.skills.map((skill) => (
          <SkillChip key={skill} skill={skill} />
        ))}
      </div>

      {large && (
        <div className="mt-auto pt-6">
          <div className="overflow-hidden rounded-xl bg-[#0c1424] p-4 font-mono text-xs leading-relaxed text-white/80 shadow-lift">
            <p>
              <span className="text-white/40 select-none">$ </span>
              lucous run python/final-project
            </p>
            <p>
              <span className="text-brand-green">✓ 42/42 tests passed</span>
            </p>
            <p>
              <span className="text-amber-300">+80 XP</span>
              <span className="text-white/40">
                {" · badge unlocked: Loop Master"}
              </span>
            </p>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Beginner to job-ready, one guided project at a time — with instant
            AI code review on every submission.
          </p>
        </div>
      )}
    </article>
  )
}

export function SkillTech() {
  const { openAuth } = useDialogs()
  const [featured, ...rest] = SKILL_TRACKS

  return (
    <Section id="skilltech">
      <SectionHeader
        eyebrow="SkillTech"
        tone="green"
        title="Skills that outlive the syllabus."
        description="Eight career-shaped tracks from coding to communication — learned by building real things, graded by AI, proven in your portfolio."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Reveal className="h-full sm:col-span-2 lg:row-span-2">
          <TrackCard track={featured} large />
        </Reveal>

        {rest.map((track, i) => (
          <Reveal key={track.name} delay={0.05 * i} className="h-full">
            <TrackCard track={track} />
          </Reveal>
        ))}

        <Reveal delay={0.35} className="h-full">
          <div className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed p-5 text-center">
            <p className="text-sm font-semibold">190+ guided projects</p>
            <p className="text-xs text-muted-foreground">
              across every track, from first line of code to portfolio-ready
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-1"
              onClick={() => openAuth("signup")}
            >
              Explore SkillTech
              <ArrowRight data-icon="inline-end" aria-hidden />
            </Button>
          </div>
        </Reveal>
      </div>
    </Section>
  )
}

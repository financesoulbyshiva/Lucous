"use client"

import * as React from "react"
import { motion, useScroll, useSpring } from "framer-motion"
import { Menu, Search } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { LucousLogo } from "@/components/logo"
import { ThemeToggle } from "@/components/site/theme-toggle"
import { useDialogs } from "@/components/site/dialogs"
import { NAV_LINKS } from "@/lib/data"

export function Navbar() {
  const { openAuth, openSearch } = useDialogs()
  const [scrolled, setScrolled] = React.useState(false)
  const [active, setActive] = React.useState<string>("#home")
  const [menuOpen, setMenuOpen] = React.useState(false)

  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    mass: 0.4,
  })

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  React.useEffect(() => {
    const sections = NAV_LINKS.map((link) =>
      document.getElementById(link.href.slice(1))
    ).filter((el): el is HTMLElement => el !== null)
    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`)
        }
      },
      { rootMargin: "-45% 0px -50% 0px" }
    )
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300",
        scrolled
          ? "border-b border-border/70 bg-background/85 shadow-soft backdrop-blur-md supports-backdrop-filter:bg-background/70"
          : "border-b border-transparent bg-background"
      )}
    >
      <motion.div
        aria-hidden
        style={{ scaleX: progress }}
        className="absolute inset-x-0 top-0 h-0.5 origin-left bg-primary"
      />

      <nav className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:px-6 lg:px-8">
        <a
          href="#home"
          aria-label="Lucous — home"
          className="rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <LucousLogo className="text-[1.35rem] leading-none" />
        </a>

        {/* Desktop links */}
        <div className="ml-2 hidden items-center lg:flex">
          {NAV_LINKS.map((link) => {
            const isActive = active === link.href
            return (
              <a
                key={link.href}
                href={link.href}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "relative flex h-16 items-center px-3 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.label}
                {isActive && (
                  <motion.span
                    layoutId="nav-active-underline"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    className="absolute inset-x-2.5 bottom-0 h-[2.5px] rounded-full bg-primary"
                  />
                )}
              </a>
            )
          })}
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          {/* Desktop search trigger */}
          <Button
            variant="outline"
            onClick={() => openSearch()}
            className="hidden h-8 w-48 justify-start gap-2 text-muted-foreground md:inline-flex xl:w-56"
            aria-label="Search Lucous"
          >
            <Search className="size-4" />
            <span className="truncate text-sm">Search courses, games…</span>
            <kbd className="pointer-events-none ml-auto hidden h-5 items-center rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground lg:inline-flex">
              ⌘K
            </kbd>
          </Button>

          {/* Mobile search trigger */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => openSearch()}
            className="md:hidden"
            aria-label="Search Lucous"
          >
            <Search />
          </Button>

          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          <div className="hidden h-5 w-px bg-border lg:block" />

          <Button
            variant="outline"
            onClick={() => openAuth("login")}
            className="hidden sm:inline-flex"
          >
            Log In
          </Button>
          <Button onClick={() => openAuth("signup")}>Get Started</Button>

          {/* Mobile menu */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu />
          </Button>
        </div>
      </nav>

      {/* Mobile menu sheet */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="right" className="w-[19rem] p-0">
          <SheetHeader className="border-b p-4">
            <SheetTitle>
              <LucousLogo className="text-lg" />
            </SheetTitle>
            <SheetDescription className="sr-only">
              Main navigation
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-1 overflow-y-auto p-3">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                openSearch()
              }}
              className="mb-2 flex h-10 items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm text-muted-foreground transition-colors hover:bg-muted"
            >
              <Search className="size-4" />
              Search courses, games, bots…
            </button>

            {NAV_LINKS.map((link) => {
              const isActive = active === link.href
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      isActive ? "bg-primary" : "bg-border"
                    )}
                    aria-hidden
                  />
                  {link.label}
                </a>
              )
            })}
          </div>

          <div className="mt-auto flex flex-col gap-2 border-t p-4">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Appearance</span>
              <ThemeToggle />
            </div>
            <Button
              variant="outline"
              className="h-9 w-full"
              onClick={() => {
                setMenuOpen(false)
                openAuth("login")
              }}
            >
              Log In
            </Button>
            <Button
              className="h-9 w-full"
              onClick={() => {
                setMenuOpen(false)
                openAuth("signup")
              }}
            >
              Get Started
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}

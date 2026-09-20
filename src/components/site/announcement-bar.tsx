"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { ArrowRight, X } from "lucide-react"

const STORAGE_KEY = "lucous-announcement-dismissed"

export function AnnouncementBar() {
  const [visible, setVisible] = React.useState(false)
  const reduceMotion = useReducedMotion()

  React.useEffect(() => {
    try {
      setVisible(window.sessionStorage.getItem(STORAGE_KEY) !== "1")
    } catch {
      setVisible(true)
    }
  }, [])

  const dismiss = () => {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, "1")
    } catch {
      /* private mode — dismissal just won't persist */
    }
    setVisible(false)
  }

  return (
    <AnimatePresence initial={false}>
      {visible && (
        <motion.div
          initial={reduceMotion ? false : { height: 0, opacity: 0 }}
          animate={reduceMotion ? undefined : { height: "auto", opacity: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="overflow-hidden bg-primary text-primary-foreground"
        >
          <div className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-0.5 px-10 py-2 text-center text-xs sm:px-12 sm:text-[13px]">
            <span className="hidden items-center gap-1 sm:flex" aria-hidden>
              <span className="size-1.5 rounded-full bg-white/90" />
              <span className="size-1.5 rounded-full bg-brand-yellow" />
              <span className="size-1.5 rounded-full bg-white/90" />
            </span>
            <p>
              <span className="font-semibold">Now in early access.</span>{" "}
              <span className="text-primary-foreground/85">
                Founding learners get 3 months of Student Pro free.
              </span>
            </p>
            <a
              href="#pricing"
              className="group inline-flex items-center gap-1 rounded-sm font-semibold underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-white/70"
            >
              Claim your spot
              <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </a>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss announcement"
              className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-primary-foreground/80 transition-colors hover:bg-white/15 hover:text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

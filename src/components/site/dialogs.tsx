"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Gamepad2,
  Rocket,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { buildSearchIndex, type SearchEntry } from "@/lib/data";
import { cn } from "cn";

interface DialogsValue {
  openAuth: (tab?: "login" | "signup") => void;
  openSearch: () => void;
}

const DialogsContext = createContext<DialogsValue | null>(null);

export function useDialogs() {
  const ctx = useContext(DialogsContext);
  if (!ctx) throw new Error("useDialogs must be used inside DialogsProvider");
  return ctx;
}

export function DialogsProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);

  const value = useMemo<DialogsValue>(
    () => ({
      // Auth now lives on the /auth role-selection pages.
      openAuth: () => {
        router.push("/auth");
      },
      openSearch: () => setSearchOpen(true),
    }),
    [router]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen(true);
      } else if (e.key === "/" && !typing) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <DialogsContext.Provider value={value}>
      {children}
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </DialogsContext.Provider>
  );
}

/* -------------------------------- Search ---------------------------------- */

const GROUP_ICONS: Record<string, LucideIcon> = {
  Section: Rocket,
  Game: Gamepad2,
  "AI Bot": Sparkles,
  SkillTech: Zap,
};

function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const index = useMemo(() => buildSearchIndex(), []);

  const results = useMemo<SearchEntry[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return index.filter((e) => e.group === "Section");
    return index.filter(
      (e) => e.label.toLowerCase().includes(q) || e.keywords.includes(q)
    );
  }, [query, index]);

  const groups = useMemo(() => {
    const map = new Map<string, SearchEntry[]>();
    for (const entry of results.slice(0, 12)) {
      const list = map.get(entry.group) ?? [];
      list.push(entry);
      map.set(entry.group, list);
    }
    return [...map.entries()];
  }, [results]);

  const go = (href: string) => {
    onOpenChange(false);
    setQuery("");
    requestAnimationFrame(() => {
      window.location.hash = href.slice(1);
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) setQuery("");
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="top-[10vh] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-xl"
      >
        <div className="flex items-center gap-2.5 border-b px-4">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses, games, AI bots, skills…"
            className="h-12 border-0 bg-transparent px-0 shadow-none focus-visible:border-0 focus-visible:ring-0 dark:bg-transparent"
            aria-label="Search the site"
          />
          <kbd className="hidden shrink-0 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:block">
            esc
          </kbd>
        </div>

        <div className="max-h-[52vh] overflow-y-auto p-2">
          {groups.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
              <Search className="size-5 text-muted-foreground" aria-hidden />
              <p className="text-sm font-medium">No results for “{query}”</p>
              <p className="text-xs text-muted-foreground">
                Try a course, game, AI bot or skill track.
              </p>
            </div>
          ) : (
            groups.map(([group, entries]) => {
              const Icon = GROUP_ICONS[group] ?? Sparkles;
              return (
                <div key={group} className="mb-1">
                  <div className="px-3 pt-2.5 pb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                    {group}
                  </div>
                  {entries.map((entry) => (
                    <button
                      key={`${entry.group}-${entry.label}`}
                      type="button"
                      onClick={() => go(entry.href)}
                      className="group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                    >
                      <Icon
                        className={cn(
                          "size-4 shrink-0",
                          entry.group === "Game"
                            ? "text-brand-red"
                            : entry.group === "Course"
                              ? "text-brand-blue"
                              : entry.group === "AI Bot"
                                ? "text-brand-green"
                                : "text-muted-foreground"
                        )}
                        aria-hidden
                      />
                      <span className="min-w-0 flex-1 truncate">
                        {entry.label}
                      </span>
                      <ArrowUpRight
                        className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                        aria-hidden
                      />
                    </button>
                  ))}
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center gap-4 border-t bg-muted/40 px-4 py-2.5 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <kbd className="rounded border bg-background px-1 font-medium">/</kbd>
            to search
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border bg-background px-1 font-medium">↵</kbd>
            open
          </span>
          <span className="ml-auto hidden sm:block">Search everything on Lucous</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

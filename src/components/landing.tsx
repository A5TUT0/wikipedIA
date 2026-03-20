import { Search, Zap, BookOpen, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, type FormEvent, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import type { ArticleMode } from "@/lib/openrouter"
import { useI18n } from "@/lib/i18n"

interface LandingProps {
  onSearch: (query: string, mode: ArticleMode) => void
  initialMode?: ArticleMode
}

const MODE_ICONS: Record<ArticleMode, typeof Zap> = {
  rapido:    Zap,
  medio:     BookOpen,
  extendido: GraduationCap,
}

const ARTICLE_MODES: ArticleMode[] = ["rapido", "medio", "extendido"]

export function Landing({ onSearch, initialMode = "medio" }: LandingProps) {
  const { t } = useI18n()
  const [query, setQuery]   = useState("")
  const [mode, setMode]     = useState<ArticleMode>(initialMode)
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (q) onSearch(q, mode)
  }

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-12">
      {/* Decorative background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-wiki-link/[0.06] blur-3xl" />
        <div className="absolute -right-40 -bottom-40 h-[500px] w-[500px] rounded-full bg-wiki-link/[0.06] blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-wiki-link/[0.03] blur-3xl" />
      </div>

      <div className="relative flex w-full max-w-xl flex-col items-center gap-9">

        {/* ── Logo ──────────────────────────────────────────────────── */}
        <div className="anim-fade-in-up flex flex-col items-center gap-2 text-center">
          <h1 className="font-serif text-[3.5rem] font-bold leading-none tracking-tight md:text-[5rem]">
            Wikiped<span className="text-wiki-link">IA</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground md:text-base">
            {t.landing.subtitle}
          </p>
        </div>

        {/* ── Mode selector ─────────────────────────────────────────── */}
        <div className="anim-fade-in-up anim-delay-1 flex w-full max-w-md items-center gap-1 rounded-xl border border-border/70 bg-muted/50 p-1 backdrop-blur-sm">
          {ARTICLE_MODES.map((m) => {
            const Icon   = MODE_ICONS[m]
            const active = mode === m
            const conf   = t.landing.modes[m]
            return (
              <button
                key={m}
                type="button"
                title={conf.desc}
                onClick={() => setMode(m)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-background text-foreground shadow-sm ring-1 ring-border/60"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("size-3.5 shrink-0", active ? "text-wiki-link" : "")} />
                <span>{conf.label}</span>
              </button>
            )
          })}
        </div>

        {/* ── Search ────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="anim-fade-in-up anim-delay-2 w-full">
          <div
            className={cn(
              "flex items-center gap-3 rounded-2xl border bg-background px-4 py-3 transition-all duration-200",
              focused
                ? "border-wiki-link/50 shadow-[0_0_0_3px_rgba(51,102,204,0.08)]"
                : "border-border shadow-sm hover:border-border/80 hover:shadow-md"
            )}
          >
            <Search
              className={cn(
                "size-5 shrink-0 transition-colors",
                focused ? "text-wiki-link" : "text-muted-foreground"
              )}
            />
            <input
              ref={inputRef}
              type="search"
              placeholder={t.landing.searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/70 md:text-[1.0625rem]"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!query.trim()}
              className="shrink-0 rounded-xl px-4 transition-opacity disabled:opacity-40"
            >
              {t.landing.searchButton}
            </Button>
          </div>
        </form>

        {/* ── Suggestions ───────────────────────────────────────────── */}
        <div className="anim-fade-in-up anim-delay-3 flex flex-wrap justify-center gap-2">
          {t.landing.suggestionItems.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSearch(s, mode)}
              className="rounded-full border border-border/60 bg-background/70 px-3.5 py-1.5 text-xs text-muted-foreground backdrop-blur-sm transition-all duration-150 hover:border-wiki-link/40 hover:bg-wiki-link/5 hover:text-wiki-link"
            >
              {s}
            </button>
          ))}
        </div>

      </div>
    </main>
  )
}

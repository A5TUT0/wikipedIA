import { Search, Zap, BookOpen, GraduationCap, Clock, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, type FormEvent, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { AI_MODELS, type ArticleMode, type AIModelId } from "@/lib/openrouter"
import { useI18n } from "@/lib/i18n"
import { useSearchSuggestions, SearchSuggestionsDropdown } from "@/components/search-suggestions"

interface LandingProps {
  onSearch: (
    query: string,
    mode: ArticleMode,
    options?: { displayTitle?: string; context?: string }
  ) => void
  mode: ArticleMode
  onModeChange: (mode: ArticleMode) => void
  currentModel: AIModelId
  onModelChange: (model: AIModelId) => void
  searchHistory: string[]
  onRemoveHistory: (query: string) => void
}

const MODE_ICONS: Record<ArticleMode, typeof Zap> = {
  rapido: Zap,
  medio: BookOpen,
  extendido: GraduationCap,
}

const ARTICLE_MODES: ArticleMode[] = ["rapido", "medio", "extendido"]

export function Landing({
  onSearch,
  mode,
  onModeChange,
  currentModel,
  onModelChange,
  searchHistory,
  onRemoveHistory,
}: LandingProps) {
  const { t, uiLocale } = useI18n()
  const [query, setQuery] = useState("")
  const [focused, setFocused] = useState(false)
  const [modelOpen, setModelOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const modelRef = useRef<HTMLDivElement>(null)
  
  const { suggestions } = useSearchSuggestions(query, uiLocale)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Close model dropdown on outside click
  useEffect(() => {
    if (!modelOpen) return
    const handler = (e: MouseEvent) => {
      if (!modelRef.current?.contains(e.target as Node)) setModelOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [modelOpen])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (q) onSearch(q, mode)
  }

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-12">
      {/* Decorative background orbs */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-wiki-link/[0.06] blur-3xl" />
        <div className="absolute -right-40 -bottom-40 h-[500px] w-[500px] rounded-full bg-wiki-link/[0.06] blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-wiki-link/[0.03] blur-3xl" />
      </div>

      <div className="relative flex w-full max-w-xl flex-col items-center gap-9">
        {/* ── Logo ──────────────────────────────────────────────────── */}
        <div className="anim-fade-in-up flex flex-col items-center gap-2 text-center">
          <h1 className="font-serif text-[3.5rem] leading-none font-bold tracking-tight md:text-[5rem]">
            Wikiped<span className="text-wiki-link">IA</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground md:text-base">
            {t.landing.subtitle}
          </p>
        </div>

        {/* ── Mode selector ─────────────────────────────────────────── */}
        <div className="anim-fade-in-up anim-delay-1 flex w-full max-w-md items-center gap-1 rounded-xl border border-border/70 bg-muted/50 p-1 backdrop-blur-sm">
          {ARTICLE_MODES.map((m) => {
            const Icon = MODE_ICONS[m]
            const active = mode === m
            const conf = t.landing.modes[m]
            return (
              <button
                key={m}
                type="button"
                title={conf.desc}
                onClick={() => onModeChange(m)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-background text-foreground shadow-sm ring-1 ring-border/60"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "size-3.5 shrink-0",
                    active ? "text-wiki-link" : ""
                  )}
                />
                <span>{conf.label}</span>
              </button>
            )
          })}
        </div>

        {/* ── Search ────────────────────────────────────────────────── */}
        <form
          onSubmit={handleSubmit}
          className="anim-fade-in-up anim-delay-2 relative z-50 w-full"
        >
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
              autoComplete="off"
              placeholder={t.landing.searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 200)}
              className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/70 md:text-[1.0625rem]"
            />
            {query.length > 0 && (
              <button
                type="button"
                className="flex items-center justify-center rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                onClick={() => {
                  setQuery("")
                  inputRef.current?.focus()
                }}
                aria-label="Limpiar búsqueda"
              >
                <X className="size-4" strokeWidth={2.5} />
              </button>
            )}

            {/* Model selector – minimal */}
            <div className="relative" ref={modelRef}>
              <button
                type="button"
                onClick={() => setModelOpen((o) => !o)}
                className="flex items-center opacity-60 transition-opacity hover:opacity-100"
                title={AI_MODELS.find((m) => m.id === currentModel)?.label}
              >
                {(() => {
                  const cur = AI_MODELS.find((m) => m.id === currentModel)
                  return cur?.darkLogo ? (
                    <>
                      <img
                        src={cur.logo}
                        alt=""
                        className="size-4.5 shrink-0 object-contain dark:hidden"
                      />
                      <img
                        src={cur.darkLogo}
                        alt=""
                        className="hidden size-4.5 shrink-0 object-contain dark:block"
                      />
                    </>
                  ) : (
                    <img
                      src={cur?.logo}
                      alt=""
                      className="size-4.5 shrink-0 object-contain"
                    />
                  )
                })()}
              </button>

              {modelOpen && (
                <div className="absolute right-0 bottom-[calc(100%+12px)] z-[100] w-52 overflow-hidden rounded-xl border border-border/60 bg-background shadow-lg shadow-black/8 backdrop-blur-md">
                  <div className="p-1">
                    {AI_MODELS.map((m) => {
                      const isActive = currentModel === m.id
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            onModelChange(m.id)
                            setModelOpen(false)
                          }}
                          className={cn(
                            "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[13px] transition-colors",
                            isActive
                              ? "bg-wiki-link/8 font-medium text-foreground"
                              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                          )}
                        >
                          {m.darkLogo ? (
                            <>
                              <img
                                src={m.logo}
                                alt=""
                                className="size-4 shrink-0 object-contain dark:hidden"
                              />
                              <img
                                src={m.darkLogo}
                                alt=""
                                className="hidden size-4 shrink-0 object-contain dark:block"
                              />
                            </>
                          ) : (
                            <img
                              src={m.logo}
                              alt=""
                              className="size-4 shrink-0 object-contain"
                            />
                          )}
                          <span className="flex-1">{m.label}</span>
                          {m.recommended && (
                            <span className="rounded-full bg-wiki-link/10 px-1.5 py-0.5 text-[10px] font-medium text-wiki-link">
                              {t.landing.recommended}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <Button
              type="submit"
              size="sm"
              disabled={!query.trim()}
              className="shrink-0 rounded-xl px-4 transition-opacity disabled:opacity-40"
            >
              {t.landing.searchButton}
            </Button>
          </div>

          {/* Search Suggestions Dropdown */}
          {focused && suggestions.length > 0 && (
            <div className="relative">
              <SearchSuggestionsDropdown
                suggestions={suggestions}
                onSelect={(title) => {
                  setQuery(title)
                  onSearch(title, mode)
                }}
              />
            </div>
          )}
        </form>

        {/* ── Recent searches ─────────────────────────────────────────── */}
        {searchHistory.length > 0 && (
          <div className="anim-fade-in-up anim-delay-3 flex w-full max-w-xl flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground/60">
              <Clock className="mr-1 mb-0.5 inline size-3" />
              {t.landing.recents}
            </span>
            <div className="flex flex-wrap gap-2">
              {searchHistory.slice(0, 8).map((q) => (
                <span
                  key={q}
                  className="group flex items-center gap-1 rounded-full border border-border/60 bg-background/70 py-1.5 pr-1.5 pl-3.5 text-xs text-muted-foreground backdrop-blur-sm transition-all duration-150 hover:border-wiki-link/40 hover:bg-wiki-link/5 hover:text-wiki-link"
                >
                  <button
                    type="button"
                    onClick={() => onSearch(q, mode)}
                    className="cursor-pointer"
                  >
                    {q}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemoveHistory(q)
                    }}
                    className="flex size-4 items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-60 hover:bg-muted"
                    title={t.landing.removeRecent(q)}
                  >
                    <X className="size-2.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Suggestions (hidden when recents exist) ───────────────── */}
        {searchHistory.length === 0 && (
          <div className="anim-fade-in-up anim-delay-3 flex flex-col items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground/60">
              {t.landing.suggestions}
            </span>
            <div className="flex flex-wrap justify-center gap-2">
              {t.landing.suggestionItems.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() =>
                    onSearch(s.query, mode, {
                      displayTitle: s.label,
                      context: "context" in s ? s.context : undefined,
                    })
                  }
                  className="rounded-full border border-border/60 bg-background/70 px-3.5 py-1.5 text-xs text-muted-foreground backdrop-blur-sm transition-all duration-150 hover:border-wiki-link/40 hover:bg-wiki-link/5 hover:text-wiki-link"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

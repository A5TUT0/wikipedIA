import { Search, Moon, Sun, Menu, ArrowLeft, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import {
  useState,
  useRef,
  useEffect,
  type FormEvent,
  type RefObject,
} from "react"
import { cn } from "@/lib/utils"
import {
  useI18n,
  UI_LOCALES,
  AI_LANG_CODES,
  type UiLocale,
  type AiLang,
} from "@/lib/i18n"

interface HeaderProps {
  mode: "landing" | "article"
  onMenuToggle?: () => void
  onSearch?: (query: string) => void
  onBack?: () => void
  currentQuery?: string
  /** Increment this to programmatically focus the search input (e.g. Cmd+K) */
  focusTrigger?: number
}

// ── Settings dropdown ─────────────────────────────────────────────────────────
function SettingsPanel({
  onClose,
  containerRef,
}: {
  onClose: () => void
  containerRef: RefObject<HTMLDivElement | null>
}) {
  const { t, uiLocale, setUiLocale, aiLang, setAiLang } = useI18n()

  // Close on outside click — excludes the whole container (button + panel)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) onClose()
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [onClose, containerRef])

  return (
    <div className="absolute top-[calc(100%+6px)] right-0 z-50 w-56 overflow-hidden rounded-xl border border-border/70 bg-background/98 shadow-xl shadow-black/10 backdrop-blur-md">
      {/* UI language */}
      <div className="px-3.5 pt-3.5 pb-3">
        <p className="mb-2 text-[0.65rem] font-semibold tracking-widest text-muted-foreground/60 uppercase">
          {t.settings.uiLanguage}
        </p>
        <div className="flex gap-1">
          {UI_LOCALES.map((loc: UiLocale) => (
            <button
              key={loc}
              type="button"
              onClick={() => setUiLocale(loc)}
              className={cn(
                "flex-1 rounded-lg py-1.5 text-xs font-semibold tracking-wide uppercase transition-all",
                uiLocale === loc
                  ? "bg-wiki-link text-white shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {loc}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-3.5 h-px bg-border/50" />

      {/* AI response language */}
      <div className="px-3.5 pt-3 pb-3.5">
        <p className="mb-2 text-[0.65rem] font-semibold tracking-widest text-muted-foreground/60 uppercase">
          {t.settings.aiLanguage}
        </p>
        <div className="flex max-h-52 flex-col gap-px overflow-y-auto">
          {AI_LANG_CODES.map((code: AiLang) => {
            const isActive = aiLang === code
            return (
              <button
                key={code}
                type="button"
                onClick={() => setAiLang(code)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors",
                  isActive
                    ? "bg-wiki-link/10 font-medium text-wiki-link"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span
                  className={cn(
                    "size-1.5 shrink-0 rounded-full",
                    isActive ? "bg-wiki-link" : "border border-border"
                  )}
                />
                {t.settings.aiLangs[code]}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Header ────────────────────────────────────────────────────────────────────
export function Header({
  mode,
  onMenuToggle,
  onSearch,
  onBack,
  currentQuery,
  focusTrigger,
}: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const { t } = useI18n()
  const [query, setQuery] = useState("")
  const [focused, setFocused] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const settingsBtnRef = useRef<HTMLDivElement>(null)

  // Sync query with prop during render (avoids useEffect for derived state)
  const [prevQuery, setPrevQuery] = useState<string | undefined>(undefined)
  if (currentQuery !== prevQuery) {
    setPrevQuery(currentQuery)
    setQuery(currentQuery ?? "")
  }

  useEffect(() => {
    if (focusTrigger && mode === "article") {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [focusTrigger, mode])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = query.trim()
    if (trimmed && onSearch) onSearch(trimmed)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-3 px-4">
        {/* Mobile menu button (article only) */}
        {mode === "article" && (
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 lg:hidden"
            onClick={onMenuToggle}
            aria-label={t.header.openMenu}
          >
            <Menu className="size-4" />
          </Button>
        )}

        {/* Logo */}
        <button
          type="button"
          onClick={onBack}
          className="group flex shrink-0 items-center gap-1.5 transition-opacity hover:opacity-80"
          aria-label={t.header.backToHome}
        >
          {mode === "article" && (
            <ArrowLeft className="size-3.5 text-muted-foreground transition-transform group-hover:-translate-x-0.5" />
          )}
          <span className="font-serif text-xl leading-none font-bold tracking-tight">
            Wikiped<span className="text-wiki-link">IA</span>
          </span>
        </button>

        {/* Search bar (article mode only) */}
        {mode === "article" && (
          <form onSubmit={handleSubmit} className="mx-auto w-full max-w-lg">
            <div
              className={cn(
                "flex items-center gap-2 rounded-lg border bg-background px-3 py-1.5 transition-all duration-200",
                focused
                  ? "border-wiki-link/50 shadow-[0_0_0_3px_rgba(51,102,204,0.08)]"
                  : "border-border/70 hover:border-border"
              )}
            >
              <Search
                className={cn(
                  "size-3.5 shrink-0 transition-colors",
                  focused ? "text-wiki-link" : "text-muted-foreground"
                )}
              />
              <input
                ref={inputRef}
                type="search"
                placeholder={t.header.searchPlaceholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
              />
              <kbd className="hidden items-center gap-0.5 rounded border border-border/50 px-1.5 py-0.5 text-[10px] text-muted-foreground/50 sm:flex">
                <span className="text-[11px]">⌘</span>K
              </kbd>
            </div>
          </form>
        )}

        {mode === "landing" && <div className="flex-1" />}

        {/* Settings + Theme */}
        <div className="flex shrink-0 items-center gap-0.5">
          {/* Settings / language */}
          <div ref={settingsBtnRef} className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSettingsOpen((o) => !o)}
              aria-label={t.header.settings}
              aria-expanded={settingsOpen}
            >
              <Globe className="size-4" />
            </Button>
            {settingsOpen && (
              <SettingsPanel
                onClose={() => setSettingsOpen(false)}
                containerRef={settingsBtnRef}
              />
            )}
          </div>

          {/* Dark mode toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label={t.header.toggleTheme}
          >
            <Sun className="hidden size-4 dark:block" />
            <Moon className="block size-4 dark:hidden" />
          </Button>
        </div>
      </div>
    </header>
  )
}

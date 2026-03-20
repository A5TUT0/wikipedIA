import { Search, Moon, Sun, Menu, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import { useState, type FormEvent, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface HeaderProps {
  mode: "landing" | "article"
  onMenuToggle?: () => void
  onSearch?: (query: string) => void
  onBack?: () => void
  currentQuery?: string
  /** Increment this to programmatically focus the search input (e.g. Cmd+K) */
  focusTrigger?: number
}

export function Header({
  mode,
  onMenuToggle,
  onSearch,
  onBack,
  currentQuery,
  focusTrigger,
}: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const [query, setQuery]   = useState(currentQuery ?? "")
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync query when parent changes it (new article loaded)
  useEffect(() => { setQuery(currentQuery ?? "") }, [currentQuery])

  // Focus search when Cmd+K is triggered from parent
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
            aria-label="Abrir menú"
          >
            <Menu className="size-4" />
          </Button>
        )}

        {/* Logo */}
        <button
          type="button"
          onClick={onBack}
          className="group flex shrink-0 items-center gap-1.5 transition-opacity hover:opacity-80"
          aria-label="Volver al inicio"
        >
          {mode === "article" && (
            <ArrowLeft className="size-3.5 text-muted-foreground transition-transform group-hover:-translate-x-0.5" />
          )}
          <span className="font-serif text-xl font-bold leading-none tracking-tight">
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
                placeholder="Buscar en WikipedIA…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
              />
              {/* Keyboard hint */}
              <kbd className="hidden items-center gap-0.5 rounded border border-border/50 px-1.5 py-0.5 text-[10px] text-muted-foreground/50 sm:flex">
                <span className="text-[11px]">⌘</span>K
              </kbd>
            </div>
          </form>
        )}

        {mode === "landing" && <div className="flex-1" />}

        {/* Dark mode toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="shrink-0"
          aria-label="Cambiar tema"
        >
          <Sun className="hidden size-4 dark:block" />
          <Moon className="block size-4 dark:hidden" />
        </Button>
      </div>
    </header>
  )
}

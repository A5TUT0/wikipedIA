import { Search, Moon, Sun, Menu, ArrowLeft } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import { useState, type FormEvent } from "react"

interface HeaderProps {
  mode: "landing" | "article"
  onMenuToggle?: () => void
  onSearch?: (query: string) => void
  onBack?: () => void
  currentQuery?: string
}

export function Header({
  mode,
  onMenuToggle,
  onSearch,
  onBack,
  currentQuery,
}: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const [query, setQuery] = useState(currentQuery ?? "")

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = query.trim()
    if (trimmed && onSearch) onSearch(trimmed)
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-4 px-4">
        {mode === "article" && (
          <>
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onMenuToggle}
            >
              <Menu data-icon="inline-start" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </>
        )}

        {/* Logo */}
        <button
          type="button"
          onClick={onBack}
          className="flex shrink-0 items-center gap-2"
        >
          {mode === "article" && (
            <ArrowLeft className="size-4 text-muted-foreground" />
          )}
          <span className="font-serif text-xl font-bold tracking-tight">
            Wikiped<span className="text-wiki-link">IA</span>
          </span>
        </button>

        {/* Search bar (only in article mode) */}
        {mode === "article" && (
          <form
            onSubmit={handleSubmit}
            className="relative mx-auto w-full max-w-lg"
          >
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar en WikipedIA..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </form>
        )}

        {mode === "landing" && <div className="flex-1" />}

        {/* Dark mode toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="hidden dark:block" data-icon="inline-start" />
          <Moon className="block dark:hidden" data-icon="inline-start" />
          <span className="sr-only">Cambiar tema</span>
        </Button>
      </div>
    </header>
  )
}

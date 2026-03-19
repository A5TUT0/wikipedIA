import { Search, Zap, BookOpen, GraduationCap } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState, type FormEvent } from "react"
import { cn } from "@/lib/utils"
import type { ArticleMode } from "@/lib/openrouter"

interface LandingProps {
  onSearch: (query: string, mode: ArticleMode) => void
  initialMode?: ArticleMode
}

const modes: {
  value: ArticleMode
  label: string
  desc: string
  icon: typeof Zap
}[] = [
  {
    value: "rapido",
    label: "Rápido",
    desc: "Respuesta corta y directa",
    icon: Zap,
  },
  {
    value: "medio",
    label: "Medio",
    desc: "Artículo con buen detalle",
    icon: BookOpen,
  },
  {
    value: "extendido",
    label: "Extendido",
    desc: "Artículo completo estilo Wikipedia",
    icon: GraduationCap,
  },
]

export function Landing({ onSearch, initialMode = "medio" }: LandingProps) {
  const [query, setQuery] = useState("")
  const [mode, setMode] = useState<ArticleMode>(initialMode)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = query.trim()
    if (trimmed) onSearch(trimmed, mode)
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4">
      <div className="flex w-full max-w-2xl flex-col items-center gap-8">
        {/* Large logo */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="font-serif text-5xl font-bold tracking-tight md:text-7xl">
            Wikiped<span className="text-wiki-link">IA</span>
          </h1>
          <p className="text-center text-sm text-muted-foreground md:text-base">
            La enciclopedia libre generada por inteligencia artificial
          </p>
        </div>

        {/* Mode selector */}
        <div className="flex w-full max-w-md gap-2">
          {modes.map((m) => {
            const Icon = m.icon
            return (
              <button
                key={m.value}
                type="button"
                onClick={() => setMode(m.value)}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 rounded-lg border px-3 py-3 text-center transition-all",
                  mode === m.value
                    ? "border-wiki-link bg-wiki-link/5 text-wiki-link"
                    : "border-border text-muted-foreground hover:border-wiki-link/40 hover:bg-accent"
                )}
              >
                <Icon className="size-4" />
                <span className="text-sm font-medium">{m.label}</span>
                <span className="hidden text-[10px] opacity-70 sm:block">
                  {m.desc}
                </span>
              </button>
            )
          })}
        </div>

        {/* Big search input */}
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar cualquier tema..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-12 pl-12 text-base md:h-14 md:text-lg"
              autoFocus
            />
          </div>
          <Button type="submit" size="lg" className="h-12 px-6 md:h-14">
            Buscar
          </Button>
        </form>

        {/* Subtle suggestions */}
        <div className="flex flex-wrap justify-center gap-2">
          {[
            "Inteligencia Artificial",
            "Agujeros Negros",
            "Historia de Roma",
            "Computación Cuántica",
            "Fotosíntesis",
          ].map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onSearch(suggestion, mode)}
              className="rounded-full border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-wiki-link"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </main>
  )
}

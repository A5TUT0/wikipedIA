import { useEffect, useState } from "react"
import { Search } from "lucide-react"

export interface SearchSuggestion {
  title: string
  description?: string
}

export function useSearchSuggestions(query: string, language: string = "es") {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setSuggestions([])
      setLoading(false)
      return
    }

    let isMounted = true
    setLoading(true)

    const timer = setTimeout(async () => {
      try {
        const url = `https://${language === "en" ? "en" : "es"}.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(
          trimmed
        )}&limit=6&format=json&origin=*`
        
        const res = await fetch(url)
        if (!res.ok) throw new Error("API Error")
        const data = await res.json()
        
        if (isMounted && Array.isArray(data) && data.length >= 3) {
          const titles = data[1] as string[]
          const descriptions = data[2] as string[]
          
          setSuggestions(
            titles.map((title, i) => ({
              title,
              description: descriptions[i] || undefined,
            }))
          )
        }
      } catch {
        if (isMounted) setSuggestions([])
      } finally {
        if (isMounted) setLoading(false)
      }
    }, 250)

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [query, language])

  return { suggestions, loading }
}

export function SearchSuggestionsDropdown({
  suggestions,
  onSelect,
}: {
  suggestions: SearchSuggestion[]
  onSelect: (title: string) => void
}) {
  const [selectedIndex, setSelectedIndex] = useState(-1)

  useEffect(() => {
    setSelectedIndex(-1)
  }, [suggestions])

  useEffect(() => {
    if (suggestions.length === 0) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere if they are not using standard navigation
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((prev) => (prev > -1 ? prev - 1 : prev))
      } else if (e.key === "Enter" && selectedIndex >= 0) {
        // Prevent form submission and select suggestion
        e.preventDefault()
        onSelect(suggestions[selectedIndex].title)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [suggestions, selectedIndex, onSelect])

  if (suggestions.length === 0) return null

  return (
    <div className="absolute top-[calc(100%+8px)] left-0 right-0 z-[100] animate-in fade-in slide-in-from-top-1 overflow-hidden rounded-xl border border-border/60 bg-background/95 shadow-xl shadow-black/10 backdrop-blur-xl supports-[backdrop-filter]:bg-background/95">
      <div className="flex flex-col py-1.5">
        {suggestions.map((s, i) => (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setSelectedIndex(i)}
            onClick={() => onSelect(s.title)}
            className={`group flex flex-col items-start gap-1 p-3 text-left transition-colors hover:bg-muted/80 focus-visible:bg-muted/80 focus-visible:outline-none ${
              selectedIndex === i ? "bg-muted/80" : ""
            }`}
          >
            <div className="flex items-center gap-2">
              <Search className={`size-3.5 shrink-0 transition-colors ${selectedIndex === i ? "text-wiki-link" : "text-muted-foreground group-hover:text-wiki-link group-focus-visible:text-wiki-link"}`} />
              <span className={`text-[0.9375rem] font-medium leading-none transition-colors ${selectedIndex === i ? "text-wiki-link" : "text-foreground group-hover:text-wiki-link group-focus-visible:text-wiki-link"}`}>
                {s.title}
              </span>
            </div>
            {s.description && (
              <span className="ml-[22px] line-clamp-1 text-xs text-muted-foreground/80">
                {s.description}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

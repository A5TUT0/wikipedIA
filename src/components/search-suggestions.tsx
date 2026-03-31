import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import type { SearchSuggestion } from "@/hooks/use-search-suggestions"

export function SearchSuggestionsDropdown({
  suggestions,
  onSelect,
}: {
  suggestions: SearchSuggestion[]
  onSelect: (title: string) => void
}) {
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [prevSuggestions, setPrevSuggestions] = useState(suggestions)

  // Reset selected index when suggestions change (during render to avoid effect lint error)
  if (suggestions !== prevSuggestions) {
    setSelectedIndex(-1)
    setPrevSuggestions(suggestions)
  }

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

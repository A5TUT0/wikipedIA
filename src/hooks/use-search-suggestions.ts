import { useEffect, useState } from "react"

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

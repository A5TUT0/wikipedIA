import type { ArticleMode } from "@/lib/openrouter"

// ── Search history helpers ────────────────────────────────────────────────────
const HISTORY_KEY = "wikia-search-history"
const MAX_HISTORY = 12

export function getSearchHistory(): string[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]")
  } catch {
    return []
  }
}

export function addToHistory(query: string) {
  const history = getSearchHistory().filter(
    (h) => h.toLowerCase() !== query.toLowerCase()
  )
  history.unshift(query)
  if (history.length > MAX_HISTORY) history.length = MAX_HISTORY
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}

export function removeFromHistory(query: string) {
  const history = getSearchHistory().filter(
    (h) => h.toLowerCase() !== query.toLowerCase()
  )
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}

// ── Article cache helpers ─────────────────────────────────────────────────────
const CACHE_KEY = "wikia-article-cache"
const MAX_CACHE = 20

interface CachedArticle {
  content: string
  mode: ArticleMode
  timestamp: number
}

export function getCachedArticle(
  query: string,
  mode: ArticleMode
): CachedArticle | null {
  try {
    const cache: Record<string, CachedArticle> = JSON.parse(
      localStorage.getItem(CACHE_KEY) ?? "{}"
    )
    const key = `${query.toLowerCase()}::${mode}`
    const entry = cache[key]
    if (!entry) return null
    // Cache expires after 24h
    if (Date.now() - entry.timestamp > 24 * 60 * 60 * 1000) return null
    return entry
  } catch {
    return null
  }
}

export function cacheArticle(
  query: string,
  mode: ArticleMode,
  content: string
) {
  try {
    const cache: Record<string, CachedArticle> = JSON.parse(
      localStorage.getItem(CACHE_KEY) ?? "{}"
    )
    const key = `${query.toLowerCase()}::${mode}`
    cache[key] = { content, mode, timestamp: Date.now() }
    // Evict oldest if too many
    const keys = Object.keys(cache)
    if (keys.length > MAX_CACHE) {
      const sorted = keys.sort(
        (a, b) => (cache[a].timestamp ?? 0) - (cache[b].timestamp ?? 0)
      )
      for (let i = 0; i < keys.length - MAX_CACHE; i++) {
        delete cache[sorted[i]]
      }
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    // Storage full or unavailable
  }
}

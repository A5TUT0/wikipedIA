import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Header } from "@/components/header"
import {
  TableOfContents,
  extractToc,
} from "@/components/table-of-contents-dynamic"
import { ArticleStream } from "@/components/article-stream"
import { Landing } from "@/components/landing"
import { Footer } from "@/components/footer"
import { ToastContainer } from "@/components/toast"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import {
  streamArticle,
  type ArticleMode,
  type AIModelId,
} from "@/lib/openrouter"
import { fetchImages, type ImageResult } from "@/lib/wikipedia-images"
import { useI18n, AI_LANG_NAMES } from "@/lib/i18n"
import { ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"

export type InfoboxData = Record<string, string>

/** Extract [INFOBOX]...[/INFOBOX] block from content */
function extractInfobox(raw: string): {
  infobox: InfoboxData | null
  cleanContent: string
} {
  const match = raw.match(/\[INFOBOX\]\n?([\s\S]*?)\[\/INFOBOX\]\n?/)
  if (!match) {
    if (raw.startsWith("[INFOBOX]") && !raw.includes("[/INFOBOX]")) {
      return { infobox: null, cleanContent: "" }
    }
    return { infobox: null, cleanContent: raw }
  }

  const pairs: InfoboxData = {}
  const lines = match[1].trim().split("\n")
  for (const line of lines) {
    const colonIdx = line.indexOf(":")
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim()
      const value = line.slice(colonIdx + 1).trim()
      if (key && value) pairs[key] = value
    }
  }

  const cleanContent = raw.replace(match[0], "").trim()
  return {
    infobox: Object.keys(pairs).length > 0 ? pairs : null,
    cleanContent,
  }
}

/** Extract [RELATED]...[/RELATED] block from content */
function extractRelated(raw: string): {
  related: string[]
  cleanContent: string
} {
  const match = raw.match(/\[RELATED\]\n?([\s\S]*?)\[\/RELATED\]\n?/)
  if (!match) return { related: [], cleanContent: raw }
  const items = match[1]
    .trim()
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
  return { related: items, cleanContent: raw.replace(match[0], "").trim() }
}

// ── Search history helpers ────────────────────────────────────────────────────
const HISTORY_KEY = "wikia-search-history"
const MAX_HISTORY = 12

function getSearchHistory(): string[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]")
  } catch {
    return []
  }
}

function addToHistory(query: string) {
  const history = getSearchHistory().filter(
    (h) => h.toLowerCase() !== query.toLowerCase()
  )
  history.unshift(query)
  if (history.length > MAX_HISTORY) history.length = MAX_HISTORY
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}

function removeFromHistory(query: string) {
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

function getCachedArticle(
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

function cacheArticle(query: string, mode: ArticleMode, content: string) {
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

type AppView = "landing" | "article"

export function App() {
  const { t, aiLang } = useI18n()
  const [view, setView] = useState<AppView>("landing")
  const [query, setQuery] = useState("")
  const [displayTitle, setDisplayTitle] = useState("")
  const [reasoning, setReasoning] = useState("")
  const [content, setContent] = useState("")
  const [images, setImages] = useState<ImageResult[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentMode, setCurrentMode] = useState<ArticleMode>("medio")
  const [currentModel, setCurrentModel] = useState<AIModelId>(
    "openai/gpt-oss-120b:free"
  )
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>(getSearchHistory)
  const [transitioning, setTransitioning] = useState(false)

  // Scroll state for reading progress + back-to-top
  const [readingProgress, setReadingProgress] = useState(0)
  const [showBackToTop, setShowBackToTop] = useState(false)

  // Trigger to focus header search (Cmd/Ctrl+K)
  const [searchFocusTrigger, setSearchFocusTrigger] = useState(0)

  const abortRef = useRef<AbortController | null>(null)

  const { infobox, cleanContent: contentAfterInfobox } = useMemo(
    () => extractInfobox(content),
    [content]
  )
  const { related, cleanContent } = useMemo(
    () => extractRelated(contentAfterInfobox),
    [contentAfterInfobox]
  )
  const tocItems = useMemo(() => extractToc(cleanContent), [cleanContent])

  // ── Scroll listener (article only) ──────────────────────────────────
  useEffect(() => {
    if (view !== "article") return

    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight
      setReadingProgress(
        docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0
      )
      setShowBackToTop(scrollTop > 400)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [view])

  // Reset scroll state when leaving article
  useEffect(() => {
    if (view === "landing") {
      setReadingProgress(0)
      setShowBackToTop(false)
    }
  }, [view])

  // ── Load from URL params on mount ───────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const q = params.get("q")?.trim()
    const m = params.get("mode")
    if (q) {
      const validMode: ArticleMode =
        m === "rapido" || m === "extendido" ? m : "medio"
      handleSearch(q, validMode)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Cmd/Ctrl+K → focus header search ────────────────────────────────
  useEffect(() => {
    if (view !== "article") return
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setSearchFocusTrigger((t) => t + 1)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [view])

  // ── Core search handler ──────────────────────────────────────────────
  const handleSearch = useCallback(
    async (
      searchQuery: string,
      mode?: ArticleMode,
      options?: { displayTitle?: string; context?: string }
    ) => {
      const selectedMode = mode ?? currentMode

      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      // Save to history
      addToHistory(options?.displayTitle ?? searchQuery)
      setSearchHistory(getSearchHistory())

      setQuery(searchQuery)
      setDisplayTitle(options?.displayTitle ?? searchQuery)
      setCurrentMode(selectedMode)
      setReasoning("")
      setContent("")
      setImages([])
      setError(null)
      setIsStreaming(true)

      // Transition animation
      setTransitioning(true)
      requestAnimationFrame(() => {
        setView("article")
        setTimeout(() => setTransitioning(false), 50)
      })

      window.scrollTo({ top: 0 })
      window.history.replaceState(
        null,
        "",
        `?q=${encodeURIComponent(searchQuery)}&mode=${selectedMode}`
      )

      fetchImages(searchQuery, 1).then((imgs) => setImages(imgs))

      // Check cache first
      const cached = getCachedArticle(searchQuery, selectedMode)
      if (cached && !options?.context) {
        setContent(cached.content)
        setIsStreaming(false)
        return
      }

      let fullContent = ""

      const langName = aiLang !== "auto" ? AI_LANG_NAMES[aiLang] : undefined

      const errorMap: Record<string, string> = {
        ERROR_UNAUTHORIZED: t.errors.unauthorized,
        ERROR_RATE_LIMITED: t.errors.rateLimited,
        ERROR_MODEL_UNAVAILABLE: t.errors.modelUnavailable,
        ERROR_SERVER: t.errors.serverError,
        ERROR_GENERIC: t.errors.generic,
      }

      await streamArticle(
        searchQuery,
        selectedMode,
        {
          onReasoning(chunk) {
            setReasoning((prev) => prev + chunk)
          },
          onContent(chunk) {
            fullContent += chunk
            setContent(fullContent)
          },
          onDone() {
            setIsStreaming(false)
            cacheArticle(searchQuery, selectedMode, fullContent)
          },
          onError(err) {
            setIsStreaming(false)
            setError(errorMap[err] ?? err)
          },
        },
        controller.signal,
        langName,
        options?.context,
        currentModel
      )
    },
    [currentMode, aiLang, currentModel, t.errors]
  )

  const handleBack = useCallback(() => {
    abortRef.current?.abort()
    window.history.replaceState(null, "", window.location.pathname)
    setTransitioning(true)
    requestAnimationFrame(() => {
      setView("landing")
      setTimeout(() => setTransitioning(false), 50)
    })
    setQuery("")
    setDisplayTitle("")
    setReasoning("")
    setContent("")
    setImages([])
    setIsStreaming(false)
    setError(null)
  }, [])

  const handleRemoveHistory = useCallback((q: string) => {
    removeFromHistory(q)
    setSearchHistory(getSearchHistory())
  }, [])

  const handleRetry = useCallback(() => {
    handleSearch(query, currentMode)
  }, [handleSearch, query, currentMode])

  // ── Landing view ─────────────────────────────────────────────────────
  if (view === "landing") {
    return (
      <div
        className={cn(
          "flex h-svh flex-col overflow-hidden transition-opacity duration-300",
          transitioning ? "opacity-0" : "opacity-100"
        )}
      >
        <Header mode="landing" onBack={handleBack} />
        <Landing
          onSearch={handleSearch}
          initialMode={currentMode}
          currentModel={currentModel}
          onModelChange={setCurrentModel}
          searchHistory={searchHistory}
          onRemoveHistory={handleRemoveHistory}
        />
        <Footer />
        <ToastContainer />
      </div>
    )
  }

  // ── Article view ──────────────────────────────────────────────────────
  return (
    <div
      className={cn(
        "flex min-h-svh flex-col transition-opacity duration-300",
        transitioning ? "opacity-0" : "opacity-100"
      )}
    >
      {/* Reading progress bar */}
      <div
        className="fixed top-0 left-0 z-50 h-[2px] bg-wiki-link transition-all duration-100"
        style={{ width: `${readingProgress}%` }}
      />

      <Header
        mode="article"
        onMenuToggle={() => setMobileMenuOpen(true)}
        onSearch={(q) => handleSearch(q, currentMode)}
        onBack={handleBack}
        currentQuery={query}
        focusTrigger={searchFocusTrigger}
      />

      {/* Mobile sidebar sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-72 p-4">
          <SheetTitle className="font-serif text-lg">
            {t.app.navigation}
          </SheetTitle>
          <TableOfContents items={tocItems} className="mt-4" />
        </SheetContent>
      </Sheet>

      {/* Main layout */}
      <div className="mx-auto flex w-full max-w-[1200px] flex-1 gap-8 px-4 py-8">
        {/* Left: Table of Contents (desktop) */}
        <aside className="hidden w-[200px] shrink-0 lg:block">
          <div className="sticky top-20">
            <TableOfContents items={tocItems} />
          </div>
        </aside>

        {/* Center: Article */}
        <main className="max-w-3xl min-w-0 flex-1">
          <ArticleStream
            title={displayTitle}
            mode={currentMode}
            reasoning={reasoning}
            content={cleanContent}
            isStreaming={isStreaming}
            images={images}
            infobox={infobox}
            error={error}
            onRetry={handleRetry}
            onSearch={(q) => handleSearch(q, currentMode)}
            related={related}
          />
        </main>
      </div>

      <Footer />

      <ToastContainer />

      {/* Back to top button */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label={t.app.backToTop}
        className={cn(
          "fixed right-6 bottom-6 z-40 flex size-10 items-center justify-center rounded-full border border-border/60 bg-background shadow-md transition-all duration-200 hover:border-wiki-link/50 hover:text-wiki-link",
          showBackToTop
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        )}
      >
        <ArrowUp className="size-4" />
      </button>
    </div>
  )
}

export default App

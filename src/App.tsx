import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react"
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
import { extractInfobox, extractRelated } from "@/lib/article-helpers"
import {
  getSearchHistory,
  addToHistory,
  removeFromHistory,
  getCachedArticle,
  cacheArticle,
} from "@/lib/storage"

type AppView = "landing" | "article"

interface ArticleState {
  view: AppView
  query: string
  displayTitle: string
  reasoning: string
  content: string
  images: ImageResult[]
  isStreaming: boolean
  error: string | null
  currentMode: ArticleMode
  transitioning: boolean
  searchHistory: string[]
}

type ArticleAction =
  | {
      type: "START_SEARCH"
      query: string
      displayTitle: string
      mode: ArticleMode
      history: string[]
    }
  | { type: "APPEND_REASONING"; chunk: string }
  | { type: "SET_CONTENT"; content: string }
  | { type: "SET_IMAGES"; images: ImageResult[] }
  | { type: "DONE" }
  | { type: "ERROR"; error: string }
  | { type: "FROM_CACHE"; content: string }
  | { type: "RESET" }
  | { type: "SHOW_ARTICLE" }
  | { type: "SHOW_LANDING" }
  | { type: "FINISH_TRANSITION" }
  | { type: "SET_MODE"; mode: ArticleMode }
  | { type: "SET_HISTORY"; history: string[] }

const initialArticleState: ArticleState = {
  view: "landing",
  query: "",
  displayTitle: "",
  reasoning: "",
  content: "",
  images: [],
  isStreaming: false,
  error: null,
  currentMode: "medio",
  transitioning: false,
  searchHistory: getSearchHistory(),
}

function articleReducer(
  state: ArticleState,
  action: ArticleAction
): ArticleState {
  switch (action.type) {
    case "START_SEARCH":
      return {
        ...state,
        query: action.query,
        displayTitle: action.displayTitle,
        reasoning: "",
        content: "",
        images: [],
        error: null,
        isStreaming: true,
        currentMode: action.mode,
        transitioning: true,
        searchHistory: action.history,
      }
    case "APPEND_REASONING":
      return { ...state, reasoning: state.reasoning + action.chunk }
    case "SET_CONTENT":
      return { ...state, content: action.content }
    case "SET_IMAGES":
      return { ...state, images: action.images }
    case "DONE":
      return { ...state, isStreaming: false }
    case "ERROR":
      return { ...state, isStreaming: false, error: action.error }
    case "FROM_CACHE":
      return { ...state, content: action.content, isStreaming: false }
    case "RESET":
      return {
        ...initialArticleState,
        currentMode: state.currentMode,
        searchHistory: state.searchHistory,
        transitioning: true,
      }
    case "SHOW_ARTICLE":
      return { ...state, view: "article" }
    case "SHOW_LANDING":
      return { ...state, view: "landing" }
    case "FINISH_TRANSITION":
      return { ...state, transitioning: false }
    case "SET_MODE":
      return { ...state, currentMode: action.mode }
    case "SET_HISTORY":
      return { ...state, searchHistory: action.history }
  }
}

function useScrollProgress(isActive: boolean) {
  const [readingProgress, setReadingProgress] = useState(0)
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    if (!isActive) return
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
  }, [isActive])

  const reset = useCallback(() => {
    setReadingProgress(0)
    setShowBackToTop(false)
  }, [])

  return { readingProgress, showBackToTop, resetScroll: reset }
}

export default function App() {
  const { t, aiLang } = useI18n()
  const [article, dispatch] = useReducer(articleReducer, initialArticleState)
  const [currentModel, setCurrentModel] = useState<AIModelId>(
    "openai/gpt-oss-120b:free"
  )
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Scroll state for reading progress + back-to-top
  const { readingProgress, showBackToTop, resetScroll } = useScrollProgress(
    article.view === "article"
  )

  // Trigger to focus header search (Cmd/Ctrl+K)
  const [searchFocusTrigger, setSearchFocusTrigger] = useState(0)

  const abortRef = useRef<AbortController | null>(null)

  const { infobox, cleanContent: contentAfterInfobox } = useMemo(
    () => extractInfobox(article.content),
    [article.content]
  )
  const { related, cleanContent } = useMemo(
    () => extractRelated(contentAfterInfobox),
    [contentAfterInfobox]
  )
  const tocItems = useMemo(() => extractToc(cleanContent), [cleanContent])

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
    if (article.view !== "article") return
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setSearchFocusTrigger((t) => t + 1)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [article.view])

  // ── Core search handler ──────────────────────────────────────────────
  const handleSearch = useCallback(
    async (
      searchQuery: string,
      mode?: ArticleMode,
      options?: { displayTitle?: string; context?: string }
    ) => {
      const selectedMode = mode ?? article.currentMode

      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      // Save to history
      addToHistory(options?.displayTitle ?? searchQuery)

      dispatch({
        type: "START_SEARCH",
        query: searchQuery,
        displayTitle: options?.displayTitle ?? searchQuery,
        mode: selectedMode,
        history: getSearchHistory(),
      })

      // Transition animation
      requestAnimationFrame(() => {
        dispatch({ type: "SHOW_ARTICLE" })
        setTimeout(() => dispatch({ type: "FINISH_TRANSITION" }), 50)
      })

      window.scrollTo({ top: 0 })
      window.history.replaceState(
        null,
        "",
        `?q=${encodeURIComponent(searchQuery)}&mode=${selectedMode}`
      )

      fetchImages(searchQuery, 1).then((imgs) =>
        dispatch({ type: "SET_IMAGES", images: imgs })
      )

      // Check cache first
      const cached = getCachedArticle(searchQuery, selectedMode)
      if (cached && !options?.context) {
        dispatch({ type: "FROM_CACHE", content: cached.content })
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
            dispatch({ type: "APPEND_REASONING", chunk })
          },
          onContent(chunk) {
            fullContent += chunk
            dispatch({ type: "SET_CONTENT", content: fullContent })
          },
          onDone() {
            dispatch({ type: "DONE" })
            cacheArticle(searchQuery, selectedMode, fullContent)
          },
          onError(err) {
            dispatch({ type: "ERROR", error: errorMap[err] ?? err })
          },
        },
        controller.signal,
        langName,
        options?.context,
        currentModel
      )
    },
    [article.currentMode, aiLang, currentModel, t.errors]
  )

  const handleBack = useCallback(() => {
    abortRef.current?.abort()
    window.history.replaceState(null, "", window.location.pathname)
    resetScroll()
    dispatch({ type: "RESET" })
    requestAnimationFrame(() => {
      dispatch({ type: "SHOW_LANDING" })
      setTimeout(() => dispatch({ type: "FINISH_TRANSITION" }), 50)
    })
  }, [resetScroll])

  const handleRemoveHistory = useCallback((q: string) => {
    removeFromHistory(q)
    dispatch({ type: "SET_HISTORY", history: getSearchHistory() })
  }, [])

  const handleRetry = useCallback(() => {
    handleSearch(article.query, article.currentMode)
  }, [handleSearch, article.query, article.currentMode])

  // ── Landing view ─────────────────────────────────────────────────────
  if (article.view === "landing") {
    return (
      <div
        className={cn(
          "flex h-svh flex-col overflow-hidden transition-opacity duration-300",
          article.transitioning ? "opacity-0" : "opacity-100"
        )}
      >
        <Header mode="landing" onBack={handleBack} />
        <Landing
          onSearch={handleSearch}
          mode={article.currentMode}
          onModeChange={(mode) => dispatch({ type: "SET_MODE", mode })}
          currentModel={currentModel}
          onModelChange={setCurrentModel}
          searchHistory={article.searchHistory}
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
        article.transitioning ? "opacity-0" : "opacity-100"
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
        onSearch={(q) => handleSearch(q, article.currentMode)}
        onBack={handleBack}
        currentQuery={article.query}
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
            title={article.displayTitle}
            mode={article.currentMode}
            reasoning={article.reasoning}
            content={cleanContent}
            isStreaming={article.isStreaming}
            images={article.images}
            infobox={infobox}
            error={article.error}
            onRetry={handleRetry}
            onSearch={(q) => handleSearch(q, article.currentMode)}
            related={related}
            currentModel={currentModel}
            onModelChange={setCurrentModel}
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

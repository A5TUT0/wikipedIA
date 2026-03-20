import { useCallback, useMemo, useRef, useState } from "react"
import { Header } from "@/components/header"
import {
  TableOfContents,
  extractToc,
} from "@/components/table-of-contents-dynamic"
import { ArticleStream } from "@/components/article-stream"
import { Landing } from "@/components/landing"
import { Footer } from "@/components/footer"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { streamArticle, type ArticleMode } from "@/lib/openrouter"
import { fetchImages, type ImageResult } from "@/lib/wikipedia-images"

export type InfoboxData = Record<string, string>

/** Extract [INFOBOX]...[/INFOBOX] block from content */
function extractInfobox(raw: string): {
  infobox: InfoboxData | null
  cleanContent: string
} {
  const match = raw.match(/\[INFOBOX\]\n?([\s\S]*?)\[\/INFOBOX\]\n?/)
  if (!match) {
    // If infobox is still streaming
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

type AppView = "landing" | "article"

export function App() {
  const [view, setView] = useState<AppView>("landing")
  const [query, setQuery] = useState("")
  const [reasoning, setReasoning] = useState("")
  const [content, setContent] = useState("")
  const [images, setImages] = useState<ImageResult[]>([])
  const [isStreaming, setIsStreaming] = useState(false)

  // Derive infobox data and clean content from raw content
  const { infobox, cleanContent } = useMemo(
    () => extractInfobox(content),
    [content]
  )
  const tocItems = useMemo(() => extractToc(cleanContent), [cleanContent])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentMode, setCurrentMode] = useState<ArticleMode>("medio")
  const abortRef = useRef<AbortController | null>(null)

  const handleSearch = useCallback(
    async (searchQuery: string, mode?: ArticleMode) => {
      const selectedMode = mode ?? currentMode

      // Abort any previous request
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setQuery(searchQuery)
      setCurrentMode(selectedMode)
      setReasoning("")
      setContent("")
      setImages([])
      setIsStreaming(true)
      setView("article")

      // Fetch images from Wikipedia in parallel with the article stream
      fetchImages(searchQuery, 6).then((imgs) => {
        setImages(imgs)
      })

      let fullContent = ""

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
          },
          onError(error) {
            setIsStreaming(false)
            setContent(fullContent + `\n\n---\n\n**Error:** ${error}`)
          },
        },
        controller.signal
      )
    },
    [currentMode]
  )

  const handleBack = useCallback(() => {
    abortRef.current?.abort()
    setView("landing")
    setQuery("")
    setReasoning("")
    setContent("")
    setImages([])
    setIsStreaming(false)
  }, [])

  if (view === "landing") {
    return (
      <div className="flex h-svh flex-col overflow-hidden">
        <Header mode="landing" onBack={handleBack} />
        <Landing onSearch={handleSearch} initialMode={currentMode} />
        <footer className="py-4 text-center text-xs text-muted-foreground">
          Contenido generado por IA · Hosting por{" "}
          <span className="font-medium text-foreground">CubePath</span>
        </footer>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col">
      <Header
        mode="article"
        onMenuToggle={() => setMobileMenuOpen(true)}
        onSearch={(q) => handleSearch(q, currentMode)}
        onBack={handleBack}
        currentQuery={query}
      />

      {/* Mobile sidebar sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-72 p-4">
          <SheetTitle className="font-serif text-lg">Navegación</SheetTitle>
          <TableOfContents items={tocItems} className="mt-4" />
        </SheetContent>
      </Sheet>

      {/* Main layout */}
      <div className="mx-auto flex w-full max-w-[1200px] flex-1 gap-8 px-4 py-8">
        {/* Left column: Table of Contents (desktop) */}
        <aside className="hidden w-[200px] shrink-0 lg:block">
          <div className="sticky top-20">
            <TableOfContents items={tocItems} />
          </div>
        </aside>

        {/* Center column: Article */}
        <main className="max-w-3xl min-w-0 flex-1">
          <ArticleStream
            title={query}
            reasoning={reasoning}
            content={cleanContent}
            isStreaming={isStreaming}
            images={images}
            infobox={infobox}
          />
        </main>
      </div>

      <Footer />
    </div>
  )
}

export default App

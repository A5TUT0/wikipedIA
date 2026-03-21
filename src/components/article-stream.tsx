import { useMemo, useEffect, useRef, useState } from "react"
import {
  Brain,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Zap,
  BookOpen,
  GraduationCap,
  AlertCircle,
  RefreshCw,
  Share2,
  Download,
  Maximize2,
  X,
} from "lucide-react"
import type { ImageResult } from "@/lib/wikipedia-images"
import { fetchImages } from "@/lib/wikipedia-images"
import type { InfoboxData } from "@/App"
import type { ArticleMode } from "@/lib/openrouter"
import { cn } from "@/lib/utils"
import { SelectionToolbar } from "@/components/selection-toolbar"
import { useI18n } from "@/lib/i18n"

interface ArticleStreamProps {
  title: string
  mode: ArticleMode
  reasoning: string
  content: string
  isStreaming: boolean
  images: ImageResult[]
  infobox: InfoboxData | null
  error: string | null
  onRetry: () => void
  onSearch?: (query: string) => void
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function toSlug(text: string): string {
  return text
    .replace(/\*\*/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^\w\sáéíóúñü]/g, "")
    .replace(/\s+/g, "-")
}

function InlineMarkdown({ text }: { text: string }) {
  const parts = text.split(/(\[.+?\]\(.+?\)|\*\*[^*]+\*\*|\*[^*]+\*)/g)
  return (
    <>
      {parts.map((part, i) => {
        const linkMatch = part.match(/^\[(.+?)\]\((.+?)\)$/)
        if (linkMatch)
          return (
            <a
              key={i}
              href={linkMatch[2]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-wiki-link underline decoration-wiki-link/30 underline-offset-2 transition-colors hover:decoration-wiki-link/70"
            >
              {linkMatch[1]}
            </a>
          )
        if (part.startsWith("**") && part.endsWith("**"))
          return <strong key={i}>{part.slice(2, -2)}</strong>
        if (part.startsWith("*") && part.endsWith("*"))
          return <em key={i}>{part.slice(1, -1)}</em>
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

function ArticleSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-4">
      <div className="h-5 w-2/3 rounded-md bg-muted" />
      <div className="h-5 w-full rounded-md bg-muted" />
      <div className="h-5 w-4/5 rounded-md bg-muted" />
      <div className="h-5 w-full rounded-md bg-muted" />
      <div className="h-5 w-3/4 rounded-md bg-muted" />
      <div className="mt-4 h-4 w-1/3 rounded-md bg-muted" />
      <div className="h-4 w-full rounded-md bg-muted" />
      <div className="h-4 w-5/6 rounded-md bg-muted" />
      <div className="h-4 w-full rounded-md bg-muted" />
    </div>
  )
}

function LoadingEntertainment() {
  const { t } = useI18n()
  const facts = t.loading.facts
  const messages = t.loading.messages
  const [factIndex, setFactIndex] = useState(0)
  const [msgIndex, setMsgIndex] = useState(0)
  const [factVisible, setFactVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setFactVisible(false)
      setTimeout(() => {
        setFactIndex((i) => (i + 1) % facts.length)
        setFactVisible(true)
      }, 350)
    }, 6000)
    return () => clearInterval(interval)
  }, [facts.length])

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % messages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [messages.length])

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl border border-wiki-link/25 bg-wiki-link/[0.04] px-5 py-4">
        <div className="mb-2.5 flex items-center gap-2">
          <span className="text-sm font-semibold text-wiki-link">
            {t.loading.didYouKnow}
          </span>
          <span className="inline-block size-1.5 animate-pulse rounded-full bg-wiki-link" />
        </div>
        <p
          className="min-h-[3rem] text-[0.9rem] leading-relaxed text-foreground/80"
          style={{
            opacity: factVisible ? 1 : 0,
            transition: "opacity 0.35s ease",
          }}
        >
          {facts[factIndex]}
        </p>
        <div className="mt-3 flex gap-1">
          {facts.map((_, i) => (
            <span
              key={i}
              className={cn(
                "inline-block h-1 rounded-full transition-all duration-500",
                i === factIndex ? "w-4 bg-wiki-link" : "w-1 bg-border"
              )}
            />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="inline-block size-1.5 animate-pulse rounded-full bg-wiki-link" />
        <span>{messages[msgIndex]}</span>
      </div>
      <ArticleSkeleton />
    </div>
  )
}

// ── Lightbox ──────────────────────────────────────────────────────────────────

function Lightbox({ img, onClose }: { img: ImageResult; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [onClose])

  return (
    <div
      className="anim-fade-in fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        className="relative w-full max-w-5xl overflow-hidden rounded-2xl bg-black shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 flex size-8 items-center justify-center rounded-full bg-black/50 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/70 hover:text-white"
        >
          <X className="size-4" />
        </button>
        <img
          src={img.original}
          alt={img.title}
          className="max-h-[82vh] w-full object-contain"
          onError={(e) => {
            const target = e.currentTarget
            if (target.src !== img.thumbnail) target.src = img.thumbnail
          }}
        />
        {(img.title || img.source) && (
          <div className="border-t border-white/10 bg-black/70 px-5 py-3">
            <p className="text-sm text-white/80">
              {img.title}
              {img.source && (
                <span className="ml-2 text-white/40">— {img.source}</span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Article image figure ──────────────────────────────────────────────────────

function ArticleImage({
  img,
  onClick,
  expandLabel,
}: {
  img: ImageResult
  onClick: () => void
  expandLabel: string
}) {
  return (
    <figure
      className="group relative mb-5 cursor-zoom-in overflow-hidden rounded-xl shadow-sm transition-shadow duration-200 hover:shadow-lg"
      onClick={onClick}
    >
      <div className="overflow-hidden" style={{ aspectRatio: "16 / 7" }}>
        <img
          src={img.original}
          alt={img.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          loading="lazy"
          onError={(e) => {
            const target = e.currentTarget
            if (target.src !== img.thumbnail) target.src = img.thumbnail
          }}
        />
      </div>
      {/* Gradient caption overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent px-4 pt-10 pb-3">
        <p className="text-xs leading-snug text-white/90">
          {img.title}
          {img.source && (
            <span className="ml-1.5 text-white/50">— {img.source}</span>
          )}
        </p>
      </div>
      {/* Expand hint on hover */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <div className="flex items-center gap-1.5 rounded-full bg-black/35 px-3 py-1.5 text-xs text-white backdrop-blur-sm">
          <Maximize2 className="size-3" />
          {expandLabel}
        </div>
      </div>
    </figure>
  )
}

// ── Lazy image: fetches from API by keyword ───────────────────────────────────

function LazyImage({
  keyword,
  onImageClick,
  expandLabel,
}: {
  keyword: string
  onImageClick: (img: ImageResult) => void
  expandLabel: string
}) {
  const [img, setImg] = useState<ImageResult | null>(null)
  const fetched = useRef(false)

  useEffect(() => {
    if (fetched.current) return
    fetched.current = true
    fetchImages(keyword, 1).then((results) => {
      if (results.length > 0) setImg(results[0])
    })
  }, [keyword])

  if (!img) return null

  return (
    <ArticleImage
      img={img}
      onClick={() => onImageClick(img)}
      expandLabel={expandLabel}
    />
  )
}

// ── Markdown article renderer ─────────────────────────────────────────────────

function MarkdownArticle({
  content,
  onImageClick,
}: {
  content: string
  onImageClick: (img: ImageResult) => void
}) {
  const { t } = useI18n()
  const blocks = useMemo(() => {
    const lines = content.split("\n")
    const result: {
      type: string
      level?: number
      text: string
      id?: string
    }[] = []
    let currentParagraph = ""

    for (const line of lines) {
      const imgMatch = line.trim().match(/^\[IMG:\s*(.+?)\]$/)
      if (imgMatch) {
        if (currentParagraph.trim()) {
          result.push({ type: "p", text: currentParagraph.trim() })
          currentParagraph = ""
        }
        result.push({ type: "img", text: imgMatch[1].trim() })
        continue
      }

      const hMatch = line.match(/^(#{1,3})\s+(.+)/)
      if (hMatch) {
        if (currentParagraph.trim()) {
          result.push({ type: "p", text: currentParagraph.trim() })
          currentParagraph = ""
        }
        const level = hMatch[1].length
        const text = hMatch[2]
        result.push({ type: "heading", level, text, id: toSlug(text) })
        continue
      }

      if (line.trim() === "") {
        if (currentParagraph.trim()) {
          result.push({ type: "p", text: currentParagraph.trim() })
          currentParagraph = ""
        }
        continue
      }

      if (line.match(/^[-*]\s+/)) {
        if (currentParagraph.trim()) {
          result.push({ type: "p", text: currentParagraph.trim() })
          currentParagraph = ""
        }
        result.push({ type: "li", text: line.replace(/^[-*]\s+/, "") })
        continue
      }

      currentParagraph += (currentParagraph ? " " : "") + line
    }

    if (currentParagraph.trim())
      result.push({ type: "p", text: currentParagraph.trim() })
    return result
  }, [content])

  return (
    <div className="article-prose flex flex-col gap-3">
      {blocks.map((block, i) => {
        if (block.type === "img") {
          return (
            <LazyImage
              key={`img-${i}-${block.text}`}
              keyword={block.text}
              onImageClick={onImageClick}
              expandLabel={t.article.expandImage}
            />
          )
        }

        if (block.type === "heading") {
          if (block.level === 1) return null

          if (block.level === 2) {
            return (
              <div key={i} className="mt-4">
                <div id={block.id} className="scroll-mt-20">
                  <h2 className="mb-2 border-b border-border/50 pb-1.5 font-serif text-[1.4rem] font-semibold text-foreground">
                    <InlineMarkdown text={block.text} />
                  </h2>
                </div>
              </div>
            )
          }

          if (block.level === 3) {
            return (
              <h3
                key={i}
                id={block.id}
                className="mt-2 scroll-mt-20 font-serif text-[1.15rem] font-semibold text-foreground/90"
              >
                <InlineMarkdown text={block.text} />
              </h3>
            )
          }
        }

        if (block.type === "li") {
          return (
            <li
              key={i}
              className="ml-5 list-disc font-serif text-[0.9375rem] leading-[1.8] text-foreground/90"
            >
              <InlineMarkdown text={block.text} />
            </li>
          )
        }

        return (
          <p
            key={i}
            className="font-serif text-[0.9375rem] leading-[1.8] text-foreground/90"
          >
            <InlineMarkdown text={block.text} />
          </p>
        )
      })}
    </div>
  )
}

// ── Wikipedia-style infobox ───────────────────────────────────────────────────

function WikiInfobox({
  data,
  image,
  title,
}: {
  data: InfoboxData
  image?: ImageResult
  title: string
}) {
  return (
    <div className="float-right mb-5 ml-7 w-[270px] shrink-0 overflow-hidden rounded-xl border border-border/70 bg-card text-sm shadow-sm max-lg:float-none max-lg:mx-auto max-lg:mb-6 max-lg:w-full max-lg:max-w-sm">
      <div className="border-b border-border/60 bg-wiki-link/[0.07] px-4 py-2.5 text-center">
        <h3 className="font-serif text-[0.9375rem] leading-snug font-semibold">
          {title}
        </h3>
      </div>
      {image && (
        <div className="border-b border-border/60">
          <img
            src={image.original}
            alt={image.title}
            className="h-44 w-full object-cover"
            loading="lazy"
            onError={(e) => {
              const target = e.currentTarget
              if (target.src !== image.thumbnail) target.src = image.thumbnail
            }}
          />
          {image.title && (
            <p className="px-3 py-1.5 text-center text-[11px] text-muted-foreground">
              {image.title}
            </p>
          )}
        </div>
      )}
      <table className="w-full text-[0.8125rem]">
        <tbody>
          {Object.entries(data).map(([key, value]) => (
            <tr key={key} className="border-b border-border/40 last:border-0">
              <td className="w-[40%] px-3 py-2 align-top font-medium text-muted-foreground">
                {key}
              </td>
              <td className="px-3 py-2 text-foreground/90">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Meta bar icon button ──────────────────────────────────────────────────────

function MetaBtn({
  onClick,
  title,
  children,
}: {
  onClick: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
    >
      {children}
    </button>
  )
}

// ── Mode icons ────────────────────────────────────────────────────────────────

const modeIcons: Record<ArticleMode, typeof Zap> = {
  rapido: Zap,
  medio: BookOpen,
  extendido: GraduationCap,
}

// ── Main component ────────────────────────────────────────────────────────────

export function ArticleStream({
  title,
  mode,
  reasoning,
  content,
  isStreaming,
  images,
  infobox,
  error,
  onRetry,
  onSearch,
}: ArticleStreamProps) {
  const { t, uiLocale } = useI18n()
  const [reasoningOpen, setReasoningOpen] = useState(true)
  const [copied, setCopied] = useState(false)
  const [shared, setShared] = useState(false)
  const [lightboxImg, setLightboxImg] = useState<ImageResult | null>(null)
  const articleBodyRef = useRef<HTMLDivElement>(null)
  const hasClosedReasoning = useRef(false)

  useEffect(() => {
    if (content && !hasClosedReasoning.current) {
      hasClosedReasoning.current = true
      setReasoningOpen(false)
    }
    if (!content && !reasoning) hasClosedReasoning.current = false
  }, [content, reasoning])

  const displayTitle = useMemo(() => {
    const match = content.match(/^#\s+(.+)/)
    return match ? match[1].replace(/\*\*/g, "") : title
  }, [content, title])

  const { wordCount, readingMinutes } = useMemo(() => {
    const words = content
      .replace(/[#*`[\]]/g, "")
      .split(/\s+/)
      .filter(Boolean).length
    return {
      wordCount: words,
      readingMinutes: Math.max(1, Math.round(words / 200)),
    }
  }, [content])

  function handleCopy() {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setShared(true)
      setTimeout(() => setShared(false), 2500)
    })
  }

  function handleDownload() {
    const filename = `${displayTitle.replace(/[/\\?%*:|"<>]/g, "-")}.md`
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const ModeIcon = modeIcons[mode]

  return (
    <article className="anim-fade-in flex flex-col gap-5 pb-12">
      {/* ── Lightbox ────────────────────────────────────────────────── */}
      {lightboxImg && (
        <Lightbox img={lightboxImg} onClose={() => setLightboxImg(null)} />
      )}

      {/* ── Title ───────────────────────────────────────────────────── */}
      <div>
        <h1
          id="top"
          className={cn(
            "font-serif text-3xl leading-tight font-bold tracking-tight md:text-4xl",
            isStreaming && content.length === 0 && "streaming-cursor"
          )}
        >
          {displayTitle}
        </h1>
        <div className="mt-3 h-px w-full bg-linear-to-r from-border via-border/60 to-transparent" />
      </div>

      {/* ── Meta bar ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        {/* Mode badge */}
        <span className="flex items-center gap-1 rounded-md border border-border/60 bg-muted/40 px-2 py-1 font-medium">
          <ModeIcon className="size-3 text-wiki-link" />
          {t.landing.modes[mode].label}
        </span>

        {/* Stats */}
        {content && !isStreaming && (
          <>
            <span className="opacity-40">·</span>
            <span>
              {wordCount.toLocaleString(uiLocale)} {t.article.words}
            </span>
            <span className="opacity-40">·</span>
            <span>
              ~{readingMinutes} {t.article.readingTime}
            </span>
          </>
        )}
        {isStreaming && content && (
          <>
            <span className="opacity-40">·</span>
            <span className="flex items-center gap-1">
              <span className="inline-block size-1.5 animate-pulse rounded-full bg-wiki-link" />
              {t.article.generating}
            </span>
          </>
        )}

        {/* Action buttons */}
        {content && !isStreaming && (
          <div className="ml-auto flex items-center gap-0.5">
            <MetaBtn
              onClick={handleShare}
              title={shared ? t.article.shared : t.article.share}
            >
              {shared ? (
                <Check className="size-3.5 text-green-500" />
              ) : (
                <Share2 className="size-3.5" />
              )}
            </MetaBtn>
            <MetaBtn onClick={handleDownload} title={t.article.download}>
              <Download className="size-3.5" />
            </MetaBtn>
            <div className="mx-1 h-3.5 w-px shrink-0 bg-border/60" />
            <MetaBtn
              onClick={handleCopy}
              title={copied ? t.article.copied : t.article.copy}
            >
              {copied ? (
                <Check className="size-3.5 text-green-500" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </MetaBtn>
          </div>
        )}
      </div>

      {/* ── AI Reasoning panel ──────────────────────────────────────── */}
      {reasoning && (
        <div className="overflow-hidden rounded-xl border border-border/60 bg-muted/30">
          <button
            type="button"
            onClick={() => setReasoningOpen(!reasoningOpen)}
            className="flex w-full items-center gap-2.5 px-4 py-3 text-left transition-colors hover:bg-muted/50"
          >
            <Brain className="size-4 shrink-0 text-wiki-link" />
            <span className="text-sm font-medium text-muted-foreground">
              {t.article.aiThinking}
            </span>
            {isStreaming && !content && (
              <span className="ml-1 inline-block size-1.5 animate-pulse rounded-full bg-wiki-link" />
            )}
            {reasoningOpen ? (
              <ChevronUp className="ml-auto size-4 text-muted-foreground/60" />
            ) : (
              <ChevronDown className="ml-auto size-4 text-muted-foreground/60" />
            )}
          </button>
          {reasoningOpen && (
            <div className="max-h-56 overflow-y-auto border-t border-border/50 px-4 py-3 text-[0.8125rem] leading-relaxed text-muted-foreground">
              {reasoning}
              {isStreaming && !content && <span className="streaming-cursor" />}
            </div>
          )}
        </div>
      )}

      {/* ── Error state ─────────────────────────────────────────────── */}
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-destructive">
                {t.article.errorTitle}
              </p>
              <p className="text-xs text-muted-foreground">{error}</p>
              <button
                type="button"
                onClick={onRetry}
                className="mt-1 flex w-fit items-center gap-1.5 rounded-lg border border-border/60 bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
              >
                <RefreshCw className="size-3" />
                {t.article.errorRetry}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Loading entertainment ────────────────────────────────────── */}
      {isStreaming && !content && !error && <LoadingEntertainment />}

      {/* ── Article body ────────────────────────────────────────────── */}
      {(content || infobox) && (
        <div ref={articleBodyRef} className="overflow-hidden">
          {infobox && (
            <WikiInfobox
              data={infobox}
              image={images[0]}
              title={displayTitle}
            />
          )}
          {content && (
            <MarkdownArticle content={content} onImageClick={setLightboxImg} />
          )}
        </div>
      )}

      {/* ── Trailing cursor ─────────────────────────────────────────── */}
      {isStreaming && content && (
        <span className="streaming-cursor inline-block w-fit" />
      )}

      {/* ── Selection toolbar ───────────────────────────────────────── */}
      {!isStreaming && content && (
        <SelectionToolbar containerRef={articleBodyRef} onSearch={onSearch} />
      )}
    </article>
  )
}

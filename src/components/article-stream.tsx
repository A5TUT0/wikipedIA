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
} from "lucide-react"
import type { ImageResult } from "@/lib/wikipedia-images"
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

/** Convert a heading title to a slug for id anchors */
function toSlug(text: string): string {
  return text
    .replace(/\*\*/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^\w\sáéíóúñü]/g, "")
    .replace(/\s+/g, "-")
}

/** Render inline markdown (bold, italic) */
function InlineMarkdown({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**"))
          return <strong key={i}>{part.slice(2, -2)}</strong>
        if (part.startsWith("*") && part.endsWith("*"))
          return <em key={i}>{part.slice(1, -1)}</em>
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

/** Pulsing skeleton shown while waiting for first content */
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

/** Renders streamed markdown content as article HTML */
function MarkdownArticle({
  content,
  images,
}: {
  content: string
  images: ImageResult[]
}) {
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

  let imageIndex = 0

  return (
    <div className="article-prose flex flex-col gap-3">
      {blocks.map((block, i) => {
        if (block.type === "heading") {
          if (block.level === 1) return null

          if (block.level === 2) {
            const img = images[imageIndex]
            imageIndex++
            return (
              <div key={i} className="mt-4">
                {img && (
                  <figure className="mb-5 overflow-hidden rounded-lg border border-border/60 bg-muted/30">
                    <img
                      src={img.original}
                      alt={img.title}
                      className="max-h-72 w-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.currentTarget
                        if (target.src !== img.thumbnail)
                          target.src = img.thumbnail
                      }}
                    />
                    <figcaption className="px-3 py-2 text-center text-xs text-muted-foreground">
                      {img.title}
                      {img.source && (
                        <span className="ml-1 italic opacity-70">
                          — {img.source}
                        </span>
                      )}
                    </figcaption>
                  </figure>
                )}
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

/** Wikipedia-style infobox */
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

const modeIcons: Record<ArticleMode, typeof Zap> = {
  rapido: Zap,
  medio: BookOpen,
  extendido: GraduationCap,
}

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
  const [reasoningOpen, setReasoningOpen] = useState(true)
  const [copied, setCopied] = useState(false)
  const { t, uiLocale } = useI18n()
  // Ref for the article body — used by SelectionToolbar to restrict selection scope
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

  // Reading time
  const { wordCount, readingMinutes } = useMemo(() => {
    const words = content
      .replace(/[#*`\[\]]/g, "")
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

  const ModeIcon = modeIcons[mode]

  return (
    <article className="anim-fade-in flex flex-col gap-5 pb-12">
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

        {/* Stats (shown only when content exists) */}
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

        {/* Copy button (only when article is done) */}
        {content && !isStreaming && (
          <button
            type="button"
            onClick={handleCopy}
            className="ml-auto flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-muted/60 hover:text-foreground"
            title={t.article.copy}
          >
            {copied ? (
              <>
                <Check className="size-3 text-green-500" />
                <span className="text-green-500">{t.article.copied}</span>
              </>
            ) : (
              <>
                <Copy className="size-3" />
                <span>{t.article.copy}</span>
              </>
            )}
          </button>
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

      {/* ── Loading skeleton ────────────────────────────────────────── */}
      {isStreaming && !content && !error && <ArticleSkeleton />}

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
            <MarkdownArticle
              content={content}
              images={infobox ? images.slice(1) : images}
            />
          )}
        </div>
      )}

      {/* ── Trailing cursor ─────────────────────────────────────────── */}
      {isStreaming && content && (
        <span className="streaming-cursor inline-block w-fit" />
      )}

      {/* ── Selection toolbar (only when article is done) ───────────── */}
      {!isStreaming && content && (
        <SelectionToolbar containerRef={articleBodyRef} onSearch={onSearch} />
      )}
    </article>
  )
}

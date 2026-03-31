import { useMemo, useEffect, useRef, useState } from "react"
import {
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
  ArrowRight,
} from "lucide-react"
import type { ImageResult } from "@/lib/wikipedia-images"
import { fetchImages } from "@/lib/wikipedia-images"
import type { InfoboxData } from "@/lib/article-helpers"
import {
  type ArticleMode,
  type AIModelId,
  AI_MODELS,
} from "@/lib/openrouter"
import { cn } from "@/lib/utils"
import { SelectionToolbar } from "@/components/selection-toolbar"
import { useI18n } from "@/lib/i18n"
import { toast } from "@/lib/toast-service"
interface ArticleStreamProps {
  title: string
  mode: ArticleMode
  content: string
  isStreaming: boolean
  images: ImageResult[]
  infobox: InfoboxData | null
  error: string | null
  onRetry: () => void
  onSearch?: (query: string) => void
  related?: string[]
  currentModel?: AIModelId
  onModelChange?: (modelId: AIModelId) => void
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
        const key = `${i}-${part.slice(0, 20)}`
        const linkMatch = part.match(/^\[(.+?)\]\((.+?)\)$/)
        if (linkMatch)
          return (
            <a
              key={key}
              href={linkMatch[2]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-wiki-link underline decoration-wiki-link/30 underline-offset-2 transition-colors hover:decoration-wiki-link/70"
            >
              {linkMatch[1]}
            </a>
          )
        if (part.startsWith("**") && part.endsWith("**"))
          return <strong key={key}>{part.slice(2, -2)}</strong>
        if (part.startsWith("*") && part.endsWith("*"))
          return <em key={key}>{part.slice(1, -1)}</em>
        return <span key={key}>{part}</span>
      })}
    </>
  )
}



function LoadingEntertainment() {
  const { t } = useI18n()
  const facts = t.loading.facts
  const messages = t.loading.messages
  const [factState, setFactState] = useState(() => ({
    index: Math.floor(Math.random() * facts.length),
    visible: true,
  }))
  const [msgIndex, setMsgIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setFactState((prev) => ({ ...prev, visible: false }))
      setTimeout(() => {
        setFactState((prev) => {
          let nextIndex
          do {
            nextIndex = Math.floor(Math.random() * facts.length)
          } while (nextIndex === prev.index && facts.length > 1)
          return { index: nextIndex, visible: true }
        })
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
            opacity: factState.visible ? 1 : 0,
            transition: "opacity 0.35s ease",
          }}
        >
          {facts[factState.index]}
        </p>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="inline-block size-1.5 animate-pulse rounded-full bg-wiki-link" />
        <span>{messages[msgIndex]}</span>
      </div>
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
      role="dialog"
      aria-modal="true"
      aria-label={img.title}
      onMouseDown={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose()
      }}
    >
      <div
        role="presentation"
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
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onClick()
        }
      }}
      className="group relative mb-5 cursor-zoom-in overflow-hidden rounded-xl shadow-sm transition-shadow duration-200 hover:shadow-lg"
      onClick={onClick}
    >
      <div
        className="overflow-hidden"
        style={{ aspectRatio: "var(--img-ratio, 16/9)" }}
      >
        <img
          src={img.original}
          alt={img.title}
          className="h-full w-full object-cover transition-transform duration-500 max-sm:[--img-ratio:16/9] sm:[--img-ratio:16/7] group-hover:scale-[1.02]"
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
  articleTitle,
  onImageClick,
  expandLabel,
}: {
  keyword: string
  articleTitle: string
  onImageClick: (img: ImageResult) => void
  expandLabel: string
}) {
  const [img, setImg] = useState<ImageResult | null>(null)
  const [loading, setLoading] = useState(true)
  const fetched = useRef(false)

  useEffect(() => {
    if (fetched.current) return
    fetched.current = true
    fetchImages(`${articleTitle} ${keyword}`, 1).then((results) => {
      if (results.length > 0) setImg(results[0])
      setLoading(false)
    })
  }, [keyword, articleTitle])

  if (loading) {
    return (
      <div
        className="mb-5 overflow-hidden rounded-xl bg-muted"
        style={{ aspectRatio: "var(--img-ratio, 16/9)" }}
      >
        <div className="h-full w-full animate-pulse max-sm:[--img-ratio:16/9] sm:[--img-ratio:16/7]" />
      </div>
    )
  }

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
  articleTitle,
  onImageClick,
}: {
  content: string
  articleTitle: string
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
      uid: number
    }[] = []
    let currentParagraph = ""
    let uid = 0

    for (const line of lines) {
      const imgMatch = line.trim().match(/^\[IMG:\s*(.+?)\]$/)
      if (imgMatch) {
        if (currentParagraph.trim()) {
          result.push({ type: "p", text: currentParagraph.trim(), uid: uid++ })
          currentParagraph = ""
        }
        result.push({ type: "img", text: imgMatch[1].trim(), uid: uid++ })
        continue
      }

      const hMatch = line.match(/^(#{1,3})\s+(.+)/)
      if (hMatch) {
        if (currentParagraph.trim()) {
          result.push({ type: "p", text: currentParagraph.trim(), uid: uid++ })
          currentParagraph = ""
        }
        const level = hMatch[1].length
        const text = hMatch[2]
        result.push({
          type: "heading",
          level,
          text,
          id: toSlug(text),
          uid: uid++,
        })
        continue
      }

      if (line.trim() === "") {
        if (currentParagraph.trim()) {
          result.push({ type: "p", text: currentParagraph.trim(), uid: uid++ })
          currentParagraph = ""
        }
        continue
      }

      if (line.match(/^[-*]\s+/)) {
        if (currentParagraph.trim()) {
          result.push({ type: "p", text: currentParagraph.trim(), uid: uid++ })
          currentParagraph = ""
        }
        result.push({
          type: "li",
          text: line.replace(/^[-*]\s+/, ""),
          uid: uid++,
        })
        continue
      }

      currentParagraph += (currentParagraph ? " " : "") + line
    }

    if (currentParagraph.trim())
      result.push({ type: "p", text: currentParagraph.trim(), uid: uid++ })
    return result
  }, [content])

  return (
    <div className="article-prose flex flex-col gap-3">
      {blocks.map((block) => {
        if (block.type === "img") {
          return (
            <LazyImage
              key={`img-${block.uid}`}
              keyword={block.text}
              articleTitle={articleTitle}
              onImageClick={onImageClick}
              expandLabel={t.article.expandImage}
            />
          )
        }

        if (block.type === "heading") {
          if (block.level === 1) return null

          if (block.level === 2) {
            return (
              <div key={block.uid} className="mt-4">
                <div id={block.id} className="scroll-mt-20">
                  <h2 className="anim-fade-in mb-2 border-b border-border/50 pb-1.5 font-serif text-[1.4rem] font-semibold text-foreground">
                    <InlineMarkdown text={block.text} />
                  </h2>
                </div>
              </div>
            )
          }

          if (block.level === 3) {
            return (
              <h3
                key={block.uid}
                id={block.id}
                className="anim-fade-in mt-2 scroll-mt-20 font-serif text-[1.15rem] font-semibold text-foreground/90"
              >
                <InlineMarkdown text={block.text} />
              </h3>
            )
          }
        }

        if (block.type === "li") {
          return (
            <li
              key={block.uid}
              className="anim-fade-in ml-5 list-disc font-serif text-[0.9375rem] leading-[1.8] text-foreground/90"
            >
              <InlineMarkdown text={block.text} />
            </li>
          )
        }

        return (
          <p
            key={block.uid}
            className="anim-fade-in font-serif text-[0.9375rem] leading-[1.8] text-foreground/90"
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
  content,
  isStreaming,
  images,
  infobox,
  error,
  onRetry,
  onSearch,
  related,
  currentModel,
  onModelChange,
}: ArticleStreamProps) {
  const { t, uiLocale } = useI18n()
  const [copied, setCopied] = useState(false)
  const [shared, setShared] = useState(false)
  const [lightboxImg, setLightboxImg] = useState<ImageResult | null>(null)
  const articleBodyRef = useRef<HTMLDivElement>(null)

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
      toast(t.toast.copied)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setShared(true)
      toast(t.toast.linkCopied)
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
    toast(t.toast.downloaded)
  }

  const activeModel = useMemo(
    () =>
      AI_MODELS.find((m) => m.id === currentModel) ||
      AI_MODELS.find((m) => m.id === "openai/gpt-oss-120b:free"),
    [currentModel]
  )

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
          className="font-serif text-3xl leading-tight font-bold tracking-tight md:text-4xl"
        >
          {displayTitle}
        </h1>
        <div className="mt-3 h-px w-full bg-linear-to-r from-border via-border/60 to-transparent" />
      </div>

      {/* ── Meta bar ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        {/* Model badge */}
        {activeModel && (
          <div className="flex items-center gap-1.5 rounded-md border border-border/60 bg-muted/40 px-2 py-1 font-medium">
            <img
              src={activeModel.logo}
              alt={activeModel.label}
              className="size-3.5 object-contain"
            />
            <span className="hidden sm:inline">{activeModel.label}</span>
          </div>
        )}

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

      {/* ── Error state ─────────────────────────────────────────────── */}
      {error && (() => {
        const isRateLimitOrAuth =
          error === t.errors.rateLimited ||
          error === t.errors.unauthorized ||
          error === t.errors.modelUnavailable

        const otherModels = currentModel
          ? AI_MODELS.filter((m) => m.id !== currentModel)
          : []

        const isRecoverable = isRateLimitOrAuth && otherModels.length > 0 && onModelChange
        const isAllExhausted = isRateLimitOrAuth && otherModels.length === 0

        return (
          <div
            className={cn(
              "anim-fade-in overflow-hidden rounded-2xl border",
              isRecoverable
                ? "border-amber-400/30 bg-amber-50/60 dark:border-amber-500/20 dark:bg-amber-950/20"
                : "border-destructive/30 bg-destructive/5"
            )}
          >
            {/* Error header */}
            <div className={cn(
              "flex items-center gap-2.5 px-5 py-3.5",
              isRecoverable
                ? "border-b border-amber-400/20 bg-amber-100/40 dark:border-amber-500/10 dark:bg-amber-950/30"
                : "border-b border-destructive/15 bg-destructive/5"
            )}>
              <AlertCircle className={cn(
                "size-[18px] shrink-0",
                isRecoverable
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-destructive"
              )} />
              <p className={cn(
                "text-sm font-semibold",
                isRecoverable
                  ? "text-amber-800 dark:text-amber-300"
                  : "text-destructive"
              )}>
                {t.article.errorTitle}
              </p>
            </div>

            <div className="flex flex-col gap-4 px-5 py-4">
              <p className="text-[0.8125rem] leading-relaxed text-muted-foreground">
                {error}
              </p>

              {/* Recoverable: show alternative model cards */}
              {isRecoverable && (
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
                    {t.errors.tryOtherModel}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {otherModels.map((model) => (
                      <button
                        key={model.id}
                        type="button"
                        onClick={() => {
                          onModelChange(model.id)
                          setTimeout(() => onRetry(), 50)
                        }}
                        className="group flex items-center gap-3 rounded-xl border border-border/60 bg-background px-4 py-3 text-left shadow-sm transition-all duration-200 hover:border-wiki-link/50 hover:shadow-md hover:ring-2 hover:ring-wiki-link/10"
                      >
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/60 p-1.5 transition-colors group-hover:bg-wiki-link/10">
                          {model.darkLogo ? (
                            <>
                              <img
                                src={model.logo}
                                alt=""
                                className="size-5 object-contain dark:hidden"
                              />
                              <img
                                src={model.darkLogo}
                                alt=""
                                className="hidden size-5 object-contain dark:block"
                              />
                            </>
                          ) : (
                            <img
                              src={model.logo}
                              alt=""
                              className="size-5 object-contain"
                            />
                          )}
                        </div>
                        <div className="flex flex-1 flex-col gap-0.5">
                          <span className="text-sm font-medium text-foreground transition-colors group-hover:text-wiki-link">
                            {model.label}
                          </span>
                          {model.recommended && (
                            <span className="text-[10px] font-medium text-wiki-link">
                              {t.landing.recommended}
                            </span>
                          )}
                        </div>
                        <ArrowRight className="size-4 text-muted-foreground/40 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-wiki-link" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* All models exhausted */}
              {isAllExhausted && (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-border/50 bg-muted/30 px-5 py-5 text-center">
                  <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                    <RefreshCw className="size-4.5 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium text-foreground/80">
                      {t.errors.allExhausted}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t.errors.allExhaustedHint}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onRetry}
                    className="mt-1 flex items-center gap-1.5 rounded-lg border border-border/60 bg-background px-4 py-2 text-xs font-medium shadow-sm transition-all duration-150 hover:bg-muted hover:shadow-md"
                  >
                    <RefreshCw className="size-3" />
                    {t.article.errorRetry}
                  </button>
                </div>
              )}

              {/* Generic error: simple retry */}
              {!isRateLimitOrAuth && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="flex w-fit items-center gap-1.5 rounded-lg border border-border/60 bg-background px-3.5 py-2 text-xs font-medium shadow-sm transition-all duration-150 hover:bg-muted hover:shadow-md"
                >
                  <RefreshCw className="size-3" />
                  {t.article.errorRetry}
                </button>
              )}
            </div>
          </div>
        )
      })()}

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
            <MarkdownArticle
              content={content}
              articleTitle={title}
              onImageClick={setLightboxImg}
            />
          )}
        </div>
      )}



      {/* ── Related articles ────────────────────────────────────────── */}
      {!isStreaming && related && related.length > 0 && (
        <div className="rounded-xl border border-border/60 bg-muted/20 p-5">
          <h3 className="mb-3 font-serif text-base font-semibold text-foreground">
            {t.article.relatedTitle}
          </h3>
          <div className="flex flex-wrap gap-2">
            {related.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onSearch?.(item)}
                className="rounded-full border border-border/60 bg-background px-3.5 py-1.5 text-xs text-muted-foreground transition-all duration-150 hover:border-wiki-link/40 hover:bg-wiki-link/5 hover:text-wiki-link"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Selection toolbar ───────────────────────────────────────── */}
      {!isStreaming && content && (
        <SelectionToolbar containerRef={articleBodyRef} onSearch={onSearch} />
      )}
    </article>
  )
}

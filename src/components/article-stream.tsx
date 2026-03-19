import { useMemo, useEffect, useRef } from "react"
import { Separator } from "@/components/ui/separator"
import { Brain, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import type { ImageResult } from "@/lib/wikipedia-images"
import type { InfoboxData } from "@/App"

interface ArticleStreamProps {
  title: string
  reasoning: string
  content: string
  isStreaming: boolean
  images: ImageResult[]
  infobox: InfoboxData | null
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
      // Headings
      const hMatch = line.match(/^(#{1,3})\s+(.+)/)
      if (hMatch) {
        if (currentParagraph.trim()) {
          result.push({ type: "p", text: currentParagraph.trim() })
          currentParagraph = ""
        }
        const level = hMatch[1].length
        const text = hMatch[2]
        result.push({
          type: "heading",
          level,
          text,
          id: toSlug(text),
        })
        continue
      }

      // Empty line = paragraph break
      if (line.trim() === "") {
        if (currentParagraph.trim()) {
          result.push({ type: "p", text: currentParagraph.trim() })
          currentParagraph = ""
        }
        continue
      }

      // List item
      if (line.match(/^[-*]\s+/)) {
        if (currentParagraph.trim()) {
          result.push({ type: "p", text: currentParagraph.trim() })
          currentParagraph = ""
        }
        result.push({ type: "li", text: line.replace(/^[-*]\s+/, "") })
        continue
      }

      // Continue paragraph
      currentParagraph += (currentParagraph ? " " : "") + line
    }

    if (currentParagraph.trim()) {
      result.push({ type: "p", text: currentParagraph.trim() })
    }

    return result
  }, [content])

  // Track which image to show next — insert after every ## heading section
  let imageIndex = 0

  return (
    <div className="flex flex-col gap-4">
      {blocks.map((block, i) => {
        if (block.type === "heading") {
          if (block.level === 1) {
            return null // We render title separately
          }
          if (block.level === 2) {
            const img = images[imageIndex]
            imageIndex++
            return (
              <div key={i}>
                {img && (
                  <figure className="my-4 flex flex-col items-center gap-2">
                    <img
                      src={img.original}
                      alt={img.title}
                      className="max-h-64 rounded-md border object-cover"
                      loading="lazy"
                      onError={(e) => {
                        // Fallback to thumbnail if original fails
                        const target = e.currentTarget
                        if (target.src !== img.thumbnail) {
                          target.src = img.thumbnail
                        }
                      }}
                    />
                    <figcaption className="text-center text-xs text-muted-foreground">
                      {img.title} — <span className="italic">{img.source}</span>
                    </figcaption>
                  </figure>
                )}
                <div id={block.id} className="scroll-mt-20">
                  <h2 className="mb-1 font-serif text-2xl font-semibold">
                    <InlineMarkdown text={block.text} />
                  </h2>
                  <Separator className="mb-2" />
                </div>
              </div>
            )
          }
          if (block.level === 3) {
            return (
              <h3
                key={i}
                id={block.id}
                className="scroll-mt-20 font-serif text-xl font-medium"
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
              className="ml-4 list-disc font-serif text-base leading-relaxed"
            >
              <InlineMarkdown text={block.text} />
            </li>
          )
        }

        return (
          <p key={i} className="font-serif text-base leading-relaxed">
            <InlineMarkdown text={block.text} />
          </p>
        )
      })}
    </div>
  )
}

/** Render inline markdown (bold, links) */
function InlineMarkdown({ text }: { text: string }) {
  // Process **bold** and *italic*
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i}>{part.slice(2, -2)}</strong>
        }
        if (part.startsWith("*") && part.endsWith("*")) {
          return <em key={i}>{part.slice(1, -1)}</em>
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

/** Wikipedia-style infobox rendered on the right side */
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
    <div className="float-right mb-4 ml-6 w-[280px] shrink-0 rounded border border-border bg-secondary/30 max-lg:float-none max-lg:mx-auto max-lg:mb-6 max-lg:w-full max-lg:max-w-sm">
      {/* Infobox header */}
      <div className="border-b bg-wiki-link/10 px-4 py-3 text-center">
        <h3 className="font-serif text-lg font-semibold">{title}</h3>
      </div>

      {/* Image */}
      {image && (
        <div className="flex flex-col items-center border-b px-4 py-3">
          <img
            src={image.original}
            alt={image.title}
            className="max-h-48 rounded object-cover"
            loading="lazy"
            onError={(e) => {
              const target = e.currentTarget
              if (target.src !== image.thumbnail) {
                target.src = image.thumbnail
              }
            }}
          />
          <span className="mt-1 text-center text-[11px] text-muted-foreground">
            {image.title}
          </span>
        </div>
      )}

      {/* Key-value rows */}
      <table className="w-full text-sm">
        <tbody>
          {Object.entries(data).map(([key, value]) => (
            <tr key={key} className="border-b border-border/50 last:border-0">
              <td className="px-3 py-2 font-medium text-muted-foreground">
                {key}
              </td>
              <td className="px-3 py-2">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function ArticleStream({
  title,
  reasoning,
  content,
  isStreaming,
  images,
  infobox,
}: ArticleStreamProps) {
  const [reasoningOpen, setReasoningOpen] = useState(true)

  // Auto-close reasoning panel when content starts arriving
  const hasClosedReasoning = useRef(false)
  useEffect(() => {
    if (content && !hasClosedReasoning.current) {
      hasClosedReasoning.current = true
      setReasoningOpen(false)
    }
    if (!content && !reasoning) {
      hasClosedReasoning.current = false
    }
  }, [content, reasoning])

  // Extract H1 from content if present, otherwise use title
  const displayTitle = useMemo(() => {
    const match = content.match(/^#\s+(.+)/)
    return match ? match[1].replace(/\*\*/g, "") : title
  }, [content, title])

  return (
    <article className="flex flex-col gap-6">
      {/* Title */}
      <div>
        <h1
          className="font-serif text-3xl leading-tight font-bold md:text-4xl"
          id="top"
        >
          {displayTitle}
          {isStreaming && content.length === 0 && (
            <span className="streaming-cursor" />
          )}
        </h1>
        <Separator className="mt-3" />
      </div>

      {/* AI Reasoning panel */}
      {reasoning && (
        <div className="rounded-lg border bg-secondary/50">
          <button
            type="button"
            onClick={() => setReasoningOpen(!reasoningOpen)}
            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Brain className="size-4 text-wiki-link" />
            <span>Pensamiento de la IA</span>
            {isStreaming && !content && (
              <span className="ml-1 inline-block size-2 animate-pulse rounded-full bg-wiki-link" />
            )}
            {reasoningOpen ? (
              <ChevronUp className="ml-auto size-4" />
            ) : (
              <ChevronDown className="ml-auto size-4" />
            )}
          </button>
          {reasoningOpen && (
            <div className="max-h-60 overflow-y-auto border-t px-4 py-3 text-sm leading-relaxed text-muted-foreground">
              {reasoning}
              {isStreaming && !content && <span className="streaming-cursor" />}
            </div>
          )}
        </div>
      )}

      {/* Article content with infobox */}
      {(content || infobox) && (
        <div>
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

      {/* Streaming cursor at the end */}
      {isStreaming && content && (
        <span className="streaming-cursor inline-block w-fit" />
      )}
    </article>
  )
}

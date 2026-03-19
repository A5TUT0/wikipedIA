import { useMemo } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export interface TocItem {
  id: string
  title: string
  level: number
}

/** Parse markdown content and extract headings into a ToC */
export function extractToc(markdown: string): TocItem[] {
  const items: TocItem[] = []
  const lines = markdown.split("\n")

  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)/)
    if (match) {
      const level = match[1].length - 1 // ## = 1, ### = 2
      const title = match[2].replace(/\*\*/g, "").trim()
      const id = title
        .toLowerCase()
        .replace(/[^\w\sáéíóúñü]/g, "")
        .replace(/\s+/g, "-")
      items.push({ id, title, level })
    }
  }

  return items
}

interface TableOfContentsProps {
  items: TocItem[]
  className?: string
}

export function TableOfContents({ items, className }: TableOfContentsProps) {
  const numberedItems = useMemo(() => {
    let h2Count = 0
    return items.map((item) => {
      if (item.level === 1) h2Count++
      return { ...item, number: item.level === 1 ? `${h2Count}.` : "–" }
    })
  }, [items])

  if (items.length === 0) return null

  return (
    <nav className={cn("w-full", className)}>
      <h2 className="mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
        Contenidos
      </h2>
      <ScrollArea className="h-[calc(100vh-10rem)]">
        <ol className="flex flex-col gap-0.5 text-sm">
          {numberedItems.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={cn(
                  "block rounded-md px-2 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-wiki-link",
                  item.level === 2 && "pl-6 text-xs"
                )}
              >
                <span className="mr-1.5 text-muted-foreground/60">
                  {item.number}
                </span>
                {item.title}
              </a>
            </li>
          ))}
        </ol>
      </ScrollArea>
    </nav>
  )
}

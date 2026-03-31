import { useMemo, useState, useEffect, useCallback } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n"
import type { TocItem } from "@/lib/toc-utils"

interface TableOfContentsProps {
  items: TocItem[]
  className?: string
}

export function TableOfContents({ items, className }: TableOfContentsProps) {
  const { t } = useI18n()
  const [activeId, setActiveId] = useState<string>("")

  // Track active section via IntersectionObserver
  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id)
          break
        }
      }
    },
    []
  )

  useEffect(() => {
    if (items.length === 0) return

    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: "-10% 0px -80% 0px",
      threshold: 0,
    })

    const timer = setTimeout(() => {
      for (const item of items) {
        const el = document.getElementById(item.id)
        if (el) observer.observe(el)
      }
    }, 200)

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [items, handleIntersect])

  const numberedItems = useMemo(() => {
    let h2Count = 0
    return items.map((item) => {
      if (item.level === 1) h2Count++
      return { ...item, number: item.level === 1 ? `${h2Count}.` : "" }
    })
  }, [items])

  if (items.length === 0) return null

  return (
    <nav className={cn("w-full", className)}>
      <p className="mb-3 text-[0.6875rem] font-semibold tracking-widest text-muted-foreground/70 uppercase">
        {t.toc.title}
      </p>
      <ScrollArea className="h-[calc(100vh-10rem)]">
        <ol className="flex flex-col gap-px text-sm">
          {numberedItems.map((item) => {
            const isActive = activeId === item.id
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={cn(
                    "group flex items-start gap-2 rounded-md px-2.5 py-1.5 transition-all duration-150",
                    item.level === 2 && "pl-5",
                    isActive
                      ? "bg-wiki-link/8 text-wiki-link"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  {item.level === 1 && (
                    <span
                      className={cn(
                        "mt-0.5 shrink-0 text-[0.7rem] tabular-nums transition-colors",
                        isActive
                          ? "text-wiki-link/70"
                          : "text-muted-foreground/40"
                      )}
                    >
                      {item.number}
                    </span>
                  )}
                  <span
                    className={cn(
                      "leading-snug",
                      item.level === 2 ? "text-xs" : "text-[0.8125rem]",
                      isActive && "font-medium"
                    )}
                  >
                    {item.title}
                  </span>
                  {isActive && (
                    <span className="mt-1 ml-auto h-3.5 w-0.5 shrink-0 rounded-full bg-wiki-link" />
                  )}
                </a>
              </li>
            )
          })}
        </ol>
      </ScrollArea>
    </nav>
  )
}

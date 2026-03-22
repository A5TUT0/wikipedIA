import { useReducer, useEffect, useRef, useCallback } from "react"
import { Copy, Check, Search, Eraser } from "lucide-react"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n"

// Semi-transparent colors — work in both light and dark mode
const HIGHLIGHT_COLORS = [
  { bg: "rgba(253, 224, 71,  0.45)", key: "yellow" as const },
  { bg: "rgba(134, 239, 172, 0.45)", key: "green" as const },
  { bg: "rgba(125, 211, 252, 0.45)", key: "blue" as const },
  { bg: "rgba(249, 168, 212, 0.45)", key: "pink" as const },
  { bg: "rgba(253, 186, 116, 0.45)", key: "orange" as const },
]

// Max chars for a reasonable WikipedIA search query
const SEARCH_MAX_CHARS = 50

interface ToolbarState {
  visible: boolean
  position: { top: number; left: number }
  selText: string
  copied: boolean
  isHighlighted: boolean
}

type ToolbarAction =
  | {
      type: "SHOW"
      position: { top: number; left: number }
      selText: string
      isHighlighted: boolean
    }
  | { type: "HIDE" }
  | { type: "COPIED" }
  | { type: "RESET_COPIED" }

const initialToolbarState: ToolbarState = {
  visible: false,
  position: { top: 0, left: 0 },
  selText: "",
  copied: false,
  isHighlighted: false,
}

function toolbarReducer(
  state: ToolbarState,
  action: ToolbarAction
): ToolbarState {
  switch (action.type) {
    case "SHOW":
      return {
        ...state,
        visible: true,
        position: action.position,
        selText: action.selText,
        isHighlighted: action.isHighlighted,
        copied: false,
      }
    case "HIDE":
      return { ...state, visible: false }
    case "COPIED":
      return { ...state, copied: true }
    case "RESET_COPIED":
      return { ...state, copied: false, visible: false }
  }
}

interface SelectionToolbarProps {
  containerRef: React.RefObject<HTMLElement | null>
  onSearch?: (text: string) => void
}

export function SelectionToolbar({
  containerRef,
  onSearch,
}: SelectionToolbarProps) {
  const { t } = useI18n()
  const [state, dispatch] = useReducer(toolbarReducer, initialToolbarState)
  const toolbarRef = useRef<HTMLDivElement>(null)

  // ── Detect & position ────────────────────────────────────────────────
  const checkSelection = useCallback(() => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || !sel.toString().trim()) {
      dispatch({ type: "HIDE" })
      return
    }

    if (containerRef.current) {
      const range = sel.getRangeAt(0)
      const ancestor = range.commonAncestorContainer
      if (!containerRef.current.contains(ancestor)) {
        dispatch({ type: "HIDE" })
        return
      }
    }

    const text = sel.toString().trim()
    const range = sel.getRangeAt(0)
    const rect = range.getBoundingClientRect()

    // Detect if the selection overlaps any existing highlight
    const ancestor = range.commonAncestorContainer
    const enclosingMark =
      (ancestor as Element).closest?.("mark[data-highlight]") ??
      (ancestor.nodeType === Node.TEXT_NODE
        ? ancestor.parentElement?.closest("mark[data-highlight]")
        : null)

    let containsMark = false
    if (!enclosingMark) {
      const tempDiv = document.createElement("div")
      tempDiv.appendChild(range.cloneContents())
      containsMark = !!tempDiv.querySelector("mark[data-highlight]")
    }

    dispatch({
      type: "SHOW",
      position: { top: rect.top - 12, left: rect.left + rect.width / 2 },
      selText: text,
      isHighlighted: !!(enclosingMark || containsMark),
    })
  }, [containerRef])

  // Hide on scroll
  useEffect(() => {
    if (!state.visible) return
    const hide = () => dispatch({ type: "HIDE" })
    window.addEventListener("scroll", hide, { passive: true })
    return () => window.removeEventListener("scroll", hide)
  }, [state.visible])

  useEffect(() => {
    const onUp = () => checkSelection()
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.shiftKey) checkSelection()
    }
    const onDown = (e: MouseEvent) => {
      if (!toolbarRef.current?.contains(e.target as Node)) {
        setTimeout(() => {
          if (!window.getSelection()?.toString()) dispatch({ type: "HIDE" })
        }, 80)
      }
    }

    document.addEventListener("mouseup", onUp)
    document.addEventListener("touchend", onUp, { passive: true })
    document.addEventListener("keyup", onKeyUp)
    document.addEventListener("mousedown", onDown)
    return () => {
      document.removeEventListener("mouseup", onUp)
      document.removeEventListener("touchend", onUp)
      document.removeEventListener("keyup", onKeyUp)
      document.removeEventListener("mousedown", onDown)
    }
  }, [checkSelection])

  // ── Actions ──────────────────────────────────────────────────────────
  function handleCopy() {
    navigator.clipboard.writeText(state.selText).then(() => {
      dispatch({ type: "COPIED" })
      setTimeout(() => dispatch({ type: "RESET_COPIED" }), 1500)
    })
  }

  function applyHighlight(color: string) {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed) return

    try {
      const range = sel.getRangeAt(0)
      const ancestor = range.commonAncestorContainer

      // Toggle off if already highlighted
      const existingMark =
        (ancestor as Element).closest?.("mark") ??
        (ancestor.nodeType === Node.TEXT_NODE
          ? ancestor.parentElement
          : (ancestor as Element)
        )?.closest("mark")

      if (existingMark) {
        const parent = existingMark.parentNode!
        while (existingMark.firstChild)
          parent.insertBefore(existingMark.firstChild, existingMark)
        parent.removeChild(existingMark)
        sel.removeAllRanges()
        dispatch({ type: "HIDE" })
        return
      }

      const mark = document.createElement("mark")
      mark.dataset.highlight = "true"
      mark.style.backgroundColor = color
      const fragment = range.extractContents()
      mark.appendChild(fragment)
      range.insertNode(mark)
      sel.removeAllRanges()
    } catch {
      // Skip if selection spans complex node boundaries
    }
    dispatch({ type: "HIDE" })
  }

  function removeHighlight() {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed) return

    try {
      const range = sel.getRangeAt(0)
      const ancestor = range.commonAncestorContainer

      const enclosingMark =
        (ancestor as Element).closest?.("mark[data-highlight]") ??
        (ancestor.nodeType === Node.TEXT_NODE
          ? ancestor.parentElement?.closest("mark[data-highlight]")
          : null)

      if (enclosingMark) {
        const parent = enclosingMark.parentNode!
        while (enclosingMark.firstChild)
          parent.insertBefore(enclosingMark.firstChild, enclosingMark)
        parent.removeChild(enclosingMark)
      } else {
        const container =
          ancestor.nodeType === Node.ELEMENT_NODE
            ? (ancestor as Element)
            : ancestor.parentElement!
        const marks = Array.from(
          container.querySelectorAll("mark[data-highlight]")
        )
        for (const mark of marks) {
          if (range.intersectsNode(mark)) {
            const parent = mark.parentNode!
            while (mark.firstChild) parent.insertBefore(mark.firstChild, mark)
            parent.removeChild(mark)
          }
        }
      }

      sel.removeAllRanges()
    } catch {
      // Skip if selection spans complex node boundaries
    }
    dispatch({ type: "HIDE" })
  }

  function handleSearch() {
    if (state.selText && onSearch) {
      onSearch(state.selText)
      window.getSelection()?.removeAllRanges()
      dispatch({ type: "HIDE" })
    }
  }

  const canSearch = onSearch && state.selText.length <= SEARCH_MAX_CHARS

  if (!state.visible) return null

  return (
    <div
      ref={toolbarRef}
      className="fixed z-50"
      style={{
        top: state.position.top,
        left: state.position.left,
        transform: "translate(-50%, -100%)",
      }}
    >
      <div className="flex items-center gap-px rounded-xl border border-border/70 bg-background/95 p-1 shadow-xl shadow-black/10 backdrop-blur-md">
        {/* Copy */}
        <ActionBtn onClick={handleCopy} title={t.toolbar.copy}>
          {state.copied ? (
            <>
              <Check className="size-3.5 text-green-500" />
              <span className="text-green-500">{t.toolbar.copied}</span>
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              <span>{t.toolbar.copy}</span>
            </>
          )}
        </ActionBtn>

        <Divider />

        {/* Highlight color dots */}
        <div className="flex items-center gap-1 px-1.5">
          {HIGHLIGHT_COLORS.map((c) => (
            <button
              key={c.bg}
              type="button"
              onClick={() => applyHighlight(c.bg)}
              title={t.toolbar.colors[c.key]}
              className={cn(
                "size-4.5 rounded-full border border-border/40 transition-all duration-150",
                "hover:scale-125 hover:border-foreground/30"
              )}
              style={{ backgroundColor: c.bg }}
            />
          ))}
        </div>

        {/* Search — only for short selections */}
        {canSearch && (
          <>
            <Divider />
            <ActionBtn onClick={handleSearch} title={t.toolbar.search}>
              <Search className="size-3.5" />
              <span>{t.toolbar.search}</span>
            </ActionBtn>
          </>
        )}

        {/* Remove highlight — only when selection overlaps a mark */}
        {state.isHighlighted && (
          <>
            <Divider />
            <ActionBtn
              onClick={removeHighlight}
              title={t.toolbar.removeHighlight}
            >
              <Eraser className="size-3.5" />
              <span>{t.toolbar.removeHighlight}</span>
            </ActionBtn>
          </>
        )}
      </div>

      {/* Caret pointing down */}
      <div className="pointer-events-none flex justify-center">
        <div className="-mt-[5px] size-[9px] rotate-45 border-r border-b border-border/70 bg-background/95" />
      </div>
    </div>
  )
}

function ActionBtn({
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
      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[0.75rem] font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="mx-0.5 h-4 w-px shrink-0 bg-border/60" />
}

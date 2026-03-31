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

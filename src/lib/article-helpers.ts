export type InfoboxData = Record<string, string>

/** Extract [INFOBOX]...[/INFOBOX] block from content */
export function extractInfobox(raw: string): {
  infobox: InfoboxData | null
  cleanContent: string
} {
  const match = raw.match(/\[INFOBOX\]\n?([\s\S]*?)\[\/INFOBOX\]\n?/)
  if (!match) {
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

/** Extract [RELATED]...[/RELATED] block from content */
export function extractRelated(raw: string): {
  related: string[]
  cleanContent: string
} {
  const match = raw.match(/\[RELATED\]\n?([\s\S]*?)\[\/RELATED\]\n?/)
  if (!match) return { related: [], cleanContent: raw }
  const items = match[1]
    .trim()
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
  return { related: items, cleanContent: raw.replace(match[0], "").trim() }
}

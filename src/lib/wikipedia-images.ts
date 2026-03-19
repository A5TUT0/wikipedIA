export interface ImageResult {
  thumbnail: string
  original: string
  title: string
  source: string
  link: string
}

/**
 * Fetch images from Wikipedia API for a given query.
 * Uses the Wikipedia search + pageimages API (free, no key, CORS-friendly).
 */
export async function fetchImages(
  query: string,
  count: number = 6
): Promise<ImageResult[]> {
  try {
    // Detect language: try Spanish first, fall back to English
    const langs = ["es", "en"]
    const allImages: ImageResult[] = []

    for (const lang of langs) {
      if (allImages.length >= count) break

      const params = new URLSearchParams({
        action: "query",
        generator: "search",
        gsrsearch: query,
        gsrlimit: String(Math.min(count * 2, 20)),
        prop: "pageimages|info",
        piprop: "original|thumbnail",
        pithumbsize: "400",
        inprop: "url",
        format: "json",
        origin: "*",
      })

      const response = await fetch(
        `https://${lang}.wikipedia.org/w/api.php?${params.toString()}`
      )

      if (!response.ok) continue

      const data = await response.json()
      const pages = data.query?.pages

      if (!pages) continue

      for (const page of Object.values(pages) as Record<string, unknown>[]) {
        if (allImages.length >= count) break

        const original = page.original as
          | { source: string; width: number }
          | undefined
        const thumb = page.thumbnail as
          | { source: string; width: number }
          | undefined

        if (original?.source || thumb?.source) {
          allImages.push({
            thumbnail: thumb?.source ?? original!.source,
            original: original?.source ?? thumb!.source,
            title: page.title as string,
            source: `Wikipedia (${lang})`,
            link: (page.fullurl as string) ?? "",
          })
        }
      }
    }

    return allImages
  } catch {
    return []
  }
}

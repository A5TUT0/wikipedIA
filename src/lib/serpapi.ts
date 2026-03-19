const SERPAPI_KEY = import.meta.env.VITE_SERPAPI_KEY as string

export interface ImageResult {
  thumbnail: string
  original: string
  title: string
  source: string
  link: string
}

/**
 * Fetch images from SerpAPI Google Images for a given query.
 * Returns the first `count` image results.
 */
export async function fetchImages(
  query: string,
  count: number = 4
): Promise<ImageResult[]> {
  if (!SERPAPI_KEY || SERPAPI_KEY === "YOUR_SERPAPI_KEY_HERE") {
    return []
  }

  try {
    const params = new URLSearchParams({
      q: query,
      engine: "google_images",
      ijn: "0",
      api_key: SERPAPI_KEY,
    })

    const response = await fetch(
      `https://serpapi.com/search.json?${params.toString()}`
    )

    if (!response.ok) return []

    const data = await response.json()
    const images: ImageResult[] = (data.images_results ?? [])
      .slice(0, count)
      .map(
        (img: {
          thumbnail: string
          original: string
          title: string
          source: string
          link: string
        }) => ({
          thumbnail: img.thumbnail,
          original: img.original,
          title: img.title,
          source: img.source,
          link: img.link,
        })
      )

    return images
  } catch {
    return []
  }
}

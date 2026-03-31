const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY as string
const API_URL = "https://openrouter.ai/api/v1/chat/completions"

export type ArticleMode = "rapido" | "medio" | "extendido"

export const AI_MODELS = [
  {
    id: "nvidia/nemotron-3-super-120b-a12b:free",
    label: "Nemotron",
    logo: "https://cdn.jsdelivr.net/gh/lobehub/lobe-icons/packages/static-png/dark/nvidia-color.png",
    darkLogo: undefined,
    recommended: false,
  },
  {
    id: "z-ai/glm-4.5-air:free",
    label: "GLM 4.5",
    logo: "https://cdn.jsdelivr.net/gh/lobehub/lobe-icons/packages/static-png/dark/zhipu-color.png",
    darkLogo: undefined,
    recommended: false,
  },
  {
    id: "openai/gpt-oss-120b:free",
    label: "ChatGPT",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/ChatGPT-Logo.svg/500px-ChatGPT-Logo.svg.png",
    darkLogo:
      "https://www.edigitalagency.com.au/wp-content/uploads/new-ChatGPT-icon-white-png-large-size.png",
    recommended: true,
  },
  {
    id: "meta-llama/llama-3.2-3b-instruct:free",
    label: "Llama 3.2",
    logo: "https://cdn.jsdelivr.net/gh/lobehub/lobe-icons/packages/static-png/dark/meta-color.png",
    darkLogo: undefined,
    recommended: true,
  },
  {
    id: "stepfun/step-3.5-flash:free",
    label: "StepFun 3.5",
    logo: "https://cdn.jsdelivr.net/gh/lobehub/lobe-icons/packages/static-png/dark/stepfun-color.png",
    darkLogo: undefined,
    recommended: false,
  },
  {
    id: "arcee-ai/trinity-large-preview:free",
    label: "Trinity",
    logo: "https://raw.githubusercontent.com/lobehub/lobe-icons/refs/heads/master/packages/static-png/dark/arcee-color.png",
    darkLogo: undefined,
    recommended: false,
  },
] as const

export type AIModelId = (typeof AI_MODELS)[number]["id"]

const DEFAULT_MODEL: AIModelId = "openai/gpt-oss-120b:free"

const INFOBOX_INSTRUCTION = `
ANTES del artículo, genera un bloque de datos estructurados llamado INFOBOX.
El INFOBOX debe contener entre 4 y 8 campos con datos RELEVANTES para el tema que el usuario solicite.

Formato del bloque:
[INFOBOX]
Clave1: Valor1
Clave2: Valor2
[/INFOBOX]

REGLAS DEL INFOBOX:
- Cada clave debe ser un nombre DESCRIPTIVO y REAL del dato: "Fundación", "País", "Autor", "Año", "Población", "Capital", "Idioma", "Categoría", "Descubridor", "Fórmula", etc.
- NUNCA uses "Campo1", "Campo2", "NombreDescriptivo1", "Clave1" ni ningún nombre genérico o numerado. Usa siempre el nombre real del campo.
- Los campos deben ser los más relevantes para el tema que el usuario busque (fechas, personas, lugares, clasificaciones, datos numéricos clave).
- Ejemplo para "París":
  [INFOBOX]
  País: Francia
  Fundación: Siglo III a.C.
  Población: 2,1 millones (ciudad)
  Superficie: 105 km²
  [/INFOBOX]
- Ejemplo para "Japón":
  [INFOBOX]
  Capital: Tokio
  Población: 125 millones
  Idioma oficial: Japonés
  Moneda: Yen
  [/INFOBOX]
- IMPORTANTE: El INFOBOX debe ser sobre el tema que el usuario busque, NO sobre inteligencia artificial ni sobre los ejemplos anteriores.

Después del bloque INFOBOX, genera el artículo en Markdown sobre el tema solicitado por el usuario.`

const LINKS_INSTRUCTION = `IMÁGENES POR SECCIÓN:
- Al final de CADA sección ## (antes de la siguiente sección), incluye una línea con un marcador de imagen.
- Formato EXACTO: [IMG: término de búsqueda específico para imagen]
- El término debe ser breve (2-4 palabras), visual y descriptivo, ideal para buscar fotos.
- NO uses el mismo término para todas las secciones, cada uno debe ser diferente y específico a esa sección.
- Ejemplo: si el artículo es sobre "Japón" y la sección es "## Geografía", escribe: [IMG: monte fuji paisaje]
- Otro ejemplo: sección "## Historia" → [IMG: castillo japonés antiguo]`

const RELATED_INSTRUCTION = `ARTÍCULOS RELACIONADOS:
- AL FINAL del artículo (después de la última sección), genera un bloque de artículos relacionados.
- Formato EXACTO:
[RELATED]
Término de búsqueda 1
Término de búsqueda 2
Término de búsqueda 3
Término de búsqueda 4
[/RELATED]
- Cada línea debe ser un tema enciclopédico relacionado pero DIFERENTE al artículo actual.
- Los términos deben ser concisos (1-4 palabras), como entradas de una enciclopedia.`

const SAFETY_RULE = `- Si la consulta trata sobre contenido explícito para adultos, pornografía, drogas ilegales, violencia, autolesiones, odio u otros temas inapropiados o dañinos, responde ÚNICAMENTE con el texto: "Este tema no es apropiado para mí y no puedo darte una respuesta." No generes ningún artículo ni información adicional en ese caso.`

const SYSTEM_PROMPTS: Record<ArticleMode, string> = {
  rapido: `Eres WikipedIA, una enciclopedia generada por inteligencia artificial.
Genera una respuesta CORTA y RÁPIDA en Markdown.
${INFOBOX_INSTRUCTION}
REGLAS:
- Usa # para el título principal (solo uno)
- Máximo 2 secciones con ##
- Cada sección: 1 párrafo breve (2-3 oraciones)
- Tono enciclopédico, neutral y formal
- Escribe en el mismo idioma que el usuario
- Usa **negrita** para términos clave
- NO generes "Véase también" ni "Referencias"
- Sé conciso y directo
${LINKS_INSTRUCTION}
${RELATED_INSTRUCTION}
${SAFETY_RULE}`,

  medio: `Eres WikipedIA, una enciclopedia generada por inteligencia artificial.
Genera un artículo enciclopédico de longitud media en Markdown.
${INFOBOX_INSTRUCTION}
REGLAS:
- Usa # para el título principal (solo uno)
- Usa ## para secciones principales (4-5 secciones)
- Usa ### para subsecciones cuando sea necesario
- Cada sección: 1-2 párrafos detallados
- Tono enciclopédico, neutral y formal
- Escribe en el mismo idioma que el usuario
- NO uses listas con viñetas para el contenido principal
- Usa **negrita** para términos importantes
- NO generes "Véase también" ni "Referencias"
${LINKS_INSTRUCTION}
${RELATED_INSTRUCTION}
${SAFETY_RULE}`,

  extendido: `Eres WikipedIA, una enciclopedia generada por inteligencia artificial.
Genera un artículo enciclopédico COMPLETO y EXTENSO en Markdown.
${INFOBOX_INSTRUCTION}
REGLAS ESTRICTAS DE FORMATO:
- Usa # para el título principal (solo uno)
- Usa ## para secciones principales
- Usa ### para subsecciones
- Escribe párrafos largos y detallados con contenido enciclopédico real
- Incluye datos, fechas, nombres y hechos verificables
- El tono debe ser enciclopédico, neutral y formal (estilo Wikipedia)
- Escribe en el mismo idioma que el usuario use en su búsqueda
- NO uses listas con viñetas para el contenido principal, usa párrafos narrativos
- Puedes usar **negrita** para términos importantes
- NO generes "Véase también" ni "Referencias"
- Genera al menos 6-8 secciones ## sustanciales
- Cada sección debe tener al menos 2-3 párrafos detallados
${LINKS_INSTRUCTION}
${RELATED_INSTRUCTION}
${SAFETY_RULE}`,
}

export interface StreamCallbacks {
  onContent: (chunk: string) => void
  onDone: () => void
  onError: (error: string) => void
}

export async function streamArticle(
  query: string,
  mode: ArticleMode,
  callbacks: StreamCallbacks,
  signal?: AbortSignal,
  /** Full language name in Spanish (e.g. "inglés"). Omit to auto-detect from query. */
  langName?: string,
  /** Extra context about the topic to help the AI generate a better article */
  context?: string,
  /** Model ID to use. Defaults to Llama 3.3 70B */
  modelId?: AIModelId
) {
  let systemPrompt = SYSTEM_PROMPTS[mode]
  if (langName) {
    // Replace every "write in the user's language" rule with the explicit language
    systemPrompt = systemPrompt
      .replace(
        "- Escribe en el mismo idioma que el usuario\n",
        `- Escribe SIEMPRE en ${langName}, independientemente del idioma de la consulta\n`
      )
      .replace(
        "- Escribe en el mismo idioma que el usuario use en su búsqueda\n",
        `- Escribe SIEMPRE en ${langName}, independientemente del idioma de la consulta\n`
      )
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: modelId ?? DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: context
            ? `${query}\n\nContexto adicional: ${context}`
            : query,
        },
      ],
      stream: true,
    }),
    signal,
  })

  if (!response.ok) {
    const status = response.status
    if (status === 401 || status === 403) {
      callbacks.onError("ERROR_UNAUTHORIZED")
    } else if (status === 429) {
      callbacks.onError("ERROR_RATE_LIMITED")
    } else if (status === 404) {
      callbacks.onError("ERROR_MODEL_UNAVAILABLE")
    } else if (status >= 500) {
      callbacks.onError("ERROR_SERVER")
    } else {
      callbacks.onError("ERROR_GENERIC")
    }
    return
  }

  const reader = response.body?.getReader()
  if (!reader) {
    callbacks.onError("No se pudo leer la respuesta")
    return
  }

  const decoder = new TextDecoder()
  let buffer = ""

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split("\n")
      buffer = lines.pop() ?? ""

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith("data: ")) continue
        const data = trimmed.slice(6)
        if (data === "[DONE]") {
          callbacks.onDone()
          return
        }

        try {
          const parsed = JSON.parse(data)
          const delta = parsed.choices?.[0]?.delta
          if (!delta) continue

          if (delta.content) {
            callbacks.onContent(delta.content)
          }
        } catch {
          // skip malformed JSON chunks
        }
      }
    }
    callbacks.onDone()
  } catch (err) {
    if ((err as Error).name !== "AbortError") {
      callbacks.onError((err as Error).message)
    }
  }
}

/** Error codes that indicate we should try the next model */
const FALLBACK_ERRORS = new Set([
  "ERROR_RATE_LIMITED",
  "ERROR_UNAUTHORIZED",
  "ERROR_MODEL_UNAVAILABLE",
])

export interface FallbackCallbacks extends StreamCallbacks {
  /** Called when switching to a different model after a failure */
  onModelSwitch: (modelId: AIModelId) => void
}

/**
 * Streams an article with automatic model fallback.
 * Tries the preferred model first, then cycles through remaining models
 * if the error is recoverable (rate limit, auth, model unavailable).
 */
export async function streamArticleWithFallback(
  query: string,
  mode: ArticleMode,
  callbacks: FallbackCallbacks,
  signal?: AbortSignal,
  langName?: string,
  context?: string,
  preferredModelId?: AIModelId
) {
  // Build ordered model list: preferred first, then the rest by priority
  const preferred = preferredModelId ?? DEFAULT_MODEL

  // Custom priority list. Fallback will follow this order.
  const priorityOrder: AIModelId[] = [
    "openai/gpt-oss-120b:free",
    "meta-llama/llama-3.2-3b-instruct:free",
    "stepfun/step-3.5-flash:free",
    "z-ai/glm-4.5-air:free",
    "arcee-ai/trinity-large-preview:free",
    "nvidia/nemotron-3-super-120b-a12b:free",
  ]

  const modelOrder: AIModelId[] = [
    preferred,
    ...priorityOrder.filter((id) => id !== preferred),
  ]

  for (let i = 0; i < modelOrder.length; i++) {
    const modelId = modelOrder[i]

    // If signal already aborted, stop
    if (signal?.aborted) return

    // Notify model switch (skip for the first/preferred model)
    if (i > 0) {
      callbacks.onModelSwitch(modelId)
    }

    // Try this model — wrap callbacks to intercept errors
    let gotFallbackError = false

    await streamArticle(
      query,
      mode,
      {
        onContent: callbacks.onContent,
        onDone: callbacks.onDone,
        onError(err) {
          if (FALLBACK_ERRORS.has(err) && i < modelOrder.length - 1) {
            // Recoverable error and more models to try — flag for fallback
            gotFallbackError = true
          } else {
            // Final model or non-recoverable error — propagate
            callbacks.onError(err)
          }
        },
      },
      signal,
      langName,
      context,
      modelId
    )

    // If we got content or finished without fallback error, we're done
    if (!gotFallbackError) return
  }
}

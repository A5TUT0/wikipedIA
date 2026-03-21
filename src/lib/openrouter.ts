const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY as string
const API_URL = "https://openrouter.ai/api/v1/chat/completions"

export type ArticleMode = "rapido" | "medio" | "extendido"

export const AI_MODELS = [
  {
    id: "meta-llama/llama-3.3-70b-instruct:free",
    label: "Llama 3.3 70B",
    logo: "https://cdn.jsdelivr.net/gh/lobehub/lobe-icons/packages/static-png/dark/meta-color.png",
  },
  {
    id: "nvidia/nemotron-3-super-120b-a12b:free",
    label: "Nemotron 120B",
    logo: "https://cdn.jsdelivr.net/gh/lobehub/lobe-icons/packages/static-png/dark/nvidia-color.png",
  },
  {
    id: "z-ai/glm-4.5-air:free",
    label: "GLM 4.5 Air",
    logo: "https://cdn.jsdelivr.net/gh/lobehub/lobe-icons/packages/static-png/dark/zhipu-color.png",
  },
  {
    id: "openai/gpt-oss-120b:free",
    label: "GPT OSS 120B",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/ChatGPT-Logo.svg/500px-ChatGPT-Logo.svg.png",
  },
  {
    id: "google/gemma-3-27b-it:free",
    label: "Gemma 3 27B",
    logo: "https://cdn.jsdelivr.net/gh/lobehub/lobe-icons/packages/static-png/dark/google-color.png",
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
${SAFETY_RULE}`,
}

export interface StreamCallbacks {
  onReasoning: (chunk: string) => void
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
      reasoning: { enabled: true },
      stream: true,
    }),
    signal,
  })

  if (!response.ok) {
    callbacks.onError(`Error ${response.status}: ${response.statusText}`)
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

          if (delta.reasoning) {
            callbacks.onReasoning(delta.reasoning)
          }
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

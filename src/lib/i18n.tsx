import { createContext, useContext, useState, type ReactNode } from "react"

// ── Locale types ──────────────────────────────────────────────────────────────
export const UI_LOCALES = ["es", "en"] as const
export type UiLocale = (typeof UI_LOCALES)[number]

export const AI_LANG_CODES = [
  "auto",
  "es",
  "en",
  "fr",
  "pt",
  "de",
  "it",
  "ja",
  "zh",
  "ar",
  "ru",
] as const
export type AiLang = (typeof AI_LANG_CODES)[number]

/** Full language name in Spanish — used to override the AI system prompt */
export const AI_LANG_NAMES: Record<Exclude<AiLang, "auto">, string> = {
  es: "español",
  en: "inglés",
  fr: "francés",
  pt: "portugués",
  de: "alemán",
  it: "italiano",
  ja: "japonés",
  zh: "chino",
  ar: "árabe",
  ru: "ruso",
}

// ── Translations ──────────────────────────────────────────────────────────────
const translations = {
  es: {
    landing: {
      subtitle: "La enciclopedia libre generada por inteligencia artificial",
      modes: {
        rapido: { label: "Rápido", desc: "Breve y directo" },
        medio: { label: "Medio", desc: "Con buen detalle" },
        extendido: { label: "Extendido", desc: "Estilo Wikipedia completo" },
      },
      searchPlaceholder: "Buscar cualquier tema...",
      searchButton: "Buscar",
      recents: "Recientes",
      suggestions: "Sugerencias",
      suggestionItems: [
        {
          label: "Midudev",
          query: "Midudev",
          context:
            "Miguel Ángel Durán García, conocido como Midudev, es un programador y creador de contenido español especializado en desarrollo web. Es reconocido por su contenido educativo sobre JavaScript, React y tecnologías frontend.",
        },
        {
          label: "CubePath",
          query: "CubePath",
          context:
            "CubePath es una empresa de infraestructura de servidores y hosting de próxima generación. Ofrece servidores dedicados con despliegue instantáneo, Cloud VPS, Cloud Gateway (conectividad con AWS, Google Cloud, Azure), y protección DDoS de grado empresarial. Garantiza 99.99% de uptime, soporte 24/7 y red AnyCast de baja latencia. Opera en centros de datos tier-3 en 5 ubicaciones estratégicas: Barcelona, Ámsterdam, Houston, Miami y Virginia. Tiene un panel de control en my.cubepath.com y una API REST junto con CubeCLI para automatización. Sus partners tecnológicos incluyen AMD, Samsung, Arista, Nutanix y VMware. También cuenta con un marketplace y su producto más reciente es OpenClaw. Sitio web: https://cubepath.com/",
        },
        { label: "Inteligencia Artificial", query: "Inteligencia Artificial" },
        {
          label: "Vite",
          query: "Vite",
          context:
            "Vite es una herramienta de construcción (build tool) para proyectos web frontend, creada por Evan You, el creador de Vue.js.",
        },
        {
          label: "React",
          query: "React",
          context:
            "React es una biblioteca de JavaScript para construir interfaces de usuario, desarrollada por Meta (Facebook).",
        },
        {
          label: "TypeScript",
          query: "TypeScript",
          context:
            "TypeScript es un lenguaje de programación desarrollado por Microsoft que extiende JavaScript con tipos estáticos.",
        },
      ],
      removeRecent: (q: string) => `Eliminar ${q} de recientes`,
    },
    header: {
      searchPlaceholder: "Buscar en WikipedIA…",
      openMenu: "Abrir menú",
      backToHome: "Volver al inicio",
      toggleTheme: "Cambiar tema",
      settings: "Configuración",
    },
    article: {
      aiThinking: "Pensamiento de la IA",
      generating: "Generando...",
      words: "palabras",
      readingTime: "min de lectura",
      errorTitle: "Error al generar el artículo",
      errorRetry: "Intentar de nuevo",
      copy: "Copiar",
      copied: "Copiado",
      share: "Compartir",
      shared: "¡Enlace copiado!",
      download: "Descargar",
      expandImage: "Ver imagen",
    },
    loading: {
      didYouKnow: "¿Sabías que...?",
      messages: [
        "Consultando la enciclopedia...",
        "Organizando el conocimiento...",
        "Redactando el artículo...",
        "Añadiendo detalles...",
        "Casi listo...",
      ],
      facts: [
        "El cerebro humano tiene ~86 mil millones de neuronas, cada una puede conectarse con hasta 10,000 otras.",
        "La Gran Muralla China no es visible desde el espacio a simple vista — es un mito popular persistente.",
        "Los pulpos tienen tres corazones, sangre azul y nueve cerebros: uno central y uno en cada tentáculo.",
        "Cleopatra vivió más cerca en el tiempo de la Torre Eiffel que de la construcción de las pirámides de Giza.",
        "El primer sitio web del mundo sigue en línea, creado por Tim Berners-Lee en 1991.",
        "Los árboles se comunican entre sí a través de redes de hongos subterráneos llamadas 'red de madera'.",
        "El ADN de todos los humanos vivos es 99,9% idéntico entre sí.",
        "El universo observable tiene unos 93 mil millones de años luz de diámetro.",
      ],
    },
    app: {
      navigation: "Navegación",
      backToTop: "Volver arriba",
    },
    toolbar: {
      copy: "Copiar",
      copied: "Copiado",
      search: "Buscar",
      removeHighlight: "Quitar",
      colors: {
        yellow: "Amarillo",
        green: "Verde",
        blue: "Azul",
        pink: "Rosa",
        orange: "Naranja",
      },
    },
    footer: {
      disclaimerPre: "El contenido de",
      disclaimerPost:
        "es generado por IA y puede contener inexactitudes. Verifica siempre con fuentes confiables.",
      hosting: "Hosting por",
    },
    settings: {
      uiLanguage: "Idioma de la interfaz",
      aiLanguage: "Idioma de respuesta de la IA",
      aiLangs: {
        auto: "Automático",
        es: "Español",
        en: "Inglés",
        fr: "Francés",
        pt: "Portugués",
        de: "Alemán",
        it: "Italiano",
        ja: "Japonés",
        zh: "Chino",
        ar: "Árabe",
        ru: "Ruso",
      },
    },
  },
  en: {
    landing: {
      subtitle: "The free encyclopedia generated by artificial intelligence",
      modes: {
        rapido: { label: "Quick", desc: "Brief and direct" },
        medio: { label: "Medium", desc: "Good amount of detail" },
        extendido: { label: "Extended", desc: "Full Wikipedia style" },
      },
      searchPlaceholder: "Search any topic...",
      searchButton: "Search",
      recents: "Recent",
      suggestions: "Suggestions",
      suggestionItems: [
        {
          label: "Midudev",
          query: "Midudev",
          context:
            "Miguel Ángel Durán García, known as Midudev, is a Spanish programmer and content creator specializing in web development. He is known for educational content about JavaScript, React and frontend technologies.",
        },
        {
          label: "CubePath",
          query: "CubePath",
          context:
            "CubePath is a next-generation server infrastructure and hosting company. They offer dedicated servers with instant deploy, Cloud VPS, Cloud Gateway (connectivity to AWS, Google Cloud, Azure), and enterprise-grade DDoS protection. They guarantee 99.99% uptime, 24/7 expert support, and an AnyCast low-latency network. They own and operate servers in tier-3 datacenters across 5 strategic locations: Barcelona, Amsterdam, Houston, Miami, and Virginia. They provide a control panel at my.cubepath.com and a REST API along with CubeCLI for infrastructure automation. Technology partners include AMD, Samsung, Arista, Nutanix, and VMware. They also have a marketplace and their newest product is OpenClaw. Website: https://cubepath.com/",
        },
        { label: "Artificial Intelligence", query: "Artificial Intelligence" },
        {
          label: "Vite",
          query: "Vite",
          context:
            "Vite is a frontend web build tool created by Evan You, the creator of Vue.js.",
        },
        {
          label: "React",
          query: "React",
          context:
            "React is a JavaScript library for building user interfaces, developed by Meta (Facebook).",
        },
        {
          label: "TypeScript",
          query: "TypeScript",
          context:
            "TypeScript is a programming language developed by Microsoft that extends JavaScript with static types.",
        },
      ],
      removeRecent: (q: string) => `Remove ${q} from recent`,
    },
    header: {
      searchPlaceholder: "Search WikipedIA…",
      openMenu: "Open menu",
      backToHome: "Back to home",
      toggleTheme: "Toggle theme",
      settings: "Settings",
    },
    article: {
      aiThinking: "AI Thinking",
      generating: "Generating...",
      words: "words",
      readingTime: "min read",
      errorTitle: "Error generating the article",
      errorRetry: "Try again",
      copy: "Copy",
      copied: "Copied",
      share: "Share",
      shared: "Link copied!",
      download: "Download",
      expandImage: "View image",
    },
    loading: {
      didYouKnow: "Did you know...?",
      messages: [
        "Consulting the encyclopedia...",
        "Organizing knowledge...",
        "Writing the article...",
        "Adding details...",
        "Almost ready...",
      ],
      facts: [
        "The human brain has ~86 billion neurons, each capable of connecting to up to 10,000 others.",
        "The Great Wall of China is NOT visible from space with the naked eye — it's a persistent myth.",
        "Octopuses have three hearts, blue blood, and nine brains: one central and one in each tentacle.",
        "Cleopatra lived closer in time to the Eiffel Tower than to the building of the Great Pyramids.",
        "The world's first website is still online, created by Tim Berners-Lee in 1991.",
        "Trees communicate with each other through underground fungal networks called the 'Wood Wide Web'.",
        "The DNA of all living humans is 99.9% identical to each other.",
        "The observable universe is about 93 billion light-years in diameter.",
      ],
    },
    app: {
      navigation: "Navigation",
      backToTop: "Back to top",
    },
    toolbar: {
      copy: "Copy",
      copied: "Copied",
      search: "Search",
      removeHighlight: "Remove",
      colors: {
        yellow: "Yellow",
        green: "Green",
        blue: "Blue",
        pink: "Pink",
        orange: "Orange",
      },
    },
    footer: {
      disclaimerPre: "The content of",
      disclaimerPost:
        "is AI-generated and may contain inaccuracies. Always verify with reliable sources.",
      hosting: "Hosted by",
    },
    settings: {
      uiLanguage: "Interface language",
      aiLanguage: "AI response language",
      aiLangs: {
        auto: "Automatic",
        es: "Spanish",
        en: "English",
        fr: "French",
        pt: "Portuguese",
        de: "German",
        it: "Italian",
        ja: "Japanese",
        zh: "Chinese",
        ar: "Arabic",
        ru: "Russian",
      },
    },
  },
} as const

type Translations = typeof translations

// ── Context ───────────────────────────────────────────────────────────────────
interface I18nContextValue {
  uiLocale: UiLocale
  setUiLocale: (l: UiLocale) => void
  aiLang: AiLang
  setAiLang: (l: AiLang) => void
  t: Translations[UiLocale]
}

const I18nCtx = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [uiLocale, setUiLocaleState] = useState<UiLocale>(() => {
    const stored = localStorage.getItem("wikia-ui-lang")
    return (UI_LOCALES as readonly string[]).includes(stored ?? "")
      ? (stored as UiLocale)
      : "es"
  })

  const [aiLang, setAiLangState] = useState<AiLang>(() => {
    const stored = localStorage.getItem("wikia-ai-lang")
    return (AI_LANG_CODES as readonly string[]).includes(stored ?? "")
      ? (stored as AiLang)
      : "auto"
  })

  function setUiLocale(l: UiLocale) {
    localStorage.setItem("wikia-ui-lang", l)
    setUiLocaleState(l)
  }

  function setAiLang(l: AiLang) {
    localStorage.setItem("wikia-ai-lang", l)
    setAiLangState(l)
  }

  return (
    <I18nCtx.Provider
      value={{
        uiLocale,
        setUiLocale,
        aiLang,
        setAiLang,
        t: translations[uiLocale],
      }}
    >
      {children}
    </I18nCtx.Provider>
  )
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nCtx)
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>")
  return ctx
}

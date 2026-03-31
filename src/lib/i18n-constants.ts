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
export const translations = {
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
      recommended: "Recomendado",
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
      shared: "Compartido",
      download: "Descargar Markdown",
      downloaded: "Descargado",
      lastUpdated: "Actualizado",
      thinking: "Razonando",
      source: "Fuente",
      related: "Artículos relacionados",
      suggestMore: "Sugerir más temas",
    },
    errors: {
      unauthorized: "Clave de API no válida o expirada",
      rateLimited: "Límite de peticiones alcanzado",
      modelUnavailable: "El modelo de IA no está disponible",
      serverError: "Error en el servidor de OpenRouter",
      generic: "Ocurrió un error inesperado",
      tryOtherModel: "Intentar con otra IA:",
      retryWith: "Intentar con",
      allExhausted: "Todos los modelos están temporalmente agotados",
      allExhaustedHint: "Los modelos gratuitos tienen límites de uso. Espera unos minutos e intenta de nuevo.",
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
        "Las abejas pueden reconocer rostros humanos y comunicarse mediante una 'danza' de movimientos.",
        "El monte Everest crece unos 4 milímetros cada año debido al movimiento de las placas tectónicas.",
        "Existen más de 200 millones de insectos por cada ser humano en el planeta Tierra.",
        "El corazón del colibrí late hasta 1,200 veces por minuto durante el vuelo.",
        "Los tiburones han existido en la Tierra por más de 400 millones de años, incluso antes que los árboles.",
        "La Antártida es técnicamente el desierto más grande del mundo debido a sus bajas precipitaciones.",
        "Un solo rayo contiene suficiente energía para tostar 100,000 rebanadas de pan.",
        "Las medusas no tienen corazón, cerebro, pulmones ni branquias; absorben oxígeno a través de su piel.",
        "El nombre oficial de Bangkok tiene 168 letras, siendo el nombre de lugar más largo del mundo.",
        "El ojo del avestruz es más grande que su cerebro.",
        "Los wombats producen heces en forma de cubo para evitar que rueden y marcar su territorio.",
        "En Saturno y Júpiter llueven diamantes debido a la presión atmosférica extrema.",
      ],
    },
    toc: {
      title: "Contenidos",
    },
    app: {
      navigation: "Navegación",
      backToTop: "Volver arriba",
    },
    footer: {
      tagline: "El conocimiento del mundo, resumido por IA",
      github: "Código fuente en GitHub",
      privacy: "Privacidad",
      terms: "Términos",
    },
    toast: {
      copied: "Copiado al portapapeles",
      linkCopied: "Enlace copiado al portapapeles",
      downloaded: "Artículo descargado",
    },
  },
  en: {
    landing: {
      subtitle: "The free encyclopedia generated by artificial intelligence",
      modes: {
        rapido: { label: "Fast", desc: "Brief and direct" },
        medio: { label: "Medium", desc: "With good detail" },
        extendido: { label: "Extended", desc: "Full Wikipedia style" },
      },
      searchPlaceholder: "Search any topic...",
      searchButton: "Search",
      recents: "Recents",
      recommended: "Recommended",
      suggestions: "Suggestions",
      suggestionItems: [
        { label: "Artificial Intelligence", query: "Artificial Intelligence" },
        {
          label: "Vite",
          query: "Vite",
          context:
            "Vite is a build tool for modern web projects, created by Evan You.",
        },
        {
          label: "React",
          query: "React",
          context:
            "React is a JavaScript library for building user interfaces, developed by Meta.",
        },
        {
          label: "TypeScript",
          query: "TypeScript",
          context:
            "TypeScript is a programming language developed by Microsoft that builds on JavaScript by adding static types.",
        },
      ],
      removeRecent: (q: string) => `Remove ${q} from recents`,
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
      errorTitle: "Error generating article",
      errorRetry: "Try again",
      copy: "Copy",
      copied: "Copied",
      share: "Share",
      shared: "Shared",
      download: "Download Markdown",
      downloaded: "Downloaded",
      lastUpdated: "Updated",
      thinking: "Reasoning",
      source: "Source",
      related: "Related articles",
      suggestMore: "Suggest more topics",
    },
    errors: {
      unauthorized: "Invalid or expired API key",
      rateLimited: "Rate limit reached",
      modelUnavailable: "AI model is unavailable",
      serverError: "OpenRouter server error",
      generic: "An unexpected error occurred",
      tryOtherModel: "Try with another AI:",
      retryWith: "Retry with",
      allExhausted: "All models are temporarily exhausted",
      allExhaustedHint: "Free models have usage limits. Wait a few minutes and try again.",
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
        "Honeybees can recognize human faces and communicate using a 'waggle dance'.",
        "Mount Everest grows about 4 millimeters every year due to tectonic plate movement.",
        "There are over 200 million insects for every human being on planet Earth.",
        "A hummingbird's heart beats up to 1,200 times per minute during flight.",
        "Sharks have existed on Earth for over 400 million years, even longer than trees.",
        "Antarctica is technically the largest desert in the world due to its low precipitation.",
        "A single lightning bolt contains enough energy to toast 100,000 slices of bread.",
        "Jellyfish have no heart, brain, lungs, or gills; they absorb oxygen through their skin.",
        "The official name of Bangkok has 168 letters, making it the longest place name in the world.",
        "An ostrich's eye is bigger than its brain.",
        "Wombats produce cube-shaped poop to keep it from rolling away and to mark their territory.",
        "On Saturn and Jupiter, it rains diamonds due to extreme atmospheric pressure.",
      ],
    },
    toc: {
      title: "Contents",
    },
    app: {
      navigation: "Navigation",
      backToTop: "Back to top",
    },
    footer: {
      tagline: "World knowledge, summarized by AI",
      github: "Source code on GitHub",
      privacy: "Privacy",
      terms: "Terms",
    },
    toast: {
      copied: "Copied to clipboard",
      linkCopied: "Link copied to clipboard",
      downloaded: "Article downloaded",
    },
  },
} as const

export type Translations = typeof translations

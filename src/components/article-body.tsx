import { useEffect, useState } from "react"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

interface ArticleSection {
  id: string
  title: string
  content: string
  subsections?: { id: string; title: string; content: string }[]
}

const articleSections: Record<string, ArticleSection[]> = {
  academico: [
    {
      id: "intro",
      title: "",
      content:
        "La inteligencia artificial (IA) es un campo multidisciplinario de las ciencias de la computación que se enfoca en la creación de sistemas capaces de realizar tareas que normalmente requieren inteligencia humana. Estas tareas incluyen el aprendizaje automático, el razonamiento lógico, la percepción visual, el procesamiento del lenguaje natural y la toma de decisiones autónoma. El término fue acuñado formalmente en 1956 durante la Conferencia de Dartmouth, organizada por John McCarthy, Marvin Minsky, Nathaniel Rochester y Claude Shannon.",
    },
    {
      id: "historia",
      title: "Historia",
      content:
        "El concepto de máquinas inteligentes tiene raíces profundas en la historia de la humanidad, desde los autómatas de la antigua Grecia hasta los trabajos teóricos de Alan Turing en el siglo XX. Sin embargo, la IA como disciplina científica formal nació en la década de 1950.",
      subsections: [
        {
          id: "origenes",
          title: "Orígenes",
          content:
            "En 1950, Alan Turing publicó su seminal artículo «Computing Machinery and Intelligence», donde propuso lo que hoy se conoce como el Test de Turing: un criterio para evaluar si una máquina puede exhibir un comportamiento inteligente equivalente o indistinguible del de un ser humano. Este trabajo sentó las bases epistemológicas para el campo. La Conferencia de Dartmouth de 1956, frecuentemente citada como el evento fundacional de la IA, reunió a investigadores que compartían la visión de que «cada aspecto del aprendizaje o cualquier otra característica de la inteligencia puede, en principio, ser descrita con tal precisión que se pueda construir una máquina para simularla».",
        },
        {
          id: "desarrollo",
          title: "Desarrollo moderno",
          content:
            "El desarrollo de la IA moderna se ha caracterizado por ciclos de optimismo y desilusión, conocidos coloquialmente como «inviernos de la IA». El período comprendido entre 2010 y el presente ha sido testigo de avances sin precedentes, impulsados principalmente por tres factores convergentes: la disponibilidad masiva de datos digitales, el incremento exponencial en la capacidad de cómputo (particularmente GPUs), y los avances algorítmicos en aprendizaje profundo (deep learning). La arquitectura Transformer, introducida en 2017 por Vaswani et al., revolucionó el procesamiento del lenguaje natural y dio origen a los modelos de lenguaje de gran escala (LLMs) como GPT, LLaMA y Claude.",
        },
      ],
    },
    {
      id: "funcionamiento",
      title: "Funcionamiento",
      content:
        "Los sistemas de IA contemporáneos se basan predominantemente en el paradigma del aprendizaje automático (machine learning), donde los algoritmos aprenden patrones a partir de datos en lugar de seguir instrucciones explícitamente programadas.",
      subsections: [
        {
          id: "arquitectura",
          title: "Arquitectura",
          content:
            "Las redes neuronales artificiales constituyen la arquitectura predominante en la IA moderna. Inspiradas vagamente en la estructura neuronal biológica, estas redes consisten en capas de nodos interconectados que procesan información mediante funciones de activación no lineales. Las arquitecturas más relevantes incluyen: redes neuronales convolucionales (CNN) para visión artificial, redes recurrentes (RNN/LSTM) para datos secuenciales, y transformers para procesamiento de lenguaje natural. La arquitectura Transformer, basada en el mecanismo de atención (self-attention), ha demostrado ser particularmente efectiva, permitiendo el procesamiento paralelo de secuencias y capturando dependencias de largo alcance.",
        },
        {
          id: "entrenamiento",
          title: "Entrenamiento",
          content:
            "El proceso de entrenamiento de modelos de IA implica la optimización iterativa de millones (o miles de millones) de parámetros mediante el descenso de gradiente estocástico y sus variantes. El entrenamiento de modelos de gran escala requiere infraestructura computacional significativa: los modelos de lenguaje más grandes se entrenan en clústeres de miles de GPUs durante semanas o meses. Las técnicas modernas incluyen pre-entrenamiento no supervisado sobre grandes corpus de texto, seguido de ajuste fino (fine-tuning) supervisado y aprendizaje por refuerzo con retroalimentación humana (RLHF).",
        },
      ],
    },
    {
      id: "aplicaciones",
      title: "Aplicaciones",
      content:
        "La IA tiene aplicaciones transformadoras en múltiples sectores: en medicina, los sistemas de IA asisten en el diagnóstico por imagen y el descubrimiento de fármacos; en transporte, impulsa el desarrollo de vehículos autónomos; en finanzas, optimiza la detección de fraude y el trading algorítmico; en educación, personaliza las experiencias de aprendizaje; en ciencia, acelera el descubrimiento mediante la simulación molecular y el análisis de datos astronómicos. Los asistentes virtuales basados en LLMs representan una de las aplicaciones más visibles, democratizando el acceso a capacidades de procesamiento de lenguaje natural avanzado.",
    },
    {
      id: "etica",
      title: "Ética y controversias",
      content:
        "El desarrollo acelerado de la IA ha suscitado debates éticos fundamentales. Los sesgos algorítmicos, heredados de los datos de entrenamiento, pueden perpetuar y amplificar discriminaciones existentes. La opacidad de los modelos de aprendizaje profundo (el problema de la «caja negra») dificulta la rendición de cuentas. La automatización amenaza con desplazar empleos en sectores como manufactura, transporte y servicios. Además, el riesgo existencial asociado al desarrollo de una inteligencia artificial general (AGI) ha motivado iniciativas regulatorias globales, como la AI Act de la Unión Europea (2024) y los Executive Orders de Estados Unidos. Investigadores prominentes, como Stuart Russell y Yoshua Bengio, abogan por un enfoque de «IA alineada» que garantice que estos sistemas operen de manera consistente con los valores humanos.",
    },
    {
      id: "futuro",
      title: "Futuro",
      content:
        "Las perspectivas futuras de la IA incluyen avances hacia la inteligencia artificial general, la integración multimodal (texto, imagen, audio, video), la mejora de la eficiencia energética del entrenamiento, y el desarrollo de marcos regulatorios internacionales. La investigación en IA neurosimbólica busca combinar la capacidad de aprendizaje de las redes neuronales con el razonamiento lógico de los sistemas simbólicos. Los agentes autónomos, capaces de planificar y ejecutar tareas complejas de forma independiente, representan el siguiente horizonte de desarrollo.",
    },
    {
      id: "vease",
      title: "Véase también",
      content: "",
    },
    {
      id: "referencias",
      title: "Referencias",
      content: "",
    },
  ],
  simple: [
    {
      id: "intro",
      title: "",
      content:
        "La inteligencia artificial (IA) es cuando las computadoras pueden hacer cosas que normalmente necesitan un cerebro humano para hacerlas. Por ejemplo: entender lo que dices, reconocer fotos, o aprender de sus errores.",
    },
    {
      id: "historia",
      title: "Historia",
      content:
        "Hace mucho tiempo, la gente soñaba con crear máquinas que pudieran pensar. En 1950, un señor muy listo llamado Alan Turing preguntó: «¿Pueden pensar las máquinas?». Después, en 1956, un grupo de científicos se reunió y dijeron: «Vamos a intentar hacer que las computadoras sean inteligentes». ¡Y así empezó todo!",
      subsections: [
        {
          id: "origenes",
          title: "Orígenes",
          content:
            "Imagina que tienes un robot amigo. En los años 50, los científicos empezaron a soñar con crear ese robot amigo. Alan Turing inventó un juego: si hablas con una computadora y no puedes distinguirla de una persona real, entonces la computadora es «inteligente».",
        },
        {
          id: "desarrollo",
          title: "Desarrollo moderno",
          content:
            "Durante muchos años, la IA avanzaba lento. Pero alrededor de 2010, pasaron tres cosas geniales al mismo tiempo: 1) Había MUCHÍSIMA información en internet para que las computadoras aprendieran, 2) Las computadoras se volvieron súper rápidas, y 3) Los científicos descubrieron nuevas formas de enseñarles. ¡Fue como darle superpoderes a las computadoras!",
        },
      ],
    },
    {
      id: "funcionamiento",
      title: "¿Cómo funciona?",
      content:
        "Las computadoras con IA aprenden parecido a como aprendes tú: viendo muchos ejemplos. Si le muestras miles de fotos de gatos, aprende a reconocer gatos. Si le das muchos textos, aprende a escribir.",
      subsections: [
        {
          id: "arquitectura",
          title: "¿Cómo está construida?",
          content:
            "Imagina una red enorme de puntitos conectados, como una telaraña gigante. Cada puntito toma decisiones simples, pero cuando trabajan todos juntos, pueden hacer cosas increíbles. Eso es básicamente una «red neuronal», la pieza principal de la IA moderna.",
        },
        {
          id: "entrenamiento",
          title: "¿Cómo aprende?",
          content:
            "Para enseñarle a una IA, le das muchos ejemplos y le dices «correcto» o «incorrecto», como cuando un profesor te corrige. La IA va ajustando sus respuestas hasta que acierta cada vez más. Los modelos más grandes de hoy necesitan computadoras enormes trabajando durante semanas para aprender.",
        },
      ],
    },
    {
      id: "aplicaciones",
      title: "¿Para qué se usa?",
      content:
        "La IA está en todas partes: en tu teléfono cuando usas el asistente de voz, en Netflix cuando te recomienda películas, en los filtros de fotos, en los doctores que la usan para detectar enfermedades, y en los coches que pueden conducir solos. ¡Incluso este texto lo podría escribir una IA!",
    },
    {
      id: "etica",
      title: "¿Es siempre buena?",
      content:
        "No siempre. A veces la IA comete errores o puede ser injusta si aprendió de datos con prejuicios. Es importante que los adultos creen reglas para que la IA se use de manera responsable y ayude a todos por igual. Muchas personas inteligentes están trabajando para que la IA sea segura y justa.",
    },
    {
      id: "futuro",
      title: "¿Qué viene después?",
      content:
        "En el futuro, la IA será aún más lista. Podrá ayudarnos a curar enfermedades, cuidar el planeta, y hacer cosas que hoy ni nos imaginamos. Lo importante es que los humanos sigamos decidiendo cómo usarla.",
    },
    {
      id: "vease",
      title: "Véase también",
      content: "",
    },
    {
      id: "referencias",
      title: "Referencias",
      content: "",
    },
  ],
  resumen: [
    {
      id: "intro",
      title: "",
      content:
        "La inteligencia artificial (IA) es una disciplina de las ciencias de la computación dedicada a crear sistemas que emulan la inteligencia humana. Surgida formalmente en 1956, ha experimentado un crecimiento explosivo desde 2010 gracias al big data, la capacidad computacional y los avances en deep learning.",
    },
    {
      id: "historia",
      title: "Historia",
      content:
        "Desde el Test de Turing (1950) hasta la arquitectura Transformer (2017), la IA ha pasado por períodos de auge y estancamiento. La era actual está definida por los modelos de lenguaje de gran escala (LLMs) y el aprendizaje profundo.",
      subsections: [],
    },
    {
      id: "funcionamiento",
      title: "Funcionamiento",
      content:
        "Los sistemas de IA modernos usan redes neuronales entrenadas con grandes volúmenes de datos. La arquitectura Transformer y técnicas como RLHF son clave en los modelos actuales.",
      subsections: [],
    },
    {
      id: "aplicaciones",
      title: "Aplicaciones",
      content:
        "Medicina, transporte autónomo, finanzas, educación, investigación científica y asistentes virtuales son los principales campos de aplicación.",
    },
    {
      id: "etica",
      title: "Ética",
      content:
        "Los principales desafíos éticos incluyen sesgos algorítmicos, falta de transparencia, desplazamiento laboral y riesgos existenciales. La regulación internacional avanza con la AI Act europea.",
    },
    {
      id: "futuro",
      title: "Futuro",
      content:
        "AGI, integración multimodal, eficiencia energética, regulación global y agentes autónomos marcan las líneas de investigación futuras.",
    },
    {
      id: "vease",
      title: "Véase también",
      content: "",
    },
    {
      id: "referencias",
      title: "Referencias",
      content: "",
    },
  ],
}

const seeAlsoLinks = [
  "Machine Learning",
  "Deep Learning",
  "Procesamiento del Lenguaje Natural",
  "Redes Neuronales Artificiales",
  "Test de Turing",
  "Singularidad Tecnológica",
]

const references = [
  'Turing, A. M. (1950). "Computing Machinery and Intelligence". Mind, 59(236), 433-460.',
  'McCarthy, J. et al. (1956). "A Proposal for the Dartmouth Summer Research Project on Artificial Intelligence".',
  'Vaswani, A. et al. (2017). "Attention Is All You Need". NeurIPS.',
  "Russell, S. & Norvig, P. (2021). Artificial Intelligence: A Modern Approach. 4th ed.",
  "Unión Europea. (2024). Artificial Intelligence Act. Reglamento (UE) 2024/1689.",
]

interface ArticleBodyProps {
  complexity: string
  isStreaming: boolean
}

function StreamingText({
  text,
  isStreaming,
  isLast,
}: {
  text: string
  isStreaming: boolean
  isLast: boolean
}) {
  const [displayedText, setDisplayedText] = useState("")
  const [isDone, setIsDone] = useState(!isStreaming)

  useEffect(() => {
    if (!isStreaming) {
      setDisplayedText(text)
      setIsDone(true)
      return
    }

    setDisplayedText("")
    setIsDone(false)
    let index = 0

    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1))
        index++
      } else {
        setIsDone(true)
        clearInterval(interval)
      }
    }, 8)

    return () => clearInterval(interval)
  }, [text, isStreaming])

  return (
    <span>
      {displayedText}
      {isStreaming && !isDone && isLast && (
        <span className="streaming-cursor" />
      )}
    </span>
  )
}

export function ArticleBody({ complexity, isStreaming }: ArticleBodyProps) {
  const sections = articleSections[complexity] ?? articleSections.academico

  if (isStreaming) {
    return (
      <article className="flex flex-col gap-6">
        <div>
          <h1 className="font-serif text-3xl leading-tight font-bold md:text-4xl">
            Inteligencia Artificial
          </h1>
          <Separator className="mt-3" />
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[90%]" />
          <Skeleton className="h-4 w-[95%]" />
          <Skeleton className="h-4 w-[80%]" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[70%]" />
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[85%]" />
          <Skeleton className="h-4 w-[92%]" />
        </div>
      </article>
    )
  }

  return (
    <article className="flex flex-col gap-6">
      {/* Title */}
      <div>
        <h1
          className="font-serif text-3xl leading-tight font-bold md:text-4xl"
          id="top"
        >
          Inteligencia Artificial
        </h1>
        <Separator className="mt-3" />
      </div>

      {/* Article content */}
      {sections.map((section, sIdx) => (
        <section key={section.id} id={section.id}>
          {section.title && (
            <>
              <h2 className="mb-2 font-serif text-2xl font-semibold">
                {section.title}
              </h2>
              <Separator className="mb-3" />
            </>
          )}

          {section.content && (
            <p className="font-serif text-base leading-relaxed">
              <StreamingText
                text={section.content}
                isStreaming={false}
                isLast={
                  sIdx === sections.length - 1 && !section.subsections?.length
                }
              />
            </p>
          )}

          {section.id === "vease" && (
            <ul className="mt-2 flex flex-col gap-1 font-serif text-base">
              {seeAlsoLinks.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-wiki-link hover:text-wiki-link-hover hover:underline"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          )}

          {section.id === "referencias" && (
            <ol className="mt-2 flex flex-col gap-2 font-serif text-sm text-muted-foreground">
              {references.map((ref, i) => (
                <li key={i} className="flex gap-2">
                  <span className="shrink-0 text-wiki-link">[{i + 1}]</span>
                  {ref}
                </li>
              ))}
            </ol>
          )}

          {section.subsections?.map((sub, subIdx) => (
            <div key={sub.id} id={sub.id} className="mt-4">
              <h3 className="mb-1.5 font-serif text-xl font-medium">
                {sub.title}
              </h3>
              <p className="font-serif text-base leading-relaxed">
                <StreamingText
                  text={sub.content}
                  isStreaming={false}
                  isLast={
                    sIdx === sections.length - 1 &&
                    subIdx === (section.subsections?.length ?? 0) - 1
                  }
                />
              </p>
            </div>
          ))}
        </section>
      ))}
    </article>
  )
}

import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface TocItem {
  id: string
  title: string
  level: number
}

const tocItems: TocItem[] = [
  { id: "intro", title: "Introducción", level: 1 },
  { id: "historia", title: "Historia", level: 1 },
  { id: "origenes", title: "Orígenes", level: 2 },
  { id: "desarrollo", title: "Desarrollo moderno", level: 2 },
  { id: "funcionamiento", title: "Funcionamiento", level: 1 },
  { id: "arquitectura", title: "Arquitectura", level: 2 },
  { id: "entrenamiento", title: "Entrenamiento", level: 2 },
  { id: "aplicaciones", title: "Aplicaciones", level: 1 },
  { id: "etica", title: "Ética y controversias", level: 1 },
  { id: "futuro", title: "Futuro", level: 1 },
  { id: "vease", title: "Véase también", level: 1 },
  { id: "referencias", title: "Referencias", level: 1 },
]

interface TableOfContentsProps {
  className?: string
}

export function TableOfContents({ className }: TableOfContentsProps) {
  return (
    <nav className={cn("w-full", className)}>
      <h2 className="mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
        Contenidos
      </h2>
      <ScrollArea className="h-[calc(100vh-10rem)]">
        <ol className="flex flex-col gap-0.5 text-sm">
          {tocItems.map((item, index) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={cn(
                  "block rounded-md px-2 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-wiki-link",
                  item.level === 2 && "pl-6 text-xs"
                )}
              >
                <span className="mr-1.5 text-muted-foreground/60">
                  {item.level === 1
                    ? `${tocItems.filter((t, i) => i <= index && t.level === 1).length}.`
                    : "–"}
                </span>
                {item.title}
              </a>
            </li>
          ))}
        </ol>
      </ScrollArea>
    </nav>
  )
}

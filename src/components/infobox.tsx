import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface InfoRow {
  label: string
  value: string
}

const infoData: InfoRow[] = [
  { label: "Tipo", value: "Rama de la informática" },
  { label: "Campo", value: "Ciencias de la computación" },
  { label: "Creador(es)", value: "Alan Turing, John McCarthy, Marvin Minsky" },
  { label: "Año de origen", value: "1956 (Conferencia de Dartmouth)" },
  { label: "Subáreas", value: "ML, NLP, Visión Artificial, Robótica" },
  { label: "Lenguajes clave", value: "Python, R, Julia, C++" },
  { label: "Framework popular", value: "TensorFlow, PyTorch, JAX" },
  { label: "Aplicación principal", value: "Automatización inteligente" },
]

interface InfoboxProps {
  className?: string
}

export function Infobox({ className }: InfoboxProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-center font-serif text-lg">
          Inteligencia Artificial
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {/* AI-generated image placeholder */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-accent">
          <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-40"
            >
              <path d="M12 2a4 4 0 0 1 4 4v1a1 1 0 0 0 1 1h1a4 4 0 0 1 0 8h-1a1 1 0 0 0-1 1v1a4 4 0 0 1-8 0v-1a1 1 0 0 0-1-1H6a4 4 0 0 1 0-8h1a1 1 0 0 0 1-1V6a4 4 0 0 1 4-4z" />
              <circle cx="12" cy="12" r="2" />
            </svg>
            <span className="text-xs">Imagen generada por IA</span>
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          Representación conceptual de una red neuronal artificial.
        </p>

        <Separator />

        {/* Info table */}
        <table className="w-full text-sm">
          <tbody>
            {infoData.map((row) => (
              <tr
                key={row.label}
                className="border-b border-border last:border-0"
              >
                <td className="py-1.5 pr-3 font-medium text-muted-foreground">
                  {row.label}
                </td>
                <td className="py-1.5">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <Separator />

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary">Machine Learning</Badge>
          <Badge variant="secondary">Deep Learning</Badge>
          <Badge variant="secondary">NLP</Badge>
          <Badge variant="secondary">Redes Neuronales</Badge>
        </div>
      </CardContent>
    </Card>
  )
}

import { Separator } from "@/components/ui/separator"

export function Footer() {
  return (
    <footer className="mt-12 border-t bg-secondary/50">
      <div className="mx-auto max-w-[1400px] px-4 py-6">
        <div className="flex flex-col items-center gap-3 text-center text-xs text-muted-foreground">
          <Separator className="mb-2 max-w-xs" />
          <p>
            Todo el contenido de{" "}
            <span className="font-serif font-semibold">WikipedIA</span> es
            generado por inteligencia artificial y puede contener inexactitudes.
          </p>
          <p>Verifica siempre la información con fuentes confiables.</p>
          <p className="mt-2">
            Hosting por{" "}
            <span className="font-medium text-foreground">CubePath</span> ·{" "}
            {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  )
}

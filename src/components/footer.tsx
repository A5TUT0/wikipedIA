export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-muted/20">
      <div className="mx-auto max-w-[1400px] px-4 py-5">
        <div className="flex flex-col items-center gap-1.5 text-center text-[0.75rem] text-muted-foreground/70">
          <p>
            El contenido de{" "}
            <span className="font-serif font-semibold text-muted-foreground">
              WikipedIA
            </span>{" "}
            es generado por IA y puede contener inexactitudes. Verifica siempre
            con fuentes confiables.
          </p>
          <p className="flex items-center gap-1.5">
            <span>Hosting por</span>
            <span className="font-medium text-muted-foreground">CubePath</span>
            <span className="opacity-40">·</span>
            <span>{new Date().getFullYear()}</span>
          </p>
        </div>
      </div>
    </footer>
  )
}

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GraduationCap, Lightbulb, FileText } from "lucide-react"

interface ComplexityTabsProps {
  value: string
  onValueChange: (value: string) => void
}

export function ComplexityTabs({ value, onValueChange }: ComplexityTabsProps) {
  return (
    <Tabs value={value} onValueChange={onValueChange}>
      <TabsList>
        <TabsTrigger value="academico">
          <GraduationCap data-icon="inline-start" />
          Académico
        </TabsTrigger>
        <TabsTrigger value="simple">
          <Lightbulb data-icon="inline-start" />
          Simple (ELI5)
        </TabsTrigger>
        <TabsTrigger value="resumen">
          <FileText data-icon="inline-start" />
          Resumen
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

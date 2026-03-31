import { useEffect, useState } from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { subscribeToToasts, type ToastItem } from "@/lib/toast-service"

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    const handler = (t: ToastItem) => {
      setToasts((prev) => [...prev, t])
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id))
      }, 2200)
    }
    return subscribeToToasts(handler)
  }, [])

  return (
    <div className="fixed bottom-6 left-1/2 z-[200] flex -translate-x-1/2 flex-col items-center gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "flex items-center gap-2 rounded-xl border border-border/60 bg-background px-4 py-2.5 text-sm font-medium shadow-lg backdrop-blur-md",
            "animate-in duration-200 fade-in slide-in-from-bottom-2"
          )}
        >
          <Check className="size-3.5 text-green-500" />
          {t.message}
        </div>
      ))}
    </div>
  )
}

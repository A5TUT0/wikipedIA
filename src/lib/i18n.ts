import { createContext, useContext } from "react"
import { type UiLocale, type AiLang, type translations } from "./i18n-constants"

export interface I18nContextValue {
  uiLocale: UiLocale
  setUiLocale: (l: UiLocale) => void
  aiLang: AiLang
  setAiLang: (l: AiLang) => void
  t: (typeof translations)["es"]
}

export const I18nCtx = createContext<I18nContextValue | null>(null)

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nCtx)
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>")
  return ctx
}

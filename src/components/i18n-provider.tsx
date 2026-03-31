import { useState, type ReactNode } from "react"
import {
  UI_LOCALES,
  AI_LANG_CODES,
  translations,
  type UiLocale,
  type AiLang,
} from "@/lib/i18n-constants"
import { I18nCtx } from "@/lib/i18n"

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

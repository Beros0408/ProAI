# Script Python pour creer le contexte i18n
import os

TARGET = os.path.join(
    "C:", os.sep, "Users", "bkabe", "Desktop", "Porjet - ProAI",
    "ProAI", "apps", "web", "lib", "i18n", "context.tsx"
)
os.makedirs(os.path.dirname(TARGET), exist_ok=True)

CODE = """\
'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { translations, type Locale, type TranslationKey } from './translations'

interface I18nContextType {
  locale: Locale
  t: (key: TranslationKey) => string
  switchLanguage: (locale: Locale) => void
}

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('fr')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('proai-locale') as Locale | null
      if (saved && (saved === 'fr' || saved === 'en')) {
        setLocale(saved)
      } else {
        const browserLang = navigator.language.startsWith('en') ? 'en' : 'fr'
        setLocale(browserLang)
      }
    }
  }, [])

  const switchLanguage = (newLocale: Locale) => {
    setLocale(newLocale)
    if (typeof window !== 'undefined') {
      localStorage.setItem('proai-locale', newLocale)
    }
  }

  const t = (key: TranslationKey): string => {
    return translations[locale]?.[key] || translations['fr']?.[key] || key
  }

  return (
    <I18nContext.Provider value={{ locale, t, switchLanguage }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(I18nContext)
  if (!context) {
    // Fallback for server-side rendering
    return {
      t: (key: string) => {
        const val = (translations['fr'] as Record<string, string>)?.[key]
        return val || key
      },
      locale: 'fr' as Locale,
      switchLanguage: () => {},
    }
  }
  return context
}
"""

with open(TARGET, "w", encoding="utf-8") as f:
    f.write(CODE)

print(f"[OK] Context i18n cree : {TARGET}")
print(f"[OK] Taille : {os.path.getsize(TARGET)} octets")

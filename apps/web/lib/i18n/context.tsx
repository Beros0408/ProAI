'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { translations, TranslationKey } from './translations'

type Locale = 'fr' | 'en'

interface I18nContextType {
  locale: Locale
  t: (key: TranslationKey) => string
  switchLanguage: (locale: Locale) => void
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('fr')
  const [mounted, setMounted] = useState(false)

  // Read from localStorage on mount
  useEffect(() => {
    const savedLocale = localStorage.getItem('proai_locale') as Locale | null
    if (savedLocale && (savedLocale === 'fr' || savedLocale === 'en')) {
      setLocale(savedLocale)
    }
    setMounted(true)
  }, [])

  const switchLanguage = (newLocale: Locale) => {
    setLocale(newLocale)
    localStorage.setItem('proai_locale', newLocale)
    // Force page reload to update all components
    window.location.reload()
  }

  const t = (key: TranslationKey): string => {
    return translations[locale][key] || key
  }

  // Prevent render until mounted to avoid hydration mismatch
  if (!mounted) {
    return <>{children}</>
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
    throw new Error('useTranslation must be used within I18nProvider')
  }
  return context
}

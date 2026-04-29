'use client'

import { usePathname } from 'next/navigation'
import { Bell, Search } from 'lucide-react'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { useTranslation } from '@/lib/i18n/context'
import type { TranslationKey } from '@/lib/i18n/translations'

const PAGE_TITLES: Record<string, TranslationKey> = {
  '/dashboard': 'dashboard',
  '/chat': 'chat',
  '/automations': 'automations',
  '/analytics': 'analytics',
  '/content': 'content',
  '/analyze': 'analyze',
  '/templates': 'templates',
  '/settings': 'settings',
}

export function Header() {
  const pathname = usePathname()
  const { t } = useTranslation()
  const foundKey = Object.entries(PAGE_TITLES).find(([k]) => pathname.startsWith(k))?.[1]
  const title = foundKey ? t(foundKey) : 'ProAI'

  return (
    <header className="h-16 shrink-0 bg-surface border-b border-[#1E1E2E] flex items-center px-6 gap-4 animate-fade-down">
      <div className="flex-1 min-w-0">
        <h2 className="font-semibold text-foreground text-sm">{title}</h2>
      </div>

      <div className="flex items-center gap-2">
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-base border border-[#1E1E2E] text-muted text-xs hover:border-primary/40 transition-colors">
          <Search className="w-3.5 h-3.5" />
          <span>{t('search')}</span>
          <kbd className="ml-1 px-1 rounded bg-[#1E1E2E] text-[10px] font-mono">⌘K</kbd>
        </button>

        <LanguageSwitcher />

        <button className="relative p-2 rounded-lg text-muted hover:bg-[#1E1E2E] hover:text-foreground transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
        </button>

        <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center cursor-pointer">
          <span className="text-primary text-xs font-bold">U</span>
        </div>
      </div>
    </header>
  )
}

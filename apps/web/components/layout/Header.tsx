'use client'

import { usePathname } from 'next/navigation'
import { Bell, Search } from 'lucide-react'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { useTranslation } from '@/lib/i18n/context'
import type { TranslationKey } from '@/lib/i18n/translations'

const PAGE_TITLES: Record<string, TranslationKey> = {
  '/dashboard': 'nav.dashboard',
  '/chat': 'nav.chat',
  '/automations': 'nav.automations',
  '/analytics': 'nav.analytics',
  '/content': 'nav.content',
  '/analyze': 'nav.analyze',
  '/templates': 'nav.templates',
  '/settings': 'nav.settings',
}

export function Header() {
  const pathname = usePathname()
  const { t } = useTranslation()
  const foundKey = Object.entries(PAGE_TITLES).find(([k]) => pathname.startsWith(k))?.[1]
  const title = foundKey ? t(foundKey) : 'ProAI'

  return (
    <header className="h-14 shrink-0 flex items-center px-6 gap-4 animate-fade-down"
      style={{
        background: 'rgba(11,18,32,0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="flex-1 min-w-0">
        <h2 className="font-semibold text-[#e2e8f0] text-sm tracking-tight">{title}</h2>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <button
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[#64748b] text-xs transition-all duration-200 hover:text-[#94a3b8]"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(14,165,233,0.06)'
            ;(e.currentTarget as HTMLButtonElement).style.border = '1px solid rgba(14,165,233,0.2)'
            ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 16px rgba(14,165,233,0.08)'
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'
            ;(e.currentTarget as HTMLButtonElement).style.border = '1px solid rgba(255,255,255,0.07)'
            ;(e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'
          }}
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t('common.search')}</span>
          <kbd className="hidden sm:inline ml-1 px-1.5 py-0.5 rounded-md text-[9px] font-mono text-[#64748b]"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
            ⌘K
          </kbd>
        </button>

        <LanguageSwitcher />

        {/* Notification Bell */}
        <button
          className="relative p-2 rounded-xl text-[#64748b] transition-all duration-200 hover:text-[#e2e8f0]"
          style={{ border: '1px solid transparent' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'
            ;(e.currentTarget as HTMLButtonElement).style.border = '1px solid rgba(255,255,255,0.08)'
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = ''
            ;(e.currentTarget as HTMLButtonElement).style.border = '1px solid transparent'
          }}
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#fb923c] shadow-[0_0_6px_rgba(251,146,60,0.8)] animate-pulse-dot" />
        </button>

        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, rgba(14,165,233,0.25), rgba(14,165,233,0.1))',
            border: '1.5px solid rgba(14,165,233,0.35)',
            boxShadow: '0 0 12px rgba(14,165,233,0.15)',
          }}
        >
          <span className="text-[#0ea5e9] text-xs font-bold">U</span>
        </div>
      </div>
    </header>
  )
}

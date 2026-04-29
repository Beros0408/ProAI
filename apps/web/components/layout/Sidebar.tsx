'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, MessageSquare, Zap, BarChart2, Settings, ChevronRight, Network, Menu, X, Users, GitBranch, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n/context'
import { TranslationKey } from '@/lib/i18n/translations'

const NAV_ITEMS = [
  { href: '/dashboard', key: 'dashboard' as TranslationKey, icon: LayoutDashboard },
  { href: '/chat', key: 'chat' as TranslationKey, icon: MessageSquare },
  { href: '/automations', key: 'automations' as TranslationKey, icon: Zap },
  { href: '/analytics', key: 'analytics' as TranslationKey, icon: BarChart2 },
  { href: '/content', key: 'content' as TranslationKey, icon: Network },
  { href: '/analyze', key: 'analyze' as TranslationKey, icon: Network },
  { href: '/templates', key: 'templates' as TranslationKey, icon: Network },
  { href: '/mindmap', key: 'mindmap' as TranslationKey, icon: Network },
  { href: '/crm', key: 'crm' as TranslationKey, icon: Users },
  { href: '/workflows', key: 'workflows' as TranslationKey, icon: GitBranch },
  { href: '/schedule', key: 'schedule' as TranslationKey, icon: Calendar },
  { href: '/settings', key: 'settings' as TranslationKey, icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { t } = useTranslation()

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-surface border border-[#1E1E2E] rounded-lg hover:bg-[#1E1E2E] transition-colors"
      >
        <Menu className="w-5 h-5 text-foreground" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "w-60 shrink-0 bg-surface border-r border-[#1E1E2E] flex flex-col h-full animate-fade-in transition-transform duration-300 ease-in-out",
        "lg:translate-x-0 lg:static lg:z-auto",
        "fixed left-0 top-0 z-50",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Close Button Mobile */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 hover:bg-[#1E1E2E] rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-foreground" />
        </button>
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-[#1E1E2E] shrink-0">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-white font-bold text-sm">P</span>
        </div>
        <span className="font-bold text-foreground text-base tracking-tight">ProAI</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ href, key, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted hover:bg-[#1E1E2E] hover:text-foreground',
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{t(key)}</span>
              {active && <ChevronRight className="w-3.5 h-3.5" />}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-[#1E1E2E] shrink-0">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20">
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <span className="text-primary text-xs font-bold">U</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-foreground truncate">{t('my_space')}</div>
            <div className="text-xs text-muted">{t('free_plan')}</div>
          </div>
        </div>
      </div>
    </aside>
    </>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, MessageSquare, Zap, BarChart2, Settings, ChevronRight, Network, Menu, X, Users, GitBranch, Calendar, CalendarDays, FileText, TrendingUp, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n/context'
import { TranslationKey } from '@/lib/i18n/translations'

const NAV_ITEMS = [
  { href: '/dashboard', key: 'nav.dashboard' as TranslationKey, icon: LayoutDashboard },
  { href: '/chat', key: 'nav.chat' as TranslationKey, icon: MessageSquare },
  { href: '/automations', key: 'nav.automations' as TranslationKey, icon: Zap },
  { href: '/analytics', key: 'nav.analytics' as TranslationKey, icon: BarChart2 },
  { href: '/content', key: 'nav.content' as TranslationKey, icon: Network },
  { href: '/agenda', key: 'nav.agenda' as TranslationKey, icon: CalendarDays },
  { href: '/reports', key: 'nav.reports' as TranslationKey, icon: FileText },
  { href: '/predictions', key: 'nav.predictions' as TranslationKey, icon: TrendingUp },
  { href: '/analyze', key: 'nav.analyze' as TranslationKey, icon: Network },
  { href: '/templates', key: 'nav.templates' as TranslationKey, icon: Network },
  { href: '/mindmap', key: 'nav.mindmap' as TranslationKey, icon: Network },
  { href: '/crm', key: 'nav.crm' as TranslationKey, icon: Users },
  { href: '/workflows', key: 'nav.workflows' as TranslationKey, icon: GitBranch },
  { href: '/schedule', key: 'nav.schedule' as TranslationKey, icon: Calendar },
  { href: '/settings', key: 'nav.settings' as TranslationKey, icon: Settings },
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
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#111827] border border-white/[0.08] rounded-xl hover:bg-[#1a2236] transition-all duration-200"
      >
        <Menu className="w-5 h-5 text-[#e2e8f0]" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "w-60 shrink-0 flex flex-col h-full animate-fade-in transition-transform duration-300 ease-in-out",
        "bg-[#0b1220]/95 backdrop-blur-xl border-r border-white/[0.06]",
        "lg:translate-x-0 lg:static lg:z-auto",
        "fixed left-0 top-0 z-50",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Close Button Mobile */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 hover:bg-white/[0.06] rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-[#e2e8f0]" />
        </button>

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-white/[0.06] shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0ea5e9] to-[#0284c7] flex items-center justify-center shadow-[0_0_16px_rgba(14,165,233,0.4)]">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <span className="font-bold text-white text-base tracking-tight">ProAI</span>
          <span className="ml-auto">
            <Sparkles className="w-3.5 h-3.5 text-[#fb923c] opacity-70" />
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ href, key, icon: Icon }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                  active
                    ? 'bg-[#0ea5e9]/10 text-[#38bdf8] font-semibold'
                    : 'text-[#64748b] hover:bg-white/[0.04] hover:text-[#94a3b8]',
                )}
                style={active ? {
                  boxShadow: 'inset 0 0 0 1px rgba(14,165,233,0.15), 0 0 20px rgba(14,165,233,0.06)'
                } : undefined}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-[#0ea5e9] shadow-[0_0_8px_rgba(14,165,233,0.8)]" />
                )}
                <Icon className={cn('w-4 h-4 shrink-0 transition-colors', active ? 'text-[#0ea5e9]' : 'text-[#64748b] group-hover:text-[#94a3b8]')} />
                <span className="flex-1 truncate">{t(key)}</span>
                {active && <ChevronRight className="w-3 h-3 text-[#0ea5e9]/60" />}
              </Link>
            )
          })}
        </nav>

        {/* User footer */}
        <div className="px-3 py-4 border-t border-white/[0.06] shrink-0">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#0ea5e9]/[0.06] border border-[#0ea5e9]/[0.12] hover:bg-[#0ea5e9]/[0.1] transition-all duration-200 cursor-pointer group">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0ea5e9]/30 to-[#0ea5e9]/10 border border-[#0ea5e9]/30 flex items-center justify-center shrink-0">
              <span className="text-[#0ea5e9] text-xs font-bold">U</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-[#e2e8f0] truncate">{t('nav.myspace')}</div>
              <div className="text-[11px] text-[#64748b]">{t('nav.freeplan')}</div>
            </div>
            <ChevronRight className="w-3 h-3 text-[#64748b] group-hover:text-[#94a3b8] transition-colors" />
          </div>
        </div>
      </aside>
    </>
  )
}

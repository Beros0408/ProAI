'use client'

export const dynamic = 'force-dynamic'

import type { ComponentType } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, Bell, Shield, CreditCard, Plug } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n/context'
import type { TranslationKey } from '@/lib/i18n/translations'

const SETTINGS_ITEMS: Array<{ href: string; labelKey: TranslationKey; icon: React.ComponentType<{ className?: string }> }> = [
  { href: '/settings/profile', labelKey: 'profile', icon: User },
  { href: '/settings/notifications', labelKey: 'notifications', icon: Bell },
  { href: '/settings/security', labelKey: 'security', icon: Shield },
  { href: '/settings/billing', labelKey: 'billing', icon: CreditCard },
  { href: '/settings/integrations', labelKey: 'integrations', icon: Plug },
]

export default function SettingsPage() {
  const { t } = useTranslation()
  const pathname = usePathname()

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="animate-fade-up">
        <h1 className="text-2xl font-bold text-foreground gradient-text">{t('settings')}</h1>
        <p className="text-muted text-sm mt-1">{t('choose_category_menu')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl p-3"
            style={{ background: 'rgba(17,24,39,0.7)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <nav className="space-y-0.5">
              {SETTINGS_ITEMS.map(({ href, labelKey, icon: Icon }) => {
                const active = pathname === href
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                      active
                        ? 'text-[#38bdf8] font-semibold'
                        : 'text-[#64748b] hover:text-[#94a3b8]',
                    )}
                    style={active ? {
                      background: 'rgba(14,165,233,0.1)',
                      boxShadow: 'inset 0 0 0 1px rgba(14,165,233,0.15)',
                    } : undefined}
                    onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.04)' }}
                    onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLAnchorElement).style.background = '' }}
                  >
                    {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-[#0ea5e9] shadow-[0_0_8px_rgba(14,165,233,0.8)]" />}
                    <Icon className={cn('w-4 h-4 shrink-0', active ? 'text-[#0ea5e9]' : 'text-[#64748b] group-hover:text-[#94a3b8]')} />
                    <span>{t(labelKey)}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl p-6"
            style={{ background: 'rgba(17,24,39,0.7)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="text-base font-semibold text-white mb-3">{t('select_section')}</h2>
            <p className="text-[#64748b] text-sm">{t('choose_category_menu')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
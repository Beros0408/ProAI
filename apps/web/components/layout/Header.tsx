'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Bell, Check, Moon, Search, Sun } from 'lucide-react'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { useTranslation } from '@/lib/i18n/context'
import type { TranslationKey } from '@/lib/i18n/translations'
import { useTheme } from '@/lib/theme/context'
import { useNotifications } from '@/lib/notifications/context'

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

function formatTimeAgo(date: Date, t: (key: TranslationKey) => string): string {
  const diffMs = Date.now() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 60) return t('notifications.time.minutes_ago').replace('{n}', String(diffMin))
  const diffH = Math.floor(diffMin / 60)
  return t('notifications.time.hours_ago').replace('{n}', String(diffH))
}

export function Header() {
  const pathname = usePathname()
  const { t } = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications()
  const [bellOpen, setBellOpen] = useState(false)
  const bellRef = useRef<HTMLDivElement>(null)

  const foundKey = Object.entries(PAGE_TITLES).find(([k]) => pathname.startsWith(k))?.[1]
  const title = foundKey ? t(foundKey) : 'ProAI'

  useEffect(() => {
    if (!bellOpen) return
    function handleClick(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [bellOpen])

  return (
    <header className="h-14 shrink-0 flex items-center px-6 gap-4 animate-fade-down sticky top-0 z-40"
      style={{
        background: theme === 'warm' ? 'rgba(31,24,20,0.85)' : 'var(--header-bg, rgba(5,12,24,0.82))',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: theme === 'warm' ? '1px solid rgba(251,146,60,0.08)' : '1px solid var(--border-subtle, rgba(255,255,255,0.05))',
        boxShadow: theme === 'warm' ? '0 1px 0 rgba(251,146,60,0.04), 0 4px 20px rgba(0,0,0,0.3)' : '0 1px 0 rgba(255,255,255,0.03), 0 4px 20px rgba(0,0,0,0.3)',
      }}
    >
      <div className="flex-1 min-w-0">
        <h2 className="font-semibold text-sm" style={{ letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>{title}</h2>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <button
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs transition-all duration-200"
          style={{
            color: 'var(--text-muted)',
            background: theme === 'warm' ? '#2a2018' : 'var(--input-bg, #1a2236)',
            border: theme === 'warm' ? '1px solid rgba(251,146,60,0.1)' : '1px solid var(--border-color, rgba(255,255,255,0.07))',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = theme === 'warm' ? 'rgba(251,146,60,0.08)' : 'rgba(14,165,233,0.08)'
            ;(e.currentTarget as HTMLButtonElement).style.border = theme === 'warm' ? '1px solid rgba(251,146,60,0.2)' : '1px solid rgba(14,165,233,0.2)'
            ;(e.currentTarget as HTMLButtonElement).style.boxShadow = theme === 'warm' ? '0 0 16px rgba(251,146,60,0.08)' : '0 0 16px rgba(14,165,233,0.08)'
            ;(e.currentTarget as HTMLButtonElement).style.color = theme === 'warm' ? '#fb923c' : '#94a3b8'
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = theme === 'warm' ? '#2a2018' : 'var(--input-bg, #1a2236)'
            ;(e.currentTarget as HTMLButtonElement).style.border = theme === 'warm' ? '1px solid rgba(251,146,60,0.1)' : '1px solid var(--border-color, rgba(255,255,255,0.07))'
            ;(e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'
            ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'
          }}
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t('common.search')}</span>
          <kbd className="hidden sm:inline ml-1 px-1.5 py-0.5 rounded-md text-[9px] font-mono"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
            ⌘K
          </kbd>
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg transition-all duration-200"
          style={{
            background: theme === 'dark' ? 'rgba(14,165,233,0.1)' : 'rgba(251,146,60,0.1)',
            color: theme === 'dark' ? '#0ea5e9' : '#fb923c',
          }}
          title={theme === 'dark' ? 'Mode chaleureux' : 'Mode sombre'}
        >
          {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        <LanguageSwitcher />

        {/* Notification Bell */}
        <div className="relative" ref={bellRef}>
          <button
            onClick={() => setBellOpen(o => !o)}
            className="relative p-2 rounded-xl transition-all duration-200"
            style={{
              color: bellOpen ? 'var(--text-primary)' : 'var(--text-muted)',
              background: bellOpen ? (theme === 'warm' ? 'rgba(251,146,60,0.06)' : 'rgba(255,255,255,0.05)') : '',
              border: bellOpen ? (theme === 'warm' ? '1px solid rgba(251,146,60,0.12)' : '1px solid rgba(255,255,255,0.08)') : '1px solid transparent',
            }}
            onMouseEnter={(e) => {
              if (!bellOpen) {
                (e.currentTarget as HTMLButtonElement).style.background = theme === 'warm' ? 'rgba(251,146,60,0.06)' : 'rgba(255,255,255,0.05)'
                ;(e.currentTarget as HTMLButtonElement).style.border = theme === 'warm' ? '1px solid rgba(251,146,60,0.12)' : '1px solid rgba(255,255,255,0.08)'
                ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'
              }
            }}
            onMouseLeave={(e) => {
              if (!bellOpen) {
                ;(e.currentTarget as HTMLButtonElement).style.background = ''
                ;(e.currentTarget as HTMLButtonElement).style.border = '1px solid transparent'
                ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'
              }
            }}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#fb923c] shadow-[0_0_6px_rgba(251,146,60,0.8)] animate-pulse-dot" />
            )}
          </button>

          {/* Dropdown panel */}
          {bellOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-80 rounded-2xl overflow-hidden z-50 animate-fade-down"
              style={{
                background: 'var(--glass-bg-strong)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid var(--border-color)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: '1px solid var(--border-subtle)' }}
              >
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {t('notifications.title')}
                  {unreadCount > 0 && (
                    <span
                      className="ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                      style={{ background: '#fb923c', color: '#fff' }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1 text-xs transition-colors duration-150"
                    style={{ color: 'var(--nav-active-color)' }}
                  >
                    <Check size={12} />
                    {t('notifications.mark_all_read')}
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-center text-xs py-8" style={{ color: 'var(--text-muted)' }}>
                    {t('notifications.empty')}
                  </p>
                ) : (
                  notifications.map(n => (
                    <button
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors duration-150"
                      style={{
                        background: n.read ? 'transparent' : (theme === 'warm' ? 'rgba(251,146,60,0.04)' : 'rgba(14,165,233,0.04)'),
                        borderBottom: '1px solid var(--border-subtle)',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = theme === 'warm' ? 'rgba(251,146,60,0.06)' : 'rgba(255,255,255,0.04)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = n.read ? 'transparent' : (theme === 'warm' ? 'rgba(251,146,60,0.04)' : 'rgba(14,165,233,0.04)') }}
                    >
                      <div
                        className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                        style={{ background: n.read ? 'var(--border-color)' : (n.type === 'success' ? '#34d399' : theme === 'warm' ? '#fb923c' : '#0ea5e9') }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{n.title}</p>
                        <p className="text-xs leading-relaxed mt-0.5" style={{ color: 'var(--text-secondary)' }}>{n.message}</p>
                        <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>{formatTimeAgo(n.createdAt, t)}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

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

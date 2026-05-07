# Script Python pour creer la Sidebar Premium ProAI
import os

TARGET = os.path.join(
    "C:", os.sep, "Users", "bkabe", "Desktop", "Porjet - ProAI",
    "ProAI", "apps", "web", "components", "layout", "Sidebar.tsx"
)
os.makedirs(os.path.dirname(TARGET), exist_ok=True)

CODE = r"""'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, MessageSquare, Zap, BarChart3, PenTool,
  CalendarDays, FileText, TrendingUp, Search, BookTemplate,
  Brain, Users, Workflow, CalendarCheck, Settings, ChevronRight,
  ChevronsLeft, ChevronsRight, Sparkles, Bell, Crown
} from 'lucide-react'

const NAV_SECTIONS = [
  {
    label: 'Principal',
    items: [
      { href: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord', badge: null },
      { href: '/chat', icon: MessageSquare, label: 'Chat IA', badge: 3 },
    ],
  },
  {
    label: 'Outils IA',
    items: [
      { href: '/content', icon: PenTool, label: 'Contenu IA', badge: null },
      { href: '/analyze', icon: Search, label: 'Analyseur', badge: null },
      { href: '/templates', icon: BookTemplate, label: 'Templates', badge: null },
      { href: '/mindmap', icon: Brain, label: 'Mind Map', badge: null },
    ],
  },
  {
    label: 'Business',
    items: [
      { href: '/crm', icon: Users, label: 'CRM', badge: 2 },
      { href: '/workflows', icon: Workflow, label: 'Workflows', badge: null },
      { href: '/schedule', icon: CalendarCheck, label: 'Calendrier', badge: null },
      { href: '/agenda', icon: CalendarDays, label: 'Agenda', badge: null },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { href: '/automations', icon: Zap, label: 'Automatisations', badge: null },
      { href: '/analytics', icon: BarChart3, label: 'Analytics', badge: null },
      { href: '/reports', icon: FileText, label: 'Rapports', badge: null },
      { href: '/predictions', icon: TrendingUp, label: 'Pr\u00e9dictions', badge: null },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [compact, setCompact] = useState(false)

  return (
    <aside
      className={`flex flex-col h-screen sticky top-0 transition-all duration-300 ${compact ? 'w-[72px]' : 'w-[220px]'}`}
      style={{ background: '#0c1220', borderRight: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* LOGO */}
      <div className="flex items-center justify-between px-4 h-16 flex-shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #fb923c)' }}
          >
            P
          </div>
          {!compact && (
            <span className="text-base font-bold" style={{ color: '#0ea5e9' }}>
              ProAI
            </span>
          )}
        </Link>
        {!compact && (
          <button
            onClick={() => router.push('/chat')}
            className="p-1.5 rounded-lg transition-all hover:scale-110"
            style={{ color: '#a78bfa' }}
            title="Chat IA"
          >
            <Sparkles size={16} />
          </button>
        )}
      </div>

      {/* NAV SECTIONS */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
        {NAV_SECTIONS.map((section, sIdx) => (
          <div key={sIdx}>
            {!compact && (
              <p
                className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest"
                style={{ color: '#475569' }}
              >
                {section.label}
              </p>
            )}
            {compact && sIdx > 0 && (
              <div className="mx-3 my-2 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-3 rounded-xl transition-all duration-200 relative ${
                      compact ? 'justify-center px-2 py-2.5' : 'px-3 py-2'
                    }`}
                    style={{
                      background: isActive
                        ? 'linear-gradient(135deg, rgba(14,165,233,0.15), rgba(14,165,233,0.05))'
                        : 'transparent',
                      color: isActive ? '#38bdf8' : '#94a3b8',
                    }}
                    title={compact ? item.label : undefined}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                        style={{
                          background: '#0ea5e9',
                          boxShadow: '0 0 8px rgba(14,165,233,0.5)',
                        }}
                      />
                    )}

                    <Icon
                      size={18}
                      className="flex-shrink-0 transition-colors duration-200"
                      style={{
                        color: isActive ? '#38bdf8' : '#64748b',
                        filter: isActive ? 'drop-shadow(0 0 4px rgba(14,165,233,0.4))' : 'none',
                      }}
                    />

                    {!compact && (
                      <>
                        <span
                          className={`text-[13px] flex-1 transition-colors duration-200 ${
                            isActive ? 'font-semibold' : 'font-medium'
                          }`}
                          style={{
                            color: isActive ? '#e2e8f0' : '#94a3b8',
                          }}
                        >
                          {item.label}
                        </span>

                        {/* Badge */}
                        {item.badge && (
                          <span
                            className="min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] font-bold"
                            style={{
                              background: 'rgba(251,146,60,0.2)',
                              color: '#fb923c',
                            }}
                          >
                            {item.badge}
                          </span>
                        )}

                        {/* Active arrow */}
                        {isActive && (
                          <ChevronRight
                            size={12}
                            style={{ color: '#0ea5e9' }}
                          />
                        )}
                      </>
                    )}

                    {/* Compact badge */}
                    {compact && item.badge && (
                      <span
                        className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                        style={{
                          background: '#fb923c',
                          boxShadow: '0 0 4px rgba(251,146,60,0.5)',
                        }}
                      />
                    )}

                    {/* Hover glow */}
                    {!isActive && (
                      <div
                        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                        style={{ background: 'rgba(255,255,255,0.03)' }}
                      />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* SETTINGS */}
      <div className="px-2 pb-2">
        <Link
          href="/settings"
          className={`flex items-center gap-3 rounded-xl transition-all duration-200 ${
            compact ? 'justify-center px-2 py-2.5' : 'px-3 py-2'
          }`}
          style={{
            color: pathname === '/settings' ? '#38bdf8' : '#64748b',
            background: pathname === '/settings' ? 'rgba(14,165,233,0.1)' : 'transparent',
          }}
        >
          <Settings size={18} />
          {!compact && <span className="text-[13px] font-medium" style={{ color: '#94a3b8' }}>Param\u00e8tres</span>}
        </Link>
      </div>

      {/* COMPACT TOGGLE */}
      <div className="px-2 pb-2">
        <button
          onClick={() => setCompact(!compact)}
          className={`w-full flex items-center gap-3 rounded-xl py-2 transition-all duration-200 hover:bg-[rgba(255,255,255,0.03)] ${
            compact ? 'justify-center px-2' : 'px-3'
          }`}
          style={{ color: '#475569' }}
        >
          {compact ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          {!compact && <span className="text-[11px] font-medium">R\u00e9duire</span>}
        </button>
      </div>

      {/* USER CARD */}
      <div
        className={`mx-2 mb-2 rounded-xl p-3 transition-all duration-200 ${compact ? 'px-2' : ''}`}
        style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className={`flex items-center gap-2.5 ${compact ? 'justify-center' : ''}`}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: 'rgba(14,165,233,0.15)', color: '#38bdf8' }}
          >
            U
          </div>
          {!compact && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">Mon espace</p>
              <div className="flex items-center gap-1">
                <Crown size={9} style={{ color: '#fb923c' }} />
                <span className="text-[10px]" style={{ color: '#fb923c' }}>Plan Free</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
"""

with open(TARGET, "w", encoding="utf-8") as f:
    f.write(CODE.lstrip())

print(f"[OK] Sidebar Premium cr\u00e9\u00e9e : {TARGET}")
print(f"[OK] Taille : {os.path.getsize(TARGET)} octets")

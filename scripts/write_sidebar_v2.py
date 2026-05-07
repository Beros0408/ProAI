# Script Python pour creer la Sidebar avec accordeons ProAI
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
  LayoutDashboard, MessageSquare, PenTool, Search, BookTemplate,
  Brain, Users, Workflow, CalendarCheck, CalendarDays, Zap,
  BarChart3, FileText, TrendingUp, Settings, ChevronRight,
  ChevronDown, ChevronsLeft, ChevronsRight, Sparkles, Crown,
  Wrench, Briefcase, Cpu
} from 'lucide-react'

interface NavItem {
  href: string
  icon: React.ElementType
  label: string
  badge?: number | null
}

interface NavSection {
  key: string
  label: string
  icon: React.ElementType
  color: string
  glowColor: string
  items: NavItem[]
}

const TOP_ITEMS: NavItem[] = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { href: '/chat', icon: MessageSquare, label: 'Chat IA', badge: 3 },
]

const ACCORDION_SECTIONS: NavSection[] = [
  {
    key: 'tools',
    label: 'Outils IA',
    icon: Wrench,
    color: '#06b6d4',
    glowColor: 'rgba(6,182,212,0.15)',
    items: [
      { href: '/content', icon: PenTool, label: 'Contenu IA' },
      { href: '/analyze', icon: Search, label: 'Analyseur' },
      { href: '/templates', icon: BookTemplate, label: 'Templates' },
      { href: '/mindmap', icon: Brain, label: 'Mind Map' },
    ],
  },
  {
    key: 'business',
    label: 'Business',
    icon: Briefcase,
    color: '#34d399',
    glowColor: 'rgba(52,211,153,0.15)',
    items: [
      { href: '/crm', icon: Users, label: 'CRM', badge: 2 },
      { href: '/workflows', icon: Workflow, label: 'Workflows' },
      { href: '/schedule', icon: CalendarCheck, label: 'Calendrier' },
      { href: '/agenda', icon: CalendarDays, label: 'Agenda' },
    ],
  },
  {
    key: 'intelligence',
    label: 'Intelligence',
    icon: Cpu,
    color: '#fb923c',
    glowColor: 'rgba(251,146,60,0.15)',
    items: [
      { href: '/automations', icon: Zap, label: 'Automatisations' },
      { href: '/analytics', icon: BarChart3, label: 'Analytics' },
      { href: '/reports', icon: FileText, label: 'Rapports' },
      { href: '/predictions', icon: TrendingUp, label: 'Pr\u00e9dictions' },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [openSection, setOpenSection] = useState<string | null>(() => {
    for (const section of ACCORDION_SECTIONS) {
      if (section.items.some(item => pathname === item.href)) {
        return section.key
      }
    }
    return null
  })
  const [compact, setCompact] = useState(false)

  const toggleSection = (key: string) => {
    setOpenSection(prev => (prev === key ? null : key))
  }

  const isItemActive = (href: string) => pathname === href

  const renderNavItem = (item: NavItem, accentColor?: string) => {
    const active = isItemActive(item.href)
    const Icon = item.icon
    const color = accentColor || '#0ea5e9'

    return (
      <Link
        key={item.href}
        href={item.href}
        className={`group flex items-center gap-3 rounded-xl transition-all duration-200 relative ${
          compact ? 'justify-center px-2 py-2.5' : 'px-3 py-2'
        }`}
        style={{
          background: active
            ? `linear-gradient(135deg, ${color}20, ${color}08)`
            : 'transparent',
          color: active ? color : '#94a3b8',
        }}
        title={compact ? item.label : undefined}
      >
        {active && (
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
            style={{ background: color, boxShadow: `0 0 8px ${color}80` }}
          />
        )}

        <Icon
          size={17}
          className="flex-shrink-0 transition-all duration-200"
          style={{
            color: active ? color : '#64748b',
            filter: active ? `drop-shadow(0 0 4px ${color}60)` : 'none',
          }}
        />

        {!compact && (
          <>
            <span
              className={`text-[13px] flex-1 transition-colors duration-200 ${
                active ? 'font-semibold' : 'font-medium'
              }`}
              style={{ color: active ? '#e2e8f0' : '#94a3b8' }}
            >
              {item.label}
            </span>

            {item.badge && (
              <span
                className="min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] font-bold"
                style={{ background: 'rgba(251,146,60,0.2)', color: '#fb923c' }}
              >
                {item.badge}
              </span>
            )}

            {active && <ChevronRight size={12} style={{ color }} />}
          </>
        )}

        {compact && item.badge && (
          <span
            className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
            style={{ background: '#fb923c', boxShadow: '0 0 4px rgba(251,146,60,0.5)' }}
          />
        )}

        {!active && (
          <div
            className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          />
        )}
      </Link>
    )
  }

  return (
    <aside
      className={`flex flex-col h-screen sticky top-0 transition-all duration-300 ${
        compact ? 'w-[72px]' : 'w-[230px]'
      }`}
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
            <span className="text-base font-bold" style={{ color: '#0ea5e9' }}>ProAI</span>
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

      {/* NAV */}
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        {/* PRINCIPAL */}
        {!compact && (
          <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>
            Principal
          </p>
        )}
        <div className="space-y-0.5 mb-3">
          {TOP_ITEMS.map(item => renderNavItem(item))}
        </div>

        {/* ACCORDION SECTIONS */}
        <div className="space-y-1">
          {ACCORDION_SECTIONS.map(section => {
            const isOpen = openSection === section.key
            const hasActive = section.items.some(item => isItemActive(item.href))
            const SectionIcon = section.icon

            return (
              <div key={section.key}>
                {/* Accordion trigger */}
                <button
                  onClick={() => toggleSection(section.key)}
                  className={`w-full flex items-center gap-2.5 rounded-xl transition-all duration-200 group ${
                    compact ? 'justify-center px-2 py-2.5' : 'px-3 py-2'
                  }`}
                  style={{
                    background: isOpen || hasActive ? section.glowColor : 'transparent',
                    borderLeft: isOpen || hasActive ? `2px solid ${section.color}` : '2px solid transparent',
                  }}
                  title={compact ? section.label : undefined}
                >
                  <SectionIcon
                    size={17}
                    className="flex-shrink-0"
                    style={{ color: isOpen || hasActive ? section.color : '#64748b' }}
                  />

                  {!compact && (
                    <>
                      <span
                        className="text-[12px] font-bold uppercase tracking-wider flex-1 text-left"
                        style={{ color: isOpen || hasActive ? section.color : '#64748b' }}
                      >
                        {section.label}
                      </span>

                      <ChevronDown
                        size={14}
                        className="transition-transform duration-300"
                        style={{
                          color: isOpen ? section.color : '#475569',
                          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        }}
                      />
                    </>
                  )}
                </button>

                {/* Accordion content */}
                {!compact && (
                  <div
                    className="overflow-hidden transition-all duration-300 ease-in-out"
                    style={{
                      maxHeight: isOpen ? `${section.items.length * 44}px` : '0px',
                      opacity: isOpen ? 1 : 0,
                    }}
                  >
                    <div className="pl-2 pt-1 space-y-0.5">
                      {section.items.map(item => renderNavItem(item, section.color))}
                    </div>
                  </div>
                )}

                {/* Compact: show items as tooltip or small dots */}
                {compact && isOpen && (
                  <div className="space-y-0.5 mt-0.5">
                    {section.items.map(item => renderNavItem(item, section.color))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </nav>

      {/* SETTINGS */}
      <div className="px-2 pb-1">
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
          <Settings size={17} />
          {!compact && <span className="text-[13px] font-medium" style={{ color: '#94a3b8' }}>Param\u00e8tres</span>}
        </Link>
      </div>

      {/* COMPACT TOGGLE */}
      <div className="px-2 pb-1">
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

print(f"[OK] Sidebar Accord\u00e9on cr\u00e9\u00e9e : {TARGET}")
print(f"[OK] Taille : {os.path.getsize(TARGET)} octets")

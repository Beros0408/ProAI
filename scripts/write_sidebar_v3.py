# Script Python - Sidebar complete v3 avec accordeons fonctionnels
import os

TARGET = os.path.join(
    "C:", os.sep, "Users", "bkabe", "Desktop", "Porjet - ProAI",
    "ProAI", "apps", "web", "components", "layout", "Sidebar.tsx"
)
os.makedirs(os.path.dirname(TARGET), exist_ok=True)

CODE = """\
'use client'

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

const TOP_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { href: '/chat', icon: MessageSquare, label: 'Chat IA', badge: 3 },
]

const SECTIONS = [
  {
    key: 'tools',
    label: 'Outils IA',
    icon: Wrench,
    color: '#06b6d4',
    glow: 'rgba(6,182,212,0.12)',
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
    glow: 'rgba(52,211,153,0.12)',
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
    glow: 'rgba(251,146,60,0.12)',
    items: [
      { href: '/automations', icon: Zap, label: 'Automatisations' },
      { href: '/analytics', icon: BarChart3, label: 'Analytics' },
      { href: '/reports', icon: FileText, label: 'Rapports' },
      { href: '/predictions', icon: TrendingUp, label: 'Pr\\u00e9dictions' },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const getInitialOpen = () => {
    for (const s of SECTIONS) {
      if (s.items.some(i => pathname === i.href)) return s.key
    }
    return null
  }

  const [openKey, setOpenKey] = useState<string | null>(getInitialOpen)
  const [compact, setCompact] = useState(false)

  const handleToggle = (key: string) => {
    setOpenKey(prev => prev === key ? null : key)
  }

  const handleHover = (key: string) => {
    setOpenKey(key)
  }

  return (
    <aside
      className={`flex flex-col h-screen sticky top-0 transition-all duration-300 ${compact ? 'w-[72px]' : 'w-[230px]'}`}
      style={{ background: '#0c1220', borderRight: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* LOGO */}
      <div className="flex items-center justify-between px-4 h-16 flex-shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #fb923c)' }}>P</div>
          {!compact && <span className="text-base font-bold" style={{ color: '#0ea5e9' }}>ProAI</span>}
        </Link>
        {!compact && (
          <button onClick={() => router.push('/chat')} className="p-1.5 rounded-lg transition-all hover:scale-110" style={{ color: '#a78bfa' }} title="Chat IA">
            <Sparkles size={16} />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {/* PRINCIPAL */}
        {!compact && <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>Principal</p>}

        <div className="space-y-1 mb-6">
          {TOP_ITEMS.map(item => {
            const active = pathname === item.href
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href}
                className={`group flex items-center gap-3 rounded-xl transition-all duration-200 relative ${compact ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'}`}
                style={{ background: active ? 'linear-gradient(135deg, rgba(14,165,233,0.15), rgba(14,165,233,0.05))' : 'transparent' }}>
                {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full" style={{ background: '#0ea5e9', boxShadow: '0 0 8px rgba(14,165,233,0.5)' }} />}
                <Icon size={17} style={{ color: active ? '#38bdf8' : '#64748b', filter: active ? 'drop-shadow(0 0 4px rgba(14,165,233,0.4))' : 'none' }} />
                {!compact && (
                  <>
                    <span className={`text-[13px] flex-1 ${active ? 'font-semibold text-[#e2e8f0]' : 'font-medium text-[#94a3b8]'}`}>{item.label}</span>
                    {item.badge && <span className="min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] font-bold" style={{ background: 'rgba(251,146,60,0.2)', color: '#fb923c' }}>{item.badge}</span>}
                    {active && <ChevronRight size={12} style={{ color: '#0ea5e9' }} />}
                  </>
                )}
                {compact && item.badge && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full" style={{ background: '#fb923c', boxShadow: '0 0 4px rgba(251,146,60,0.5)' }} />}
                {!active && <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" style={{ background: 'rgba(255,255,255,0.03)' }} />}
              </Link>
            )
          })}
        </div>

        {/* ACCORDEONS */}
        <div className="space-y-4">
          {SECTIONS.map(section => {
            const isOpen = openKey === section.key
            const hasActive = section.items.some(i => pathname === i.href)
            const SIcon = section.icon

            return (
              <div key={section.key}>
                {/* TRIGGER */}
                <button
                  type="button"
                  onClick={() => handleToggle(section.key)}
                  onMouseEnter={() => handleHover(section.key)}
                  className={`w-full flex items-center gap-2.5 rounded-xl cursor-pointer transition-all duration-200 ${compact ? 'justify-center px-2 py-3' : 'px-3 py-3'}`}
                  style={{
                    background: isOpen || hasActive ? section.glow : 'transparent',
                    borderLeft: isOpen || hasActive ? '3px solid ' + section.color : '3px solid transparent',
                  }}
                >
                  <SIcon size={17} style={{ color: isOpen || hasActive ? section.color : '#64748b' }} />
                  {!compact && (
                    <>
                      <span className="text-[12px] font-bold uppercase tracking-wider flex-1 text-left"
                        style={{ color: isOpen || hasActive ? section.color : '#64748b' }}>{section.label}</span>
                      <ChevronDown size={14} className="transition-transform duration-300"
                        style={{ color: isOpen ? section.color : '#475569', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                    </>
                  )}
                </button>

                {/* SOUS-MENU ANIME */}
                {!compact && (
                  <div className="overflow-hidden transition-all duration-300 ease-in-out"
                    style={{ maxHeight: isOpen ? '250px' : '0px', opacity: isOpen ? 1 : 0 }}>
                    <div className="pl-3 pt-2 space-y-1">
                      {section.items.map(item => {
                        const active = pathname === item.href
                        const Icon = item.icon
                        return (
                          <Link key={item.href} href={item.href}
                            className="group flex items-center gap-3 rounded-xl px-3 py-2 transition-all duration-200 relative"
                            style={{ background: active ? section.glow : 'transparent' }}>
                            {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full" style={{ background: section.color, boxShadow: '0 0 6px ' + section.color + '80' }} />}
                            <Icon size={15} style={{ color: active ? section.color : '#64748b' }} />
                            <span className={`text-[13px] flex-1 ${active ? 'font-semibold text-[#e2e8f0]' : 'font-medium text-[#94a3b8]'}`}>{item.label}</span>
                            {item.badge && <span className="min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] font-bold" style={{ background: 'rgba(251,146,60,0.2)', color: '#fb923c' }}>{item.badge}</span>}
                            {!active && <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" style={{ background: 'rgba(255,255,255,0.04)' }} />}
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* COMPACT MODE */}
                {compact && isOpen && (
                  <div className="space-y-0.5 mt-1">
                    {section.items.map(item => {
                      const active = pathname === item.href
                      const Icon = item.icon
                      return (
                        <Link key={item.href} href={item.href} className="flex justify-center py-2 rounded-xl transition-all duration-200"
                          style={{ background: active ? section.glow : 'transparent' }} title={item.label}>
                          <Icon size={15} style={{ color: active ? section.color : '#64748b' }} />
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </nav>

      {/* SETTINGS */}
      <div className="px-2 pb-1">
        <Link href="/settings"
          className={`flex items-center gap-3 rounded-xl transition-all duration-200 ${compact ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'}`}
          style={{ color: pathname === '/settings' ? '#38bdf8' : '#64748b', background: pathname === '/settings' ? 'rgba(14,165,233,0.1)' : 'transparent' }}>
          <Settings size={17} />
          {!compact && <span className="text-[13px] font-medium" style={{ color: '#94a3b8' }}>Param\\u00e8tres</span>}
        </Link>
      </div>

      {/* COMPACT TOGGLE */}
      <div className="px-2 pb-1">
        <button onClick={() => setCompact(!compact)}
          className={`w-full flex items-center gap-3 rounded-xl py-2.5 transition-all duration-200 hover:bg-[rgba(255,255,255,0.03)] ${compact ? 'justify-center px-2' : 'px-3'}`}
          style={{ color: '#475569' }}>
          {compact ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          {!compact && <span className="text-[11px] font-medium">R\\u00e9duire</span>}
        </button>
      </div>

      {/* USER */}
      <div className={`mx-2 mb-2 rounded-xl p-3 ${compact ? 'px-2' : ''}`}
        style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className={`flex items-center gap-2.5 ${compact ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: 'rgba(14,165,233,0.15)', color: '#38bdf8' }}>U</div>
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

# Fix accents - replace unicode escapes with real characters
CODE = CODE.replace("Param\\u00e8tres", "Param\u00e8tres")
CODE = CODE.replace("R\\u00e9duire", "R\u00e9duire")
CODE = CODE.replace("Pr\\u00e9dictions", "Pr\u00e9dictions")

with open(TARGET, "w", encoding="utf-8") as f:
    f.write(CODE.lstrip())

print(f"[OK] Sidebar v3 cr\u00e9\u00e9e : {TARGET}")
print(f"[OK] Taille : {os.path.getsize(TARGET)} octets")
print("[OK] Corrections :")
print("  - Espacement mb-6 entre Principal et accordeons")
print("  - space-y-4 entre les 3 blocs accordeon")
print("  - Hover ouvre les sous-menus (onMouseEnter)")
print("  - Click toggle les sous-menus")
print("  - Accents corriges (Parametres, Reduire, Predictions)")
print("  - Animation fluide maxHeight 0 -> 250px")

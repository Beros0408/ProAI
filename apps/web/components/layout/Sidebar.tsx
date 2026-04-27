'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, MessageSquare, Zap, BarChart2, Settings, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/chat', label: 'Chat', icon: MessageSquare },
  { href: '/automations', label: 'Automatisations', icon: Zap },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/settings', label: 'Paramètres', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 shrink-0 bg-surface border-r border-[#1E1E2E] flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-[#1E1E2E] shrink-0">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-white font-bold text-sm">P</span>
        </div>
        <span className="font-bold text-foreground text-base tracking-tight">ProAI</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted hover:bg-[#1E1E2E] hover:text-foreground',
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{label}</span>
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
            <div className="text-xs font-medium text-foreground truncate">Mon espace</div>
            <div className="text-xs text-muted">Plan Free</div>
          </div>
        </div>
      </div>
    </aside>
  )
}

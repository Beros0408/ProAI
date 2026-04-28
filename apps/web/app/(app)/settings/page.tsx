'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, Bell, Shield, CreditCard, Plug } from 'lucide-react'
import { cn } from '@/lib/utils'

const SETTINGS_ITEMS = [
  { href: '/settings/profile', label: 'Profil', icon: User },
  { href: '/settings/notifications', label: 'Notifications', icon: Bell },
  { href: '/settings/security', label: 'Sécurité', icon: Shield },
  { href: '/settings/billing', label: 'Facturation', icon: CreditCard },
  { href: '/settings/integrations', label: 'Intégrations', icon: Plug },
]

export default function SettingsPage() {
  const pathname = usePathname()

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="animate-fade-up">
        <h1 className="text-2xl font-bold text-foreground gradient-text">Paramètres</h1>
        <p className="text-muted text-sm mt-1">Gérez vos préférences et intégrations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-surface border border-[#1E1E2E] rounded-xl p-4">
            <nav className="space-y-2">
              {SETTINGS_ITEMS.map(({ href, label, icon: Icon }) => {
                const active = pathname === href
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                      active
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted hover:bg-[#1E1E2E] hover:text-foreground',
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-surface border border-[#1E1E2E] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Sélectionnez une section</h2>
            <p className="text-muted">Choisissez une catégorie dans le menu de gauche pour configurer vos paramètres.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
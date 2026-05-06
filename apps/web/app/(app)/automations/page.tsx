'use client'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/lib/i18n/context'
import { ChevronRight } from 'lucide-react'

const AUTOMATION_CARDS = [
  { emoji: '⚡', titleKey: 'prospect_tracking' as const, descKey: 'prospect_tracking_description' as const, color: '#fb923c' },
  { emoji: '📧', titleKey: 'auto_emails' as const, descKey: 'auto_emails_description' as const, color: '#0ea5e9' },
  { emoji: '🔄', titleKey: 'crm_workflows' as const, descKey: 'crm_workflows_description' as const, color: '#8b5cf6' },
  { emoji: '📊', titleKey: 'auto_reports' as const, descKey: 'auto_reports_description' as const, color: '#34d399' },
]

export default function AutomationsPage() {
  const { t } = useTranslation()
  const router = useRouter()
  return (
    <div className="p-6 space-y-6 animate-fade-in stagger-children">
      <div className="animate-fade-up">
        <h1 className="text-2xl font-bold text-white gradient-text">{t('automations')}</h1>
        <p className="text-[#64748b] mt-1">{t('configure_your_workflows')}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
        {AUTOMATION_CARDS.map((card, i) => (
          <div
            key={i}
            onClick={() => router.push('/chat?agent=automation')}
            className="rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden animate-fade-up"
            style={{
              background: 'rgba(17,24,39,0.7)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.border = `1px solid ${card.color}30`
              ;(e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 32px ${card.color}15`
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.border = '1px solid rgba(255,255,255,0.07)'
              ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl"
              style={{ background: `linear-gradient(90deg, ${card.color}, transparent)` }} />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{ background: `radial-gradient(ellipse at 0% 0%, ${card.color}06, transparent 60%)` }} />

            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 transition-transform duration-300 group-hover:scale-110"
                style={{ background: `${card.color}15`, border: `1px solid ${card.color}20`, boxShadow: `0 0 0 1px ${card.color}10` }}>
                {card.emoji}
              </div>
              <h3 className="text-base font-semibold text-white">{t(card.titleKey)}</h3>
              <p className="text-[#64748b] text-sm mt-1 leading-relaxed">{t(card.descKey)}</p>
              <div className="flex items-center gap-1 mt-4 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all duration-200" style={{ color: card.color }}>
                Configurer <ChevronRight size={12} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
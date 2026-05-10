'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MessageSquarePlus, Bot, Sparkles } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/context'
import { BackButton } from '@/components/ui/BackButton'

import type { TranslationKey } from '@/lib/i18n/translations'

interface AgentConfig {
  type: string
  labelKey: TranslationKey
  descKey: TranslationKey
  emoji: string
  color: string
  hex: string
  capabilityKeys: TranslationKey[]
  questionKeys: TranslationKey[]
}

const AGENT_TYPES: AgentConfig[] = [
  {
    type: 'general',
    labelKey: 'general',
    descKey: 'general_desc',
    emoji: '🤖',
    color: 'from-slate-500 to-slate-600',
    hex: '#64748b',
    capabilityKeys: ['agent.general.cap.1', 'agent.general.cap.2', 'agent.general.cap.3', 'agent.general.cap.4'],
    questionKeys: ['agent.general.q.1', 'agent.general.q.2', 'agent.general.q.3'],
  },
  {
    type: 'marketing',
    labelKey: 'marketing',
    descKey: 'marketing_desc',
    emoji: '📣',
    color: 'from-pink-500 to-rose-600',
    hex: '#f472b6',
    capabilityKeys: ['agent.marketing.cap.1', 'agent.marketing.cap.2', 'agent.marketing.cap.3', 'agent.marketing.cap.4'],
    questionKeys: ['agent.marketing.q.1', 'agent.marketing.q.2', 'agent.marketing.q.3'],
  },
  {
    type: 'sales',
    labelKey: 'sales',
    descKey: 'sales_desc',
    emoji: '💼',
    color: 'from-green-500 to-emerald-600',
    hex: '#34d399',
    capabilityKeys: ['agent.sales.cap.1', 'agent.sales.cap.2', 'agent.sales.cap.3', 'agent.sales.cap.4'],
    questionKeys: ['agent.sales.q.1', 'agent.sales.q.2', 'agent.sales.q.3'],
  },
  {
    type: 'social_media',
    labelKey: 'social_media',
    descKey: 'social_media_desc',
    emoji: '📱',
    color: 'from-violet-500 to-purple-600',
    hex: '#a78bfa',
    capabilityKeys: ['agent.social.cap.1', 'agent.social.cap.2', 'agent.social.cap.3', 'agent.social.cap.4'],
    questionKeys: ['agent.social.q.1', 'agent.social.q.2', 'agent.social.q.3'],
  },
  {
    type: 'communication',
    labelKey: 'communication',
    descKey: 'communication_desc',
    emoji: '✉️',
    color: 'from-sky-500 to-blue-600',
    hex: '#38bdf8',
    capabilityKeys: ['agent.communication.cap.1', 'agent.communication.cap.2', 'agent.communication.cap.3', 'agent.communication.cap.4'],
    questionKeys: ['agent.communication.q.1', 'agent.communication.q.2', 'agent.communication.q.3'],
  },
  {
    type: 'automation',
    labelKey: 'automation',
    descKey: 'automation_desc',
    emoji: '⚡',
    color: 'from-yellow-500 to-orange-600',
    hex: '#fb923c',
    capabilityKeys: ['agent.automation.cap.1', 'agent.automation.cap.2', 'agent.automation.cap.3', 'agent.automation.cap.4'],
    questionKeys: ['agent.automation.q.1', 'agent.automation.q.2', 'agent.automation.q.3'],
  },
  {
    type: 'analytics',
    labelKey: 'analytics_agent',
    descKey: 'analytics_desc',
    emoji: '📊',
    color: 'from-blue-500 to-cyan-600',
    hex: '#0ea5e9',
    capabilityKeys: ['agent.analytics.cap.1', 'agent.analytics.cap.2', 'agent.analytics.cap.3', 'agent.analytics.cap.4'],
    questionKeys: ['agent.analytics.q.1', 'agent.analytics.q.2', 'agent.analytics.q.3'],
  },
]

export default function ChatPage() {
  const { t } = useTranslation()
  const router = useRouter()

  // Auto-redirect if agent/lead params are present (e.g. from CRM)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const agent = params.get('agent')
    const lead = params.get('lead')
    if (agent) {
      const target = lead
        ? `/chat/new?agent=${encodeURIComponent(agent)}&lead=${encodeURIComponent(lead)}`
        : `/chat/new?agent=${encodeURIComponent(agent)}`
      router.replace(target)
    }
  }, [router])

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <BackButton />
      <div className="text-center mb-10 animate-fade-up">
        <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
          style={{
            background: 'linear-gradient(135deg, rgba(14,165,233,0.2), rgba(14,165,233,0.06))',
            border: '1px solid rgba(14,165,233,0.25)',
            boxShadow: '0 0 32px rgba(14,165,233,0.2)',
          }}>
          <Bot className="w-8 h-8 text-[#0ea5e9]" />
          <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full"
            style={{ background: 'linear-gradient(135deg, #fb923c, #f97316)', boxShadow: '0 0 8px rgba(251,146,60,0.6)' }}>
            <Sparkles className="w-2.5 h-2.5 text-white" />
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white gradient-text" style={{ letterSpacing: '-0.02em' }}>{t('new_conversation')}</h1>
        <p className="text-[#64748b] text-sm mt-2">{t('choose_agent_start')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 stagger-children">
        {AGENT_TYPES.map(agent => (
          <Link
            key={agent.type}
            href={`/chat/new?agent=${agent.type}`}
            className="group flex flex-col gap-3 p-4 rounded-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
            style={{
              background: 'var(--glass-bg-strong)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid var(--border-color)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = 'var(--glass-bg-full)'
              ;(e.currentTarget as HTMLAnchorElement).style.border = `1px solid ${agent.hex}35`
              ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 8px 24px ${agent.hex}18, 0 0 0 1px ${agent.hex}15`
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = 'var(--glass-bg-strong)'
              ;(e.currentTarget as HTMLAnchorElement).style.border = '1px solid var(--border-color)'
              ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none'
            }}
          >
            {/* Gradient top bar */}
            <div className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl"
              style={{ background: `linear-gradient(90deg, ${agent.hex}, transparent)` }} />

            {/* Header row */}
            <div className="flex items-center gap-3">
              <div className={`flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br ${agent.color} text-xl shrink-0 shadow-lg transition-transform duration-300 group-hover:scale-110`}
                style={{ boxShadow: `0 4px 16px ${agent.hex}30` }}>
                {agent.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white text-sm">{t(agent.labelKey)}</div>
                <div className="text-[#94a3b8] text-xs mt-0.5 truncate group-hover:text-[#cbd5e1] transition-colors duration-200">{t(agent.descKey)}</div>
              </div>
              <MessageSquarePlus className="w-4 h-4 text-[#64748b] group-hover:text-[#0ea5e9] ml-auto transition-colors duration-200 opacity-60 group-hover:opacity-100 shrink-0" />
            </div>

            {/* Capabilities pills */}
            <div className="flex flex-wrap gap-1.5">
              {agent.capabilityKeys.map((cap, i) => (
                <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium"
                  style={{ background: `${agent.hex}15`, color: agent.hex, border: `1px solid ${agent.hex}25` }}>
                  {t(cap)}
                </span>
              ))}
            </div>

            {/* Suggested questions */}
            <div className="space-y-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {agent.questionKeys.map((q, i) => (
                <div key={i} className="text-[11px] flex items-start gap-1.5">
                  <span style={{ color: agent.hex }} className="mt-0.5 shrink-0 font-bold">›</span>
                  <span className="leading-tight text-[#cbd5e1]">{t(q)}</span>
                </div>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

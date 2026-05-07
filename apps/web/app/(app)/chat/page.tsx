'use client'
import Link from 'next/link'
import { MessageSquarePlus, Bot, Sparkles } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/context'

import type { TranslationKey } from '@/lib/i18n/translations'

interface AgentConfig {
  type: string
  labelKey: TranslationKey
  descKey: TranslationKey
  emoji: string
  color: string
  hex: string
  capabilities: string[]
  suggestedQuestions: string[]
}

const AGENT_TYPES: AgentConfig[] = [
  {
    type: 'general',
    labelKey: 'general',
    descKey: 'general_desc',
    emoji: '🤖',
    color: 'from-slate-500 to-slate-600',
    hex: '#64748b',
    capabilities: ['Stratégie business', 'Finances', 'Croissance', 'Outils SaaS'],
    suggestedQuestions: [
      'Comment structurer ma levée de fonds seed ?',
      'Quels KPIs suivre pour une startup B2B ?',
      'Comment recruter mes 3 premiers commerciaux ?',
    ],
  },
  {
    type: 'marketing',
    labelKey: 'marketing',
    descKey: 'marketing_desc',
    emoji: '📣',
    color: 'from-pink-500 to-rose-600',
    hex: '#f472b6',
    capabilities: ['Posts LinkedIn viraux', 'Stratégie contenu', 'SEO sémantique', 'Campagnes email'],
    suggestedQuestions: [
      'Écris-moi un post LinkedIn sur mon SaaS',
      'Crée une stratégie contenu pour 30 jours',
      'Quels mots-clés cibler pour mon secteur ?',
    ],
  },
  {
    type: 'sales',
    labelKey: 'sales',
    descKey: 'sales_desc',
    emoji: '💼',
    color: 'from-green-500 to-emerald-600',
    hex: '#34d399',
    capabilities: ['Pipeline CRM en temps réel', 'Scripts de vente', 'Emails de prospection', 'Objections'],
    suggestedQuestions: [
      'Montre-moi mes leads chauds',
      'Écris un script pour appel de découverte',
      'Comment relancer un prospect silencieux ?',
    ],
  },
  {
    type: 'social_media',
    labelKey: 'social_media',
    descKey: 'social_media_desc',
    emoji: '📱',
    color: 'from-violet-500 to-purple-600',
    hex: '#a78bfa',
    capabilities: ['Hooks LinkedIn et Instagram', 'Stratégie hashtags', 'Calendrier éditorial', 'Reels et TikTok'],
    suggestedQuestions: [
      'Crée 5 idées de reels Instagram pour mon activité',
      'Quel est le meilleur horaire pour publier sur LinkedIn ?',
      'Génère un calendrier de contenu pour cette semaine',
    ],
  },
  {
    type: 'communication',
    labelKey: 'communication',
    descKey: 'communication_desc',
    emoji: '✉️',
    color: 'from-sky-500 to-blue-600',
    hex: '#38bdf8',
    capabilities: ['Cold emails haute délivrabilité', 'Séquences nurturing', 'Objet A/B testable', 'Réponse aux objections'],
    suggestedQuestions: [
      'Écris un cold email pour prospecter des PME',
      'Crée une séquence de 5 emails de nurturing',
      'Comment améliorer le taux d\'ouverture de mes emails ?',
    ],
  },
  {
    type: 'automation',
    labelKey: 'automation',
    descKey: 'automation_desc',
    emoji: '⚡',
    color: 'from-yellow-500 to-orange-600',
    hex: '#fb923c',
    capabilities: ['Workflows Zapier / Make', 'Automatisation CRM', 'Planning de semaine', 'ROI des automatisations'],
    suggestedQuestions: [
      'Crée un workflow pour qualifier mes leads automatiquement',
      'Comment automatiser mes relances email avec Make ?',
      'Optimise mon planning pour cette semaine',
    ],
  },
  {
    type: 'analytics',
    labelKey: 'analytics_agent',
    descKey: 'analytics_desc',
    emoji: '📊',
    color: 'from-blue-500 to-cyan-600',
    hex: '#0ea5e9',
    capabilities: ['Stats en temps réel', 'KPIs et tableaux de bord', 'Analyse de cohortes', 'Prévisions de croissance'],
    suggestedQuestions: [
      'Quel est mon taux de conversion ce mois ?',
      'Analyse mes performances des 30 derniers jours',
      'Quels KPIs dois-je absolument suivre ?',
    ],
  },
]

export default function ChatPage() {
  const { t } = useTranslation()

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
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
        <h1 className="text-2xl font-bold text-white gradient-text">{t('new_conversation')}</h1>
        <p className="text-[#64748b] text-sm mt-2">{t('choose_agent_start')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 stagger-children">
        {AGENT_TYPES.map(agent => (
          <Link
            key={agent.type}
            href={`/chat/new?agent=${agent.type}`}
            className="group flex flex-col gap-3 p-4 rounded-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
            style={{
              background: 'rgba(17,24,39,0.7)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.border = `1px solid ${agent.hex}30`
              ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 8px 24px ${agent.hex}12, 0 0 0 1px ${agent.hex}15`
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.border = '1px solid rgba(255,255,255,0.07)'
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
                <div className="font-semibold text-[#e2e8f0] text-sm">{t(agent.labelKey)}</div>
                <div className="text-[#64748b] text-xs mt-0.5 truncate">{t(agent.descKey)}</div>
              </div>
              <MessageSquarePlus className="w-4 h-4 text-[#64748b] group-hover:text-[#0ea5e9] ml-auto transition-colors duration-200 opacity-60 group-hover:opacity-100 shrink-0" />
            </div>

            {/* Capabilities pills */}
            <div className="flex flex-wrap gap-1.5">
              {agent.capabilities.map((cap, i) => (
                <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium"
                  style={{ background: `${agent.hex}15`, color: agent.hex, border: `1px solid ${agent.hex}25` }}>
                  {cap}
                </span>
              ))}
            </div>

            {/* Suggested questions */}
            <div className="space-y-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {agent.suggestedQuestions.map((q, i) => (
                <div key={i} className="text-[11px] text-[#475569] flex items-start gap-1.5">
                  <span style={{ color: agent.hex }} className="mt-0.5 shrink-0">›</span>
                  <span className="leading-tight">{q}</span>
                </div>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

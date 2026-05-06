'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  MessageSquare, Zap, Users, Clock, TrendingUp, TrendingDown,
  Plus, FileText, Brain, Sparkles,
  AlertTriangle, Lightbulb, Calendar, Target,
  Send, Workflow, PenTool, ChevronRight,
  Activity, Shield, Award, Building2
} from 'lucide-react'
import { useTranslation } from '@/lib/i18n/context'
import { api } from '@/lib/api'

const HOUR = new Date().getHours()
const GREETING = HOUR < 12 ? 'Bonjour' : HOUR < 18 ? 'Bon après-midi' : 'Bonsoir'

interface BusinessProfile {
  business_name:   string | null
  sector:          string | null
  main_objective:  string | null
  business_summary: string | null
}

const AGENTS = [
  { name: 'Marketing', status: 'active', leads: 32, convos: 12, icon: '📣', color: '#fb923c' },
  { name: 'Sales', status: 'active', leads: 18, convos: 8, icon: '💼', color: '#0ea5e9' },
  { name: 'Social Media', status: 'active', leads: 15, convos: 6, icon: '📱', color: '#f472b6' },
  { name: 'Communication', status: 'idle', leads: 8, convos: 3, icon: '✉️', color: '#34d399' },
  { name: 'Automation', status: 'active', leads: 22, convos: 10, icon: '⚡', color: '#8b5cf6' },
  { name: 'Analytics', status: 'active', leads: 0, convos: 5, icon: '📊', color: '#06b6d4' },
]

const ACTIVITIES = [
  { icon: Send, text: 'Agent Marketing a généré 3 posts LinkedIn', time: 'Il y a 10 min', color: '#fb923c' },
  { icon: Target, text: 'Lead qualifié ajouté au pipeline', time: 'Il y a 42 min', color: '#0ea5e9' },
  { icon: Zap, text: 'Workflow de relance email exécuté', time: 'Il y a 1h', color: '#8b5cf6' },
  { icon: FileText, text: 'Rapport hebdomadaire généré et envoyé', time: 'Il y a 2h', color: '#34d399' },
  { icon: MessageSquare, text: 'Nouvelle conversation initiée par un visiteur', time: 'Il y a 3h', color: '#06b6d4' },
]

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data) * 1.2
  const w = 120
  const h = 32
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(' ')
  return (
    <svg width={w} height={h} className="overflow-visible">
      <defs>
        <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${points} ${w},${h}`} fill={`url(#sg-${color.replace('#','')})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [profile, setProfile] = useState<BusinessProfile | null>(null)

  useEffect(() => {
    api.get<BusinessProfile>('/api/v1/onboarding/profile')
      .then(setProfile)
      .catch(() => {}) // profile is optional — dashboard works without it
  }, [])

  const KPI_DATA = [
    {
      label: t('dashboard.conversations'),
      value: '142',
      delta: '+12%',
      deltaType: 'up' as const,
      desc: 'opportunités générées ce mois',
      icon: MessageSquare,
      color: '#0ea5e9',
      link: '/chat',
      sparkline: [30, 35, 28, 42, 38, 45, 50, 48, 55, 52, 60, 58],
    },
    {
      label: t('dashboard.autotasks'),
      value: '38',
      delta: '+8%',
      deltaType: 'up' as const,
      desc: 'workflows exécutés cette semaine',
      icon: Zap,
      color: '#34d399',
      link: '/workflows',
      sparkline: [10, 12, 15, 14, 18, 20, 22, 25, 24, 28, 30, 32],
    },
    {
      label: t('dashboard.leads'),
      value: '24',
      delta: '+5%',
      deltaType: 'up' as const,
      desc: 'nouveaux prospects qualifiés',
      icon: Users,
      color: '#fb923c',
      link: '/crm',
      sparkline: [5, 8, 6, 10, 12, 9, 15, 14, 18, 16, 20, 24],
    },
    {
      label: t('dashboard.timesaved'),
      value: '12h',
      delta: '+3h',
      deltaType: 'up' as const,
      desc: 'cette semaine vs travail manuel',
      icon: Clock,
      color: '#8b5cf6',
      link: '/analytics',
      sparkline: [1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 8, 10, 12],
    },
  ]

  const QUICK_ACTIONS = [
    { label: t('dashboard.newlead'), icon: Plus, href: '/crm', color: '#0ea5e9' },
    { label: t('dashboard.createworkflow'), icon: Workflow, href: '/workflows', color: '#8b5cf6' },
    { label: t('dashboard.generatecontent'), icon: PenTool, href: '/content', color: '#fb923c' },
    { label: t('dashboard.planpost'), icon: Calendar, href: '/schedule', color: '#f472b6' },
    { label: t('dashboard.viewpredictions'), icon: TrendingUp, href: '/predictions', color: '#34d399' },
    { label: t('dashboard.weeklyreport'), icon: FileText, href: '/reports', color: '#06b6d4' },
  ]

  return (
    <div className="space-y-6 animate-fade-up">

      {/* HEADER PERSONNALISE */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
            {GREETING}{profile?.business_name ? `, ${profile.business_name}` : ''} 👋
          </h1>
          <p className="text-[#94a3b8] text-sm">
            {profile?.sector
              ? `${t('dashboard.todaySummary')} · ${profile.sector}`
              : t('dashboard.todaySummary')}
          </p>
          {profile?.business_summary && (
            <div className="flex items-start gap-2 mt-3 px-3 py-2 rounded-xl max-w-md"
              style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.15)' }}>
              <Building2 size={13} className="mt-0.5 shrink-0" style={{ color: '#38bdf8' }} />
              <p className="text-xs leading-relaxed" style={{ color: '#94a3b8' }}>
                {profile.business_summary}
              </p>
            </div>
          )}
          <div className="flex items-center gap-4 mt-3">
            <span className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}>
              <TrendingUp size={12} /> +15% de croissance ce mois
            </span>
            <span className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(14,165,233,0.1)', color: '#38bdf8', border: '1px solid rgba(14,165,233,0.2)' }}>
              <Users size={12} /> 24 nouveaux leads
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/chat')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', boxShadow: '0 4px 20px rgba(14,165,233,0.3)' }}
          >
            <Sparkles size={14} /> {t('dashboard.talkToProAI')}
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_DATA.map((kpi, i) => (
          <div
            key={i}
            onClick={() => router.push(kpi.link)}
            className="rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1.5 group relative overflow-hidden"
            style={{
              background: 'rgba(17,24,39,0.7)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.border = `1px solid ${kpi.color}30`
              ;(e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 32px ${kpi.color}18, 0 0 0 1px ${kpi.color}15`
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.border = '1px solid rgba(255,255,255,0.07)'
              ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
            }}
          >
            {/* Gradient top bar */}
            <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: `linear-gradient(90deg, ${kpi.color}, ${kpi.color}60)` }} />
            {/* Ambient glow */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{ background: `radial-gradient(ellipse at 50% 0%, ${kpi.color}08, transparent 70%)` }} />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                  style={{ background: `${kpi.color}18`, boxShadow: `0 0 0 1px ${kpi.color}20` }}>
                  <kpi.icon size={18} style={{ color: kpi.color }} />
                </div>
                <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: kpi.deltaType === 'up' ? 'rgba(52,211,153,0.1)' : 'rgba(239,68,68,0.1)', color: kpi.deltaType === 'up' ? '#34d399' : '#ef4444', border: kpi.deltaType === 'up' ? '1px solid rgba(52,211,153,0.2)' : '1px solid rgba(239,68,68,0.2)' }}>
                  {kpi.deltaType === 'up' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {kpi.delta}
                </span>
              </div>
              <div className="text-3xl font-extrabold text-white mb-1 tracking-tight">{kpi.value}</div>
              <div className="text-xs text-[#94a3b8] mb-3 leading-relaxed">{kpi.desc}</div>
              <MiniSparkline data={kpi.sparkline} color={kpi.color} />
              <div className="flex items-center gap-1 mt-3 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0" style={{ color: kpi.color }}>
                {t('dashboard.viewDetails')} <ChevronRight size={12} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* AI INSIGHTS */}
        <div className="lg:col-span-2 rounded-xl p-5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #111827, #0f172a)', border: '1px solid rgba(14,165,233,0.15)' }}>
          <div className="absolute top-0 right-0 w-40 h-40 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.08), transparent 70%)' }} />

          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.15)' }}>
              <Brain size={16} style={{ color: '#a78bfa' }} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{t('dashboard.insightsIA')}</h3>
              <p className="text-[10px] text-[#64748b]">{t('dashboard.insightsSubtitle')}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.1)' }}>
              <TrendingUp size={16} style={{ color: '#34d399' }} className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-white font-medium">Croissance du chiffre d'affaires +15 % ce mois</p>
                <p className="text-xs text-[#94a3b8] mt-0.5">Accélération portée par LinkedIn (+42 % trafic). Continuez cette stratégie.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'rgba(251,146,60,0.06)', border: '1px solid rgba(251,146,60,0.1)' }}>
              <AlertTriangle size={16} style={{ color: '#fb923c' }} className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-white font-medium">Agent Marketing en baisse (-23% engagement)</p>
                <p className="text-xs text-[#94a3b8] mt-0.5">Optimisation possible : varier les formats de contenu (+18 leads estimés).</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.1)' }}>
              <Lightbulb size={16} style={{ color: '#38bdf8' }} className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-white font-medium">Recommandation : lancer une campagne email</p>
                <p className="text-xs text-[#94a3b8] mt-0.5">3 leads chauds détectés dans votre pipeline. Taux de conversion estimé : 67 %.</p>
              </div>
            </div>
          </div>

          {/* AI prediction card */}
          <div className="mt-4 p-4 rounded-xl relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(14,165,233,0.1))', border: '1px solid rgba(139,92,246,0.15)' }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={14} style={{ color: '#a78bfa' }} />
                  <span className="text-xs font-bold" style={{ color: '#a78bfa' }}>{t('dashboard.aiPrediction')}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399' }}>Confiance 87%</span>
                </div>
                <p className="text-sm text-white font-medium">Vos ventes devraient augmenter de 15% ce mois</p>
                <p className="text-xs text-[#94a3b8] mt-0.5">Basé sur votre pipeline actuel et les tendances marché.</p>
              </div>
              <button
                onClick={() => router.push('/predictions')}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:-translate-y-0.5"
                style={{ background: 'rgba(139,92,246,0.2)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' }}
              >
                {t('dashboard.viewDetails')}
              </button>
            </div>
          </div>
        </div>

        {/* ACTIVITE RECENTE */}
        <div className="rounded-xl p-5" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Activity size={14} style={{ color: '#0ea5e9' }} />
            {t('dashboard.recentactivity')}
          </h3>
          <div className="space-y-3">
            {ACTIVITIES.map((a, i) => (
              <div key={i} className="flex items-start gap-3 p-2 rounded-lg transition-colors hover:bg-[#1a2236] cursor-pointer">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${a.color}15` }}>
                  <a.icon size={14} style={{ color: a.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#e2e8f0] leading-relaxed">{a.text}</p>
                  <p className="text-[10px] text-[#64748b] mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AGENTS + QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* AGENTS */}
        <div className="lg:col-span-2 rounded-2xl p-5"
          style={{ background: 'rgba(17,24,39,0.7)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Shield size={14} style={{ color: '#0ea5e9' }} />
            {t('dashboard.agentstatus')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {AGENTS.map((agent, i) => (
              <div
                key={i}
                onClick={() => router.push(`/chat?agent=${agent.name.toLowerCase().replace(' ', '_')}`)}
                className="rounded-xl p-4 cursor-pointer transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden"
                style={{ background: 'rgba(26,34,54,0.8)', border: '1px solid rgba(255,255,255,0.05)' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.border = `1px solid ${agent.color}25`
                  ;(e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 24px ${agent.color}12`
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.border = '1px solid rgba(255,255,255,0.05)'
                  ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(90deg, ${agent.color}, transparent)` }} />
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl">{agent.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{agent.name}</p>
                    <span className="flex items-center gap-1 text-[10px]" style={{ color: agent.status === 'active' ? '#34d399' : '#64748b' }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: agent.status === 'active' ? '#34d399' : '#64748b', boxShadow: agent.status === 'active' ? '0 0 6px rgba(52,211,153,0.8)' : 'none' }} />
                      {agent.status === 'active' ? t('dashboard.connected') : t('dashboard.idle')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[11px] text-[#94a3b8]">
                  <span className="flex items-center gap-1">
                    <Target size={10} style={{ color: agent.color }} /> {agent.leads} leads
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare size={10} style={{ color: agent.color }} /> {agent.convos} convos
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <button className="text-[10px] px-2.5 py-1 rounded-full font-semibold" style={{ background: `${agent.color}18`, color: agent.color, border: `1px solid ${agent.color}25` }}>{t('dashboard.viewDetails')}</button>
                  <button className="text-[10px] px-2.5 py-1 rounded-full font-semibold" style={{ background: 'rgba(255,255,255,0.04)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}>{t('dashboard.optimize')}</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="rounded-2xl p-5"
          style={{ background: 'rgba(17,24,39,0.7)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Zap size={14} style={{ color: '#fb923c' }} />
            {t('dashboard.quickactions')}
          </h3>
          <div className="space-y-2">
            {QUICK_ACTIONS.map((action, i) => (
              <button
                key={i}
                onClick={() => router.push(action.href)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 hover:-translate-y-0.5 group"
                style={{ background: 'rgba(26,34,54,0.8)', border: '1px solid rgba(255,255,255,0.04)' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.border = `1px solid ${action.color}20`
                  ;(e.currentTarget as HTMLButtonElement).style.boxShadow = `0 4px 16px ${action.color}10`
                  ;(e.currentTarget as HTMLButtonElement).style.background = `rgba(26,34,54,1)`
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.border = '1px solid rgba(255,255,255,0.04)'
                  ;(e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'
                  ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(26,34,54,0.8)'
                }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:scale-110"
                  style={{ background: `${action.color}15`, boxShadow: `0 0 0 1px ${action.color}18` }}>
                  <action.icon size={14} style={{ color: action.color }} />
                </div>
                <span className="text-sm text-[#e2e8f0] font-medium flex-1">{action.label}</span>
                <ChevronRight size={14} className="text-[#64748b] opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-x-1 group-hover:translate-x-0" />
              </button>
            ))}
          </div>

          {/* Gamification */}
          <div className="mt-4 p-3 rounded-xl" style={{ background: 'rgba(251,146,60,0.06)', border: '1px solid rgba(251,146,60,0.1)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Award size={14} style={{ color: '#fb923c' }} />
              <span className="text-xs font-bold" style={{ color: '#fb923c' }}>{t('dashboard.todayGoal')}</span>
            </div>
            <p className="text-xs text-[#94a3b8]">Générez 3 contenus pour débloquer le badge « Content Creator »</p>
            <div className="w-full h-1.5 rounded-full mt-2 overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div className="h-full rounded-full" style={{ width: '33%', background: 'linear-gradient(90deg, #fb923c, #f97316)' }} />
            </div>
            <p className="text-[10px] text-[#64748b] mt-1">1/3 réalisé</p>
          </div>
        </div>
      </div>
    </div>
  )
}

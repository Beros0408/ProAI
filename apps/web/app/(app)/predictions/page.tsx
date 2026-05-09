'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  TrendingUp, Shield, Sparkles, RefreshCw, ChevronRight,
  AlertTriangle, Zap, Target, ArrowRight,
  Brain, Activity, Eye
} from 'lucide-react'
import { useTranslation } from '@/lib/i18n/context'
import type { TranslationKey } from '@/lib/i18n/translations'

const SALES_DATA = [0, 0, 12, 28, 45, 68, 85, 98, 110, 125]
const PREDICTION_DATA = [null, null, null, null, null, null, null, 98, 118, 135, 148, 162]
const MAX_VAL = 170

interface ClientData {
  name: string
  actionKey: TranslationKey
  risk: number
  color: string
}

const CLIENTS: ClientData[] = [
  { name: 'Client A', actionKey: 'predictions.client.A.action', risk: 82, color: '#ef4444' },
  { name: 'Client B', actionKey: 'predictions.client.B.action', risk: 72, color: '#ef4444' },
  { name: 'Client C', actionKey: 'predictions.client.C.action', risk: 61, color: '#fb923c' },
  { name: 'Client D', actionKey: 'predictions.client.D.action', risk: 48, color: '#0ea5e9' },
  { name: 'Client E', actionKey: 'predictions.client.E.action', risk: 34, color: '#0ea5e9' },
]

interface TrendData {
  textKey: TranslationKey
  impactKey: TranslationKey
  icon: string
  color: string
  glow: string
}

const TRENDS: TrendData[] = [
  { textKey: 'predictions.trend.1', impactKey: 'predictions.trend.high',   icon: '🔥', color: '#ef4444', glow: 'rgba(239,68,68,0.15)' },
  { textKey: 'predictions.trend.2', impactKey: 'predictions.trend.high',   icon: '⚡', color: '#fb923c', glow: 'rgba(251,146,60,0.15)' },
  { textKey: 'predictions.trend.3', impactKey: 'predictions.trend.medium', icon: '🌱', color: '#34d399', glow: 'rgba(52,211,153,0.15)' },
  { textKey: 'predictions.trend.4', impactKey: 'predictions.trend.medium', icon: '⚡', color: '#8b5cf6', glow: 'rgba(139,92,246,0.15)' },
  { textKey: 'predictions.trend.5', impactKey: 'predictions.trend.low',    icon: '🌱', color: '#06b6d4', glow: 'rgba(6,182,212,0.15)' },
]

function SalesChart() {
  const { t, locale } = useTranslation()
  const intlLocale = locale === 'fr' ? 'fr-FR' : 'en-US'
  const MONTHS = Array.from({ length: 12 }, (_, i) => {
    const name = new Intl.DateTimeFormat(intlLocale, { month: 'short' }).format(new Date(2000, i, 1))
    return name.charAt(0).toUpperCase() + name.slice(1)
  })
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 300)
    return () => clearTimeout(timer)
  }, [])

  const w = 560
  const h = 280
  const padL = 40
  const padB = 30
  const chartW = w - padL
  const chartH = h - padB

  const toX = (i: number) => padL + (i / 11) * chartW
  const toY = (v: number) => chartH - (v / MAX_VAL) * chartH

  const realPoints = SALES_DATA.map((v, i) => `${toX(i)},${toY(v)}`).join(' ')
  const predPoints = PREDICTION_DATA
    .map((v, i) => (v !== null ? `${toX(i)},${toY(v)}` : null))
    .filter(Boolean)
    .join(' ')

  const areaPoints = `${toX(0)},${chartH} ${realPoints} ${toX(SALES_DATA.length - 1)},${chartH}`

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Grille */}
      {[0, 35, 70, 105, 140].map((v, i) => (
        <g key={i}>
          <line x1={padL} y1={toY(v)} x2={w} y2={toY(v)} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <text x={padL - 8} y={toY(v) + 4} fill="#64748b" fontSize="10" textAnchor="end">{v}</text>
        </g>
      ))}

      {/* Étiquettes des mois */}
      {MONTHS.map((m, i) => (
        <text key={m} x={toX(i)} y={h - 5} fill="#64748b" fontSize="9" textAnchor="middle">{m}</text>
      ))}

      {/* Zone de projection */}
      <rect x={toX(7)} y={0} width={toX(11) - toX(7)} height={chartH} fill="url(#predGrad)" rx="4" className={animated ? 'animate-pulse' : ''} style={{ animationDuration: '3s' }} />
      <text x={toX(9)} y={20} fill="#a78bfa" fontSize="9" textAnchor="middle" fontWeight="600">{t('predictions.projection')}</text>

      {/* Aire sous la courbe réelle */}
      <polygon points={areaPoints} fill="url(#areaGrad)" className={`transition-opacity duration-1000 ${animated ? 'opacity-100' : 'opacity-0'}`} />

      {/* Courbe réelle */}
      <polyline
        points={realPoints}
        fill="none"
        stroke="url(#lineGrad)"
        strokeWidth="2.5"
        filter="url(#glow)"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`transition-all duration-1000 ${animated ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Courbe de projection */}
      <polyline
        points={predPoints || ''}
        fill="none"
        stroke="#8b5cf6"
        strokeWidth="2"
        strokeDasharray="6,4"
        filter="url(#glow)"
        strokeLinecap="round"
        className={`transition-all duration-1000 delay-500 ${animated ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Points réels */}
      {SALES_DATA.map((v, i) => (
        <circle key={`r${i}`} cx={toX(i)} cy={toY(v)} r="4" fill="#0ea5e9" stroke="#0c1220" strokeWidth="2"
          className={`transition-all duration-500 ${animated ? 'opacity-100' : 'opacity-0'}`}
          style={{ transitionDelay: `${i * 80}ms`, filter: 'drop-shadow(0 0 4px #0ea5e9)' }}
        />
      ))}

      {/* Points de projection */}
      {PREDICTION_DATA.map((v, i) => v !== null && i >= SALES_DATA.length && (
        <circle key={`p${i}`} cx={toX(i)} cy={toY(v)} r="4" fill="#8b5cf6" stroke="#0c1220" strokeWidth="2"
          className={`transition-all duration-500 ${animated ? 'opacity-100' : 'opacity-0'}`}
          style={{ transitionDelay: `${i * 80 + 400}ms`, filter: 'drop-shadow(0 0 4px #8b5cf6)' }}
        />
      ))}

      {/* Annotation */}
      <g className={`transition-opacity duration-700 delay-1000 ${animated ? 'opacity-100' : 'opacity-0'}`}>
        <line x1={toX(9)} y1={toY(135)} x2={toX(9)} y2={toY(135) - 20} stroke="#34d399" strokeWidth="1" />
        <rect x={toX(9) - 45} y={toY(135) - 36} width="90" height="18" rx="4" fill="rgba(52,211,153,0.15)" stroke="rgba(52,211,153,0.3)" strokeWidth="1" />
        <text x={toX(9)} y={toY(135) - 23} fill="#34d399" fontSize="9" textAnchor="middle" fontWeight="600">+15 % MoM</text>
      </g>
    </svg>
  )
}

export default function PredictionsPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [refreshing, setRefreshing] = useState(false)
  const [aiScore, setAiScore] = useState(0)
  const [barsVisible, setBarsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setAiScore(82), 800)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setBarsVisible(true), 400)
    return () => clearTimeout(timer)
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 2000)
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {/* EN-TÊTE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#8b5cf6' }}>
              {t('predictions.title')}
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399' }}>
              <Activity size={10} /> {t('predictions.realtime')}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">
            {t('predictions.subtitle')}
          </h1>
          <p className="text-sm text-[#94a3b8] mt-1">
            {t('dashboard.prediction.desc')}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60"
          style={{ background: '#111827', border: '1px solid rgba(139,92,246,0.3)', color: '#a78bfa' }}
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? t('agenda.analyzing') : t('predictions.refresh')}
        </button>
      </div>

      {/* GRILLE PRINCIPALE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* GRAPHIQUE PRINCIPAL */}
        <div className="lg:col-span-2 rounded-2xl p-5 relative overflow-hidden"
          style={{ background: 'linear-gradient(145deg, #0f0f1a, #111827)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 0 20px rgba(14,165,233,0.05)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={16} style={{ color: '#0ea5e9' }} />
                <span className="text-sm font-bold text-white">{t('predictions.chart.title')}</span>
              </div>
              <p className="text-xs text-[#64748b]">{t('predictions.chart.real')} + {t('predictions.chart.predicted')}</p>
            </div>
            <div className="flex items-center gap-4 text-[10px]">
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded-full" style={{ background: '#0ea5e9' }} /> {t('predictions.chart.real')}</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded-full" style={{ background: '#8b5cf6' }} /> {t('predictions.chart.predicted')}</span>
            </div>
          </div>
          <SalesChart />
        </div>

        {/* SCORE IA GLOBAL */}
        <div className="rounded-2xl p-5 relative overflow-hidden"
          style={{ background: 'linear-gradient(145deg, #0f0f1a, #111827)', border: '1px solid rgba(139,92,246,0.15)', boxShadow: '0 0 30px rgba(139,92,246,0.08)' }}>
          <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.1), transparent 70%)' }} />

          <div className="flex items-center gap-2 mb-4">
            <Brain size={16} style={{ color: '#a78bfa' }} />
            <span className="text-sm font-bold text-white">{t('dashboard.aiPrediction')}</span>
          </div>

          {/* Score circulaire */}
          <div className="flex justify-center mb-4">
            <div className="relative w-32 h-32">
              {/* Glow ring */}
              <div className="absolute inset-0 rounded-full animate-pulse-glow pointer-events-none" style={{ boxShadow: `0 0 ${aiScore > 0 ? '24px' : '0px'} rgba(139,92,246,0.3), 0 0 ${aiScore > 0 ? '48px' : '0px'} rgba(14,165,233,0.15)`, transition: 'box-shadow 1s ease-out' }} />
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="url(#scoreGrad)" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${aiScore * 2.64} 264`}
                  className="transition-all duration-1000 ease-out"
                  style={{ filter: 'drop-shadow(0 0 6px rgba(139,92,246,0.6))' }} />
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#0ea5e9" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-white">{aiScore} %</span>
                <span className="text-[10px] text-[#94a3b8]">Performance</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5 mb-4">
            <TrendingUp size={12} style={{ color: '#34d399' }} />
            <span className="text-xs font-bold" style={{ color: '#34d399' }}>{t('predictions.vs_last_month')}</span>
          </div>

          {/* Insight IA */}
          <div className="p-3 rounded-xl" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}>
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles size={12} style={{ color: '#a78bfa' }} />
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#a78bfa' }}>{t('dashboard.insightsIA')}</span>
            </div>
            <p className="text-xs text-[#e2e8f0] leading-relaxed">
              {t('dashboard.prediction.text')}
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={() => router.push('/chat?agent=analytics')}
            className="w-full mt-4 py-2.5 rounded-full text-xs font-bold text-white flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', boxShadow: '0 4px 20px rgba(139,92,246,0.3)' }}
          >
            <Target size={12} /> {t('predictions.churn.title')}
          </button>
        </div>
      </div>

      {/* LIGNE DU BAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* CLIENTS À SURVEILLER */}
        <div className="rounded-2xl p-5"
          style={{ background: 'linear-gradient(145deg, #0f0f1a, #111827)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 0 20px rgba(0,0,0,0.2)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield size={16} style={{ color: '#fb923c' }} />
              <span className="text-sm font-bold text-white">{t('predictions.churn.title')}</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(251,146,60,0.1)', color: '#fb923c' }}>
              {t('predictions.churn.subtitle')}
            </span>
          </div>

          <div className="space-y-3">
            {CLIENTS.map((client, i) => {
              const riskColor = client.risk > 70 ? '#ef4444' : client.risk > 50 ? '#fb923c' : '#0ea5e9'
              return (
                <div
                  key={i}
                  className="p-3 rounded-xl cursor-pointer transition-all duration-300 hover:-translate-y-1 group"
                  style={{ background: '#1a2236', border: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-sm font-semibold text-white">{client.name}</span>
                      <p className="text-[11px] text-[#94a3b8]">{t(client.actionKey)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold" style={{ color: riskColor }}>{client.risk} %</span>
                      {client.risk > 70 && <AlertTriangle size={12} style={{ color: '#ef4444' }} className="animate-pulse" />}
                    </div>
                  </div>
                  {/* Barre de risque */}
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: barsVisible ? `${client.risk}%` : '0%',
                        transitionDelay: `${i * 120}ms`,
                        background: `linear-gradient(90deg, ${riskColor}, ${riskColor}80)`,
                        boxShadow: `0 0 8px ${riskColor}40`,
                      }}
                    />
                  </div>
                  {/* Action au survol */}
                  <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-[10px] px-2 py-1 rounded-full font-medium"
                      style={{ background: `${riskColor}15`, color: riskColor }}>
                      {t('predictions.client.action')}
                    </button>
                    <button className="text-[10px] px-2 py-1 rounded-full font-medium"
                      style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}>
                      <Eye size={10} className="inline mr-1" />{t('common.viewDetails')}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* TENDANCES MARCHÉ */}
        <div className="rounded-2xl p-5"
          style={{ background: 'linear-gradient(145deg, #0f0f1a, #111827)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 0 20px rgba(0,0,0,0.2)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} style={{ color: '#06b6d4' }} />
            <span className="text-sm font-bold text-white">{t('predictions.trends.title')}</span>
          </div>

          <div className="space-y-3">
            {TRENDS.map((trend, i) => {
              const impactLabel = t(trend.impactKey)
              const impactColor = trend.impactKey === 'predictions.trend.high' ? '#ef4444'
                : trend.impactKey === 'predictions.trend.medium' ? '#fb923c'
                : '#06b6d4'
              return (
                <div
                  key={i}
                  className="p-3 rounded-xl cursor-pointer transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group"
                  style={{ background: '#1a2236', border: '1px solid rgba(255,255,255,0.04)' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.border = `1px solid ${trend.color}30`
                    ;(e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 20px ${trend.color}18`
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.border = '1px solid rgba(255,255,255,0.04)'
                    ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
                  }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"
                    style={{ background: `radial-gradient(circle at 100% 0%, ${trend.glow}, transparent 70%)` }} />

                  <div className="relative z-10 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="text-lg">{trend.icon}</span>
                      <p className="text-xs text-[#e2e8f0] leading-relaxed">{t(trend.textKey)}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: `${impactColor}15`, color: impactColor }}>
                      {impactLabel}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Recommandation IA */}
          <div className="mt-4 p-3 rounded-xl" style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)' }}>
            <div className="flex items-center gap-1.5 mb-2">
              <Brain size={12} style={{ color: '#06b6d4' }} />
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#06b6d4' }}>{t('dashboard.insightsIA')}</span>
            </div>
            <p className="text-xs text-[#e2e8f0] leading-relaxed mb-2">
              {t('dashboard.insight.tip.desc')}
            </p>
            <button
              onClick={() => router.push('/content')}
              className="flex items-center gap-1.5 text-[10px] font-bold transition-colors"
              style={{ color: '#06b6d4' }}
            >
              {t('dashboard.generatecontent')} <ArrowRight size={10} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

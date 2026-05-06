# Script Python pour creer la page Predictions Premium ProAI
import os

TARGET = os.path.join(
    "C:", os.sep, "Users", "bkabe", "Desktop", "Porjet - ProAI",
    "ProAI", "apps", "web", "app", "(app)", "predictions", "page.tsx"
)
os.makedirs(os.path.dirname(TARGET), exist_ok=True)

CODE = r"""'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  TrendingUp, Shield, Sparkles, RefreshCw, ChevronRight,
  AlertTriangle, Zap, Flame, Target, ArrowRight,
  BarChart3, Brain, Activity, Eye
} from 'lucide-react'

const SALES_DATA = [0, 0, 12, 28, 45, 68, 85, 98, 110, 125]
const PREDICTION_DATA = [null, null, null, null, null, null, null, 98, 118, 135, 148, 162]
const MONTHS = ['Jan', 'F\u00e9v', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Ao\u00fbt', 'Sep', 'Oct', 'Nov', 'D\u00e9c']
const MAX_VAL = 170

const CLIENTS = [
  { name: 'Client A', action: 'Proposition de valeur personnalis\u00e9e', risk: 82, color: '#ef4444' },
  { name: 'Client B', action: 'Relance cibl\u00e9e', risk: 72, color: '#ef4444' },
  { name: 'Client C', action: 'R\u00e9union de satisfaction', risk: 61, color: '#fb923c' },
  { name: 'Client D', action: "Offre d'engagement", risk: 48, color: '#0ea5e9' },
  { name: 'Client E', action: "Newsletter d'actualit\u00e9s", risk: 34, color: '#0ea5e9' },
]

const TRENDS = [
  { text: 'La vid\u00e9o courte devient le format pr\u00e9f\u00e9r\u00e9 B2B', impact: 'Fort', icon: '🔥', color: '#ef4444', glow: 'rgba(239,68,68,0.15)' },
  { text: 'Personnalisation des emails conduit \u00e0 +22% d\'ouverture', impact: 'Fort', icon: '⚡', color: '#fb923c', glow: 'rgba(251,146,60,0.15)' },
  { text: 'Int\u00e9gration CRM et IA am\u00e9liore le suivi client', impact: 'Moyen', icon: '🌱', color: '#34d399', glow: 'rgba(52,211,153,0.15)' },
  { text: 'Webinars interactifs renforcent la conversion', impact: 'Moyen', icon: '⚡', color: '#8b5cf6', glow: 'rgba(139,92,246,0.15)' },
  { text: 'Les micro-capsules sociales augmentent l\'engagement', impact: 'Faible', icon: '🌱', color: '#06b6d4', glow: 'rgba(6,182,212,0.15)' },
]

function SalesChart() {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 300)
    return () => clearTimeout(t)
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

      {/* Grid */}
      {[0, 35, 70, 105, 140].map((v, i) => (
        <g key={i}>
          <line x1={padL} y1={toY(v)} x2={w} y2={toY(v)} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <text x={padL - 8} y={toY(v) + 4} fill="#64748b" fontSize="10" textAnchor="end">{v}</text>
        </g>
      ))}

      {/* Month labels */}
      {MONTHS.map((m, i) => (
        <text key={m} x={toX(i)} y={h - 5} fill="#64748b" fontSize="9" textAnchor="middle">{m}</text>
      ))}

      {/* Prediction zone */}
      <rect x={toX(7)} y={0} width={toX(11) - toX(7)} height={chartH} fill="url(#predGrad)" rx="4" className={animated ? 'animate-pulse' : ''} style={{ animationDuration: '3s' }} />
      <text x={toX(9)} y={20} fill="#a78bfa" fontSize="9" textAnchor="middle" fontWeight="600">PROJECTION IA</text>

      {/* Area under real line */}
      <polygon points={areaPoints} fill="url(#areaGrad)" className={`transition-opacity duration-1000 ${animated ? 'opacity-100' : 'opacity-0'}`} />

      {/* Real line */}
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

      {/* Prediction line */}
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

      {/* Real data points */}
      {SALES_DATA.map((v, i) => (
        <circle key={`r${i}`} cx={toX(i)} cy={toY(v)} r="4" fill="#0ea5e9" stroke="#0c1220" strokeWidth="2"
          className={`transition-all duration-500 ${animated ? 'opacity-100' : 'opacity-0'}`}
          style={{ transitionDelay: `${i * 80}ms`, filter: 'drop-shadow(0 0 4px #0ea5e9)' }}
        />
      ))}

      {/* Prediction points */}
      {PREDICTION_DATA.map((v, i) => v !== null && i >= SALES_DATA.length && (
        <circle key={`p${i}`} cx={toX(i)} cy={toY(v)} r="4" fill="#8b5cf6" stroke="#0c1220" strokeWidth="2"
          className={`transition-all duration-500 ${animated ? 'opacity-100' : 'opacity-0'}`}
          style={{ transitionDelay: `${i * 80 + 400}ms`, filter: 'drop-shadow(0 0 4px #8b5cf6)' }}
        />
      ))}

      {/* Trigger annotation */}
      <g className={`transition-opacity duration-700 delay-1000 ${animated ? 'opacity-100' : 'opacity-0'}`}>
        <line x1={toX(9)} y1={toY(135)} x2={toX(9)} y2={toY(135) - 20} stroke="#34d399" strokeWidth="1" />
        <rect x={toX(9) - 45} y={toY(135) - 36} width="90" height="18" rx="4" fill="rgba(52,211,153,0.15)" stroke="rgba(52,211,153,0.3)" strokeWidth="1" />
        <text x={toX(9)} y={toY(135) - 23} fill="#34d399" fontSize="9" textAnchor="middle" fontWeight="600">+15% MoM</text>
      </g>
    </svg>
  )
}

export default function PredictionsPage() {
  const router = useRouter()
  const [refreshing, setRefreshing] = useState(false)
  const [aiScore, setAiScore] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setAiScore(82), 800)
    return () => clearTimeout(t)
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 2000)
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#8b5cf6' }}>
              Pr\u00e9dictions IA
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399' }}>
              <Activity size={10} /> Temps r\u00e9el
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">
            Anticipez les ventes, le churn et les tendances
          </h1>
          <p className="text-sm text-[#94a3b8] mt-1">
            Des insights concrets pour mieux piloter votre pipeline et vos actions prioritaires.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60"
          style={{ background: '#111827', border: '1px solid rgba(139,92,246,0.3)', color: '#a78bfa' }}
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Analyse en cours...' : 'Actualiser les pr\u00e9dictions'}
        </button>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* GRAPH PRINCIPAL */}
        <div className="lg:col-span-2 rounded-2xl p-5 relative overflow-hidden"
          style={{ background: 'linear-gradient(145deg, #0f0f1a, #111827)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 0 20px rgba(14,165,233,0.05)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={16} style={{ color: '#0ea5e9' }} />
                <span className="text-sm font-bold text-white">Pr\u00e9vision de ventes</span>
              </div>
              <p className="text-xs text-[#64748b]">Donn\u00e9es r\u00e9elles + projection IA sur 3 mois</p>
            </div>
            <div className="flex items-center gap-4 text-[10px]">
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded-full" style={{ background: '#0ea5e9' }} /> R\u00e9el</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded-full" style={{ background: '#8b5cf6', borderTop: '1px dashed #8b5cf6' }} /> Projection</span>
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
            <span className="text-sm font-bold text-white">Score IA global</span>
          </div>

          {/* Circular score */}
          <div className="flex justify-center mb-4">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="url(#scoreGrad)" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${aiScore * 2.64} 264`}
                  className="transition-all duration-1000 ease-out" />
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#0ea5e9" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-white">{aiScore}%</span>
                <span className="text-[10px] text-[#94a3b8]">Performance</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5 mb-4">
            <TrendingUp size={12} style={{ color: '#34d399' }} />
            <span className="text-xs font-bold" style={{ color: '#34d399' }}>+12% vs mois dernier</span>
          </div>

          {/* AI Insight */}
          <div className="p-3 rounded-xl" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}>
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles size={12} style={{ color: '#a78bfa' }} />
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#a78bfa' }}>Insight IA</span>
            </div>
            <p className="text-xs text-[#e2e8f0] leading-relaxed">
              Vos ventes devraient augmenter gr\u00e2ce \u00e0 la hausse des leads inbound et la baisse du churn sur le segment B.
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={() => router.push('/chat?agent=analytics')}
            className="w-full mt-4 py-2.5 rounded-full text-xs font-bold text-white flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', boxShadow: '0 4px 20px rgba(139,92,246,0.3)' }}
          >
            <Target size={12} /> Lancer une campagne de r\u00e9tention
          </button>
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* CLIENTS A SURVEILLER */}
        <div className="rounded-2xl p-5"
          style={{ background: 'linear-gradient(145deg, #0f0f1a, #111827)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 0 20px rgba(0,0,0,0.2)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield size={16} style={{ color: '#fb923c' }} />
              <span className="text-sm font-bold text-white">Risque de churn</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(251,146,60,0.1)', color: '#fb923c' }}>
              5 clients \u00e0 surveiller
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
                      <p className="text-[11px] text-[#94a3b8]">{client.action}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold" style={{ color: riskColor }}>{client.risk}%</span>
                      {client.risk > 70 && <AlertTriangle size={12} style={{ color: '#ef4444' }} className="animate-pulse" />}
                    </div>
                  </div>
                  {/* Risk bar */}
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${client.risk}%`,
                        background: `linear-gradient(90deg, ${riskColor}, ${riskColor}80)`,
                        boxShadow: `0 0 8px ${riskColor}40`,
                      }}
                    />
                  </div>
                  {/* Hover action */}
                  <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-[10px] px-2 py-1 rounded-full font-medium"
                      style={{ background: `${riskColor}15`, color: riskColor }}>
                      Action recommand\u00e9e
                    </button>
                    <button className="text-[10px] px-2 py-1 rounded-full font-medium"
                      style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}>
                      <Eye size={10} className="inline mr-1" />Voir le profil
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* TENDANCES MARCHE */}
        <div className="rounded-2xl p-5"
          style={{ background: 'linear-gradient(145deg, #0f0f1a, #111827)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 0 20px rgba(0,0,0,0.2)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} style={{ color: '#06b6d4' }} />
            <span className="text-sm font-bold text-white">Tendances march\u00e9</span>
          </div>

          <div className="space-y-3">
            {TRENDS.map((trend, i) => {
              const impactColor = trend.impact === 'Fort' ? '#ef4444' : trend.impact === 'Moyen' ? '#fb923c' : '#06b6d4'
              return (
                <div
                  key={i}
                  className="p-3 rounded-xl cursor-pointer transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group"
                  style={{ background: '#1a2236', border: '1px solid rgba(255,255,255,0.04)' }}
                >
                  {/* Hover glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"
                    style={{ background: `radial-gradient(circle at 100% 0%, ${trend.glow}, transparent 70%)` }} />

                  <div className="relative z-10 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="text-lg">{trend.icon}</span>
                      <p className="text-xs text-[#e2e8f0] leading-relaxed">{trend.text}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: `${impactColor}15`, color: impactColor }}>
                      {trend.impact}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* AI recommendation */}
          <div className="mt-4 p-3 rounded-xl" style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)' }}>
            <div className="flex items-center gap-1.5 mb-2">
              <Brain size={12} style={{ color: '#06b6d4' }} />
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#06b6d4' }}>Recommandation IA</span>
            </div>
            <p className="text-xs text-[#e2e8f0] leading-relaxed mb-2">
              Investissez dans la vid\u00e9o courte et la personnalisation email pour maximiser votre ROI ce trimestre.
            </p>
            <button
              onClick={() => router.push('/content')}
              className="flex items-center gap-1.5 text-[10px] font-bold transition-colors"
              style={{ color: '#06b6d4' }}
            >
              G\u00e9n\u00e9rer du contenu vid\u00e9o <ArrowRight size={10} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
"""

with open(TARGET, "w", encoding="utf-8") as f:
    f.write(CODE.lstrip())

print(f"[OK] Page Predictions Premium cr\u00e9\u00e9e : {TARGET}")
print(f"[OK] Taille : {os.path.getsize(TARGET)} octets")

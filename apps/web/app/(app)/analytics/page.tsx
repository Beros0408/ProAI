'use client'

import { useState, useEffect } from 'react'
import { Sparkles, TrendingUp, TrendingDown, Activity, Zap, Users, Clock, BarChart3, Radio } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/context'

const MONTHS = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aout', 'Sep', 'Oct', 'Nov', 'Dec']
const REVENUE_DATA = [12, 15, 17, 21, 24, 28, 33, 36, 39, 42, 45, 50]
const MAX_REV = 55

const SOCIAL_DATA = [
  { name: 'LinkedIn', value: 18500, color: '#00f0ff' },
  { name: 'Instagram', value: 13000, color: '#ff00ff' },
  { name: 'Facebook', value: 6500, color: '#ffff00' },
]
const MAX_SOCIAL = 20000

const KPI_CHANNELS = [
  { label: 'CONVERSATIONS', value: '142', delta: '+12%', color: '#00f0ff', data: [30, 35, 28, 42, 38, 45, 50, 48, 55, 52, 60, 58] },
  { label: 'AUTOMATIONS', value: '38', delta: '+8%', color: '#39ff14', data: [10, 12, 15, 14, 18, 20, 22, 25, 24, 28, 30, 32] },
  { label: 'LEADS', value: '24', delta: '+5%', color: '#ff00ff', data: [5, 8, 6, 10, 12, 9, 15, 14, 18, 16, 20, 22] },
  { label: 'TEMPS ECON.', value: '6h', delta: '+2h', color: '#ffff00', data: [1, 1.5, 2, 2.5, 2, 3, 3.5, 4, 4.5, 5, 5.5, 6] },
]

const TRIGGER_LOGS = [
  { time: '14:32:03', type: 'SPIKE', msg: 'Lead chaud detecte: Alice Dubois (+50K)', color: '#ff00ff' },
  { time: '14:28:17', type: 'ALERT', msg: 'Chute engagement Instagram (-15%)', color: '#ff4444' },
  { time: '14:15:42', type: 'INFO', msg: "Workflow 'Nurture' execute: 12 contacts", color: '#39ff14' },
  { time: '13:58:11', type: 'SPIKE', msg: 'Pic de trafic LinkedIn: +234 visites', color: '#ff00ff' },
  { time: '13:45:00', type: 'INFO', msg: 'Rapport auto genere et envoye', color: '#39ff14' },
]

const XY_POINTS = [
  { x: 10, y: 0.5 }, { x: 20, y: 1.2 }, { x: 30, y: 1.8 },
  { x: 40, y: 2.5 }, { x: 50, y: 3.2 }, { x: 60, y: 4.0 },
  { x: 70, y: 4.8 }, { x: 80, y: 5.5 },
]

function MiniWaveform({ data, color, width = 280, height = 50 }: { data: number[]; color: string; width?: number; height?: number }) {
  const max = Math.max(...data) * 1.2
  const points = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - (v / max) * height}`).join(' ')
  const areaPoints = `0,${height} ${points} ${width},${height}`
  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <filter id={`glow-${color.replace('#', '')}`}>
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <polygon points={areaPoints} fill={`url(#grad-${color.replace('#', '')})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" filter={`url(#glow-${color.replace('#', '')})`} />
    </svg>
  )
}

function GridBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ opacity: 0.15 }}>
      <svg width="100%" height="100%">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00f0ff" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  )
}

export default function AnalyticsPage() {
  const { t } = useTranslation()
  const [activeLog, setActiveLog] = useState(0)
  const [cursorX, setCursorX] = useState<number | null>(null)
  const [aiTyping, setAiTyping] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveLog(prev => (prev + 1) % TRIGGER_LOGS.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setAiTyping(false), 2000)
    return () => clearTimeout(t)
  }, [])

  const getCursorData = () => {
    if (cursorX === null) return null
    const idx = Math.round((cursorX / 100) * (REVENUE_DATA.length - 1))
    const clampIdx = Math.max(0, Math.min(REVENUE_DATA.length - 1, idx))
    return { month: MONTHS[clampIdx], value: REVENUE_DATA[clampIdx] }
  }

  const cursorData = getCursorData()

  return (
    <div className="min-h-screen relative" style={{ background: '#0a0a0f', fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}>
      <GridBackground />

      {/* STATUS BAR */}
      <div className="relative z-10 flex items-center justify-between px-6 py-2 border-b" style={{ borderColor: '#1a1a2e', background: 'rgba(10,10,15,0.9)' }}>
        <div className="flex items-center gap-6">
          <span className="text-sm font-bold tracking-wider" style={{ color: '#00f0ff' }}>PROAI MISSION CONTROL</span>
          <span className="flex items-center gap-1.5 text-xs">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#39ff14', boxShadow: '0 0 6px #39ff14' }} />
            <span style={{ color: '#39ff14' }}>SYS: ONLINE</span>
          </span>
          <span className="text-xs" style={{ color: '#ffff00' }}>LATENCY: 12ms</span>
          <span className="text-xs" style={{ color: '#00f0ff' }}>AGENT IA: ACTIVE</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-xs" style={{ color: '#ff00ff' }}>MODE: REAL-TIME</span>
          <span className="text-xs" style={{ color: '#ffff00' }}>SAMPLING: 1KHz</span>
          <span className="text-xs" style={{ color: '#c0c0d0' }}>PROAI v2.4.1</span>
        </div>
      </div>

      <div className="relative z-10 p-4 space-y-4">

        {/* KPI CHANNELS */}
        <div className="grid grid-cols-4 gap-3">
          {KPI_CHANNELS.map((ch, i) => (
            <div key={i} className="relative rounded-lg p-4 transition-all duration-300 hover:scale-[1.02]" style={{ background: '#0f0f1a', border: `1px solid ${ch.color}30` }}>
              <div className="absolute inset-0 rounded-lg pointer-events-none" style={{ boxShadow: `inset 0 0 30px ${ch.color}08` }} />
              <div className="relative z-10">
                <div className="text-3xl font-bold mb-1" style={{ color: '#e0e0f0' }}>{ch.value}</div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase tracking-widest" style={{ color: '#606080' }}>CH{i + 1}: {ch.label}</span>
                  <span className="text-xs font-bold" style={{ color: ch.color }}>{ch.delta}</span>
                </div>
                <MiniWaveform data={ch.data} color={ch.color} />
              </div>
            </div>
          ))}
        </div>

        {/* MAIN ROW */}
        <div className="grid grid-cols-3 gap-3" style={{ gridTemplateColumns: '2fr 1fr' }}>

          {/* MAIN SCOPE - REVENUE */}
          <div className="rounded-lg p-4 relative" style={{ background: '#0f0f1a', border: '1px solid #1a1a2e' }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-widest" style={{ color: '#606080' }}>MAIN SCOPE - REVENUE WAVEFORM (CH1)</span>
              {cursorData && (
                <span className="text-xs px-2 py-1 rounded" style={{ background: '#ffff0020', color: '#ffff00', border: '1px solid #ffff0040' }}>
                  CURSOR A: {cursorData.value}K - {cursorData.month} 2026
                </span>
              )}
            </div>

            <div
              className="relative"
              style={{ height: '280px' }}
              onMouseMove={e => {
                const rect = e.currentTarget.getBoundingClientRect()
                setCursorX(((e.clientX - rect.left) / rect.width) * 100)
              }}
              onMouseLeave={() => setCursorX(null)}
            >
              {/* Grid lines */}
              <svg width="100%" height="100%" className="absolute inset-0" style={{ opacity: 0.15 }}>
                {[0, 1, 2, 3, 4].map(i => (
                  <line key={`h${i}`} x1="0" y1={`${(i / 4) * 100}%`} x2="100%" y2={`${(i / 4) * 100}%`} stroke="#00f0ff" strokeWidth="0.5" strokeDasharray="4,4" />
                ))}
                {MONTHS.map((_, i) => (
                  <line key={`v${i}`} x1={`${(i / 11) * 100}%`} y1="0" x2={`${(i / 11) * 100}%`} y2="100%" stroke="#00f0ff" strokeWidth="0.5" strokeDasharray="4,4" />
                ))}
              </svg>

              {/* Y axis labels */}
              {[0, 15, 30, 45, 60].map((v, i) => (
                <span key={i} className="absolute left-0 text-[10px]" style={{ color: '#606080', top: `${100 - (v / 60) * 100}%`, transform: 'translateY(-50%)' }}>{v}K</span>
              ))}

              {/* Waveform */}
              <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0" style={{ padding: '0 30px' }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
                  </linearGradient>
                  <filter id="revGlow">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>
                <polygon
                  points={`0,100 ${REVENUE_DATA.map((v, i) => `${(i / 11) * 100},${100 - (v / MAX_REV) * 100}`).join(' ')} 100,100`}
                  fill="url(#revGrad)"
                />
                <polyline
                  points={REVENUE_DATA.map((v, i) => `${(i / 11) * 100},${100 - (v / MAX_REV) * 100}`).join(' ')}
                  fill="none" stroke="#00f0ff" strokeWidth="1.5" filter="url(#revGlow)"
                />
                {REVENUE_DATA.map((v, i) => (
                  <circle key={i} cx={`${(i / 11) * 100}`} cy={`${100 - (v / MAX_REV) * 100}`} r="1.5" fill="#00f0ff" style={{ filter: 'drop-shadow(0 0 4px #00f0ff)' }} />
                ))}
              </svg>

              {/* Trigger line */}
              <div className="absolute left-[30px] right-0 pointer-events-none" style={{ top: '30%' }}>
                <div className="w-full h-px" style={{ borderTop: '1px dashed #ff00ff40' }} />
                <span className="absolute right-0 -top-4 text-[10px] px-1" style={{ color: '#ff00ff' }}>TRIGGER: +15% MoM</span>
              </div>

              {/* Cursor */}
              {cursorX !== null && (
                <div className="absolute top-0 bottom-0 pointer-events-none" style={{ left: `${cursorX}%` }}>
                  <div className="w-px h-full" style={{ background: '#ffff0060', boxShadow: '0 0 4px #ffff00' }} />
                </div>
              )}

              {/* X axis */}
              <div className="absolute bottom-0 left-[30px] right-0 flex justify-between">
                {MONTHS.map(m => (
                  <span key={m} className="text-[9px]" style={{ color: '#606080' }}>{m}</span>
                ))}
              </div>
            </div>
          </div>

          {/* SPECTRUM ANALYZER */}
          <div className="rounded-lg p-4" style={{ background: '#0f0f1a', border: '1px solid #1a1a2e' }}>
            <span className="text-xs uppercase tracking-widest block mb-4" style={{ color: '#606080' }}>SPECTRUM ANALYZER - SOCIAL (CH2-4)</span>
            <div className="flex items-end justify-around gap-4" style={{ height: '240px' }}>
              {SOCIAL_DATA.map((s, i) => {
                const h = (s.value / MAX_SOCIAL) * 100
                return (
                  <div key={i} className="flex flex-col items-center gap-2 flex-1">
                    <span className="text-xs font-bold" style={{ color: s.color }}>{s.value.toLocaleString()}</span>
                    <div className="w-full relative" style={{ height: '200px' }}>
                      <div
                        className="absolute bottom-0 left-1 right-1 rounded-t-sm transition-all duration-500"
                        style={{
                          height: `${h}%`,
                          background: `linear-gradient(0deg, ${s.color}20, ${s.color}60)`,
                          border: `1px solid ${s.color}`,
                          boxShadow: `0 0 20px ${s.color}30, inset 0 0 20px ${s.color}10`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold" style={{ color: s.color }}>{s.name}</span>
                  </div>
                )
              })}
            </div>
            {/* Y axis */}
            <div className="flex justify-between mt-2">
              {['0', '5K', '10K', '15K', '20K'].map(v => (
                <span key={v} className="text-[9px]" style={{ color: '#606080' }}>{v}</span>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM ROW */}
        <div className="grid grid-cols-3 gap-3">

          {/* XY PLOT */}
          <div className="rounded-lg p-4" style={{ background: '#0f0f1a', border: '1px solid #1a1a2e' }}>
            <span className="text-xs uppercase tracking-widest block mb-3" style={{ color: '#606080' }}>XY PLOT - AUTO/TIME CORRELATION (CH2)</span>
            <div className="relative" style={{ height: '180px' }}>
              <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                {[0, 25, 50, 75, 100].map(v => (
                  <line key={`g${v}`} x1="0" y1={v} x2="100" y2={v} stroke="#1a1a2e" strokeWidth="0.5" />
                ))}
                <defs>
                  <filter id="xyGlow">
                    <feGaussianBlur stdDeviation="2" />
                    <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>
                <polyline
                  points={XY_POINTS.map(p => `${p.x},${100 - (p.y / 6) * 100}`).join(' ')}
                  fill="none" stroke="#39ff14" strokeWidth="1.5" filter="url(#xyGlow)"
                />
                {XY_POINTS.map((p, i) => (
                  <circle key={i} cx={p.x} cy={100 - (p.y / 6) * 100} r="2" fill="#39ff14" style={{ filter: 'drop-shadow(0 0 4px #39ff14)' }} />
                ))}
              </svg>
              <div className="absolute bottom-0 left-0 right-0 flex justify-between">
                {['0', '25', '50', '75', '100%'].map(v => (
                  <span key={v} className="text-[9px]" style={{ color: '#606080' }}>{v}</span>
                ))}
              </div>
              <span className="absolute bottom-[-16px] left-1/2 -translate-x-1/2 text-[9px] uppercase" style={{ color: '#606080' }}>TAUX AUTOMATION</span>
              <span className="absolute top-1/2 -left-4 -translate-y-1/2 -rotate-90 text-[9px] uppercase" style={{ color: '#606080' }}>TEMPS ECON.</span>
            </div>
          </div>

          {/* TRIGGER LOG */}
          <div className="rounded-lg p-4" style={{ background: '#0f0f1a', border: '1px solid #1a1a2e' }}>
            <span className="text-xs uppercase tracking-widest block mb-3" style={{ color: '#606080' }}>TRIGGER LOG - EVENT DETECTOR</span>
            <div className="space-y-2">
              {TRIGGER_LOGS.map((log, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 py-1.5 px-2 rounded transition-all duration-500 ${i === activeLog ? 'bg-[#ffffff08]' : ''}`}
                  style={{ borderLeft: i === activeLog ? `2px solid ${log.color}` : '2px solid transparent' }}
                >
                  <span className="text-[10px] flex-shrink-0" style={{ color: '#606080' }}>{log.time}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0" style={{ color: log.color, background: `${log.color}15` }}>[{log.type}]</span>
                  <span className="text-[11px]" style={{ color: '#c0c0d0' }}>{log.msg}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1 mt-3">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#39ff14' }} />
              <span className="text-[10px]" style={{ color: '#39ff14' }}>Monitoring actif</span>
            </div>
          </div>

          {/* AGENT IA PANEL */}
          <div className="rounded-lg p-4" style={{ background: '#0f0f1a', border: '1px solid #ff00ff30' }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#ff00ff', boxShadow: '0 0 8px #ff00ff' }} />
              <span className="text-xs uppercase tracking-widest font-bold" style={{ color: '#ff00ff' }}>AGENT ANALYTICS</span>
            </div>

            <div className="text-[11px] mb-4" style={{ color: '#606080' }}>
              {aiTyping ? (
                <span className="flex items-center gap-1">
                  Analyse en temps reel
                  <span className="inline-flex gap-0.5">
                    <span className="w-1 h-1 rounded-full animate-bounce" style={{ background: '#ff00ff', animationDelay: '0ms' }} />
                    <span className="w-1 h-1 rounded-full animate-bounce" style={{ background: '#ff00ff', animationDelay: '150ms' }} />
                    <span className="w-1 h-1 rounded-full animate-bounce" style={{ background: '#ff00ff', animationDelay: '300ms' }} />
                  </span>
                </span>
              ) : 'Analyse terminee'}
            </div>

            <div className="space-y-3 text-[11px]" style={{ color: '#c0c0d0' }}>
              <div>
                <span className="block mb-1" style={{ color: '#606080' }}>ANALYSE:</span>
                <p>{'-> Tendance revenue: HAUSSE'}</p>
                <p className="ml-3" style={{ color: '#00f0ff' }}>Acceleration +15% sur Q4</p>
              </div>
              <div>
                <p>{'-> Canal LinkedIn: PERFORMANT'}</p>
                <p className="ml-3" style={{ color: '#00f0ff' }}>42% du trafic total</p>
              </div>
              <div className="mt-4 rounded-lg p-3" style={{ background: '#ff00ff10', border: '1px solid #ff00ff30' }}>
                <span className="text-[10px] block mb-1" style={{ color: '#ff00ff' }}>{'-> Recommandation:'}</span>
                <p className="text-[11px]" style={{ color: '#e0e0f0' }}>Augmenter budget Instagram</p>
                <p className="text-[10px]" style={{ color: '#606080' }}>(ROAS en baisse -12%)</p>
                <button className="mt-2 w-full py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all hover:scale-[1.02]" style={{ background: 'linear-gradient(135deg, #ff00ff40, #ff00ff20)', color: '#ff00ff', border: '1px solid #ff00ff40' }}>
                  Lancer analyse profonde {'->'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

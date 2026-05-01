'use client'

import { useEffect, useState } from 'react'
import { LineChart, Line, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts'
import { TrendingUp, ShieldCheck, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useTranslation } from '@/lib/i18n/context'

type SalesPoint = { name: string; actual: number; forecast: number }

type ChurnClient = { id: string; name: string; risk: number; action: string }

type TrendItem = { id: string; trend: string; impact: 'Fort' | 'Moyen' | 'Faible' }

const initialSales: SalesPoint[] = [
  { name: 'Fév', actual: 55, forecast: 0 },
  { name: 'Mar', actual: 68, forecast: 0 },
  { name: 'Avr', actual: 82, forecast: 98 },
  { name: 'Mai', actual: 90, forecast: 110 },
  { name: 'Juin', actual: 105, forecast: 122 },
  { name: 'Juil', actual: 118, forecast: 135 },
]

const initialChurn: ChurnClient[] = [
  { id: 'c1', name: 'Client A', risk: 82, action: 'Proposition de valeur personnalisée' },
  { id: 'c2', name: 'Client B', risk: 72, action: 'Relance ciblée' },
  { id: 'c3', name: 'Client C', risk: 61, action: 'Réunion de satisfaction' },
  { id: 'c4', name: 'Client D', risk: 48, action: 'Offre d’engagement' },
  { id: 'c5', name: 'Client E', risk: 34, action: 'Newsletter d’actualités' },
]

const initialTrends: TrendItem[] = [
  { id: 't1', trend: 'La vidéo courte devient le format préféré B2B', impact: 'Fort' },
  { id: 't2', trend: 'Personnalisation des emails conduit à +22% d’ouverture', impact: 'Fort' },
  { id: 't3', trend: 'Intégration CRM et IA améliore le suivi client', impact: 'Moyen' },
  { id: 't4', trend: 'Webinars interactifs renforcent la conversion', impact: 'Moyen' },
  { id: 't5', trend: 'Les micro-capsules sociales augmentent l’engagement', impact: 'Faible' },
]

export default function PredictionsPage() {
  const { t } = useTranslation()
  const [salesData, setSalesData] = useState<SalesPoint[]>(initialSales)
  const [churnData, setChurnData] = useState<ChurnClient[]>(initialChurn)
  const [trends, setTrends] = useState<TrendItem[]>(initialTrends)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    setMessage('')
  }, [])

  const handleRefresh = async () => {
    setLoading(true)
    setMessage('')
    try {
      const [salesRes, churnRes, trendsRes] = await Promise.all([
        fetch('/api/v1/predictions/sales', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ context: 'Analyse des tendances commerciales actuelles.' }) }),
        fetch('/api/v1/predictions/churn', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ context: 'Évaluer le risque de churn pour les clients clés.' }) }),
        fetch('/api/v1/predictions/trends', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ context: 'Identifier les tendances marché clés pour les 3 prochains mois.' }) }),
      ])

      if (!salesRes.ok || !churnRes.ok || !trendsRes.ok) throw new Error('Erreur lors de la récupération')

      const salesJson = await salesRes.json()
      const churnJson = await churnRes.json()
      const trendsJson = await trendsRes.json()

      setSalesData(salesJson.forecast)
      setChurnData(churnJson.risks)
      setTrends(trendsJson.trends)
      setMessage('Prédictions actualisées')
    } catch {
      setMessage('Impossible d’actualiser les prédictions. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0c1220] text-white animate-fade-up">
      <div className="max-w-7xl mx-auto space-y-6 px-4 pb-10 lg:px-6">
        <div className="rounded-3xl border border-[#1f2937] bg-[#111827]/90 p-6 shadow-xl shadow-black/20">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-[#0ea5e9]">Prédictions IA</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">Anticipez les ventes, le churn et les tendances</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-400">Des insights concrets pour mieux piloter votre pipeline et vos actions prioritaires.</p>
            </div>
            <Button onClick={handleRefresh} disabled={loading}>
              {loading ? 'Actualisation...' : 'Actualiser les prédictions'}
            </Button>
          </div>
          {message ? <p className="mt-4 text-sm text-slate-300">{message}</p> : null}
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <section className="rounded-3xl border border-[#1f2937] bg-[#111827]/90 p-6 shadow-xl shadow-black/20">
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <TrendingUp className="h-5 w-5 text-[#0ea5e9]" />
              <span>Prévision de ventes</span>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-white">Projection 3 mois</h2>
            <p className="mt-2 text-sm text-slate-400">Données actuelles en bleu plein et projection en pointillé.</p>
            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#0b1120', border: '1px solid #1f2937', borderRadius: 10 }} />
                  <Line type="monotone" dataKey="actual" stroke="#0ea5e9" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="forecast" stroke="#38bdf8" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="rounded-3xl border border-[#1f2937] bg-[#111827]/90 p-6 shadow-xl shadow-black/20">
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <ShieldCheck className="h-5 w-5 text-[#fb923c]" />
              <span>Risque de churn</span>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-white">Clients à surveiller</h2>
            <div className="mt-6 space-y-4">
              {churnData.map((client) => (
                <div key={client.id} className="rounded-3xl border border-[#1e2937] bg-[#0f172a]/80 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-white">{client.name}</p>
                      <p className="text-sm text-slate-400">{client.action}</p>
                    </div>
                    <span className="text-sm font-semibold text-slate-200">{client.risk}%</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full rounded-full ${client.risk > 70 ? 'bg-red-500' : client.risk > 50 ? 'bg-orange-500' : 'bg-sky-500'}`}
                      style={{ width: `${client.risk}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-6 w-full rounded-2xl bg-[#0ea5e9] px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[#0ea5e9]/90">
              Action recommandée
            </button>
          </section>

          <section className="rounded-3xl border border-[#1f2937] bg-[#111827]/90 p-6 shadow-xl shadow-black/20">
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <Sparkles className="h-5 w-5 text-[#fb923c]" />
              <span>Tendances marché</span>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-white">Détections IA</h2>
            <div className="mt-6 space-y-4">
              {trends.map((trend) => (
                <div key={trend.id} className="rounded-3xl border border-[#1e2937] bg-[#0f172a]/80 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-slate-200">{trend.trend}</p>
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${trend.impact === 'Fort' ? 'bg-red-500/15 text-red-300' : trend.impact === 'Moyen' ? 'bg-orange-500/15 text-orange-300' : 'bg-sky-500/15 text-sky-300'}`}>
                      {trend.impact}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

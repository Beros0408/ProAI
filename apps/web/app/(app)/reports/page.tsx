'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { FileText, Download, Eye } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useTranslation } from '@/lib/i18n/context'

type ReportItem = {
  id: string
  date: string
  report: string
  metrics: { actionsCompleted: number; kpis: number; productivity: number }
}

const initialReports: ReportItem[] = [
  {
    id: 'rpt-1',
    date: '2026-04-21',
    report: 'Cette semaine a été marquée par une forte progression des leads et des conversions. Le pipeline se consolide et les actions automatisées ont permis de gagner du temps.',
    metrics: { actionsCompleted: 24, kpis: 78, productivity: 86 },
  },
  {
    id: 'rpt-2',
    date: '2026-04-14',
    report: 'Les efforts marketing ont généré une hausse d’engagement, mais il reste des optimisations à faire sur la qualification des prospects.',
    metrics: { actionsCompleted: 19, kpis: 70, productivity: 79 },
  },
]

export default function ReportsPage() {
  const { t } = useTranslation()
  const [reports, setReports] = useState<ReportItem[]>(initialReports)
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(initialReports[0] ?? null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const chartData = useMemo(
    () => (
      selectedReport
        ? [
            { name: 'Actions', value: selectedReport.metrics.actionsCompleted },
            { name: 'KPIs', value: selectedReport.metrics.kpis },
            { name: 'Productivité', value: selectedReport.metrics.productivity },
          ]
        : []
    ),
    [selectedReport],
  )

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch('/api/v1/reports')
        if (!response.ok) throw new Error('Impossible de charger l’historique')
        const data = await response.json()
        setReports(data)
        if (data.length > 0) setSelectedReport(data[0])
      } catch {
        // fallback mocks
      }
    }

    fetchReports()
  }, [])

  const handleGenerateReport = async () => {
    setLoading(true)
    setMessage('')
    try {
      const response = await fetch('/api/v1/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: 'Récapitulatif hebdomadaire des actions, KPIs et recommandations.' }),
      })
      if (!response.ok) throw new Error('Erreur serveur')
      const data = await response.json()
      const newReport: ReportItem = {
        id: `rpt-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        report: data.report,
        metrics: data.metrics,
      }
      setReports((current) => [newReport, ...current])
      setSelectedReport(newReport)
      setMessage('Rapport généré avec succès.')
    } catch (error) {
      setMessage('Impossible de générer le rapport. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  const exportReport = (report: ReportItem) => {
    const blob = new Blob([report.report], { type: 'application/pdf' })
    const anchor = document.createElement('a')
    anchor.href = URL.createObjectURL(blob)
    anchor.download = `rapport-${report.date}.pdf`
    anchor.click()
    URL.revokeObjectURL(anchor.href)
  }

  return (
    <div className="min-h-screen bg-[#0c1220] text-white animate-fade-up">
      <div className="max-w-7xl mx-auto space-y-6 px-4 pb-10 lg:px-6">
        <div className="rounded-3xl border border-[#1f2937] bg-[#111827]/90 p-6 shadow-xl shadow-black/20">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-[#fb923c]">Rapports automatiques</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">Synthèse hebdomadaire et recommandations IA</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-400">Générez des rapports faciles à partager et suivez l’historique des performances.</p>
            </div>
            <Button onClick={handleGenerateReport} disabled={loading}>
              {loading ? 'Génération...' : 'Générer le rapport'}
            </Button>
          </div>
          {message ? <p className="mt-4 text-sm text-slate-300">{message}</p> : null}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.3fr,0.9fr]">
          <section className="space-y-6 rounded-3xl border border-[#1f2937] bg-[#111827]/90 p-6 shadow-xl shadow-black/20">
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <FileText className="h-5 w-5 text-[#0ea5e9]" />
              <span>Rapport hebdomadaire</span>
            </div>
            <div className="rounded-3xl border border-[#1e2937] bg-[#0f172a]/80 p-6">
              <h2 className="text-xl font-semibold text-white">Résumé IA</h2>
              <p className="mt-3 text-slate-300 leading-7">
                {selectedReport ? selectedReport.report : 'Générez un rapport pour voir un résumé détaillé de la semaine.'}
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl bg-[#111827] p-4">
                  <p className="text-sm text-slate-400">Actions réalisées</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{selectedReport?.metrics.actionsCompleted ?? 0}</p>
                </div>
                <div className="rounded-3xl bg-[#111827] p-4">
                  <p className="text-sm text-slate-400">KPIs clés</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{selectedReport?.metrics.kpis ?? 0}%</p>
                </div>
                <div className="rounded-3xl bg-[#111827] p-4">
                  <p className="text-sm text-slate-400">Productivité</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{selectedReport?.metrics.productivity ?? 0}%</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[#1e2937] bg-[#0f172a]/80 p-6">
              <h3 className="text-lg font-semibold text-white">Métriques de la semaine</h3>
              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0b1120', border: '1px solid #1f2937', borderRadius: 12, color: '#fff' }}
                    />
                    <Bar dataKey="value" fill="#0ea5e9" radius={[12, 12, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          <aside className="space-y-4 rounded-3xl border border-[#1f2937] bg-[#111827]/90 p-6 shadow-xl shadow-black/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-[#0ea5e9]">Historique</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Rapports passés</h2>
              </div>
            </div>

            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="rounded-3xl border border-[#1e2937] bg-[#0f172a]/80 p-4 transition hover:border-primary/50 hover:bg-[#111827]/90">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-400">{report.date}</p>
                      <p className="mt-2 text-sm text-slate-200 line-clamp-2">{report.report}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setSelectedReport(report)} className="rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-200 transition hover:border-primary/60">
                        <Eye className="inline-block h-4 w-4" /> Voir
                      </button>
                      <button
                        onClick={() => exportReport(report)}
                        className="rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-200 transition hover:border-primary/60"
                      >
                        <Download className="inline-block h-4 w-4" /> PDF
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

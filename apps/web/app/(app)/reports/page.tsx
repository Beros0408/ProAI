"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { FileText, Download, Eye } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useTranslation } from "@/lib/i18n/context"

type ReportItem = {
  id: string
  date: string
  report: string
  metrics: { actionsCompleted: number; kpis: number; productivity: number }
}

export default function ReportsPage() {
  const { t } = useTranslation()

  // Rebuild mock reports whenever t changes (i.e. on locale switch)
  const mockReports = useMemo<ReportItem[]>(() => [
    {
      id: "rpt-1",
      date: "2026-04-21",
      report: t("reports.mock.summary_1"),
      metrics: { actionsCompleted: 24, kpis: 78, productivity: 86 },
    },
    {
      id: "rpt-2",
      date: "2026-04-14",
      report: t("reports.mock.summary_2"),
      metrics: { actionsCompleted: 19, kpis: 70, productivity: 79 },
    },
  ], [t])

  const [reports, setReports] = useState<ReportItem[]>(mockReports)
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(mockReports[0] ?? null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  // Track whether real API data replaced the mocks
  const hasApiData = useRef(false)

  // When locale changes mockReports rebuilds — push new translations into state
  // unless the API already provided real data
  useEffect(() => {
    if (!hasApiData.current) {
      setReports(mockReports)
      setSelectedReport((prev) => {
        if (!prev) return mockReports[0] ?? null
        const updated = mockReports.find((r) => r.id === prev.id)
        return updated ?? prev
      })
    }
  }, [mockReports])

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch("/api/v1/reports")
        if (!response.ok) throw new Error("load-error")
        const data: ReportItem[] = await response.json()
        if (data && data.length > 0) {
          hasApiData.current = true
          setReports(data)
          setSelectedReport(data[0])
        }
      } catch {
        // keep mocks
      }
    }
    fetchReports()
  }, [])

  const chartData = useMemo(
    () =>
      selectedReport
        ? [
            { name: t("reports.chart.actions"), value: selectedReport.metrics.actionsCompleted },
            { name: t("reports.chart.kpis"), value: selectedReport.metrics.kpis },
            { name: t("reports.productivity"), value: selectedReport.metrics.productivity },
          ]
        : [],
    [selectedReport, t],
  )

  const handleGenerateReport = async () => {
    setLoading(true)
    setMessage("")
    try {
      const response = await fetch("/api/v1/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context: "Récapitulatif hebdomadaire des actions, KPIs et recommandations." }),
      })
      if (!response.ok) throw new Error(t("reports.serverError"))
      const data = await response.json()
      const newReport: ReportItem = {
        id: `rpt-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        report: data.report,
        metrics: data.metrics,
      }
      hasApiData.current = true
      setReports((current) => [newReport, ...current])
      setSelectedReport(newReport)
      setMessage(t("reports.success"))
    } catch {
      setMessage(t("reports.error.generate"))
    } finally {
      setLoading(false)
    }
  }

  const exportReport = (report: ReportItem) => {
    const blob = new Blob([report.report], { type: "application/pdf" })
    const anchor = document.createElement("a")
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
              <p className="text-sm uppercase tracking-[0.24em] text-[#fb923c]">{t("reports.badge")}</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">{t("reports.heading")}</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-400">{t("reports.headingDesc")}</p>
            </div>
            <Button onClick={handleGenerateReport} disabled={loading}>
              {loading ? t("reports.generating") : t("reports.generate")}
            </Button>
          </div>
          {message ? <p className="mt-4 text-sm text-slate-300">{message}</p> : null}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.3fr,0.9fr]">
          <section className="space-y-6 rounded-3xl border border-[#1f2937] bg-[#111827]/90 p-6 shadow-xl shadow-black/20">
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <FileText className="h-5 w-5 text-[#0ea5e9]" />
              <span>{t("reports.weekly")}</span>
            </div>
            <div className="rounded-3xl border border-[#1e2937] bg-[#0f172a]/80 p-6">
              <h2 className="text-xl font-semibold text-white">{t("reports.summary")}</h2>
              <p className="mt-3 text-slate-300 leading-7">
                {selectedReport ? selectedReport.report : t("reports.empty")}
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div
                  className="rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5"
                  style={{ background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.15)", boxShadow: "0 0 20px rgba(14,165,233,0.04)" }}
                >
                  <p className="text-sm text-[#94a3b8]">{t("reports.actions")}</p>
                  <p className="mt-2 text-2xl font-bold text-white">{selectedReport?.metrics.actionsCompleted ?? 0}</p>
                </div>
                <div
                  className="rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5"
                  style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)", boxShadow: "0 0 20px rgba(139,92,246,0.04)" }}
                >
                  <p className="text-sm text-[#94a3b8]">{t("reports.kpis")}</p>
                  <p className="mt-2 text-2xl font-bold text-[#a78bfa]">{selectedReport?.metrics.kpis ?? 0}%</p>
                </div>
                <div
                  className="rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5"
                  style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.15)", boxShadow: "0 0 20px rgba(52,211,153,0.04)" }}
                >
                  <p className="text-sm text-[#94a3b8]">{t("reports.productivity")}</p>
                  <p className="mt-2 text-2xl font-bold text-[#34d399]">{selectedReport?.metrics.productivity ?? 0}%</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[#1e2937] bg-[#0f172a]/80 p-6">
              <h3 className="text-lg font-semibold text-white">{t("reports.metrics")}</h3>
              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0b1120", border: "1px solid #1f2937", borderRadius: 12, color: "#fff" }}
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
                <p className="text-sm uppercase tracking-[0.24em] text-[#0ea5e9]">{t("reports.historyBadge")}</p>
                <h2 className="mt-2 text-xl font-semibold text-white">{t("reports.past")}</h2>
              </div>
            </div>

            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer group"
                  style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.border = "1px solid rgba(14,165,233,0.25)"
                    ;(e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(14,165,233,0.08)"
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.border = "1px solid rgba(255,255,255,0.06)"
                    ;(e.currentTarget as HTMLDivElement).style.boxShadow = "none"
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#64748b] font-mono">{report.date}</p>
                      <p className="mt-1.5 text-sm text-[#cbd5e1] line-clamp-2 leading-relaxed">{report.report}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-[#38bdf8] transition-all duration-200 hover:scale-105"
                        style={{ background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.2)" }}
                      >
                        <Eye className="w-3.5 h-3.5" /> {t("reports.view")}
                      </button>
                      <button
                        onClick={() => exportReport(report)}
                        className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-[#94a3b8] transition-all duration-200 hover:scale-105"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                      >
                        <Download className="w-3.5 h-3.5" /> PDF
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

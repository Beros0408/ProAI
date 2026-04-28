'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

export default function AnalyzePage() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleAnalyze = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/v1/analyze/website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ score: 0, seo: { summary: '' }, performance: { summary: '' }, accessibility: { summary: '' }, best_practices: { summary: '' }, recommendations: [], error: 'Impossible d’analyser' })
    } finally {
      setLoading(false)
    }
  }

  const downloadReport = () => {
    if (!result) return
    const content = `ProAI Website Analysis Report\n\nURL: ${url}\nScore: ${result.score}\n\nSEO:\n${result.seo?.summary}\n\nPerformance:\n${result.performance?.summary}\n\nAccessibilité:\n${result.accessibility?.summary}\n\nBonnes pratiques:\n${result.best_practices?.summary}\n\nRecommandations:\n${result.recommendations?.map((item: string) => `- ${item}`).join('\n')}`
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const anchor = document.createElement('a')
    anchor.href = URL.createObjectURL(blob)
    anchor.download = 'proai-analysis-report.txt'
    anchor.click()
    URL.revokeObjectURL(anchor.href)
  }

  return (
    <div className="space-y-8 p-6 lg:p-10">
      <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-8 shadow-xl shadow-slate-950/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white">Audit IA de site</h1>
            <p className="mt-2 text-slate-400">Analyse le contenu, l’expérience et la proposition de valeur d’un site.</p>
          </div>
          <Button onClick={() => router.push('/dashboard')} variant="secondary">
            Retour au tableau de bord
          </Button>
        </div>
      </div>

      <section className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
        <div className="grid gap-6 lg:grid-cols-[1fr,0.65fr]">
          <div className="space-y-4">
            <label className="text-sm text-slate-400">URL à analyser</label>
            <input
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://example.com"
              className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleAnalyze} disabled={loading || !url.trim()}>
                {loading ? 'Analyse en cours...' : 'Analyser le site'}
              </Button>
              <Button onClick={downloadReport} variant="secondary" disabled={!result}>
                Exporter le rapport
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="text-lg font-semibold text-white">Score projet</h2>
            <div className="mt-6 flex items-center justify-center">
              <div className="flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-cyan-400/10 text-white">
                <span className="text-4xl font-bold">{result?.score ?? '-'}</span>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-400">Plus le score est élevé, plus le site est aligné avec les attentes utilisateurs.</p>
          </div>
        </div>
      </section>

      {result && (
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
            <h3 className="text-lg font-semibold text-white">Résumé SEO</h3>
            <p className="mt-4 rounded-2xl bg-slate-900 p-4 text-slate-300">{result.seo?.summary}</p>
            <h3 className="mt-6 text-lg font-semibold text-white">Performance</h3>
            <p className="mt-4 rounded-2xl bg-slate-900 p-4 text-slate-300">{result.performance?.summary}</p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
            <h3 className="text-lg font-semibold text-white">Accessibilité</h3>
            <p className="mt-4 rounded-2xl bg-slate-900 p-4 text-slate-300">{result.accessibility?.summary}</p>
            <h3 className="mt-6 text-lg font-semibold text-white">Bonnes pratiques</h3>
            <p className="mt-4 rounded-2xl bg-slate-900 p-4 text-slate-300">{result.best_practices?.summary}</p>
          </div>
        </section>
      )}

      {result?.recommendations && (
        <section className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
          <h3 className="text-lg font-semibold text-white">Recommandations</h3>
          <ul className="mt-4 space-y-3 text-slate-300">
            {result.recommendations.map((item: string, index: number) => (
              <li key={index} className="rounded-2xl bg-slate-900 p-4">
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}

      {result?.error && (
        <div className="rounded-3xl border border-rose-700 bg-rose-950/80 p-5 text-rose-200">
          {result.error}
        </div>
      )}
    </div>
  )
}

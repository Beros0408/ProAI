'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { useTranslation } from '@/lib/i18n/context'

export default function AnalyzePage() {
  const router = useRouter()
  const { t } = useTranslation()
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
      setResult({ score: 0, seo: { summary: '' }, performance: { summary: '' }, accessibility: { summary: '' }, best_practices: { summary: '' }, recommendations: [], error: t('error_analysis') })
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
      <div className="rounded-2xl p-8" style={{ background: 'rgba(17,24,39,0.7)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white">{t('website_audit_title')}</h1>
            <p className="mt-2 text-slate-400">{t('website_audit_description')}</p>
          </div>
          <Button onClick={() => router.push('/dashboard')} variant="secondary">
            {t('back_to_dashboard')}
          </Button>
        </div>
      </div>

      <section className="rounded-2xl p-6" style={{ background: 'rgba(17,24,39,0.7)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="grid gap-6 lg:grid-cols-[1fr,0.65fr]">
          <div className="space-y-4">
            <label className="text-sm text-slate-400">{t('enter_url')}</label>
            <input
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://example.com"
              className="w-full rounded-xl px-4 py-3 text-[#e2e8f0] placeholder-[#475569] text-sm outline-none transition-all duration-200"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              onFocus={(e) => { e.currentTarget.style.border = '1px solid rgba(14,165,233,0.4)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.08)' }}
              onBlur={(e) => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none' }}
            />
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleAnalyze} disabled={loading || !url.trim()}>
                {loading ? t('analyzing_website') : t('analyze_site')}
              </Button>
              <Button onClick={downloadReport} variant="secondary" disabled={!result}>
                {t('export_report')}
              </Button>
            </div>
          </div>

          <div className="rounded-2xl p-5" style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="text-lg font-semibold text-white">{t('score_project')}</h2>
            <div className="mt-6 flex items-center justify-center">
              <div className="flex h-36 w-36 items-center justify-center rounded-full text-white"
                style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.2), rgba(6,182,212,0.1))', border: '2px solid rgba(14,165,233,0.25)', boxShadow: '0 0 40px rgba(14,165,233,0.2)' }}>
                <span className="text-4xl font-extrabold text-[#38bdf8]">{result?.score ?? '-'}</span>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-400">{t('higher_score_means_aligned')}</p>
          </div>
        </div>
      </section>

      {result && (
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl p-6" style={{ background: 'rgba(17,24,39,0.7)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h3 className="text-lg font-semibold text-white">{t('seo_summary')}</h3>
            <p className="mt-4 rounded-xl p-4 text-[#cbd5e1] text-sm leading-relaxed" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>{result.seo?.summary}</p>
            <h3 className="mt-6 text-lg font-semibold text-white">{t('performance')}</h3>
            <p className="mt-4 rounded-xl p-4 text-[#cbd5e1] text-sm leading-relaxed" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>{result.performance?.summary}</p>
          </div>

          <div className="rounded-2xl p-6" style={{ background: 'rgba(17,24,39,0.7)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h3 className="text-lg font-semibold text-white">{t('accessibility')}</h3>
            <p className="mt-4 rounded-xl p-4 text-[#cbd5e1] text-sm leading-relaxed" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>{result.accessibility?.summary}</p>
            <h3 className="mt-6 text-lg font-semibold text-white">{t('best_practices')}</h3>
            <p className="mt-4 rounded-xl p-4 text-[#cbd5e1] text-sm leading-relaxed" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>{result.best_practices?.summary}</p>
          </div>
        </section>
      )}

      {result?.recommendations && (
        <section className="rounded-2xl p-6" style={{ background: 'rgba(17,24,39,0.7)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h3 className="text-lg font-semibold text-white">{t('recommendations_title')}</h3>
          <ul className="mt-4 space-y-3 text-slate-300">
            {result.recommendations.map((item: string, index: number) => (
              <li key={index} className="rounded-xl p-4 text-sm" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
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

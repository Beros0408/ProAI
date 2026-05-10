'use client'

import { useTranslation } from '@/lib/i18n/context'

interface Props {
  data: Record<string, string>
  onChange: (key: string, value: string) => void
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function MetricBar({ level }: { level: 1 | 2 | 3 }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3].map(i => (
        <div
          key={i}
          className="h-1.5 w-4 rounded-full transition-all duration-300"
          style={{ background: i <= level ? '#0ea5e9' : 'rgba(255,255,255,0.08)' }}
        />
      ))}
    </div>
  )
}

export function Step4LLMProvider({ data, onChange }: Props) {
  const { t } = useTranslation()

  const PROVIDERS = [
    {
      value: 'openai',
      nameKey: 'ob.step4.openai.name' as const,
      descKey: 'ob.step4.openai.desc' as const,
      speedKey: 'ob.step4.openai.speed' as const,
      qualityKey: 'ob.step4.openai.quality' as const,
      costKey: 'ob.step4.openai.cost' as const,
      speedLevel: 3 as 1 | 2 | 3,
      qualityLevel: 3 as 1 | 2 | 3,
      costLevel: 3 as 1 | 2 | 3,
      recommended: true,
      logo: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.843-3.376L15.115 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
        </svg>
      ),
      color: '#10a37f',
    },
    {
      value: 'anthropic',
      nameKey: 'ob.step4.anthropic.name' as const,
      descKey: 'ob.step4.anthropic.desc' as const,
      speedKey: 'ob.step4.anthropic.speed' as const,
      qualityKey: 'ob.step4.anthropic.quality' as const,
      costKey: 'ob.step4.anthropic.cost' as const,
      speedLevel: 3 as 1 | 2 | 3,
      qualityLevel: 3 as 1 | 2 | 3,
      costLevel: 2 as 1 | 2 | 3,
      recommended: false,
      logo: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M13.827 3.52h-3.654L6 20h3.192l.974-2.966h3.668L14.808 20H18zM11.14 14.104 12 11.16l.86 2.944z" />
        </svg>
      ),
      color: '#d97706',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="text-center animate-fade-up">
        <div
          className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
          style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" aria-hidden="true">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          </svg>
        </div>
        <h2 className="mb-1 text-2xl font-bold text-white" style={{ letterSpacing: '-0.02em' }}>{t('ob.step4.title')}</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('ob.step4.subtitle')}</p>
      </div>

      <div className="space-y-3 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        {PROVIDERS.map(p => {
          const selected = data.llmProvider === p.value
          return (
            <button
              key={p.value}
              type="button"
              onClick={() => onChange('llmProvider', p.value)}
              className="w-full rounded-xl px-5 py-5 text-left transition-all duration-200"
              style={{
                background: selected ? 'rgba(14,165,233,0.08)' : 'var(--bg-surface)',
                border: selected ? '1px solid rgba(14,165,233,0.4)' : '1px solid rgba(255,255,255,0.06)',
                boxShadow: selected ? '0 0 0 1px rgba(14,165,233,0.2), 0 4px 20px rgba(14,165,233,0.08)' : 'none',
              }}
            >
              <div className="flex items-start gap-4">
                {/* Logo */}
                <div
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{ background: selected ? `${p.color}22` : 'rgba(255,255,255,0.04)', color: selected ? p.color : 'var(--text-muted)', border: `1px solid ${selected ? p.color + '44' : 'rgba(255,255,255,0.06)'}` }}
                >
                  {p.logo}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="mb-1 flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold" style={{ color: selected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      {t(p.nameKey)}
                    </span>
                    {p.recommended && (
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{ background: 'rgba(14,165,233,0.15)', color: '#0ea5e9', border: '1px solid rgba(14,165,233,0.25)' }}
                      >
                        {t('ob.step4.recommended')}
                      </span>
                    )}
                  </div>
                  <p className="mb-3 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{t(p.descKey)}</p>

                  {/* Metrics */}
                  <div className="flex flex-wrap gap-4">
                    {[
                      { labelKey: 'ob.step4.speed' as const, valueKey: p.speedKey, level: p.speedLevel },
                      { labelKey: 'ob.step4.quality' as const, valueKey: p.qualityKey, level: p.qualityLevel },
                      { labelKey: 'ob.step4.cost' as const, valueKey: p.costKey, level: p.costLevel },
                    ].map(metric => (
                      <div key={metric.labelKey} className="flex flex-col gap-1">
                        <span className="text-[10px] font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                          {t(metric.labelKey)}
                        </span>
                        <MetricBar level={metric.level} />
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{t(metric.valueKey)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Check */}
                <div
                  className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full transition-all duration-200"
                  style={{
                    background: selected ? '#0ea5e9' : 'rgba(255,255,255,0.04)',
                    border: selected ? '1px solid #0ea5e9' : '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {selected && <CheckIcon />}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Note */}
      <div
        className="animate-fade-up rounded-xl px-4 py-3 text-xs"
        style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', color: '#fbbf24', animationDelay: '0.2s' }}
      >
        {t('ob.step4.note')}
      </div>
    </div>
  )
}

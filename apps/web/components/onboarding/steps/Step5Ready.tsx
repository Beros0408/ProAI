'use client'

import { useTranslation } from '@/lib/i18n/context'

interface Props {
  data: Record<string, string>
}

const USE_CASE_KEYS: Record<string, string> = {
  marketing: 'ob.step3.marketing',
  sales: 'ob.step3.sales',
  automation: 'ob.step3.automation',
  analytics: 'ob.step3.analytics',
  general: 'ob.step3.general',
}

const PROVIDER_KEYS: Record<string, string> = {
  openai: 'ob.step4.openai.name',
  anthropic: 'ob.step4.anthropic.name',
}

export function Step5Ready({ data }: Props) {
  const { t } = useTranslation()

  const summaryRows = [
    { labelKey: 'ob.step5.org' as const, value: data.orgName },
    { labelKey: 'ob.step5.sector' as const, value: data.industry },
    { labelKey: 'ob.step5.audience' as const, value: data.targetAudience },
    {
      labelKey: 'ob.step5.usecase' as const,
      value: USE_CASE_KEYS[data.useCase] ? t(USE_CASE_KEYS[data.useCase] as Parameters<typeof t>[0]) : data.useCase,
    },
    {
      labelKey: 'ob.step5.engine' as const,
      value: PROVIDER_KEYS[data.llmProvider] ? t(PROVIDER_KEYS[data.llmProvider] as Parameters<typeof t>[0]) : data.llmProvider,
    },
  ]

  const featureKeys = ['ob.step5.feat1', 'ob.step5.feat2', 'ob.step5.feat3'] as const

  return (
    <div className="space-y-6">
      {/* Animated check */}
      <div className="flex flex-col items-center gap-4 animate-fade-up">
        <div className="relative">
          {/* Pulse rings */}
          <div
            className="ob-pulse-ring absolute inset-0 rounded-full"
            style={{ background: 'rgba(34,197,94,0.15)' }}
          />
          <div
            className="ob-pulse-ring absolute inset-0 rounded-full"
            style={{ background: 'rgba(34,197,94,0.08)', animationDelay: '0.6s' }}
          />
          {/* Check circle */}
          <div
            className="ob-check-bounce relative flex h-20 w-20 items-center justify-center rounded-full"
            style={{ background: 'linear-gradient(135deg, #15803d, #16a34a)', boxShadow: '0 0 0 6px rgba(34,197,94,0.15), 0 8px 24px rgba(34,197,94,0.3)' }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>
        <div className="text-center animate-fade-up" style={{ animationDelay: '0.3s' }}>
          <h2
            className="mb-2 text-2xl font-bold sm:text-3xl"
            style={{
              background: 'linear-gradient(135deg, #ffffff 30%, #94a3b8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
            }}
          >
            {t('ob.step5.title')}
          </h2>
          <p className="text-sm" style={{ color: '#64748b' }}>{t('ob.step5.subtitle')}</p>
        </div>
      </div>

      {/* Summary card */}
      <div
        className="animate-fade-up rounded-xl p-4 space-y-3"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', animationDelay: '0.2s' }}
      >
        {summaryRows.map(row => (
          <div key={row.labelKey} className="flex items-center justify-between gap-4">
            <span className="text-xs font-medium" style={{ color: '#64748b' }}>{t(row.labelKey)}</span>
            <span className="text-xs font-semibold text-right" style={{ color: '#e2e8f0' }}>
              {row.value || '—'}
            </span>
          </div>
        ))}
      </div>

      {/* Feature list */}
      <div className="space-y-2.5 animate-fade-up" style={{ animationDelay: '0.3s' }}>
        {featureKeys.map((key, i) => (
          <div key={key} className="flex items-center gap-3">
            <div
              className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full"
              style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span className="text-sm" style={{ color: '#94a3b8' }}>{t(key)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

'use client'

import { useTranslation } from '@/lib/i18n/context'

interface Props {
  data: Record<string, string>
  onChange: (key: string, value: string) => void
}

function IconMarketing() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}

function IconSales() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}

function IconAutomation() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}

function IconAnalytics() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  )
}

function IconGeneral() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export function Step3UseCase({ data, onChange }: Props) {
  const { t } = useTranslation()

  const USE_CASES = [
    { value: 'marketing', icon: <IconMarketing />, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', labelKey: 'ob.step3.marketing' as const, descKey: 'ob.step3.marketing.desc' as const },
    { value: 'sales', icon: <IconSales />, color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', labelKey: 'ob.step3.sales' as const, descKey: 'ob.step3.sales.desc' as const },
    { value: 'automation', icon: <IconAutomation />, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.2)', labelKey: 'ob.step3.automation' as const, descKey: 'ob.step3.automation.desc' as const },
    { value: 'analytics', icon: <IconAnalytics />, color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)', border: 'rgba(14,165,233,0.2)', labelKey: 'ob.step3.analytics' as const, descKey: 'ob.step3.analytics.desc' as const },
    { value: 'general', icon: <IconGeneral />, color: '#64748b', bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.2)', labelKey: 'ob.step3.general' as const, descKey: 'ob.step3.general.desc' as const },
  ]

  return (
    <div className="space-y-6">
      <div className="text-center animate-fade-up">
        <div
          className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
          style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className="mb-1 text-2xl font-bold text-white" style={{ letterSpacing: '-0.02em' }}>{t('ob.step3.title')}</h2>
        <p className="text-sm" style={{ color: '#64748b' }}>{t('ob.step3.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 gap-3 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        {USE_CASES.map(uc => {
          const selected = data.useCase === uc.value
          return (
            <button
              key={uc.value}
              type="button"
              onClick={() => onChange('useCase', uc.value)}
              className="flex items-center gap-4 rounded-xl px-4 py-4 text-left transition-all duration-200"
              style={{
                background: selected ? `rgba(14,165,233,0.08)` : '#111827',
                border: selected ? '1px solid rgba(14,165,233,0.4)' : '1px solid rgba(255,255,255,0.06)',
                boxShadow: selected ? '0 0 0 1px rgba(14,165,233,0.2), 0 4px 20px rgba(14,165,233,0.08)' : 'none',
              }}
            >
              {/* Icon box */}
              <div
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-200"
                style={{
                  background: selected ? uc.bg : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${selected ? uc.border : 'rgba(255,255,255,0.06)'}`,
                  color: selected ? uc.color : '#64748b',
                }}
              >
                {uc.icon}
              </div>

              {/* Text */}
              <div className="flex-1">
                <p className="text-sm font-semibold transition-colors duration-200" style={{ color: selected ? '#e2e8f0' : '#94a3b8' }}>
                  {t(uc.labelKey)}
                </p>
                <p className="mt-0.5 text-xs" style={{ color: '#475569' }}>
                  {t(uc.descKey)}
                </p>
              </div>

              {/* Check */}
              <div
                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full transition-all duration-200"
                style={{
                  background: selected ? '#0ea5e9' : 'rgba(255,255,255,0.04)',
                  border: selected ? '1px solid #0ea5e9' : '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {selected && <CheckIcon />}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

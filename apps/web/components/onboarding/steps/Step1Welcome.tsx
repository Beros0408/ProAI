'use client'

import { useTranslation } from '@/lib/i18n/context'

interface Props {
  data: Record<string, string>
  onChange: (key: string, value: string) => void
}

const FIELD = { background: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }

function onFocus(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = '#0ea5e9'
  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.1)'
}
function onBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = 'var(--border-color)'
  e.currentTarget.style.boxShadow = 'none'
}

export function Step1Welcome({ data, onChange }: Props) {
  const { t } = useTranslation()

  return (
    <div className="space-y-8">
      {/* Animated logo */}
      <div className="flex flex-col items-center gap-4 animate-scale-in">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ background: 'rgba(14,165,233,0.12)', border: '1px solid rgba(14,165,233,0.25)' }}
        >
          <span className="text-2xl font-bold" style={{ letterSpacing: '-0.03em' }}>
            <span style={{ color: '#0ea5e9' }}>P</span><span className="text-white">AI</span>
          </span>
        </div>
        <div className="text-center animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <h2
            className="mb-2 text-2xl font-bold sm:text-3xl"
            style={{
              background: 'linear-gradient(135deg, #ffffff 30%, #94a3b8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
            }}
          >
            {t('ob.step1.title')}
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('ob.step1.subtitle')}</p>
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-4 animate-fade-up" style={{ animationDelay: '0.2s' }}>
        {/* First name */}
        <div>
          <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            {t('ob.step1.name.label')}
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
            </span>
            <input
              type="text"
              value={data.firstName ?? ''}
              onChange={e => onChange('firstName', e.target.value)}
              placeholder={t('ob.step1.name.placeholder')}
              className="h-12 w-full rounded-xl pl-10 pr-4 text-sm text-white placeholder-slate-600 outline-none transition-all duration-200"
              style={FIELD}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>
        </div>

        {/* Role */}
        <div>
          <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            {t('ob.step1.role.label')}
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              </svg>
            </span>
            <select
              value={data.role ?? ''}
              onChange={e => onChange('role', e.target.value)}
              className="h-12 w-full appearance-none rounded-xl pl-10 pr-10 text-sm outline-none transition-all duration-200"
              style={{ ...FIELD, color: data.role ? 'var(--text-primary)' : 'var(--text-muted)' }}
              onFocus={onFocus}
              onBlur={onBlur}
            >
              <option value="" style={{ background: 'var(--bg-elevated)' }}>{t('ob.step1.role.select')}</option>
              <option value="freelance" style={{ background: 'var(--bg-elevated)' }}>{t('ob.step1.role.freelance')}</option>
              <option value="entrepreneur" style={{ background: 'var(--bg-elevated)' }}>{t('ob.step1.role.entrepreneur')}</option>
              <option value="manager" style={{ background: 'var(--bg-elevated)' }}>{t('ob.step1.role.manager')}</option>
              <option value="other" style={{ background: 'var(--bg-elevated)' }}>{t('ob.step1.role.other')}</option>
            </select>
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

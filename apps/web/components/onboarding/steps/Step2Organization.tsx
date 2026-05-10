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

function FieldIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }}>
      {children}
    </span>
  )
}

export function Step2Organization({ data, onChange }: Props) {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div className="text-center animate-fade-up">
        <div
          className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
          style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" aria-hidden="true">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <h2 className="mb-1 text-2xl font-bold text-white" style={{ letterSpacing: '-0.02em' }}>{t('ob.step2.title')}</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('ob.step2.subtitle')}</p>
      </div>

      <div className="space-y-4 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        {/* Org name */}
        <div>
          <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t('ob.step2.org.label')}</label>
          <div className="relative">
            <FieldIcon>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              </svg>
            </FieldIcon>
            <input
              type="text"
              value={data.orgName ?? ''}
              onChange={e => onChange('orgName', e.target.value)}
              placeholder={t('ob.step2.org.placeholder')}
              className="h-12 w-full rounded-xl pl-10 pr-4 text-sm text-white placeholder-slate-600 outline-none transition-all duration-200"
              style={FIELD}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>
        </div>

        {/* Industry */}
        <div>
          <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t('ob.step2.industry.label')}</label>
          <div className="relative">
            <FieldIcon>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </FieldIcon>
            <select
              value={data.industry ?? ''}
              onChange={e => onChange('industry', e.target.value)}
              className="h-12 w-full appearance-none rounded-xl pl-10 pr-10 text-sm outline-none transition-all duration-200"
              style={{ ...FIELD, color: data.industry ? 'var(--text-primary)' : 'var(--text-muted)' }}
              onFocus={onFocus}
              onBlur={onBlur}
            >
              <option value="" style={{ background: 'var(--bg-elevated)' }}>{t('ob.step2.industry.select')}</option>
              <option value="tech" style={{ background: 'var(--bg-elevated)' }}>{t('ob.step2.industry.tech')}</option>
              <option value="ecommerce" style={{ background: 'var(--bg-elevated)' }}>{t('ob.step2.industry.ecommerce')}</option>
              <option value="consulting" style={{ background: 'var(--bg-elevated)' }}>{t('ob.step2.industry.consulting')}</option>
              <option value="agency" style={{ background: 'var(--bg-elevated)' }}>{t('ob.step2.industry.agency')}</option>
              <option value="retail" style={{ background: 'var(--bg-elevated)' }}>{t('ob.step2.industry.retail')}</option>
              <option value="other" style={{ background: 'var(--bg-elevated)' }}>{t('ob.step2.industry.other')}</option>
            </select>
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </div>
        </div>

        {/* Target audience */}
        <div>
          <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t('ob.step2.audience.label')}</label>
          <div className="relative">
            <FieldIcon>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </FieldIcon>
            <input
              type="text"
              value={data.targetAudience ?? ''}
              onChange={e => onChange('targetAudience', e.target.value)}
              placeholder={t('ob.step2.audience.placeholder')}
              className="h-12 w-full rounded-xl pl-10 pr-4 text-sm text-white placeholder-slate-600 outline-none transition-all duration-200"
              style={FIELD}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>
        </div>

        {/* Team size */}
        <div>
          <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t('ob.step2.size.label')}</label>
          <div className="relative">
            <FieldIcon>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="8" r="4" /><path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
              </svg>
            </FieldIcon>
            <select
              value={data.teamSize ?? ''}
              onChange={e => onChange('teamSize', e.target.value)}
              className="h-12 w-full appearance-none rounded-xl pl-10 pr-10 text-sm outline-none transition-all duration-200"
              style={{ ...FIELD, color: data.teamSize ? 'var(--text-primary)' : 'var(--text-muted)' }}
              onFocus={onFocus}
              onBlur={onBlur}
            >
              <option value="" style={{ background: 'var(--bg-elevated)' }}>{t('ob.step2.size.select')}</option>
              <option value="solo" style={{ background: 'var(--bg-elevated)' }}>{t('ob.step2.size.solo')}</option>
              <option value="2-5" style={{ background: 'var(--bg-elevated)' }}>{t('ob.step2.size.small')}</option>
              <option value="6-20" style={{ background: 'var(--bg-elevated)' }}>{t('ob.step2.size.medium')}</option>
              <option value="21+" style={{ background: 'var(--bg-elevated)' }}>{t('ob.step2.size.large')}</option>
            </select>
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </div>
        </div>

        {/* Website (optional) */}
        <div>
          <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t('ob.step2.website.label')}</label>
          <div className="relative">
            <FieldIcon>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </FieldIcon>
            <input
              type="url"
              value={data.website ?? ''}
              onChange={e => onChange('website', e.target.value)}
              placeholder={t('ob.step2.website.placeholder')}
              className="h-12 w-full rounded-xl pl-10 pr-4 text-sm text-white placeholder-slate-600 outline-none transition-all duration-200"
              style={FIELD}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

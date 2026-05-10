'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/i18n/context'
import type { TranslationKey } from '@/lib/i18n/translations'
import { BackButton } from '@/components/ui/BackButton'
import { useTheme } from '@/lib/theme/context'

type Tab = 'profile' | 'preferences' | 'subscription' | 'security'

// ── Shared style helpers ───────────────────────────────────────────────────────

const FIELD = { background: 'var(--input-bg, #1a2236)', border: '1px solid var(--border-color, rgba(255,255,255,0.08))' }

function onInputFocus(e: React.FocusEvent<HTMLInputElement>) {
  e.currentTarget.style.borderColor = '#0ea5e9'
  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.1)'
}
function onInputBlur(e: React.FocusEvent<HTMLInputElement>) {
  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
  e.currentTarget.style.boxShadow = 'none'
}

// ── Shared UI atoms ────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none"
      style={{ background: checked ? '#0ea5e9' : 'rgba(255,255,255,0.1)' }}
    >
      <span
        className="inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200"
        style={{ transform: checked ? 'translateX(24px)' : 'translateX(4px)' }}
      />
    </button>
  )
}

function ToggleRow({ label, desc, checked, onChange, noBorder }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void; noBorder?: boolean }) {
  return (
    <div
      className="flex items-center justify-between gap-4 py-4"
      style={!noBorder ? { borderBottom: '1px solid rgba(255,255,255,0.04)' } : undefined}
    >
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="mt-0.5 text-xs" style={{ color: '#64748b' }}>{desc}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  )
}

function SuccessBanner({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <div className="mt-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80' }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
      {message}
    </div>
  )
}

function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <div className="mt-4 rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
      {message}
    </div>
  )
}

function Avatar({ name, size = 64 }: { name: string; size?: number }) {
  const parts = name.trim().split(/\s+/)
  const initials = ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || 'U'
  return (
    <div
      className="flex flex-shrink-0 items-center justify-center rounded-full font-bold text-white"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36), background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)' }}
    >
      {initials}
    </div>
  )
}

function EyeIcon({ off }: { off?: boolean }) {
  return off ? (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function PwdField({ label, value, onChange, show, onToggle }: { label: string; value: string; onChange: (v: string) => void; show: boolean; onToggle: () => void }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium" style={{ color: '#cbd5e1' }}>{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="h-12 w-full rounded-xl pl-4 pr-11 text-sm text-white outline-none transition-all duration-200"
          style={FIELD}
          onFocus={onInputFocus}
          onBlur={onInputBlur}
        />
        <button type="button" onClick={onToggle} className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors" style={{ color: '#64748b' }}>
          <EyeIcon off={show} />
        </button>
      </div>
    </div>
  )
}

// ── PROFILE TAB ───────────────────────────────────────────────────────────────

function ProfileTab() {
  const { t } = useTranslation()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [sector, setSector] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      const user = data?.user
      if (!user) return
      setEmail(user.email ?? '')
      setFullName(user.user_metadata?.full_name ?? '')
      setCompany(user.user_metadata?.company ?? user.user_metadata?.business_name ?? '')
      setSector(user.user_metadata?.sector ?? '')
    })
  }, [])

  async function handleSave() {
    setSaving(true)
    setSuccess(null)
    setError(null)
    const supabase = createClient()
    const { error: err } = await supabase.auth.updateUser({
      data: { full_name: fullName, company, sector },
    })
    setSaving(false)
    if (err) {
      setError(err.message)
    } else {
      setSuccess(t('settings.profile.saved'))
      setTimeout(() => setSuccess(null), 3000)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">{t('settings.profile.title')}</h2>
        <p className="mt-0.5 text-sm" style={{ color: '#64748b' }}>{t('settings.profile.subtitle')}</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <Avatar name={fullName} size={64} />
        <div>
          <p className="text-sm font-medium text-white">{fullName || email}</p>
          <p className="text-xs" style={{ color: '#64748b' }}>{email}</p>
          <button
            type="button"
            className="mt-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}
          >
            {t('settings.profile.avatar.change')}
          </button>
        </div>
      </div>

      {/* Fields */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium" style={{ color: '#cbd5e1' }}>{t('settings.profile.fullname')}</label>
          <input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder={t('settings.profile.fullname.placeholder')}
            className="h-12 w-full rounded-xl px-4 text-sm text-white placeholder-slate-600 outline-none transition-all duration-200"
            style={FIELD}
            onFocus={onInputFocus}
            onBlur={onInputBlur}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium" style={{ color: '#cbd5e1' }}>
            {t('settings.profile.email')}
            <span className="ml-2 text-[10px] font-normal" style={{ color: '#475569' }}>({t('settings.profile.email.note')})</span>
          </label>
          <input
            type="email"
            value={email}
            readOnly
            className="h-12 w-full cursor-not-allowed rounded-xl px-4 text-sm outline-none"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium" style={{ color: '#cbd5e1' }}>{t('settings.profile.company')}</label>
          <input
            type="text"
            value={company}
            onChange={e => setCompany(e.target.value)}
            placeholder={t('settings.profile.company.placeholder')}
            className="h-12 w-full rounded-xl px-4 text-sm text-white placeholder-slate-600 outline-none transition-all duration-200"
            style={FIELD}
            onFocus={onInputFocus}
            onBlur={onInputBlur}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium" style={{ color: '#cbd5e1' }}>{t('settings.profile.sector')}</label>
          <input
            type="text"
            value={sector}
            onChange={e => setSector(e.target.value)}
            placeholder={t('settings.profile.sector.placeholder')}
            className="h-12 w-full rounded-xl px-4 text-sm text-white placeholder-slate-600 outline-none transition-all duration-200"
            style={FIELD}
            onFocus={onInputFocus}
            onBlur={onInputBlur}
          />
        </div>
      </div>

      <SuccessBanner message={success} />
      <ErrorBanner message={error} />

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="btn-premium flex items-center gap-2 rounded-xl px-6 h-11 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {saving ? <><Spinner />{t('settings.profile.saving')}</> : t('settings.profile.save')}
      </button>
    </div>
  )
}

// ── PREFERENCES TAB ───────────────────────────────────────────────────────────

function PreferencesTab() {
  const { t, locale, switchLanguage } = useTranslation()
  const { theme, setTheme } = useTheme()
  const [emailNotif, setEmailNotif] = useState(true)
  const [pushNotif, setPushNotif] = useState(false)
  const [reportFreq, setReportFreq] = useState('weekly')
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-1">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">{t('settings.pref.title')}</h2>
        <p className="mt-0.5 text-sm" style={{ color: '#64748b' }}>{t('settings.pref.subtitle')}</p>
      </div>

      {/* Language */}
      <div className="flex items-center justify-between gap-4 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div>
          <p className="text-sm font-medium text-white">{t('settings.pref.lang')}</p>
          <p className="mt-0.5 text-xs" style={{ color: '#64748b' }}>{t('settings.pref.lang.desc')}</p>
        </div>
        <div className="flex overflow-hidden rounded-lg" style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)' }}>
          {(['fr', 'en'] as const).map(lang => (
            <button
              key={lang}
              type="button"
              onClick={() => switchLanguage(lang)}
              className="px-4 py-2 text-xs font-semibold uppercase transition-colors duration-200"
              style={{ color: locale === lang ? '#ffffff' : '#64748b', background: locale === lang ? 'rgba(14,165,233,0.2)' : 'transparent' }}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Theme */}
      <div className="flex items-center justify-between gap-4 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div>
          <p className="text-sm font-medium text-white">{t('settings.pref.theme')}</p>
          <p className="mt-0.5 text-xs" style={{ color: '#64748b' }}>{t('settings.pref.theme.desc')}</p>
        </div>
        <div className="flex overflow-hidden rounded-lg" style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)' }}>
          {(['dark', 'light'] as const).map(t_ => (
            <button
              key={t_}
              type="button"
              onClick={() => setTheme(t_)}
              className="px-4 py-2 text-xs font-semibold uppercase transition-colors duration-200"
              style={{
                color: theme === t_ ? '#ffffff' : '#64748b',
                background: theme === t_ ? 'rgba(14,165,233,0.2)' : 'transparent',
              }}
            >
              {t_ === 'dark' ? t('settings.pref.theme.dark') : t('settings.pref.theme.light')}
            </button>
          ))}
        </div>
      </div>

      {/* Notification toggles */}
      <ToggleRow label={t('settings.pref.notif.email')} desc={t('settings.pref.notif.email.desc')} checked={emailNotif} onChange={setEmailNotif} />
      <ToggleRow label={t('settings.pref.notif.push')} desc={t('settings.pref.notif.push.desc')} checked={pushNotif} onChange={setPushNotif} noBorder />

      {/* Report frequency */}
      <div className="flex items-center justify-between gap-4 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div>
          <p className="text-sm font-medium text-white">{t('settings.pref.report.freq')}</p>
          <p className="mt-0.5 text-xs" style={{ color: '#64748b' }}>{t('settings.pref.report.freq.desc')}</p>
        </div>
        <div className="relative">
          <select
            value={reportFreq}
            onChange={e => setReportFreq(e.target.value)}
            className="h-9 appearance-none rounded-lg pl-3 pr-8 text-xs font-medium outline-none"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
          >
            <option value="daily" style={{ background: 'var(--input-bg)' }}>{t('settings.pref.report.daily')}</option>
            <option value="weekly" style={{ background: 'var(--input-bg)' }}>{t('settings.pref.report.weekly')}</option>
            <option value="monthly" style={{ background: 'var(--input-bg)' }}>{t('settings.pref.report.monthly')}</option>
          </select>
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" style={{ color: '#64748b' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="6 9 12 15 18 9" /></svg>
          </span>
        </div>
      </div>

      {saved && <SuccessBanner message={t('settings.pref.saved')} />}

      <div className="pt-2">
        <button type="button" onClick={handleSave} className="btn-premium rounded-xl px-6 h-11 text-sm font-semibold">
          {t('settings.pref.save')}
        </button>
      </div>
    </div>
  )
}

// ── SUBSCRIPTION TAB ──────────────────────────────────────────────────────────

const PLAN_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  free: { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8', border: 'rgba(100,116,139,0.3)' },
  pro: { bg: 'rgba(14,165,233,0.15)', color: '#38bdf8', border: 'rgba(14,165,233,0.3)' },
  business: { bg: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: 'rgba(139,92,246,0.3)' },
}

const MOCK_INVOICES = [
  { id: 'INV-2026-04', date: '01/04/2026', amount: '29€' },
  { id: 'INV-2026-03', date: '01/03/2026', amount: '29€' },
  { id: 'INV-2026-02', date: '01/02/2026', amount: '29€' },
]

const PLAN_DESC_KEYS: Record<string, TranslationKey> = {
  free: 'settings.sub.free.desc',
  pro: 'settings.sub.pro.desc',
  business: 'settings.sub.business.desc',
}

function SubscriptionTab() {
  const { t } = useTranslation()
  const plan = 'pro'
  const planStyle = PLAN_STYLES[plan]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">{t('settings.sub.title')}</h2>
        <p className="mt-0.5 text-sm" style={{ color: '#64748b' }}>{t('settings.sub.subtitle')}</p>
      </div>

      {/* Current plan card */}
      <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-medium" style={{ color: '#64748b' }}>{t('settings.sub.current')}</p>
            <span className="rounded-full px-3 py-1 text-sm font-bold capitalize" style={{ background: planStyle.bg, color: planStyle.color, border: `1px solid ${planStyle.border}` }}>
              {plan}
            </span>
            <p className="mt-2 text-xs" style={{ color: '#64748b' }}>{t(PLAN_DESC_KEYS[plan])}</p>
            <p className="mt-1 text-xs" style={{ color: '#475569' }}>{t('settings.sub.renewal')} 01/06/2026</p>
          </div>
          <Link href="/pricing" className="btn-premium flex h-9 items-center rounded-lg px-4 text-xs font-semibold whitespace-nowrap">
            {t('settings.sub.change')}
          </Link>
        </div>
      </div>

      {/* Invoice history */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-white">{t('settings.sub.invoices')}</h3>
        <div className="overflow-hidden rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="grid grid-cols-4 gap-4 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wide" style={{ background: 'rgba(255,255,255,0.03)', color: '#475569' }}>
            <span>{t('settings.sub.invoice.date')}</span>
            <span>{t('settings.sub.invoice.amount')}</span>
            <span>{t('settings.sub.invoice.status')}</span>
            <span />
          </div>
          {MOCK_INVOICES.map(inv => (
            <div key={inv.id} className="grid grid-cols-4 items-center gap-4 px-4 py-3 text-sm" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ color: '#94a3b8' }}>{inv.date}</span>
              <span className="font-semibold text-white">{inv.amount}</span>
              <span>
                <span className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }}>
                  {t('settings.sub.invoice.paid')}
                </span>
              </span>
              <button type="button" className="text-left text-xs font-medium hover:underline" style={{ color: '#0ea5e9' }}>
                {t('settings.sub.invoice.download')}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── SECURITY TAB ──────────────────────────────────────────────────────────────

const MOCK_SESSIONS = [
  { id: '1', device: 'Chrome / Windows', location: 'Paris, France', current: true },
  { id: '2', device: 'Safari / iPhone', location: 'Lyon, France', current: false },
]

function SecurityTab() {
  const { t } = useTranslation()
  const router = useRouter()
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pwdSaving, setPwdSaving] = useState(false)
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null)
  const [pwdError, setPwdError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  async function handlePasswordChange() {
    setPwdError(null)
    setPwdSuccess(null)
    if (newPwd !== confirmPwd) {
      setPwdError(t('settings.sec.pwd.mismatch'))
      return
    }
    setPwdSaving(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPwd })
    setPwdSaving(false)
    if (error) {
      setPwdError(error.message)
    } else {
      setPwdSuccess(t('settings.sec.pwd.success'))
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('')
      setTimeout(() => setPwdSuccess(null), 3000)
    }
  }

  async function handleSignOutAll() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-white">{t('settings.sec.title')}</h2>
        <p className="mt-0.5 text-sm" style={{ color: '#64748b' }}>{t('settings.sec.subtitle')}</p>
      </div>

      {/* Change password */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white">{t('settings.sec.pwd.title')}</h3>
        <div className="space-y-3">
          <PwdField label={t('settings.sec.pwd.current')} value={currentPwd} onChange={setCurrentPwd} show={showCurrent} onToggle={() => setShowCurrent(v => !v)} />
          <PwdField label={t('settings.sec.pwd.new')} value={newPwd} onChange={setNewPwd} show={showNew} onToggle={() => setShowNew(v => !v)} />
          <PwdField label={t('settings.sec.pwd.confirm')} value={confirmPwd} onChange={setConfirmPwd} show={showConfirm} onToggle={() => setShowConfirm(v => !v)} />
        </div>
        <SuccessBanner message={pwdSuccess} />
        <ErrorBanner message={pwdError} />
        <button
          type="button"
          onClick={handlePasswordChange}
          disabled={pwdSaving || !newPwd || !confirmPwd}
          className="btn-premium flex items-center gap-2 rounded-xl px-6 h-11 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pwdSaving ? <><Spinner />{t('settings.sec.pwd.saving')}</> : t('settings.sec.pwd.save')}
        </button>
      </div>

      {/* Active sessions */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-white">{t('settings.sec.sessions.title')}</h3>
        <div className="space-y-2">
          {MOCK_SESSIONS.map(session => (
            <div key={session.id} className="flex items-center justify-between gap-4 rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: 'rgba(14,165,233,0.1)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" aria-hidden="true">
                    <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{session.device}</p>
                  <p className="text-xs" style={{ color: '#64748b' }}>{session.location}</p>
                </div>
              </div>
              {session.current && (
                <span className="whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }}>
                  {t('settings.sec.sessions.current')}
                </span>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={handleSignOutAll}
          className="mt-3 rounded-xl px-4 h-9 text-xs font-medium transition-all duration-200"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}
        >
          {t('settings.sec.sessions.revoke')}
        </button>
      </div>

      {/* Danger zone */}
      <div className="rounded-xl p-5" style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.2)' }}>
        <h3 className="mb-1 text-sm font-semibold" style={{ color: '#f87171' }}>{t('settings.sec.danger.title')}</h3>
        <p className="mb-4 text-xs" style={{ color: '#94a3b8' }}>{t('settings.sec.danger.desc')}</p>
        {!deleteConfirm ? (
          <button
            type="button"
            onClick={() => setDeleteConfirm(true)}
            className="rounded-xl px-4 h-10 text-sm font-semibold transition-all duration-200"
            style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}
          >
            {t('settings.sec.danger.delete')}
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-xs font-medium" style={{ color: '#f87171' }}>⚠ {t('settings.sec.danger.confirm')}</p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-xl px-4 h-10 text-sm font-semibold transition-all duration-200"
                style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171' }}
              >
                {t('settings.sec.danger.delete')}
              </button>
              <button
                type="button"
                onClick={() => setDeleteConfirm(false)}
                className="rounded-xl px-4 h-10 text-sm font-medium"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────

const TABS: { id: Tab; labelKey: TranslationKey }[] = [
  { id: 'profile', labelKey: 'settings.tab.profile' },
  { id: 'preferences', labelKey: 'settings.tab.preferences' },
  { id: 'subscription', labelKey: 'settings.tab.subscription' },
  { id: 'security', labelKey: 'settings.tab.security' },
]

export default function SettingsPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [activeTab, setActiveTab] = useState<Tab>('profile')

  function renderTab() {
    switch (activeTab) {
      case 'profile':      return <ProfileTab />
      case 'preferences':  return <PreferencesTab />
      case 'subscription': return <SubscriptionTab />
      case 'security':     return <SecurityTab />
    }
  }

  return (
    <div className="animate-fade-in max-w-3xl space-y-6">
      <BackButton />
      <div className="animate-fade-up">
        <h1 className="gradient-text text-2xl font-bold" style={{ letterSpacing: '-0.02em', color: theme === 'light' ? '#0f172a' : undefined }}>{t('settings')}</h1>
      </div>

      <div
        className="overflow-hidden rounded-2xl"
        style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid var(--border-color)' }}
      >
        {/* Desktop tab bar */}
        <div className="hidden items-stretch sm:flex" style={{ borderBottom: theme === 'light' ? '1px solid #e8eaf0' : '1px solid rgba(255,255,255,0.06)' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className="whitespace-nowrap px-6 py-4 text-sm font-medium transition-all duration-200"
              style={{
                color: activeTab === tab.id ? (theme === 'light' ? '#0f172a' : '#ffffff') : '#64748b',
                borderBottom: activeTab === tab.id ? '2px solid #0ea5e9' : '2px solid transparent',
                background: activeTab === tab.id ? (theme === 'light' ? '#ffffff' : 'rgba(14,165,233,0.05)') : 'transparent',
              }}
            >
              {t(tab.labelKey)}
            </button>
          ))}
          <Link
            href="/settings/integrations"
            className="ml-auto whitespace-nowrap px-6 py-4 text-sm font-medium transition-colors duration-200"
            style={{ color: '#64748b', borderBottom: '2px solid transparent' }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#94a3b8' }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#64748b' }}
          >
            {t('settings.integrations')}
          </Link>
        </div>

        {/* Mobile dropdown */}
        <div className="p-4 pb-0 sm:hidden">
          <div className="relative">
            <select
              value={activeTab}
              onChange={e => setActiveTab(e.target.value as Tab)}
              className="h-11 w-full appearance-none rounded-xl pl-4 pr-10 text-sm font-medium outline-none"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
            >
              {TABS.map(tab => (
                <option key={tab.id} value={tab.id} style={{ background: 'var(--input-bg)' }}>{t(tab.labelKey)}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: '#64748b' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="6 9 12 15 18 9" /></svg>
            </span>
          </div>
        </div>

        {/* Tab content */}
        <div className="p-6">
          {renderTab()}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/i18n/context'
import type { TranslationKey } from '@/lib/i18n/translations'
import { BackButton } from '@/components/ui/BackButton'

const AUTH_FEATURES: TranslationKey[] = ['auth.feat.1', 'auth.feat.2', 'auth.feat.3']

// ── Inline SVG atoms ─────────────────────────────────────────────────────────

function IconMail() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,12 2,6"/>
    </svg>
  )
}

function IconLock() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  )
}

function IconEye({ off }: { off?: boolean }) {
  return off ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

function IconCheck() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2.5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
    </svg>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

// ── Input helper ─────────────────────────────────────────────────────────────

const INPUT_STYLE = { background: 'var(--input-bg, #1a2236)', border: '1px solid var(--border-color, rgba(255,255,255,0.08))' }
const INPUT_FOCUS = (e: React.FocusEvent<HTMLInputElement>) => {
  const isWarm = document.documentElement.getAttribute('data-theme') === 'warm'
  e.currentTarget.style.borderColor = isWarm ? '#fb923c' : '#0ea5e9'
  e.currentTarget.style.boxShadow = isWarm ? '0 0 0 3px rgba(251,146,60,0.1)' : '0 0 0 3px rgba(14,165,233,0.1)'
}
const INPUT_BLUR = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.borderColor = 'var(--border-color, rgba(255,255,255,0.08))'
  e.currentTarget.style.boxShadow = 'none'
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError(t('auth.error.invalid'))
      setLoading(false)
    } else {
      window.location.href = '/dashboard'
    }
  }

  async function handleGoogleSignIn() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
  }

  return (
    <div className="flex min-h-screen">

      {/* ── Left: marketing panel ── */}
      <div className="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex lg:w-1/2">
        {/* Mesh glows */}
        <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(135deg, #0c1220 0%, #111827 60%, #0f1a2e 100%)' }} />
        <div className="pointer-events-none absolute left-1/4 top-1/4 h-96 w-96 rounded-full opacity-25" style={{ background: 'radial-gradient(circle, #0ea5e9, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)', filter: 'blur(60px)' }} />

        {/* Logo */}
        <div className="relative">
          <span className="text-2xl font-bold" style={{ letterSpacing: '-0.03em' }}>
            <span style={{ color: '#0ea5e9' }}>Pro</span><span className="text-white">AI</span>
          </span>
        </div>

        {/* Content */}
        <div className="relative space-y-10">
          <div>
            <h1 className="mb-3 text-4xl font-bold text-white" style={{ letterSpacing: '-0.02em' }}>{t('auth.welcome')}</h1>
            <p className="text-lg text-slate-400">{t('auth.tagline')}</p>
          </div>

          {/* Features */}
          <ul className="space-y-4">
            {AUTH_FEATURES.map((key) => (
              <li key={key} className="flex items-center gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: 'rgba(14,165,233,0.15)', border: '1px solid rgba(14,165,233,0.25)' }}>
                  <IconCheck />
                </div>
                <span className="text-sm font-medium text-slate-300">{t(key)}</span>
              </li>
            ))}
          </ul>

          {/* Testimonial */}
          <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="mb-4 flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              ))}
            </div>
            <p className="mb-4 text-sm italic leading-relaxed text-slate-300">"{t('auth.test.text')}"</p>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)' }}>S</div>
              <div>
                <p className="text-sm font-semibold text-white">{t('auth.test.name')}</p>
                <p className="text-xs text-slate-500">{t('auth.test.role')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <p className="text-xs text-slate-700">© 2026 Krezia</p>
        </div>
      </div>

      {/* ── Right: form ── */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2 lg:p-12" style={{ background: 'var(--bg-base, #0c1220)' }}>
        <div className="w-full max-w-md animate-fade-in">
          <div className="mb-4">
            <BackButton href="/" />
          </div>

          {/* Mobile logo */}
          <div className="mb-8 text-center lg:hidden">
            <span className="text-2xl font-bold" style={{ letterSpacing: '-0.03em' }}>
              <span style={{ color: '#0ea5e9' }}>Pro</span><span style={{ color: 'var(--text-primary)' }}>AI</span>
            </span>
          </div>

          <div className="rounded-2xl p-8" style={{ background: 'var(--bg-surface, #111827)', border: '1px solid var(--border-color, rgba(255,255,255,0.06))' }}>
            <div className="mb-8">
              <h2 className="mb-1 text-2xl font-bold" style={{ letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>{t('auth.login')}</h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('auth.login.subtitle')}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{t('auth.email')}</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"><IconMail /></span>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder={t('auth.email.placeholder')}
                    className="h-12 w-full rounded-xl pl-10 pr-4 text-sm placeholder-slate-400 outline-none transition-all duration-200"
                    style={INPUT_STYLE}
                    onFocus={INPUT_FOCUS}
                    onBlur={INPUT_BLUR}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{t('auth.password')}</label>
                  <Link href="#" className="text-xs text-sky-400 transition-colors hover:text-sky-300">{t('auth.forgot.password')}</Link>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"><IconLock /></span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="h-12 w-full rounded-xl pl-10 pr-12 text-sm placeholder-slate-400 outline-none transition-all duration-200"
                    style={INPUT_STYLE}
                    onFocus={INPUT_FOCUS}
                    onBlur={INPUT_BLUR}
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-300">
                    <IconEye off={showPassword} />
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded accent-sky-500"
                />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('auth.remember')}</span>
              </label>

              {/* Error */}
              {error && (
                <div className="rounded-xl px-4 py-3 text-sm text-red-400" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-premium flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? <><Spinner />{t('auth.signin.loading')}</> : t('auth.signin.button')}
              </button>
            </form>

            {/* Separator */}
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1" style={{ background: 'var(--border-color)' }} />
              <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{t('auth.or')}</span>
              <div className="h-px flex-1" style={{ background: 'var(--border-color)' }} />
            </div>

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="flex h-12 w-full items-center justify-center gap-3 rounded-xl text-sm font-medium transition-all duration-200"
              style={{ border: '1px solid var(--border-color)', background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-surface)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(14,165,233,0.3)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-elevated)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-color)' }}
            >
              <GoogleIcon />
              {t('auth.signin.google')}
            </button>

            {/* Sign-up link */}
            <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              {t('auth.no.account')}{' '}
              <Link href="/signup" className="font-medium text-sky-500 transition-colors hover:text-sky-400">
                {t('auth.signup')}
              </Link>
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}

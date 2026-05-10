'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/lib/i18n/context'
import type { TranslationKey } from '@/lib/i18n/translations'
import { Step1Welcome } from './steps/Step1Welcome'
import { Step2Organization } from './steps/Step2Organization'
import { Step3UseCase } from './steps/Step3UseCase'
import { Step4LLMProvider } from './steps/Step4LLMProvider'
import { Step5Ready } from './steps/Step5Ready'
import { api } from '@/lib/api'

const STEP_KEYS: TranslationKey[] = ['ob.steps.1', 'ob.steps.2', 'ob.steps.3', 'ob.steps.4', 'ob.steps.5']
const STEP_COMPONENTS = [Step1Welcome, Step2Organization, Step3UseCase, Step4LLMProvider, Step5Ready]

// ── SVG atoms ─────────────────────────────────────────────────────────────────

function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}

function CheckDot() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

// ── Progress bar ───────────────────────────────────────────────────────────────

function ProgressBar({ step, total }: { step: number; total: number }) {
  const { t } = useTranslation()
  return (
    <div className="mb-10 px-1">
      <div className="relative flex items-start justify-between">
        {/* Background connector line */}
        <div
          className="absolute top-4 left-0 right-0 h-px"
          style={{ background: 'rgba(255,255,255,0.06)', zIndex: 0 }}
        />
        {/* Progress fill */}
        <div
          className="absolute top-4 left-0 h-px transition-all duration-500 ease-out"
          style={{
            background: 'linear-gradient(90deg, #22c55e, #0ea5e9)',
            width: step === 0 ? '0%' : `${(step / (total - 1)) * 100}%`,
            zIndex: 0,
          }}
        />
        {/* Dots + labels */}
        {STEP_KEYS.map((key, i) => {
          const done = i < step
          const active = i === step
          return (
            <div key={i} className="relative flex flex-col items-center gap-2" style={{ zIndex: 1 }}>
              <div className={`ob-step-dot ${done ? 'ob-step-done' : active ? 'ob-step-active' : 'ob-step-pending'}`}>
                {done ? <CheckDot /> : <span className="text-[11px] font-bold">{i + 1}</span>}
              </div>
              <span
                className="hidden sm:block text-[10px] font-medium whitespace-nowrap transition-colors duration-300"
                style={{ color: active ? '#ffffff' : done ? '#4ade80' : '#475569' }}
              >
                {t(key)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Wizard ─────────────────────────────────────────────────────────────────────

export function OnboardingWizard() {
  const { t } = useTranslation()
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [animKey, setAnimKey] = useState(0)
  const [data, setData] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleChange(key: string, value: string) {
    setData(prev => ({ ...prev, [key]: value }))
  }

  function goBack() {
    if (step === 0) return
    setDirection('back')
    setAnimKey(k => k + 1)
    setStep(s => s - 1)
  }

  async function handleNext() {
    if (step < STEP_COMPONENTS.length - 1) {
      setDirection('forward')
      setAnimKey(k => k + 1)
      setStep(s => s + 1)
      return
    }
    setSaving(true)
    setError(null)
    try {
      await api.post('/api/v1/onboarding/profile', {
        business_name:   data.orgName        || null,
        sector:          data.industry        || null,
        target_audience: data.targetAudience  || null,
        main_objective:  data.useCase         || null,
        company_size:    data.teamSize        || null,
        current_tools:   data.llmProvider     || null,
      })
      router.push('/dashboard')
    } catch (err) {
      console.warn('Profile save failed, redirecting anyway:', err)
      router.push('/dashboard')
    } finally {
      setSaving(false)
    }
  }

  const CurrentStep = STEP_COMPONENTS[step]
  const isLast = step === STEP_COMPONENTS.length - 1

  return (
    <div className="w-full max-w-2xl">
      <ProgressBar step={step} total={5} />

      {/* Glass card */}
      <div
        className="rounded-2xl p-6 sm:p-8"
        style={{
          background: 'rgba(17,24,39,0.85)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
        }}
      >
        {/* Animated step content */}
        <div key={animKey} className={direction === 'forward' ? 'ob-slide-in-right' : 'ob-slide-in-left'}>
          <CurrentStep data={data} onChange={handleChange} />
        </div>

        {error && (
          <p className="mt-4 text-xs text-red-400 text-center">{error}</p>
        )}

        {/* Navigation */}
        <div className="flex items-center gap-3 mt-8">
          {step > 0 && (
            <button
              type="button"
              onClick={goBack}
              disabled={saving}
              className="flex items-center gap-2 px-5 h-12 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-40"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)' }}
            >
              <ChevronLeft />
              {t('ob.back')}
            </button>
          )}

          <button
            type="button"
            onClick={handleNext}
            disabled={saving}
            className="btn-premium flex flex-1 items-center justify-center gap-2 h-12 rounded-xl text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <><Spinner />{t('ob.saving')}</>
            ) : isLast ? (
              t('ob.start')
            ) : (
              <>{t('ob.continue')}<ChevronRight /></>
            )}
          </button>
        </div>
      </div>

      <p className="mt-4 text-center text-xs" style={{ color: '#475569' }}>
        {t('ob.footer')}
      </p>
    </div>
  )
}

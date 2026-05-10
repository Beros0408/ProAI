'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useTranslation } from '@/lib/i18n/context'
import type { TranslationKey } from '@/lib/i18n/translations'
import {
  GmailIcon, SlackIcon, HubSpotIcon, GoogleCalendarIcon, NotionIcon,
  LinkedInIcon, InstagramIcon, FacebookIcon, ZapierIcon, StripeIcon, N8nIcon,
} from '@/components/icons/BrandIcons'

// ─── Types ───────────────────────────────────────────────────────────────────

type FeatureItem = { icon: string; titleKey: TranslationKey; descKey: TranslationKey; color: string }
type StepItem    = { numKey: TranslationKey; titleKey: TranslationKey; descKey: TranslationKey }
type AgentItem   = { nameKey: TranslationKey; specialtyKey: TranslationKey; actionKeys: [TranslationKey, TranslationKey, TranslationKey]; color: string; emoji: string }
type PlanItem    = { nameKey: TranslationKey; priceKey: TranslationKey; priceAnnualKey: TranslationKey; periodKey: TranslationKey; descKey: TranslationKey; featKeys: TranslationKey[]; popular: boolean; ctaKey: TranslationKey }
type TestimonialItem = { textKey: TranslationKey; nameKey: TranslationKey; roleKey: TranslationKey }

// ─── Static data ─────────────────────────────────────────────────────────────

const FEATURES: FeatureItem[] = [
  { icon: '🤖', titleKey: 'landing.feat.1.title', descKey: 'landing.feat.1.desc', color: '#0ea5e9' },
  { icon: '✍️', titleKey: 'landing.feat.2.title', descKey: 'landing.feat.2.desc', color: '#8b5cf6' },
  { icon: '📈', titleKey: 'landing.feat.3.title', descKey: 'landing.feat.3.desc', color: '#34d399' },
  { icon: '⚡', titleKey: 'landing.feat.4.title', descKey: 'landing.feat.4.desc', color: '#fb923c' },
  { icon: '📋', titleKey: 'landing.feat.5.title', descKey: 'landing.feat.5.desc', color: '#f43f5e' },
  { icon: '📅', titleKey: 'landing.feat.6.title', descKey: 'landing.feat.6.desc', color: '#06b6d4' },
]

const STEPS: StepItem[] = [
  { numKey: 'landing.how.step.1.num', titleKey: 'landing.how.step.1.title', descKey: 'landing.how.step.1.desc' },
  { numKey: 'landing.how.step.2.num', titleKey: 'landing.how.step.2.title', descKey: 'landing.how.step.2.desc' },
  { numKey: 'landing.how.step.3.num', titleKey: 'landing.how.step.3.title', descKey: 'landing.how.step.3.desc' },
]

const AGENTS: AgentItem[] = [
  { nameKey: 'landing.agent.marketing.name', specialtyKey: 'landing.agent.marketing.specialty', actionKeys: ['landing.agent.marketing.action.1', 'landing.agent.marketing.action.2', 'landing.agent.marketing.action.3'], color: '#0ea5e9', emoji: '📣' },
  { nameKey: 'landing.agent.sales.name',     specialtyKey: 'landing.agent.sales.specialty',     actionKeys: ['landing.agent.sales.action.1',     'landing.agent.sales.action.2',     'landing.agent.sales.action.3'],     color: '#34d399', emoji: '💼' },
  { nameKey: 'landing.agent.social.name',    specialtyKey: 'landing.agent.social.specialty',    actionKeys: ['landing.agent.social.action.1',    'landing.agent.social.action.2',    'landing.agent.social.action.3'],    color: '#8b5cf6', emoji: '📱' },
  { nameKey: 'landing.agent.communication.name', specialtyKey: 'landing.agent.communication.specialty', actionKeys: ['landing.agent.communication.action.1', 'landing.agent.communication.action.2', 'landing.agent.communication.action.3'], color: '#fb923c', emoji: '✉️' },
  { nameKey: 'landing.agent.automation.name', specialtyKey: 'landing.agent.automation.specialty', actionKeys: ['landing.agent.automation.action.1', 'landing.agent.automation.action.2', 'landing.agent.automation.action.3'], color: '#f43f5e', emoji: '⚙️' },
  { nameKey: 'landing.agent.analytics.name', specialtyKey: 'landing.agent.analytics.specialty', actionKeys: ['landing.agent.analytics.action.1', 'landing.agent.analytics.action.2', 'landing.agent.analytics.action.3'], color: '#06b6d4', emoji: '📊' },
]

const PLANS: PlanItem[] = [
  { nameKey: 'landing.pricing.free.name', priceKey: 'landing.pricing.free.price', priceAnnualKey: 'landing.pricing.free.price.annual', periodKey: 'landing.pricing.free.period', descKey: 'landing.pricing.free.desc', featKeys: ['landing.pricing.free.feat.1', 'landing.pricing.free.feat.2', 'landing.pricing.free.feat.3', 'landing.pricing.free.feat.4'], popular: false, ctaKey: 'landing.pricing.cta.free' },
  { nameKey: 'landing.pricing.pro.name',  priceKey: 'landing.pricing.pro.price',  priceAnnualKey: 'landing.pricing.pro.price.annual',  periodKey: 'landing.pricing.pro.period',  descKey: 'landing.pricing.pro.desc',  featKeys: ['landing.pricing.pro.feat.1',  'landing.pricing.pro.feat.2',  'landing.pricing.pro.feat.3',  'landing.pricing.pro.feat.4',  'landing.pricing.pro.feat.5'],  popular: true,  ctaKey: 'landing.pricing.cta' },
  { nameKey: 'landing.pricing.business.name', priceKey: 'landing.pricing.business.price', priceAnnualKey: 'landing.pricing.business.price.annual', periodKey: 'landing.pricing.business.period', descKey: 'landing.pricing.business.desc', featKeys: ['landing.pricing.business.feat.1', 'landing.pricing.business.feat.2', 'landing.pricing.business.feat.3', 'landing.pricing.business.feat.4', 'landing.pricing.business.feat.5'], popular: false, ctaKey: 'landing.pricing.cta' },
]

const TESTIMONIALS: TestimonialItem[] = [
  { textKey: 'landing.test.1.text', nameKey: 'landing.test.1.name', roleKey: 'landing.test.1.role' },
  { textKey: 'landing.test.2.text', nameKey: 'landing.test.2.name', roleKey: 'landing.test.2.role' },
  { textKey: 'landing.test.3.text', nameKey: 'landing.test.3.name', roleKey: 'landing.test.3.role' },
]

type IntegrationLandingItem = { name: string; icon: React.ReactNode; glowColor: string }

const INTEGRATIONS_LANDING: IntegrationLandingItem[] = [
  { name: 'Gmail',            icon: <GmailIcon size={32} />,           glowColor: '#EA4335' },
  { name: 'Slack',            icon: <SlackIcon size={32} />,           glowColor: '#E01E5A' },
  { name: 'HubSpot',          icon: <HubSpotIcon size={32} />,         glowColor: '#FF7A59' },
  { name: 'Google Calendar',  icon: <GoogleCalendarIcon size={32} />,  glowColor: '#4285F4' },
  { name: 'Notion',           icon: <NotionIcon size={32} />,          glowColor: '#94a3b8' },
  { name: 'LinkedIn',         icon: <LinkedInIcon size={32} />,        glowColor: '#0A66C2' },
  { name: 'Instagram',        icon: <InstagramIcon size={32} />,       glowColor: '#D6249F' },
  { name: 'Facebook',         icon: <FacebookIcon size={32} />,        glowColor: '#1877F2' },
  { name: 'Zapier',           icon: <ZapierIcon size={32} />,          glowColor: '#FF4A00' },
  { name: 'Stripe',           icon: <StripeIcon size={32} />,          glowColor: '#635BFF' },
  { name: 'n8n',              icon: <N8nIcon size={32} />,             glowColor: '#EA4B71' },
]

// ─── Spotlight mouse tracker (defined outside component — no re-render) ──────

function handleCardMouseMove(e: React.MouseEvent<HTMLDivElement>) {
  const card = e.currentTarget
  const rect = card.getBoundingClientRect()
  card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`)
  card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`)
}

// ─── useInView hook ───────────────────────────────────────────────────────────

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold })
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function LandingPage() {
  const { t, locale, switchLanguage } = useTranslation()
  const [annual, setAnnual] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const integrationsRef = useInView()
  const featuresRef     = useInView()
  const howRef          = useInView()
  const agentsRef       = useInView()
  const pricingRef      = useInView()
  const testimonialsRef = useInView()
  const ctaRef          = useInView()

  return (
    <div className="min-h-screen" style={{ background: '#050c18', color: '#e2e8f0', fontFamily: 'inherit' }}>

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(5,12,24,0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(24px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
        }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold" style={{ letterSpacing: '-0.03em' }}>
              <span style={{ color: '#0ea5e9' }}>Pro</span><span className="text-white">AI</span>
            </span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-slate-400 transition-colors hover:text-white">{t('landing.nav.features')}</a>
            <a href="#agents"   className="text-sm text-slate-400 transition-colors hover:text-white">{t('landing.nav.agents')}</a>
            <a href="#pricing"  className="text-sm text-slate-400 transition-colors hover:text-white">{t('landing.nav.pricing')}</a>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <Link href="/login" className="text-sm text-slate-400 transition-colors hover:text-white px-4 py-2">{t('landing.nav.login')}</Link>
            {/* Language toggle */}
            <div className="flex items-center rounded-lg overflow-hidden" style={{ background: '#1a2236', border: '1px solid rgba(255,255,255,0.1)' }}>
              {(['fr', 'en'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => switchLanguage(lang)}
                  className="px-3 py-1.5 text-xs font-semibold uppercase transition-colors duration-200"
                  style={{ color: locale === lang ? '#ffffff' : '#64748b', background: locale === lang ? 'rgba(14,165,233,0.15)' : 'transparent' }}
                >
                  {lang}
                </button>
              ))}
            </div>
            <Link href="/signup" className="btn-premium text-sm px-5 py-2.5">{t('landing.nav.cta')}</Link>
          </div>
          <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setMobileOpen(v => !v)} aria-label="Menu">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
        {mobileOpen && (
          <div className="md:hidden px-6 pb-6 space-y-4" style={{ background: 'rgba(5,12,24,0.96)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <a href="#features" className="block text-sm text-slate-300 py-2" onClick={() => setMobileOpen(false)}>{t('landing.nav.features')}</a>
            <a href="#agents"   className="block text-sm text-slate-300 py-2" onClick={() => setMobileOpen(false)}>{t('landing.nav.agents')}</a>
            <a href="#pricing"  className="block text-sm text-slate-300 py-2" onClick={() => setMobileOpen(false)}>{t('landing.nav.pricing')}</a>
            <Link href="/login"  className="block text-sm text-slate-300 py-2" onClick={() => setMobileOpen(false)}>{t('landing.nav.login')}</Link>
            <div className="flex items-center gap-2 py-2">
              <span className="text-xs text-slate-500 uppercase tracking-widest">{t('common.language')} :</span>
              <div className="flex items-center rounded-lg overflow-hidden" style={{ background: '#1a2236', border: '1px solid rgba(255,255,255,0.1)' }}>
                {(['fr', 'en'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => switchLanguage(lang)}
                    className="px-3 py-1.5 text-xs font-semibold uppercase transition-colors duration-200"
                    style={{ color: locale === lang ? '#ffffff' : '#64748b', background: locale === lang ? 'rgba(14,165,233,0.15)' : 'transparent' }}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
            <Link href="/signup" className="btn-premium inline-block text-sm px-5 py-2.5" onClick={() => setMobileOpen(false)}>{t('landing.nav.cta')}</Link>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20">
        {/* Mesh background */}
        <div className="landing-glow" style={{ width: 800, height: 800, top: '50%', left: '50%', transform: 'translate(-50%,-60%)', background: 'radial-gradient(ellipse, rgba(14,165,233,0.12) 0%, transparent 70%)' }} />
        <div className="landing-glow" style={{ width: 500, height: 500, bottom: 0, right: '10%', background: 'radial-gradient(ellipse, rgba(139,92,246,0.08) 0%, transparent 70%)' }} />

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm" style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.25)', color: '#38bdf8' }}>
            {t('landing.hero.badge')}
          </div>

          <h1 className="mb-6 text-3xl font-bold leading-[1.1] text-white md:text-4xl lg:text-5xl" style={{ letterSpacing: '-0.03em' }}>
            {t('landing.hero.title')}
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-400 leading-relaxed">
            {t('landing.hero.subtitle')}
          </p>

          <div className="mb-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/signup" className="btn-premium px-8 py-4 text-base font-semibold">
              {t('landing.hero.cta.primary')}
            </Link>
            <Link href="#agents" className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-white transition-all duration-200 hover:bg-white/10 hover:border-white/20">
              {t('landing.hero.cta.secondary')}
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </Link>
          </div>

          {/* Social proof */}
          <p className="mb-8 text-sm text-slate-500">{t('landing.hero.social')}</p>

          {/* Quick stats */}
          <div className="inline-flex flex-wrap justify-center gap-6 rounded-2xl px-8 py-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {(['landing.hero.stat.1', 'landing.hero.stat.2', 'landing.hero.stat.3'] as TranslationKey[]).map((key, i) => (
              <div key={i} className="flex items-center gap-2">
                {i > 0 && <span className="hidden h-4 w-px bg-white/10 sm:block" />}
                <span className="text-sm font-medium text-slate-300">{t(key)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Integrations grid ── */}
      <section className="py-20 px-6" style={{ background: '#0a1120', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }} ref={integrationsRef.ref as React.RefObject<HTMLElement>}>
        <div className={`mx-auto max-w-5xl landing-section-enter ${integrationsRef.visible ? 'is-visible' : ''}`}>
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest" style={{ background: 'rgba(14,165,233,0.1)', color: '#38bdf8', border: '1px solid rgba(14,165,233,0.2)' }}>{t('landing.integrations.badge')}</span>
            <h2 className="mb-3 text-3xl font-bold text-white" style={{ letterSpacing: '-0.02em' }}>{t('landing.integrations.title')}</h2>
            <p className="text-slate-400 text-sm">{t('landing.integrations.subtitle')}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6" style={{ perspective: '1000px' }}>
            {INTEGRATIONS_LANDING.map((item) => (
              <div
                key={item.name}
                className="integration-card flex flex-col items-center gap-3 rounded-2xl p-5 cursor-default"
                style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px' }}
                onMouseMove={handleCardMouseMove}
              >
                <div className="integration-icon flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: '#1a2236' }}>
                  {item.icon}
                </div>
                <div className="integration-card-name text-center">
                  <p className="integration-label mb-0.5 text-[10px] uppercase" style={{ color: '#64748b' }}>{t('landing.integrations.label')}</p>
                  <p className="text-sm font-semibold leading-tight" style={{ color: '#e2e8f0' }}>{item.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-28 px-6" ref={featuresRef.ref as React.RefObject<HTMLElement>}>
        <div className={`mx-auto max-w-6xl landing-section-enter ${featuresRef.visible ? 'is-visible' : ''}`}>
          <div className="mb-16 text-center">
            <span className="mb-4 inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest" style={{ background: 'rgba(14,165,233,0.1)', color: '#38bdf8', border: '1px solid rgba(14,165,233,0.2)' }}>{t('landing.features.badge')}</span>
            <h2 className="mb-4 text-4xl font-bold text-white" style={{ letterSpacing: '-0.02em' }}>{t('landing.features.title')}</h2>
            <p className="mx-auto max-w-xl text-slate-400">{t('landing.features.subtitle')}</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feat, i) => (
              <article
                key={i}
                className="card-premium group relative overflow-hidden p-6 cursor-default"
                style={{ transitionDelay: `${i * 80}ms` }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0 1px ${feat.color}25, 0 15px 40px rgba(0,0,0,0.4), 0 0 32px ${feat.color}10` }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = '' }}
              >
                <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(90deg, transparent, ${feat.color}60, transparent)` }} />
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-2xl" style={{ background: `${feat.color}15`, border: `1px solid ${feat.color}25` }}>
                  {feat.icon}
                </div>
                <h3 className="mb-2 font-semibold text-white">{t(feat.titleKey)}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{t(feat.descKey)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-28 px-6" style={{ background: 'rgba(255,255,255,0.015)' }} ref={howRef.ref as React.RefObject<HTMLElement>}>
        <div className={`mx-auto max-w-4xl landing-section-enter ${howRef.visible ? 'is-visible' : ''}`}>
          <div className="mb-16 text-center">
            <span className="mb-4 inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest" style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}>{t('landing.how.badge')}</span>
            <h2 className="text-4xl font-bold text-white" style={{ letterSpacing: '-0.02em' }}>{t('landing.how.title')}</h2>
          </div>
          <div className="relative grid gap-8 lg:grid-cols-3">
            {/* connector lines */}
            <div className="absolute top-10 left-1/3 right-1/3 hidden h-px lg:block" style={{ background: 'linear-gradient(90deg, transparent, rgba(14,165,233,0.4), transparent)' }} />
            {STEPS.map((step, i) => (
              <div key={i} className="relative flex flex-col items-center text-center" style={{ transitionDelay: `${i * 120}ms` }}>
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.25)', boxShadow: '0 0 20px rgba(14,165,233,0.1)' }}>
                  <span className="text-2xl font-bold" style={{ color: '#38bdf8' }}>{t(step.numKey)}</span>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">{t(step.titleKey)}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{t(step.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Agents showcase ── */}
      <section id="agents" className="py-28 px-6" ref={agentsRef.ref as React.RefObject<HTMLElement>}>
        <div className={`mx-auto max-w-6xl landing-section-enter ${agentsRef.visible ? 'is-visible' : ''}`}>
          <div className="mb-16 text-center">
            <span className="mb-4 inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest" style={{ background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)' }}>{t('landing.agents.badge')}</span>
            <h2 className="mb-4 text-4xl font-bold text-white" style={{ letterSpacing: '-0.02em' }}>{t('landing.agents.title')}</h2>
            <p className="mx-auto max-w-xl text-slate-400">{t('landing.agents.subtitle')}</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {AGENTS.map((agent, i) => (
              <article
                key={i}
                className="card-premium group relative overflow-hidden p-6"
                style={{ transitionDelay: `${i * 80}ms` }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0 1px ${agent.color}30, 0 15px 40px rgba(0,0,0,0.4)` }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = '' }}
              >
                <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(90deg, transparent, ${agent.color}60, transparent)` }} />
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl text-xl" style={{ background: `${agent.color}15`, border: `1px solid ${agent.color}25` }}>
                    {agent.emoji}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">{t(agent.nameKey)}</div>
                    <div className="text-xs" style={{ color: agent.color }}>{t(agent.specialtyKey)}</div>
                  </div>
                </div>
                <ul className="mb-5 space-y-2">
                  {agent.actionKeys.map((key, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-slate-300">
                      <span style={{ color: agent.color }}>✓</span>
                      {t(key)}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-200 hover:opacity-80" style={{ background: `${agent.color}18`, color: agent.color, border: `1px solid ${agent.color}30` }}>
                  {t('landing.agents.cta')}
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-28 px-6" style={{ background: 'rgba(255,255,255,0.015)' }} ref={pricingRef.ref as React.RefObject<HTMLElement>}>
        <div className={`mx-auto max-w-5xl landing-section-enter ${pricingRef.visible ? 'is-visible' : ''}`}>
          <div className="mb-12 text-center">
            <span className="mb-4 inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest" style={{ background: 'rgba(251,146,60,0.12)', color: '#fb923c', border: '1px solid rgba(251,146,60,0.25)' }}>{t('landing.pricing.badge')}</span>
            <h2 className="mb-4 text-4xl font-bold text-white" style={{ letterSpacing: '-0.02em' }}>{t('landing.pricing.title')}</h2>
            <p className="text-slate-400">{t('landing.pricing.subtitle')}</p>
          </div>

          {/* Toggle */}
          <div className="mb-12 flex items-center justify-center gap-3">
            <span className={`text-sm ${!annual ? 'text-white' : 'text-slate-500'}`}>{t('landing.pricing.monthly')}</span>
            <button
              onClick={() => setAnnual(v => !v)}
              className="relative h-6 w-11 rounded-full transition-colors duration-200"
              style={{ background: annual ? '#0ea5e9' : 'rgba(255,255,255,0.12)' }}
            >
              <span className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200" style={{ transform: annual ? 'translateX(20px)' : 'translateX(0)' }} />
            </button>
            <span className={`text-sm ${annual ? 'text-white' : 'text-slate-500'}`}>{t('landing.pricing.annual')}</span>
            <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399' }}>{t('landing.pricing.save')}</span>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {PLANS.map((plan, i) => (
              <div
                key={i}
                className="relative rounded-2xl p-6 flex flex-col"
                style={{
                  background: plan.popular ? 'linear-gradient(180deg, rgba(14,165,233,0.12), rgba(6,182,212,0.06))' : 'linear-gradient(180deg, rgba(18,28,48,0.95), rgba(10,16,30,0.95))',
                  border: plan.popular ? '1px solid rgba(14,165,233,0.35)' : '1px solid rgba(255,255,255,0.06)',
                  boxShadow: plan.popular ? '0 0 40px rgba(14,165,233,0.12)' : 'none',
                }}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: 'linear-gradient(90deg, #0ea5e9, #06b6d4)', color: '#fff' }}>{t('landing.pricing.popular')}</span>
                  </div>
                )}
                <div className="mb-1 text-sm font-semibold text-slate-400">{t(plan.nameKey)}</div>
                <div className="mb-1 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">{annual ? t(plan.priceAnnualKey) : t(plan.priceKey)}</span>
                  <span className="text-slate-500 text-sm">{t(plan.periodKey)}</span>
                </div>
                <p className="mb-6 text-sm text-slate-500">{t(plan.descKey)}</p>
                <ul className="mb-8 flex-1 space-y-3">
                  {plan.featKeys.map((key, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-slate-300">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                      {t(key)}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className={`w-full rounded-xl py-3 text-center text-sm font-semibold transition-all duration-200 ${plan.popular ? 'btn-premium' : 'border border-white/10 bg-white/5 text-white hover:bg-white/10'}`}>
                  {t(plan.ctaKey)}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-28 px-6" ref={testimonialsRef.ref as React.RefObject<HTMLElement>}>
        <div className={`mx-auto max-w-5xl landing-section-enter ${testimonialsRef.visible ? 'is-visible' : ''}`}>
          <div className="mb-16 text-center">
            <span className="mb-4 inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest" style={{ background: 'rgba(244,63,94,0.1)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.2)' }}>{t('landing.testimonials.badge')}</span>
            <h2 className="mb-4 text-4xl font-bold text-white" style={{ letterSpacing: '-0.02em' }}>{t('landing.testimonials.title')}</h2>
            <p className="text-slate-400">{t('landing.testimonials.subtitle')}</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {TESTIMONIALS.map((test, i) => (
              <div key={i} className="card-premium p-6" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <svg key={j} width="16" height="16" viewBox="0 0 24 24" fill="#fbbf24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  ))}
                </div>
                <p className="mb-6 text-slate-300 text-sm leading-relaxed">"{t(test.textKey)}"</p>
                <div>
                  <div className="font-semibold text-white text-sm">{t(test.nameKey)}</div>
                  <div className="text-xs text-slate-500">{t(test.roleKey)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-28 px-6" ref={ctaRef.ref as React.RefObject<HTMLElement>}>
        <div className={`mx-auto max-w-3xl text-center landing-section-enter ${ctaRef.visible ? 'is-visible' : ''}`}>
          <div className="relative rounded-3xl p-12 overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.12), rgba(139,92,246,0.08))', border: '1px solid rgba(14,165,233,0.2)', boxShadow: '0 0 80px rgba(14,165,233,0.1)' }}>
            <div className="landing-glow" style={{ width: 400, height: 400, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'radial-gradient(ellipse, rgba(14,165,233,0.15) 0%, transparent 70%)' }} />
            <div className="relative">
              <h2 className="mb-4 text-4xl font-bold text-white" style={{ letterSpacing: '-0.02em' }}>{t('landing.cta.title')}</h2>
              <p className="mb-8 text-slate-400">{t('landing.cta.subtitle')}</p>
              <Link href="/signup" className="btn-premium inline-block px-10 py-4 text-base font-semibold">{t('landing.cta.button')}</Link>
              <p className="mt-4 text-xs text-slate-600">{t('landing.cta.note')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-6 py-12" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center gap-8 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="mb-2 text-xl font-bold" style={{ letterSpacing: '-0.03em' }}>
                <span style={{ color: '#0ea5e9' }}>Pro</span><span className="text-white">AI</span>
              </div>
              <p className="text-sm text-slate-500">{t('landing.footer.tagline')}</p>
            </div>
            <div className="flex flex-wrap gap-8">
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-widest text-slate-600">{t('landing.footer.links.product')}</div>
                <a href="#features" className="block text-sm text-slate-400 hover:text-white transition-colors">{t('landing.nav.features')}</a>
                <a href="#agents"   className="block text-sm text-slate-400 hover:text-white transition-colors">{t('landing.nav.agents')}</a>
              </div>
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-widest text-slate-600">{t('landing.footer.links.pricing')}</div>
                <a href="#pricing" className="block text-sm text-slate-400 hover:text-white transition-colors">{t('landing.nav.pricing')}</a>
              </div>
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-widest text-slate-600">{t('landing.footer.links.contact')}</div>
                <span className="block text-sm text-slate-400">{t('landing.footer.links.blog')}</span>
                <span className="block text-sm text-slate-400">{t('landing.footer.links.contact')}</span>
              </div>
            </div>
            {/* Social icons */}
            <div className="flex gap-3">
              {[
                { href: '#', label: 'LinkedIn', path: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z' },
                { href: '#', label: 'Twitter', path: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z' },
              ].map(({ href, label, path }) => (
                <a key={label} href={href} aria-label={label} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:text-slate-300" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
          <div className="mt-10 pt-6 text-center text-xs text-slate-700" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            {t('landing.footer.copyright')}
          </div>
        </div>
      </footer>
    </div>
  )
}

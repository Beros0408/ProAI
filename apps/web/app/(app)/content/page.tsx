'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarDays, CheckCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { api } from '@/lib/api'
import { useTranslation } from '@/lib/i18n/context'
import type { TranslationKey } from '@/lib/i18n/translations'
import { BackButton } from '@/components/ui/BackButton'
import { useTheme } from '@/lib/theme/context'

type ContentTab =
  | 'linkedin'
  | 'newsletter'
  | 'email'
  | 'instagram'
  | 'facebook'
  | 'twitter'
  | 'blog'
  | 'video-script'

type SchedulePlatform = 'linkedin' | 'instagram' | 'facebook' | 'twitter'

const TAB_KEYS: Array<{ key: ContentTab; labelKey: TranslationKey }> = [
  { key: 'linkedin',      labelKey: 'content.linkedin' },
  { key: 'newsletter',    labelKey: 'content.newsletter' },
  { key: 'email',         labelKey: 'content.email' },
  { key: 'instagram',     labelKey: 'content.instagram' },
  { key: 'facebook',      labelKey: 'content.facebook' },
  { key: 'twitter',       labelKey: 'content.twitter' },
  { key: 'blog',          labelKey: 'content.blog' },
  { key: 'video-script',  labelKey: 'content.videoscript' },
]

const TONE_KEYS: Array<{ value: string; labelKey: TranslationKey }> = [
  { value: 'professional',  labelKey: 'content.tone.professional' },
  { value: 'casual',        labelKey: 'content.tone.casual' },
  { value: 'inspirational', labelKey: 'content.tone.inspirational' },
]

const LENGTH_KEYS: Array<{ value: string; labelKey: TranslationKey }> = [
  { value: 'court', labelKey: 'content.length.short' },
  { value: 'moyen', labelKey: 'content.length.medium' },
  { value: 'long',  labelKey: 'content.length.long' },
]

// Glassmorphism style constants — use CSS vars so light mode works
const GLASS_CARD: React.CSSProperties = {
  background: 'var(--glass-bg)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid var(--border-color)',
}

const GLASS_SECTION: React.CSSProperties = {
  background: 'var(--glass-bg)',
  border: '1px solid var(--border-color)',
}

const INPUT_BASE: React.CSSProperties = {
  background: 'var(--input-bg)',
  border: '1px solid var(--border-color)',
}

const INPUT_FOCUS: React.CSSProperties = {
  border: '1px solid rgba(14,165,233,0.4)',
  boxShadow: '0 0 0 3px rgba(14,165,233,0.08)',
}

const INPUT_BLUR: React.CSSProperties = {
  border: '1px solid var(--border-color)',
  boxShadow: 'none',
}

const TAB_ACTIVE: React.CSSProperties = {
  background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
  color: 'white',
  boxShadow: '0 4px 16px rgba(14,165,233,0.35)',
}

const TAB_INACTIVE: React.CSSProperties = {
  background: 'var(--bg-elevated)',
  color: 'var(--text-secondary)',
  border: '1px solid var(--border-color)',
}

function tabToSchedulePlatform(tab: ContentTab): SchedulePlatform {
  if (tab === 'instagram') return 'instagram'
  if (tab === 'facebook')  return 'facebook'
  if (tab === 'twitter')   return 'twitter'
  return 'linkedin'
}

// Préconfigurations depuis les templates
const TEMPLATE_PRESETS: Record<string, {
  tab: ContentTab
  topic?: string
  tone?: string
  sections?: string
  type?: string
  context?: string
}> = {
  launch_product:         { tab: 'linkedin',    topic: 'Lancement de produit SaaS', tone: 'inspirational' },
  article_summary:        { tab: 'newsletter',  topic: 'Résumé hebdomadaire', sections: '4' },
  linkedin_post_template: { tab: 'linkedin',    tone: 'professional' },
  follow_up_email:        { tab: 'email',       type: 'followup', context: 'Suite à notre échange précédent, je souhaitais faire un point.' },
  email_campaign:         { tab: 'email',       type: 'cold', context: 'Campagne email pour générer de nouveaux leads qualifiés.' },
  retention:              { tab: 'email',       type: 'followup', context: 'Campagne de rétention client pour les clients à risque de désabonnement.' },
}

export default function ContentPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [activeTab, setActiveTab] = useState<ContentTab>('linkedin')
  const [loading, setLoading]     = useState(false)
  const [result, setResult]       = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [form, setForm] = useState({
    topic:    '',
    tone:     'professional',
    language: 'fr',
    sections: '3',
    type:     'cold',
    context:  '',
    style:    'carousel',
    format:   'tweet unique',
    keywords: '',
    length:   'moyen',
    platform: 'YouTube',
    duration: '3 min',
  })

  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [scheduleLoading, setScheduleLoading]     = useState(false)
  const [scheduleSuccess, setScheduleSuccess]     = useState('')
  const [scheduleForm, setScheduleForm] = useState<{
    platform: SchedulePlatform
    date:     string
    time:     string
  }>({
    platform: 'linkedin',
    date:     new Date().toISOString().slice(0, 10),
    time:     '10:00',
  })

  // Résolution des labels traduits
  const tabs = TAB_KEYS.map(item => ({ key: item.key, label: t(item.labelKey) }))
  const toneOptions = TONE_KEYS.map(item => ({ value: item.value, label: t(item.labelKey) }))
  const lengths = LENGTH_KEYS.map(item => ({ value: item.value, label: t(item.labelKey) }))

  // Pré-remplissage depuis ?template=xxx ou ?platform=xxx
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const templateKey = params.get('template')
    const platformParam = params.get('platform')
    if (templateKey) {
      const preset = TEMPLATE_PRESETS[templateKey]
      if (preset) {
        setActiveTab(preset.tab)
        setForm(prev => ({
          ...prev,
          ...(preset.topic    !== undefined && { topic:    preset.topic    }),
          ...(preset.tone     !== undefined && { tone:     preset.tone     }),
          ...(preset.sections !== undefined && { sections: preset.sections }),
          ...(preset.type     !== undefined && { type:     preset.type     }),
          ...(preset.context  !== undefined && { context:  preset.context  }),
        }))
      }
    }
    if (platformParam === 'video') {
      setActiveTab('video-script')
    }
  }, [])

  const endpoint = useMemo(() => {
    const map: Record<ContentTab, string> = {
      linkedin:       '/api/v1/content/linkedin',
      newsletter:     '/api/v1/content/newsletter',
      email:          '/api/v1/content/email',
      instagram:      '/api/v1/content/instagram',
      facebook:       '/api/v1/content/facebook',
      twitter:        '/api/v1/content/twitter',
      blog:           '/api/v1/content/blog',
      'video-script': '/api/v1/content/video-script',
    }
    return map[activeTab]
  }, [activeTab])

  const requestBody = () => {
    switch (activeTab) {
      case 'linkedin':     return { topic: form.topic, tone: form.tone, language: form.language }
      case 'newsletter':   return { topic: form.topic, sections: Number(form.sections), language: form.language }
      case 'email':        return { type: form.type, context: form.context, language: form.language }
      case 'instagram':    return { subject: form.topic, style: form.style, language: form.language }
      case 'facebook':     return { subject: form.topic, type: form.type, language: form.language }
      case 'twitter':      return { subject: form.topic, format: form.format, language: form.language }
      case 'blog':         return { subject: form.topic, keywords: form.keywords, length: form.length, language: form.language }
      case 'video-script': return { subject: form.topic, platform: form.platform, duration: form.duration, language: form.language }
      default:             return {}
    }
  }

  const handleGenerate = async () => {
    if (!form.topic.trim() && activeTab !== 'email') {
      setErrorMessage(t('content.error.topic'))
      return
    }
    setLoading(true)
    setErrorMessage('')
    setResult('')
    try {
      const data = await api.post<{ content: string; report?: string }>(endpoint, requestBody())
      setResult(data.content || data.report || t('content.result.empty'))
    } catch {
      setErrorMessage(t('content.error.generate'))
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result)
  }

  const handleDownload = () => {
    const blob   = new Blob([result], { type: 'text/plain;charset=utf-8' })
    const anchor = document.createElement('a')
    anchor.href     = URL.createObjectURL(blob)
    anchor.download = 'proai-content.txt'
    anchor.click()
    URL.revokeObjectURL(anchor.href)
  }

  const openScheduleModal = () => {
    setScheduleForm(prev => ({
      ...prev,
      platform: tabToSchedulePlatform(activeTab),
      date:     new Date().toISOString().slice(0, 10),
    }))
    setScheduleSuccess('')
    setShowScheduleModal(true)
  }

  const handleSchedule = async () => {
    setScheduleLoading(true)
    setScheduleSuccess('')
    try {
      await api.post('/api/v1/schedule/posts', {
        platform:       scheduleForm.platform,
        content:        result,
        scheduled_date: scheduleForm.date,
        scheduled_time: scheduleForm.time,
      })
      setScheduleSuccess(t('content.schedule.success'))
      setTimeout(() => {
        setShowScheduleModal(false)
        setScheduleSuccess('')
      }, 2200)
    } catch {
      setScheduleSuccess(t('content.schedule.error'))
    } finally {
      setScheduleLoading(false)
    }
  }

  const inputProps = {
    className: 'w-full rounded-xl px-4 py-3 text-[#e2e8f0] placeholder-[#475569] text-sm outline-none transition-all duration-200',
    style:    INPUT_BASE as React.CSSProperties,
    onFocus:  (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { Object.assign(e.currentTarget.style, INPUT_FOCUS) },
    onBlur:   (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { Object.assign(e.currentTarget.style, INPUT_BLUR) },
  }

  const modalInputCls = 'w-full rounded-xl px-4 py-3 text-[#e2e8f0] text-sm outline-none transition-all'
  const activeTabLabel = tabs.find(tab => tab.key === activeTab)?.label ?? ''

  return (
    <div className="space-y-8 p-6 lg:p-10 animate-fade-up">
      <BackButton />

      {/* EN-TÊTE */}
      <div className="rounded-2xl p-6" style={GLASS_CARD}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#0ea5e9]">{t('content.title')}</p>
            <h1 className="mt-2 text-2xl font-bold text-white" style={{ letterSpacing: '-0.02em' }}>{t('content.subtitle')}</h1>
            <p className="mt-2 text-[#64748b] text-sm">{t('content.topic.placeholder')}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => router.push('/templates')}>{t('templates.title')}</Button>
            <Button variant="secondary" onClick={() => router.push('/schedule')}>{t('schedule.title')}</Button>
          </div>
        </div>
      </div>

      {/* PANNEAU PRINCIPAL */}
      <div className="space-y-6 rounded-2xl p-6" style={GLASS_CARD}>

        {/* ONGLETS */}
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className="rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
              style={activeTab === tab.key ? TAB_ACTIVE : TAB_INACTIVE}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* GRILLE DE CONTENU */}
        <div className="grid gap-6 lg:grid-cols-[1.4fr,0.8fr]">
          <section className="space-y-6 rounded-2xl p-6" style={GLASS_SECTION}>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-white">{activeTabLabel}</h2>
              <p className="text-sm text-slate-400">
                {t('content.topic.placeholder')}
              </p>
            </div>

            {/* CHAMPS COMMUNS */}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-300">
                {t('content.topic.label')}
                <input
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  placeholder="Ex : lancement produit SaaS"
                  {...inputProps}
                />
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                {t('content.language')}
                <select
                  value={form.language}
                  onChange={(e) => setForm({ ...form, language: e.target.value })}
                  {...inputProps}
                >
                  <option value="fr">{t('content.language.fr')}</option>
                  <option value="en">{t('content.language.en')}</option>
                </select>
              </label>
            </div>

            {/* LINKEDIN */}
            {activeTab === 'linkedin' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-300">
                  {t('content.tone.label')}
                  <select value={form.tone} onChange={(e) => setForm({ ...form, tone: e.target.value })} {...inputProps}>
                    {toneOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </label>
              </div>
            )}

            {/* NEWSLETTER */}
            {activeTab === 'newsletter' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-300">
                  {t('content.sections.label')}
                  <input
                    type="number" min={2} max={6}
                    value={form.sections}
                    onChange={(e) => setForm({ ...form, sections: String(Math.max(2, Math.min(6, Number(e.target.value)))) })}
                    {...inputProps}
                  />
                </label>
              </div>
            )}

            {/* EMAIL */}
            {activeTab === 'email' && (
              <div className="space-y-4">
                <label className="space-y-2 text-sm text-slate-300">
                  {t('content.type.label')}
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} {...inputProps}>
                    <option value="cold">{t('content.type.cold')}</option>
                    <option value="followup">{t('content.type.followup')}</option>
                    <option value="relance">{t('content.type.followup')}</option>
                    <option value="remerciement">Remerciement</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  {t('content.context.label')}
                  <Textarea value={form.context} onChange={(e) => setForm({ ...form, context: e.target.value })} placeholder={t('content.context.placeholder')} className="bg-slate-900" />
                </label>
              </div>
            )}

            {/* INSTAGRAM */}
            {activeTab === 'instagram' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-300">
                  {t('content.style.label')}
                  <select value={form.style} onChange={(e) => setForm({ ...form, style: e.target.value })} {...inputProps}>
                    <option value="carousel">{t('content.style.carousel')}</option>
                    <option value="reel">{t('content.style.reel')}</option>
                    <option value="story">{t('content.style.story')}</option>
                  </select>
                </label>
              </div>
            )}

            {/* FACEBOOK */}
            {activeTab === 'facebook' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-300">
                  {t('content.type.label')}
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} {...inputProps}>
                    <option value="post">Post</option>
                    <option value="event">Événement</option>
                    <option value="publicite">Publicité</option>
                  </select>
                </label>
              </div>
            )}

            {/* TWITTER */}
            {activeTab === 'twitter' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-300">
                  {t('content.format.label')}
                  <select value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })} {...inputProps}>
                    <option value="tweet unique">{t('content.format.tweet')}</option>
                    <option value="thread">{t('content.format.thread')}</option>
                  </select>
                </label>
              </div>
            )}

            {/* BLOG */}
            {activeTab === 'blog' && (
              <div className="space-y-4">
                <label className="space-y-2 text-sm text-slate-300">
                  {t('content.keywords.label')}
                  <input value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} placeholder={t('content.keywords.placeholder')} {...inputProps} />
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  {t('content.length.label')}
                  <select value={form.length} onChange={(e) => setForm({ ...form, length: e.target.value })} {...inputProps}>
                    {lengths.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </label>
              </div>
            )}

            {/* SCRIPT VIDÉO */}
            {activeTab === 'video-script' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-300">
                  {t('content.platform.label')}
                  <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} {...inputProps}>
                    <option value="YouTube">YouTube</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Reels">Reels</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  {t('content.duration.label')}
                  <input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="3 min" {...inputProps} />
                </label>
              </div>
            )}

            {/* DESCRIPTION DÉTAILLÉE */}
            <div>
              <label className="text-sm text-slate-300">{t('content.context.label')}</label>
              <Textarea
                value={form.context}
                onChange={(e) => setForm({ ...form, context: e.target.value })}
                placeholder={t('content.context.placeholder')}
                className="mt-2 bg-slate-900"
              />
            </div>

            {errorMessage && <p className="text-sm text-rose-400">{errorMessage}</p>}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button onClick={handleGenerate} disabled={loading}>
                {loading ? t('content.loading') : t('content.generate')}
              </Button>
            </div>
          </section>

          {/* PANNEAU LATÉRAL — APERÇU */}
          <aside className="space-y-4 rounded-2xl p-6" style={GLASS_SECTION}>
            <div>
              <h3 className="text-lg font-semibold text-white">Actions</h3>
            </div>
            <div className="grid gap-3">
              <button
                disabled={!result}
                onClick={handleCopy}
                className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'rgba(14,165,233,0.08)', color: '#38bdf8', border: '1px solid rgba(14,165,233,0.15)' }}
                onMouseEnter={(e) => { if (result) { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 20px rgba(14,165,233,0.2)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(14,165,233,0.35)' } }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(14,165,233,0.15)' }}
              >
                {t('content.copy')}
              </button>
              <button
                disabled={!result}
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'rgba(14,165,233,0.08)', color: '#38bdf8', border: '1px solid rgba(14,165,233,0.15)' }}
                onMouseEnter={(e) => { if (result) { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 20px rgba(14,165,233,0.2)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(14,165,233,0.35)' } }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(14,165,233,0.15)' }}
              >
                {t('content.download')}
              </button>
              {result && (
                <button
                  type="button"
                  onClick={() => router.push(`/schedule?content=${encodeURIComponent(result)}&platform=${tabToSchedulePlatform(activeTab)}`)}
                  className="flex items-center justify-center gap-2 w-full rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg, #fb923c, #f97316)', boxShadow: '0 4px 16px rgba(251,146,60,0.3)' }}
                >
                  <CalendarDays size={15} />
                  {t('content.schedule')}
                </button>
              )}
            </div>
            {result && (
              <div className="mt-2 p-3 rounded-xl text-xs text-[#94a3b8]" style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.12)' }}>
                {t('content.generate')} — <span className="font-semibold text-[#38bdf8]">{activeTabLabel}</span>
              </div>
            )}
          </aside>
        </div>

        {/* RÉSULTAT */}
        <div className="rounded-2xl p-6 glass-strong" style={{ ...GLASS_SECTION, transition: 'opacity 0.4s ease' }}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">{t('content.regenerate')}</h2>
            </div>
            <Button onClick={handleGenerate} disabled={loading}>
              {loading ? t('content.loading') : t('content.regenerate')}
            </Button>
          </div>
          <div className="mt-6 rounded-xl p-6 min-h-[260px]" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
            {result
              ? <pre className="whitespace-pre-wrap break-words text-sm animate-fade-in">{result}</pre>
              : <p className="text-slate-500">{t('content.result.empty')}</p>
            }
          </div>
        </div>

      </div>

      {/* MODAL — PLANIFICATION */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>
          <div className="w-full max-w-md rounded-2xl p-6 animate-scale-in"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}>

            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-white">{t('content.schedule.modal.title')}</h3>
                <p className="text-xs text-[#94a3b8] mt-0.5">{t('schedule.subtitle2')}</p>
              </div>
              <button type="button" onClick={() => setShowScheduleModal(false)} style={{ color: 'var(--text-secondary)' }} className="hover:text-[var(--text-primary)] transition-colors">
                <X size={20} />
              </button>
            </div>

            {scheduleSuccess ? (
              <div className="flex flex-col items-center gap-3 py-6">
                <CheckCircle size={40} style={{ color: '#34d399' }} />
                <p className="text-sm text-center font-medium" style={{ color: scheduleSuccess === t('content.schedule.error') ? '#ef4444' : '#34d399' }}>
                  {scheduleSuccess}
                </p>
                {scheduleSuccess !== t('content.schedule.error') && (
                  <button
                    type="button"
                    onClick={() => { setShowScheduleModal(false); window.location.href = '/schedule' }}
                    className="mt-2 text-xs text-[#38bdf8] underline hover:no-underline"
                  >
                    {t('schedule.title')} →
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <label className="block space-y-1.5 text-sm text-[#cbd5e1]">
                  {t('schedule.platform')}
                  <select
                    value={scheduleForm.platform}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, platform: e.target.value as SchedulePlatform })}
                    className={modalInputCls}
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
                  >
                    <option value="linkedin">LinkedIn</option>
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="twitter">Twitter / X</option>
                  </select>
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block space-y-1.5 text-sm text-[#cbd5e1]">
                    {t('schedule.date')}
                    <input
                      type="date"
                      value={scheduleForm.date}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                      className={modalInputCls}
                      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
                    />
                  </label>
                  <label className="block space-y-1.5 text-sm text-[#cbd5e1]">
                    {t('schedule.time')}
                    <input
                      type="time"
                      value={scheduleForm.time}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                      className={modalInputCls}
                      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
                    />
                  </label>
                </div>

                <div className="rounded-xl p-3 text-xs line-clamp-3"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  {result.slice(0, 180)}{result.length > 180 ? '…' : ''}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowScheduleModal(false)}
                    className="flex-1 py-2.5 rounded-full text-sm font-medium transition-colors"
                    style={{ border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="button"
                    onClick={handleSchedule}
                    disabled={scheduleLoading}
                    className="flex-1 py-2.5 rounded-full text-sm font-bold text-white transition-all hover:brightness-110 disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg, #fb923c, #f97316)' }}
                  >
                    {scheduleLoading ? t('common.loading') : t('content.schedule')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

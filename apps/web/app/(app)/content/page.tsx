'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'

type ContentTab =
  | 'linkedin'
  | 'newsletter'
  | 'email'
  | 'instagram'
  | 'facebook'
  | 'twitter'
  | 'blog'
  | 'video-script'

const tabs: Array<{ key: ContentTab; label: string }> = [
  { key: 'linkedin',      label: 'LinkedIn' },
  { key: 'newsletter',    label: 'Newsletter' },
  { key: 'email',         label: 'Email' },
  { key: 'instagram',     label: 'Instagram' },
  { key: 'facebook',      label: 'Facebook' },
  { key: 'twitter',       label: 'Twitter / X' },
  { key: 'blog',          label: 'Blog SEO' },
  { key: 'video-script',  label: 'Script vidéo' },
]

const toneOptions = [
  { value: 'professional',  label: 'Professional' },
  { value: 'casual',        label: 'Casual' },
  { value: 'inspirational', label: 'Inspirational' },
]

const lengths = [
  { value: 'court', label: 'Court' },
  { value: 'moyen', label: 'Moyen' },
  { value: 'long',  label: 'Long' },
]

// Glassmorphism style constants (ASCII-safe)
const GLASS_CARD: React.CSSProperties = {
  background: 'rgba(17,24,39,0.7)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.07)',
}

const GLASS_SECTION: React.CSSProperties = {
  background: 'rgba(15,23,42,0.7)',
  border: '1px solid rgba(255,255,255,0.07)',
}

const INPUT_BASE: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
}

const INPUT_FOCUS: React.CSSProperties = {
  border: '1px solid rgba(14,165,233,0.4)',
  boxShadow: '0 0 0 3px rgba(14,165,233,0.08)',
}

const INPUT_BLUR: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: 'none',
}

const TAB_ACTIVE: React.CSSProperties = {
  background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
  color: 'white',
  boxShadow: '0 4px 16px rgba(14,165,233,0.35)',
}

const TAB_INACTIVE: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  color: '#94a3b8',
  border: '1px solid rgba(255,255,255,0.07)',
}

export default function ContentPage() {
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
      setErrorMessage('Le sujet est requis pour générer le contenu.')
      return
    }
    setLoading(true)
    setErrorMessage('')
    setResult('')
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody()),
      })
      if (!response.ok) throw new Error('Erreur serveur')
      const data = await response.json()
      setResult(data.content || data.report || 'Aucune réponse obtenue.')
    } catch (err) {
      setErrorMessage('Impossible de générer le contenu. Réessayez plus tard.')
      void err
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

  const inputProps = {
    className: 'w-full rounded-xl px-4 py-3 text-[#e2e8f0] placeholder-[#475569] text-sm outline-none transition-all duration-200',
    style:    INPUT_BASE as React.CSSProperties,
    onFocus:  (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { Object.assign(e.currentTarget.style, INPUT_FOCUS) },
    onBlur:   (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { Object.assign(e.currentTarget.style, INPUT_BLUR) },
  }

  return (
    <div className="space-y-8 p-6 lg:p-10">

      {/* HEADER */}
      <div className="rounded-2xl p-6" style={GLASS_CARD}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#0ea5e9]">Studio de contenu IA</p>
            <h1 className="mt-2 text-2xl font-bold text-white">Générez du contenu adapté à chaque canal</h1>
            <p className="mt-2 text-[#64748b] text-sm">Sélectionnez une plateforme, définissez votre message et laissez l&apos;IA créer un contenu optimisé.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => window.history.back()}>Retour</Button>
          </div>
        </div>
      </div>

      {/* MAIN PANEL */}
      <div className="space-y-6 rounded-2xl p-6" style={GLASS_CARD}>

        {/* TAB BAR */}
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

        {/* CONTENT GRID */}
        <div className="grid gap-6 lg:grid-cols-[1.4fr,0.8fr]">
          <section className="space-y-6 rounded-2xl p-6" style={GLASS_SECTION}>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-white">
                {tabs.find((tab) => tab.key === activeTab)?.label}
              </h2>
              <p className="text-sm text-slate-400">
                Sélectionnez vos paramètres et générez un contenu sur mesure pour {tabs.find((tab) => tab.key === activeTab)?.label}.
              </p>
            </div>

            {/* COMMON FIELDS */}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-300">
                Sujet / Thème
                <input
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  placeholder="Ex: lancement produit SaaS"
                  {...inputProps}
                />
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                Langue
                <select
                  value={form.language}
                  onChange={(e) => setForm({ ...form, language: e.target.value })}
                  {...inputProps}
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </label>
            </div>

            {/* LINKEDIN */}
            {activeTab === 'linkedin' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-300">
                  Ton
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
                  Sections
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
                  Type d&apos;email
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} {...inputProps}>
                    <option value="cold">Cold email</option>
                    <option value="followup">Suivi</option>
                    <option value="relance">Relance</option>
                    <option value="remerciement">Remerciement</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  Contexte
                  <Textarea value={form.context} onChange={(e) => setForm({ ...form, context: e.target.value })} placeholder="Décrivez le contexte de l'email" className="bg-slate-900" />
                </label>
              </div>
            )}

            {/* INSTAGRAM */}
            {activeTab === 'instagram' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-300">
                  Format
                  <select value={form.style} onChange={(e) => setForm({ ...form, style: e.target.value })} {...inputProps}>
                    <option value="carousel">Carousel</option>
                    <option value="reel">Reel</option>
                    <option value="story">Story</option>
                  </select>
                </label>
              </div>
            )}

            {/* FACEBOOK */}
            {activeTab === 'facebook' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-300">
                  Type
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} {...inputProps}>
                    <option value="post">Post</option>
                    <option value="event">Event</option>
                    <option value="publicite">Publicité</option>
                  </select>
                </label>
              </div>
            )}

            {/* TWITTER */}
            {activeTab === 'twitter' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-300">
                  Format
                  <select value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })} {...inputProps}>
                    <option value="tweet unique">Tweet unique</option>
                    <option value="thread">Thread</option>
                  </select>
                </label>
              </div>
            )}

            {/* BLOG */}
            {activeTab === 'blog' && (
              <div className="space-y-4">
                <label className="space-y-2 text-sm text-slate-300">
                  Mots-clés
                  <input value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} placeholder="ex: SEO, génération de leads" {...inputProps} />
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  Longueur
                  <select value={form.length} onChange={(e) => setForm({ ...form, length: e.target.value })} {...inputProps}>
                    {lengths.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </label>
              </div>
            )}

            {/* VIDEO SCRIPT */}
            {activeTab === 'video-script' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-300">
                  Plateforme
                  <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} {...inputProps}>
                    <option value="YouTube">YouTube</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Reels">Reels</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  Durée
                  <input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="3 min" {...inputProps} />
                </label>
              </div>
            )}

            {/* DETAILED DESCRIPTION */}
            <div>
              <label className="text-sm text-slate-300">Description détaillée</label>
              <Textarea
                value={form.context}
                onChange={(e) => setForm({ ...form, context: e.target.value })}
                placeholder="Ajoutez des détails pour aider l'IA"
                className="mt-2 bg-slate-900"
              />
            </div>

            {errorMessage && <p className="text-sm text-rose-400">{errorMessage}</p>}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button onClick={handleGenerate} disabled={loading}>
                {loading ? 'Génération...' : 'Générer le contenu'}
              </Button>
              <p className="text-sm text-slate-500">Un contenu prêt à publier, optimisé pour chaque canal.</p>
            </div>
          </section>

          {/* PREVIEW SIDEBAR */}
          <aside className="space-y-4 rounded-2xl p-6" style={GLASS_SECTION}>
            <div>
              <h3 className="text-lg font-semibold text-white">Aperçu</h3>
              <p className="mt-2 text-sm text-slate-400">Copiez ou téléchargez votre version finalisée en un clic.</p>
            </div>
            <div className="grid gap-3">
              <Button disabled={!result} onClick={handleCopy} variant="secondary">Copier le contenu</Button>
              <Button disabled={!result} onClick={handleDownload} variant="secondary">Télécharger</Button>
            </div>
          </aside>
        </div>

        {/* RESULT */}
        <div className="rounded-2xl p-6" style={GLASS_SECTION}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Résultat généré</h2>
              <p className="text-sm text-slate-500">Le contenu final s&apos;affiche ici après validation.</p>
            </div>
            <Button onClick={handleGenerate} disabled={loading}>
              {loading ? 'Génération...' : 'Régénérer'}
            </Button>
          </div>
          <div className="mt-6 rounded-xl p-6 min-h-[260px] text-slate-300" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
            {result
              ? <pre className="whitespace-pre-wrap break-words text-sm">{result}</pre>
              : <p className="text-slate-500">Aucun contenu généré pour le moment.</p>
            }
          </div>
        </div>

      </div>
    </div>
  )
}

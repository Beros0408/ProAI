'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { useTranslation } from '@/lib/i18n/context'

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
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'newsletter', label: 'Newsletter' },
  { key: 'email', label: 'Email' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'twitter', label: 'Twitter / X' },
  { key: 'blog', label: 'Blog SEO' },
  { key: 'video-script', label: 'Script vidéo' },
]

const toneOptions = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'inspirational', label: 'Inspirational' },
]

const lengths = [
  { value: 'court', label: 'Court' },
  { value: 'moyen', label: 'Moyen' },
  { value: 'long', label: 'Long' },
]

export default function ContentPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<ContentTab>('linkedin')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [form, setForm] = useState({
    topic: '',
    tone: 'professional',
    language: 'fr',
    sections: '3',
    type: 'cold',
    context: '',
    style: 'carousel',
    format: 'tweet unique',
    keywords: '',
    length: 'moyen',
    platform: 'YouTube',
    duration: '3 min',
  })

  const endpoint = useMemo(
    () => ({
      linkedin: '/api/v1/content/linkedin',
      newsletter: '/api/v1/content/newsletter',
      email: '/api/v1/content/email',
      instagram: '/api/v1/content/instagram',
      facebook: '/api/v1/content/facebook',
      twitter: '/api/v1/content/twitter',
      blog: '/api/v1/content/blog',
      'video-script': '/api/v1/content/video-script',
    } as const)[activeTab],
    [activeTab],
  )

  const requestBody = () => {
    switch (activeTab) {
      case 'linkedin':
        return { topic: form.topic, tone: form.tone, language: form.language }
      case 'newsletter':
        return { topic: form.topic, sections: Number(form.sections), language: form.language }
      case 'email':
        return { type: form.type, context: form.context, language: form.language }
      case 'instagram':
        return { subject: form.topic, style: form.style, language: form.language }
      case 'facebook':
        return { subject: form.topic, type: form.type, language: form.language }
      case 'twitter':
        return { subject: form.topic, format: form.format, language: form.language }
      case 'blog':
        return { subject: form.topic, keywords: form.keywords, length: form.length, language: form.language }
      case 'video-script':
        return { subject: form.topic, platform: form.platform, duration: form.duration, language: form.language }
      default:
        return {}
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
      if (!response.ok) {
        throw new Error('Erreur serveur')
      }
      const data = await response.json()
      setResult(data.content || data.report || 'Aucune réponse obtenue.')
    } catch {
      setErrorMessage('Impossible de générer le contenu. Réessayez plus tard.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result)
  }

  const handleDownload = () => {
    const blob = new Blob([result], { type: 'text/plain;charset=utf-8' })
    const anchor = document.createElement('a')
    anchor.href = URL.createObjectURL(blob)
    anchor.download = 'proai-content.txt'
    anchor.click()
    URL.revokeObjectURL(anchor.href)
  }

  return (
    <div className="space-y-8 p-6 lg:p-10">
      <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-8 shadow-xl shadow-slate-950/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-[#0ea5e9]">Studio de contenu IA</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Générez du contenu adapté à chaque canal</h1>
            <p className="mt-2 text-slate-400">Sélectionnez une plateforme, définissez votre message et laissez l’IA créer un contenu optimisé.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => window.history.back()}>
              Retour
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-6 rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-xl shadow-slate-950/20">
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-3">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full px-4 py-2 text-sm transition ${activeTab === tab.key ? 'bg-primary text-slate-950' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr,0.8fr]">
          <section className="space-y-6 rounded-3xl border border-slate-800 bg-[#0f172a]/80 p-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-white">{tabs.find((tab) => tab.key === activeTab)?.label}</h2>
              <p className="text-sm text-slate-400">Sélectionnez vos paramètres et générez un contenu sur mesure pour {tabs.find((tab) => tab.key === activeTab)?.label}.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-300">
                Sujet / Thème
                <input
                  value={form.topic}
                  onChange={(event) => setForm({ ...form, topic: event.target.value })}
                  placeholder="Ex: lancement produit SaaS"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-primary"
                />
              </label>

              <label className="space-y-2 text-sm text-slate-300">
                Langue
                <select
                  value={form.language}
                  onChange={(event) => setForm({ ...form, language: event.target.value })}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-primary"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </label>
            </div>

            {activeTab === 'linkedin' ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-300">
                  Ton
                  <select
                    value={form.tone}
                    onChange={(event) => setForm({ ...form, tone: event.target.value })}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-primary"
                  >
                    {toneOptions.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                </label>
              </div>
            ) : null}

            {activeTab === 'newsletter' ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-300">
                  Sections
                  <input
                    type="number"
                    min={2}
                    max={6}
                    value={form.sections}
                    onChange={(event) => setForm({ ...form, sections: Math.max(2, Math.min(6, Number(event.target.value))).toString() })}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-primary"
                  />
                </label>
              </div>
            ) : null}

            {activeTab === 'email' ? (
              <div className="space-y-4">
                <label className="space-y-2 text-sm text-slate-300">
                  Type d’email
                  <select
                    value={form.type}
                    onChange={(event) => setForm({ ...form, type: event.target.value })}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-primary"
                  >
                    <option value="cold">Cold email</option>
                    <option value="followup">Suivi</option>
                    <option value="relance">Relance</option>
                    <option value="remerciement">Remerciement</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  Contexte
                  <Textarea
                    value={form.context}
                    onChange={(event) => setForm({ ...form, context: event.target.value })}
                    placeholder="Décrivez le contexte de l’email"
                    className="bg-slate-900"
                  />
                </label>
              </div>
            ) : null}

            {activeTab === 'instagram' ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-300">
                  Format
                  <select
                    value={form.style}
                    onChange={(event) => setForm({ ...form, style: event.target.value })}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-primary"
                  >
                    <option value="carousel">Carousel</option>
                    <option value="reel">Reel</option>
                    <option value="story">Story</option>
                  </select>
                </label>
              </div>
            ) : null}

            {activeTab === 'facebook' ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-300">
                  Type
                  <select
                    value={form.type}
                    onChange={(event) => setForm({ ...form, type: event.target.value })}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-primary"
                  >
                    <option value="post">Post</option>
                    <option value="event">Event</option>
                    <option value="publicité">Publicité</option>
                  </select>
                </label>
              </div>
            ) : null}

            {activeTab === 'twitter' ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-300">
                  Format
                  <select
                    value={form.format}
                    onChange={(event) => setForm({ ...form, format: event.target.value })}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-primary"
                  >
                    <option value="tweet unique">Tweet unique</option>
                    <option value="thread">Thread</option>
                  </select>
                </label>
              </div>
            ) : null}

            {activeTab === 'blog' ? (
              <div className="space-y-4">
                <label className="space-y-2 text-sm text-slate-300">
                  Mots-clés
                  <input
                    value={form.keywords}
                    onChange={(event) => setForm({ ...form, keywords: event.target.value })}
                    placeholder="ex: SEO, génération de leads"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-primary"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  Longueur
                  <select
                    value={form.length}
                    onChange={(event) => setForm({ ...form, length: event.target.value })}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-primary"
                  >
                    {lengths.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                </label>
              </div>
            ) : null}

            {activeTab === 'video-script' ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-300">
                  Plateforme
                  <select
                    value={form.platform}
                    onChange={(event) => setForm({ ...form, platform: event.target.value })}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-primary"
                  >
                    <option value="YouTube">YouTube</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Reels">Reels</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  Durée
                  <input
                    value={form.duration}
                    onChange={(event) => setForm({ ...form, duration: event.target.value })}
                    placeholder="3 min"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-primary"
                  />
                </label>
              </div>
            ) : null}

            <div>
              <label className="text-sm text-slate-300">Description détaillée</label>
              <Textarea
                value={form.context}
                onChange={(event) => setForm({ ...form, context: event.target.value })}
                placeholder="Ajoutez des détails pour aider l’IA"
                className="mt-2 bg-slate-900"
              />
            </div>

            {errorMessage ? <p className="text-sm text-rose-400">{errorMessage}</p> : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button onClick={handleGenerate} disabled={loading}>
                {loading ? 'Génération...' : 'Générer le contenu'}
              </Button>
              <p className="text-sm text-slate-500">Réservez un message IA prêt à publier pour chaque canal.</p>
            </div>
          </section>

          <aside className="space-y-4 rounded-3xl border border-slate-800 bg-[#0f172a]/80 p-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Aperçu</h3>
              <p className="mt-2 text-sm text-slate-400">Copiez ou téléchargez votre version finalisée en un clic.</p>
            </div>

            <div className="grid gap-3">
              <Button disabled={!result} onClick={handleCopy} variant="secondary">
                Copier le contenu
              </Button>
              <Button disabled={!result} onClick={handleDownload} variant="secondary">
                Télécharger
              </Button>
            </div>
          </aside>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Résultat généré</h2>
              <p className="text-sm text-slate-500">Le contenu final s’affiche ici après validation.</p>
            </div>
            <Button onClick={handleGenerate} disabled={loading}>
              {loading ? 'Génération...' : 'Régénérer'}
            </Button>
          </div>
          <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-950 p-6 min-h-[260px] text-slate-300">
            {result ? <pre className="whitespace-pre-wrap break-words text-sm">{result}</pre> : <p className="text-slate-500">Aucun contenu généré pour le moment.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

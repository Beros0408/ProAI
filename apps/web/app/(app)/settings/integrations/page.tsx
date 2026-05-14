'use client'

import Image from 'next/image'
import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from '@/lib/i18n/context'
import { BackButton } from '@/components/ui/BackButton'
import { api } from '@/lib/api'
import {
  GmailIcon, LinkedInIcon, SlackIcon, InstagramIcon, FacebookIcon,
  NotionIcon, GoogleCalendarIcon, GoogleSheetsIcon, MakeIcon,
} from '@/components/icons/BrandIcons'
import { WebhookCard, type WebhookToken } from '@/components/webhooks/WebhookCard'
import { WebhookCreateModal } from '@/components/webhooks/WebhookCreateModal'
import { WebhookEventsHistory } from '@/components/webhooks/WebhookEventsHistory'
import { WebhookRulesEditor } from '@/components/webhooks/WebhookRulesEditor'
import { IntegrationComingSoonCard } from '@/components/webhooks/IntegrationComingSoonCard'
import { WebhookIntegrationTutorial } from '@/components/webhooks/WebhookIntegrationTutorial'

// ── Types ─────────────────────────────────────────────────────────────────────

type WebhooksResponse = { webhooks: WebhookToken[] }

// ── Coming-soon native integrations ──────────────────────────────────────────

const COMING_SOON = [
  { name: 'Slack',          icon: <SlackIcon size={24} />,           glowColor: '#E01E5A' },
  { name: 'Notion',         icon: <NotionIcon size={24} />,          glowColor: '#94a3b8' },
  { name: 'n8n',            icon: <Image src="/integrations/n8n-icon.svg" alt="n8n" width={36} height={16} unoptimized />, glowColor: '#EA4B71' },
  { name: 'HubSpot',        icon: <span className="text-xl font-bold" style={{ color: '#FF7A59' }}>H</span>, glowColor: '#FF7A59' },
  { name: 'Salesforce',     icon: <span className="text-xl font-bold" style={{ color: '#00A1E0' }}>S</span>, glowColor: '#00A1E0' },
  { name: 'Pipedrive',      icon: <span className="text-xl font-bold" style={{ color: '#26292C' }}>P</span>, glowColor: '#26292C' },
  { name: 'Gmail',          icon: <GmailIcon size={24} />,           glowColor: '#EA4335' },
  { name: 'Google Sheets',  icon: <GoogleSheetsIcon size={24} />,    glowColor: '#34A853' },
  { name: 'Google Calendar',icon: <GoogleCalendarIcon size={24} />,  glowColor: '#4285F4' },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function IntegrationsPage() {
  const { t } = useTranslation()

  // Webhook state
  const [webhooks, setWebhooks] = useState<WebhookToken[]>([])
  const [loadingWebhooks, setLoadingWebhooks] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [historyId, setHistoryId] = useState<string | null>(null)
  const [configureId, setConfigureId] = useState<string | null>(null)
  const [tutorialUrl, setTutorialUrl] = useState<string | null>(null)

  const loadWebhooks = useCallback(async () => {
    setLoadingWebhooks(true)
    try {
      const resp = await api.get<WebhooksResponse>('/api/v1/webhooks')
      setWebhooks(resp.webhooks ?? [])
    } catch {
      // user not logged in or API unavailable
    } finally {
      setLoadingWebhooks(false)
    }
  }, [])

  useEffect(() => { loadWebhooks() }, [loadWebhooks])

  const handleCreate = async (name: string, description: string) => {
    const resp = await api.post<{ webhook: WebhookToken }>('/api/v1/webhooks', { name, description })
    setWebhooks(w => [resp.webhook, ...w])
  }

  const handleUpdate = async (id: string, patch: Partial<WebhookToken>) => {
    const resp = await api.patch<{ webhook: WebhookToken }>(`/api/v1/webhooks/${id}`, patch)
    setWebhooks(w => w.map(wh => wh.id === id ? resp.webhook : wh))
  }

  const handleDelete = async (id: string) => {
    await api.delete(`/api/v1/webhooks/${id}`)
    setWebhooks(w => w.filter(wh => wh.id !== id))
  }

  const historyWebhook = webhooks.find(w => w.id === historyId)
  const configureWebhook = webhooks.find(w => w.id === configureId)

  return (
    <div className="space-y-10 animate-fade-in p-6 lg:p-10">
      <BackButton />

      {/* Page header */}
      <div className="animate-fade-up">
        <h1 className="text-2xl font-bold text-white" style={{ letterSpacing: '-0.02em' }}>
          {t('integrations')}
        </h1>
        <p className="mt-1 text-sm text-slate-400">{t('integrations_description')}</p>
      </div>

      {/* ── Section: Webhooks personnalisés ─────────────────────────────── */}
      <section className="animate-fade-up" style={{ animationDelay: '60ms' }}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              🔌 {t('webhook.section_title')}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">{t('webhook.section_subtitle')}</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: '#6366F1', color: '#fff' }}
          >
            + {t('webhook.new')}
          </button>
        </div>

        {loadingWebhooks ? (
          <div className="flex items-center justify-center py-10">
            <span className="text-sm text-slate-500">{t('common.loading')}</span>
          </div>
        ) : webhooks.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center rounded-2xl px-8 py-12 text-center"
            style={{ background: 'var(--bg-surface)', border: '1px dashed var(--border-color)' }}
          >
            <span className="mb-3 text-4xl">📡</span>
            <p className="mb-1 text-sm font-semibold text-white">{t('webhook.empty_title')}</p>
            <p className="mb-5 text-xs text-slate-500 max-w-xs">{t('webhook.empty_desc')}</p>
            <button
              onClick={() => setShowCreate(true)}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: '#6366F1', color: '#fff' }}
            >
              + {t('webhook.new')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {webhooks.map(wh => (
              <WebhookCard
                key={wh.id}
                webhook={wh}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onViewHistory={setHistoryId}
                onConfigure={setConfigureId}
              />
            ))}
          </div>
        )}

        {/* Tutorial CTA */}
        {webhooks.length > 0 && (
          <button
            onClick={() => setTutorialUrl(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'}/api/v1/webhook/${webhooks[0].token}`)}
            className="mt-3 text-xs font-medium transition-colors hover:text-indigo-300"
            style={{ color: '#6366F1' }}
          >
            📖 {t('webhook.see_tutorials')} →
          </button>
        )}
      </section>

      {/* ── Section: Intégrations natives (bientôt) ─────────────────────── */}
      <section className="animate-fade-up" style={{ animationDelay: '120ms' }}>
        <div className="mb-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            🔗 {t('webhook.native_title')}
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">{t('webhook.native_subtitle')}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {COMING_SOON.map(item => (
            <IntegrationComingSoonCard
              key={item.name}
              name={item.name}
              icon={item.icon}
              glowColor={item.glowColor}
            />
          ))}
        </div>
      </section>

      {/* ── Agent CTA ───────────────────────────────────────────────────── */}
      <section className="animate-fade-up" style={{ animationDelay: '180ms' }}>
        <div
          className="flex flex-col items-start gap-3 rounded-2xl p-6 sm:flex-row sm:items-center sm:justify-between"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
        >
          <div>
            <p className="text-sm font-semibold text-white">💡 {t('webhook.agent_cta_title')}</p>
            <p className="mt-0.5 text-xs text-slate-500">{t('webhook.agent_cta_desc')}</p>
          </div>
          <a
            href="/chat?agent=automation"
            className="shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: '#6366F118', color: '#6366F1', border: '1px solid #6366F130' }}
          >
            {t('webhook.agent_cta_button')} →
          </a>
        </div>
      </section>

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      {showCreate && (
        <WebhookCreateModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />
      )}
      {historyId && historyWebhook && (
        <WebhookEventsHistory
          webhookId={historyId}
          webhookName={historyWebhook.name}
          onClose={() => setHistoryId(null)}
        />
      )}
      {configureId && configureWebhook && (
        <WebhookRulesEditor
          webhookId={configureId}
          webhookName={configureWebhook.name}
          onClose={() => setConfigureId(null)}
        />
      )}
      {tutorialUrl && (
        <WebhookIntegrationTutorial
          webhookUrl={tutorialUrl}
          onClose={() => setTutorialUrl(null)}
        />
      )}
    </div>
  )
}

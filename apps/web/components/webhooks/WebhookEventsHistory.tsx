'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from '@/lib/i18n/context'
import { api } from '@/lib/api'

type WebhookEvent = {
  id: string
  status: 'received' | 'processing' | 'completed' | 'failed'
  agent_triggered?: string
  agent_response?: string
  error_message?: string
  source_ip?: string
  received_at: string
  completed_at?: string
  payload: Record<string, unknown>
}

type EventsResponse = {
  events: WebhookEvent[]
  total: number
  page: number
  page_size: number
}

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  received:   { bg: 'rgba(99,102,241,0.12)',   color: '#6366F1', label: '⏳ Reçu' },
  processing: { bg: 'rgba(251,191,36,0.12)',   color: '#fbbf24', label: '⚙️ Traitement' },
  completed:  { bg: 'rgba(52,211,153,0.12)',   color: '#34d399', label: '✅ Terminé' },
  failed:     { bg: 'rgba(239,68,68,0.12)',    color: '#ef4444', label: '❌ Échoué' },
}

type Props = {
  webhookId: string
  webhookName: string
  onClose: () => void
}

export function WebhookEventsHistory({ webhookId, webhookName, onClose }: Props) {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [data, setData] = useState<EventsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const resp = await api.get<EventsResponse>(`/api/v1/webhooks/${webhookId}/events?page=${page}&page_size=15`)
      setData(resp)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [webhookId, page])

  useEffect(() => { load() }, [load])

  const totalPages = data ? Math.ceil(data.total / 15) : 1

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="flex w-full max-w-2xl flex-col rounded-2xl"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', maxHeight: '85vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b p-5" style={{ borderColor: 'var(--border-color)' }}>
          <div>
            <h2 className="text-base font-bold text-white">{t('webhook.history_title')}</h2>
            <p className="text-xs text-slate-500">{webhookName} · {data?.total ?? 0} {t('webhook.events')}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="rounded-lg px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors" style={{ background: 'var(--bg-elevated)' }}>
              ↺ {t('webhook.refresh')}
            </button>
            <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:text-white transition-colors" style={{ background: 'var(--bg-elevated)' }}>
              ✕
            </button>
          </div>
        </div>

        {/* Events list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <span className="text-sm text-slate-500">{t('common.loading')}</span>
            </div>
          )}
          {!loading && (!data?.events.length) && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="text-3xl mb-2">📭</span>
              <p className="text-sm text-slate-500">{t('webhook.no_events')}</p>
            </div>
          )}
          {data?.events.map((ev) => {
            const style = STATUS_STYLES[ev.status] ?? STATUS_STYLES.received
            const isExpanded = expanded === ev.id
            return (
              <div
                key={ev.id}
                className="rounded-xl overflow-hidden"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}
              >
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 text-left"
                  onClick={() => setExpanded(isExpanded ? null : ev.id)}
                >
                  <span
                    className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{ background: style.bg, color: style.color }}
                  >
                    {style.label}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-xs text-white">
                      {ev.agent_triggered ? `Agent: ${ev.agent_triggered}` : t('webhook.no_agent')}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(ev.received_at).toLocaleString()} · IP: {ev.source_ip ?? '—'}
                    </p>
                  </div>
                  <span className="text-slate-600 text-xs">{isExpanded ? '▲' : '▼'}</span>
                </button>

                {isExpanded && (
                  <div className="border-t px-4 pb-4 pt-3 space-y-3" style={{ borderColor: 'var(--border-color)' }}>
                    <div>
                      <p className="mb-1 text-xs font-medium text-slate-400">{t('webhook.payload')}</p>
                      <pre className="overflow-x-auto rounded-lg px-3 py-2 text-xs text-slate-300" style={{ background: '#0A0A0F' }}>
                        {JSON.stringify(ev.payload, null, 2)}
                      </pre>
                    </div>
                    {ev.agent_response && (
                      <div>
                        <p className="mb-1 text-xs font-medium text-slate-400">{t('webhook.agent_response')}</p>
                        <div className="rounded-lg px-3 py-2 text-xs text-slate-300 whitespace-pre-wrap" style={{ background: '#0A0A0F' }}>
                          {ev.agent_response}
                        </div>
                      </div>
                    )}
                    {ev.error_message && (
                      <div>
                        <p className="mb-1 text-xs font-medium" style={{ color: '#ef4444' }}>{t('webhook.error')}</p>
                        <p className="text-xs text-red-400">{ev.error_message}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 border-t p-4" style={{ borderColor: 'var(--border-color)' }}>
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="rounded-lg px-3 py-1.5 text-xs disabled:opacity-40"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
            >
              ← {t('common.previous')}
            </button>
            <span className="text-xs text-slate-500">{page} / {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="rounded-lg px-3 py-1.5 text-xs disabled:opacity-40"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
            >
              {t('common.next')} →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

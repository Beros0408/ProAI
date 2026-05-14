'use client'

import { useState } from 'react'
import { useTranslation } from '@/lib/i18n/context'
import { api } from '@/lib/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export type WebhookToken = {
  id: string
  token: string
  name: string
  description?: string
  is_active: boolean
  created_at: string
  last_used_at?: string
  event_count?: number
}

type Props = {
  webhook: WebhookToken
  onUpdate: (id: string, patch: Partial<WebhookToken>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onViewHistory: (id: string) => void
  onConfigure: (id: string) => void
}

export function WebhookCard({ webhook, onUpdate, onDelete, onViewHistory, onConfigure }: Props) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)

  const webhookUrl = `${API_URL}/api/v1/webhook/${webhook.token}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(webhookUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      await api.post(`/api/v1/webhooks/${webhook.id}/test`, {})
      setTestResult('ok')
    } catch {
      setTestResult('error')
    } finally {
      setTesting(false)
    }
  }

  const handleToggle = () => onUpdate(webhook.id, { is_active: !webhook.is_active })
  const handleDelete = () => {
    if (confirm(t('webhook.confirm_delete'))) onDelete(webhook.id)
  }

  return (
    <div
      className="rounded-2xl p-5 transition-all duration-200"
      style={{
        background: 'var(--bg-surface)',
        border: `1px solid ${webhook.is_active ? '#6366F120' : 'var(--border-color)'}`,
      }}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg">📥</span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-white">{webhook.name}</h3>
            {webhook.description && (
              <p className="truncate text-xs text-slate-500">{webhook.description}</p>
            )}
          </div>
        </div>
        <span
          className="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium"
          style={
            webhook.is_active
              ? { background: 'rgba(52,211,153,0.15)', color: '#34d399' }
              : { background: 'rgba(100,116,139,0.15)', color: '#64748b' }
          }
        >
          {webhook.is_active ? t('webhook.status_active') : t('webhook.status_inactive')}
        </span>
      </div>

      {/* URL row */}
      <div
        className="mb-3 flex items-center gap-2 rounded-xl px-3 py-2.5"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}
      >
        <code className="flex-1 truncate text-xs text-slate-400">{webhookUrl}</code>
        <button
          onClick={handleCopy}
          className="shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors"
          style={{ background: '#6366F118', color: '#6366F1' }}
        >
          {copied ? t('webhook.copied') : t('webhook.copy')}
        </button>
        <button
          onClick={handleTest}
          disabled={testing}
          className="shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50"
          style={{ background: '#10b98118', color: '#10b981' }}
        >
          {testing ? '…' : t('webhook.test')}
        </button>
      </div>

      {testResult && (
        <p
          className="mb-3 rounded-lg px-3 py-2 text-xs"
          style={
            testResult === 'ok'
              ? { background: 'rgba(52,211,153,0.1)', color: '#34d399' }
              : { background: 'rgba(239,68,68,0.1)', color: '#ef4444' }
          }
        >
          {testResult === 'ok' ? t('webhook.test_success') : t('webhook.test_error')}
        </p>
      )}

      {/* Stats */}
      <p className="mb-4 text-xs text-slate-500">
        {webhook.event_count ?? 0} {t('webhook.events_received')}
        {webhook.last_used_at && (
          <> · {t('webhook.last_used')} {new Date(webhook.last_used_at).toLocaleDateString()}</>
        )}
      </p>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onViewHistory(webhook.id)}
          className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
          style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
        >
          {t('webhook.view_history')}
        </button>
        <button
          onClick={() => onConfigure(webhook.id)}
          className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
          style={{ background: '#6366F118', color: '#6366F1', border: '1px solid #6366F130' }}
        >
          {t('webhook.configure')}
        </button>
        <button
          onClick={handleToggle}
          className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
          style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
        >
          {webhook.is_active ? t('webhook.disable') : t('webhook.enable')}
        </button>
        <button
          onClick={handleDelete}
          className="ml-auto rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
          style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          {t('common.delete')}
        </button>
      </div>
    </div>
  )
}

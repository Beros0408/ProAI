'use client'

import { useState } from 'react'
import { useTranslation } from '@/lib/i18n/context'

type Props = {
  onClose: () => void
  onCreate: (name: string, description: string) => Promise<void>
}

export function WebhookCreateModal({ onClose, onCreate }: Props) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError(null)
    try {
      await onCreate(name.trim(), description.trim())
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">{t('webhook.create_title')}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white transition-colors"
            style={{ background: 'var(--bg-elevated)' }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">
              {t('webhook.name_label')} *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('webhook.name_placeholder')}
              required
              className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-slate-600"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">
              {t('webhook.description_label')}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('webhook.description_placeholder')}
              rows={3}
              className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-slate-600 resize-none"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}
            />
          </div>

          {error && (
            <p className="rounded-lg px-3 py-2 text-xs" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
              {error}
            </p>
          )}

          {/* Info */}
          <p className="rounded-xl px-3 py-2.5 text-xs text-slate-400" style={{ background: 'var(--bg-elevated)' }}>
            💡 {t('webhook.create_info')}
          </p>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl py-2.5 text-sm font-medium transition-colors"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all disabled:opacity-50"
              style={{ background: '#6366F1', color: '#fff' }}
            >
              {loading ? t('common.loading') : t('webhook.create_button')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

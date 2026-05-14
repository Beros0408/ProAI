'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from '@/lib/i18n/context'
import { api } from '@/lib/api'

type WebhookRule = {
  id: string
  agent_id: string
  condition_field?: string
  condition_value?: string
  enabled: boolean
}

type RulesResponse = { rules: WebhookRule[] }

const AGENTS = [
  { id: 'general',      label: '🤖 General' },
  { id: 'marketing',    label: '📣 Marketing' },
  { id: 'sales',        label: '💼 Sales' },
  { id: 'automation',   label: '⚙️ Automation' },
  { id: 'analytics',    label: '📊 Analytics' },
  { id: 'communication',label: '✉️ Communication' },
  { id: 'legal',        label: '⚖️ Legal' },
  { id: 'social_media', label: '📱 Social Media' },
]

type Props = {
  webhookId: string
  webhookName: string
  onClose: () => void
}

export function WebhookRulesEditor({ webhookId, webhookName, onClose }: Props) {
  const { t } = useTranslation()
  const [rules, setRules] = useState<WebhookRule[]>([])
  const [loading, setLoading] = useState(true)
  const [agentId, setAgentId] = useState('general')
  const [conditionField, setConditionField] = useState('')
  const [conditionValue, setConditionValue] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const resp = await api.get<RulesResponse>(`/api/v1/webhooks/${webhookId}/rules`)
      setRules(resp.rules)
    } finally {
      setLoading(false)
    }
  }, [webhookId])

  useEffect(() => { load() }, [load])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post(`/api/v1/webhooks/${webhookId}/rules`, {
        agent_id: agentId,
        condition_field: conditionField || null,
        condition_value: conditionValue || null,
      })
      setConditionField('')
      setConditionValue('')
      await load()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (ruleId: string) => {
    await api.delete(`/api/v1/webhooks/${webhookId}/rules/${ruleId}`)
    setRules(r => r.filter(x => x.id !== ruleId))
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="flex w-full max-w-lg flex-col rounded-2xl"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', maxHeight: '85vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b p-5" style={{ borderColor: 'var(--border-color)' }}>
          <div>
            <h2 className="text-base font-bold text-white">{t('webhook.rules_title')}</h2>
            <p className="text-xs text-slate-500">{webhookName}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:text-white" style={{ background: 'var(--bg-elevated)' }}>
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Existing rules */}
          {loading ? (
            <p className="text-center text-xs text-slate-500">{t('common.loading')}</p>
          ) : rules.length === 0 ? (
            <div className="rounded-xl px-4 py-3 text-xs text-slate-400" style={{ background: 'var(--bg-elevated)' }}>
              {t('webhook.no_rules')}
            </div>
          ) : (
            <div className="space-y-2">
              {rules.map(rule => (
                <div
                  key={rule.id}
                  className="flex items-center gap-3 rounded-xl px-4 py-3"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}
                >
                  <span className="text-lg">{AGENTS.find(a => a.id === rule.agent_id)?.label.split(' ')[0] ?? '🤖'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white">
                      {AGENTS.find(a => a.id === rule.agent_id)?.label ?? rule.agent_id}
                    </p>
                    {rule.condition_field && (
                      <p className="text-xs text-slate-500 truncate">
                        {t('webhook.when')} <code className="text-slate-400">{rule.condition_field}</code> = <code className="text-slate-400">{rule.condition_value}</code>
                      </p>
                    )}
                    {!rule.condition_field && <p className="text-xs text-slate-500">{t('webhook.always_trigger')}</p>}
                  </div>
                  <button onClick={() => handleDelete(rule.id)} className="text-xs text-red-400 hover:text-red-300 transition-colors">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add rule form */}
          <form onSubmit={handleAdd} className="space-y-3 rounded-xl p-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}>
            <p className="text-xs font-medium text-slate-300">{t('webhook.add_rule')}</p>

            <div>
              <label className="mb-1 block text-xs text-slate-400">{t('webhook.agent_label')}</label>
              <select
                value={agentId}
                onChange={e => setAgentId(e.target.value)}
                className="w-full rounded-xl px-3 py-2 text-xs text-white outline-none"
                style={{ background: '#0A0A0F', border: '1px solid var(--border-color)' }}
              >
                {AGENTS.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs text-slate-400">{t('webhook.condition_field')} <span className="text-slate-600">({t('common.optional')})</span></label>
                <input
                  type="text"
                  value={conditionField}
                  onChange={e => setConditionField(e.target.value)}
                  placeholder="payload.action"
                  className="w-full rounded-xl px-3 py-2 text-xs text-white outline-none placeholder:text-slate-600"
                  style={{ background: '#0A0A0F', border: '1px solid var(--border-color)' }}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">{t('webhook.condition_value')} <span className="text-slate-600">({t('common.optional')})</span></label>
                <input
                  type="text"
                  value={conditionValue}
                  onChange={e => setConditionValue(e.target.value)}
                  placeholder="form.submitted"
                  className="w-full rounded-xl px-3 py-2 text-xs text-white outline-none placeholder:text-slate-600"
                  style={{ background: '#0A0A0F', border: '1px solid var(--border-color)' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl py-2 text-xs font-semibold transition-all disabled:opacity-50"
              style={{ background: '#6366F1', color: '#fff' }}
            >
              {saving ? t('common.loading') : t('webhook.add_rule_button')}
            </button>
          </form>

          {/* Info box */}
          <div className="rounded-xl px-4 py-3 text-xs text-slate-400" style={{ background: 'var(--bg-elevated)' }}>
            💡 {t('webhook.rules_info')}
          </div>
        </div>
      </div>
    </div>
  )
}

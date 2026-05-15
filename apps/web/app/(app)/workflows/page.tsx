'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Plus, Save, Zap, Mail, MessageSquare, CheckSquare,
  Users, Globe, Clock, GitBranch, Power, Trash2, Play,
} from 'lucide-react'
import { useTranslation } from '@/lib/i18n/context'
import type { TranslationKey } from '@/lib/i18n/translations'
import { BackButton } from '@/components/ui/BackButton'
import { api } from '@/lib/api'
import { WorkflowCanvas, type CanvasStep, type CanvasWorkflow } from '@/components/workflows/WorkflowCanvas'

// ── Types ─────────────────────────────────────────────────────────────────────

interface WorkflowStep {
  id: string
  step_order: number
  step_type: string
  name: string
  config: Record<string, unknown>
}

interface Workflow {
  id: string
  name: string
  description?: string
  trigger_type: string
  trigger_config: Record<string, unknown>
  is_active: boolean
  run_count: number
  last_run_at?: string
  created_at: string
  steps: WorkflowStep[]
}

// ── Trigger palette ───────────────────────────────────────────────────────────

const TRIGGER_OPTIONS = [
  { id: 'new_lead',       icon: Users,     labelKey: 'workflows.trigger.new_lead'       as TranslationKey },
  { id: 'email_received', icon: Mail,      labelKey: 'workflows.trigger.email_received' as TranslationKey },
  { id: 'webhook',        icon: Globe,     labelKey: 'workflows.trigger.webhook'        as TranslationKey },
  { id: 'scheduled',      icon: Clock,     labelKey: 'workflows.trigger.scheduled'      as TranslationKey },
  { id: 'manual',         icon: Zap,       labelKey: 'workflows.trigger.manual'         as TranslationKey },
]

const ACTION_OPTIONS = [
  { id: 'send_email',    icon: Mail,        labelKey: 'workflows.action.send_email'    as TranslationKey },
  { id: 'send_slack',    icon: MessageSquare, labelKey: 'workflows.action.slack_notify' as TranslationKey },
  { id: 'create_task',   icon: CheckSquare, labelKey: 'workflows.action.create_task'   as TranslationKey },
  { id: 'update_lead',   icon: Users,       labelKey: 'workflows.action.update_lead'   as TranslationKey },
  { id: 'linkedin_post', icon: Globe,       labelKey: 'workflows.action.linkedin_post' as TranslationKey },
  { id: 'webhook_call',  icon: Globe,       labelKey: 'workflows.action.webhook_call'  as TranslationKey },
  { id: 'wait',          icon: Clock,       labelKey: 'workflows.action.wait'          as TranslationKey },
  { id: 'condition',     icon: GitBranch,   labelKey: 'workflows.action.condition'     as TranslationKey },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function emptyWorkflow(): Omit<Workflow, 'id' | 'created_at'> {
  return {
    name: 'Nouveau workflow',
    description: '',
    trigger_type: 'manual',
    trigger_config: {},
    is_active: false,
    run_count: 0,
    steps: [],
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function WorkflowsPage() {
  const { t } = useTranslation()

  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editing, setEditing] = useState<Omit<Workflow, 'id' | 'created_at'>>(emptyWorkflow())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [saveError, setSaveError] = useState(false)
  const initialized = useRef(false)

  // Modal state: 'trigger' | 'action' | null
  const [modal, setModal] = useState<'trigger' | 'action' | null>(null)

  const selectedWorkflow = workflows.find(w => w.id === selectedId) ?? null

  // ── Load ─────────────────────────────────────────────────────────────────────
  // Stable callback (no selectedId dep) — avoids infinite re-fetch loop.
  // useRef tracks whether we've already set the initial selection.
  const loadWorkflows = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.get<Workflow[]>('/api/v1/workflows/')
      setWorkflows(data)
      if (!initialized.current && data.length > 0) {
        initialized.current = true
        setSelectedId(data[0].id)
        const { id: _id, created_at: _ca, ...rest } = data[0]
        setEditing(rest)
      }
    } catch {
      // backend returns mock data on error — no action needed
    } finally {
      setLoading(false)
    }
  }, []) // stable reference — intentionally no deps

  useEffect(() => { loadWorkflows() }, [loadWorkflows])

  // Sync editing when selection changes
  const selectWorkflow = (wf: Workflow) => {
    setSelectedId(wf.id)
    const { id: _id, created_at: _ca, ...rest } = wf
    setEditing(rest)
    setDirty(false)
  }

  const markDirty = <K extends keyof typeof editing>(key: K, val: (typeof editing)[K]) => {
    setEditing(prev => ({ ...prev, [key]: val }))
    setDirty(true)
  }

  // ── Create ──
  const handleCreate = async () => {
    const payload = {
      name: `${t('workflows.newName')} ${workflows.length + 1}`,
      trigger_type: 'manual',
      trigger_config: {},
      steps: [],
    }
    try {
      const created = await api.post<Workflow>('/api/v1/workflows/', payload)
      setWorkflows(prev => [...prev, created])
      selectWorkflow(created)
    } catch {
      // optimistic local add
      const local: Workflow = {
        ...payload,
        id: `local-${Date.now()}`,
        description: '',
        is_active: false,
        run_count: 0,
        created_at: new Date().toISOString().slice(0, 10),
      }
      setWorkflows(prev => [...prev, local])
      selectWorkflow(local)
    }
  }

  // ── Save (PATCH /{id}) ───────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!selectedId) return
    setSaving(true)
    setSaveError(false)
    try {
      const payload = {
        name: editing.name,
        description: editing.description,
        trigger_type: editing.trigger_type,
        trigger_config: editing.trigger_config,
        steps: editing.steps.map(s => ({
          step_type: s.step_type,
          name: s.name,
          config: s.config,
        })),
      }
      // PATCH /{id} — backend endpoint updated to match
      const updated = await api.patch<Workflow>(`/api/v1/workflows/${selectedId}`, payload)
      setWorkflows(prev => prev.map(w => w.id === selectedId ? updated : w))
      setDirty(false)
    } catch {
      setSaveError(true)
      // Keep dirty=true so user knows save failed and can retry
    } finally {
      setSaving(false)
    }
  }

  // ── Toggle active ──
  const handleToggle = async (id: string) => {
    try {
      const updated = await api.patch<Workflow>(`/api/v1/workflows/${id}/toggle`, {})
      setWorkflows(prev => prev.map(w => w.id === id ? updated : w))
      if (id === selectedId) {
        setEditing(prev => ({ ...prev, is_active: updated.is_active }))
      }
    } catch {
      setWorkflows(prev => prev.map(w => w.id === id ? { ...w, is_active: !w.is_active } : w))
    }
  }

  // ── Delete ──
  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce workflow ?')) return
    try {
      await api.delete(`/api/v1/workflows/${id}`)
    } catch { /* ignore */ }
    setWorkflows(prev => prev.filter(w => w.id !== id))
    if (id === selectedId) {
      const remaining = workflows.filter(w => w.id !== id)
      if (remaining.length > 0) selectWorkflow(remaining[0])
      else { setSelectedId(null); setEditing(emptyWorkflow()) }
    }
  }

  // ── Step management ──
  const handleAddStep = (stepType: string, stepName: string) => {
    const newStep: WorkflowStep = {
      id: `tmp-${Date.now()}`,
      step_order: editing.steps.length + 1,
      step_type: stepType,
      name: stepName,
      config: {},
    }
    markDirty('steps', [...editing.steps, newStep])
    setModal(null)
  }

  const handleDeleteStep = (stepId: string) => {
    markDirty('steps', editing.steps.filter(s => s.id !== stepId))
  }

  const handleSetTrigger = (triggerType: string) => {
    markDirty('trigger_type', triggerType)
    setModal(null)
  }

  // ── Canvas adapter ──
  const canvasWorkflow: CanvasWorkflow = {
    trigger_type: editing.trigger_type,
    steps: editing.steps as CanvasStep[],
  }

  return (
    <div className="min-h-screen flex flex-col animate-fade-up" style={{ background: 'var(--bg-base)' }}>

      {/* ── Top bar ─────────────────────────────────────────────── */}
      <div
        className="border-b px-6 py-4 flex items-center justify-between gap-4"
        style={{ borderColor: 'var(--border-color)', background: 'var(--bg-surface)' }}
      >
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ letterSpacing: '-0.02em' }}>
              Workflow Builder
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {t('workflows.subtitle2')}
            </p>
          </div>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold
                     text-white transition-all hover:opacity-90"
          style={{ background: '#6366F1' }}
        >
          <Plus className="w-4 h-4" />
          {t('workflows.new')}
        </button>
      </div>

      {/* ── Main layout ─────────────────────────────────────────── */}
      <div className="flex flex-1 gap-0 overflow-hidden">

        {/* Left: workflow list */}
        <aside
          className="w-44 flex-shrink-0 border-r flex flex-col overflow-y-auto"
          style={{ borderColor: 'var(--border-color)', background: 'var(--bg-surface)' }}
        >
          <div className="px-4 py-3 border-b text-xs font-semibold uppercase tracking-wider"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
            {t('workflows.saved')}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('workflows.loading')}</span>
            </div>
          ) : (
            <div className="flex-1 p-2 space-y-1">
              {workflows.map(wf => (
                <div
                  key={wf.id}
                  onClick={() => selectWorkflow(wf)}
                  className="group relative rounded-lg px-2.5 py-2 cursor-pointer transition-all"
                  style={selectedId === wf.id
                    ? { background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }
                    : { background: 'transparent', border: '1px solid transparent' }
                  }
                >
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-medium text-white truncate flex-1">{wf.name}</p>
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(wf.id) }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-500/20 transition-all shrink-0"
                    >
                      <Trash2 className="w-2.5 h-2.5 text-red-400" />
                    </button>
                  </div>
                  <span
                    className="mt-0.5 inline-block text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                    style={wf.is_active
                      ? { background: 'rgba(74,222,128,0.15)', color: '#4ade80' }
                      : { background: 'rgba(100,116,139,0.15)', color: '#64748b' }
                    }
                  >
                    {wf.is_active ? t('workflows.active') : t('workflows.draft')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* Center: canvas */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Canvas top bar */}
          {selectedWorkflow && (
            <div
              className="flex items-center gap-4 px-5 py-3 border-b"
              style={{ borderColor: 'var(--border-color)', background: 'var(--bg-surface)' }}
            >
              <input
                value={editing.name}
                onChange={e => markDirty('name', e.target.value)}
                className="bg-transparent text-lg font-bold text-white outline-none flex-1 min-w-0"
                placeholder={t('workflows.namePlaceholder')}
              />
              <div className="flex items-center gap-2 shrink-0">
                {saveError && (
                  <span className="text-xs text-red-400 font-medium">✕ Erreur — réessayer</span>
                )}
                {dirty && !saveError && (
                  <span className="text-xs text-amber-400 font-medium">● Non sauvegardé</span>
                )}
                <button
                  onClick={() => handleToggle(selectedWorkflow.id)}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
                  style={editing.is_active
                    ? { background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }
                    : { background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.25)' }
                  }
                >
                  <Power className="w-3.5 h-3.5" />
                  {editing.is_active ? t('workflows.deactivate') : t('workflows.activate')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-all disabled:opacity-50"
                  style={{ background: '#6366F1' }}
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving ? '…' : t('workflows.save')}
                </button>
              </div>
            </div>
          )}

          {/* Canvas body */}
          <div className="flex-1 overflow-y-auto">
            {!selectedWorkflow ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 py-20">
                <GitBranch className="w-12 h-12 text-[#6366F1]" style={{ opacity: 0.4 }} />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Sélectionnez ou créez un workflow
                </p>
                <button
                  onClick={handleCreate}
                  className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white"
                  style={{ background: '#6366F1' }}
                >
                  <Plus className="w-4 h-4" /> {t('workflows.new')}
                </button>
              </div>
            ) : (
              <WorkflowCanvas
                workflow={canvasWorkflow}
                onEditTrigger={() => setModal('trigger')}
                onAddStep={() => setModal('action')}
                onEditStep={() => setModal('action')}
                onDeleteStep={handleDeleteStep}
              />
            )}
          </div>
        </main>

        {/* Right: palette */}
        <aside
          className="w-56 flex-shrink-0 border-l flex flex-col overflow-y-auto"
          style={{ borderColor: 'var(--border-color)', background: 'var(--bg-surface)' }}
        >
          {/* Triggers */}
          <div className="px-4 py-3 border-b text-xs font-semibold uppercase tracking-wider"
            style={{ borderColor: 'var(--border-color)', color: '#60a5fa' }}>
            {t('workflows.triggers')}
          </div>
          <div className="p-2 space-y-1 border-b" style={{ borderColor: 'var(--border-color)' }}>
            {TRIGGER_OPTIONS.map(opt => {
              const Icon = opt.icon
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSetTrigger(opt.id)}
                  className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-left transition-all hover:bg-[rgba(96,165,250,0.1)]"
                  style={{
                    background: editing.trigger_type === opt.id ? 'rgba(96,165,250,0.12)' : 'transparent',
                    color: editing.trigger_type === opt.id ? '#60a5fa' : 'var(--text-secondary)',
                    border: editing.trigger_type === opt.id ? '1px solid rgba(96,165,250,0.3)' : '1px solid transparent',
                  }}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="font-medium truncate">{t(opt.labelKey)}</span>
                </button>
              )
            })}
          </div>

          {/* Actions */}
          <div className="px-4 py-3 border-b text-xs font-semibold uppercase tracking-wider"
            style={{ borderColor: 'var(--border-color)', color: '#2dd4bf' }}>
            {t('workflows.actions')}
          </div>
          <div className="p-2 space-y-1">
            {ACTION_OPTIONS.map(opt => {
              const Icon = opt.icon
              return (
                <button
                  key={opt.id}
                  onClick={() => handleAddStep(opt.id, t(opt.labelKey))}
                  className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-left transition-all hover:bg-[rgba(45,212,191,0.08)]"
                  style={{ color: 'var(--text-secondary)', border: '1px solid transparent' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#2dd4bf'; e.currentTarget.style.border = '1px solid rgba(45,212,191,0.2)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.border = '1px solid transparent' }}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="font-medium truncate">{t(opt.labelKey)}</span>
                  <Plus className="w-3 h-3 ml-auto shrink-0 opacity-50" />
                </button>
              )
            })}
          </div>
        </aside>
      </div>

      {/* ── Bottom: workflow stats ───────────────────────────────── */}
      {workflows.length > 0 && (
        <div
          className="border-t px-6 py-4"
          style={{ borderColor: 'var(--border-color)', background: 'var(--bg-surface)' }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Workflows', value: workflows.length },
              { label: t('workflows.active'), value: workflows.filter(w => w.is_active).length },
              { label: 'Total ' + t('workflows.run_count'), value: workflows.reduce((s, w) => s + w.run_count, 0) },
              { label: 'Étapes (sélectionné)', value: editing.steps.length },
            ].map(stat => (
              <div
                key={stat.label}
                className="rounded-xl px-4 py-3"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}
              >
                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Trigger picker modal ─────────────────────────────────── */}
      {modal === 'trigger' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
          onClick={() => setModal(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-5"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-white mb-4">{t('workflows.select_trigger')}</h3>
            <div className="space-y-2">
              {TRIGGER_OPTIONS.map(opt => {
                const Icon = opt.icon
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSetTrigger(opt.id)}
                    className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all text-left hover:scale-[1.01]"
                    style={{ background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.15)', color: 'white' }}
                  >
                    <Icon className="w-4 h-4 text-[#60a5fa] shrink-0" />
                    {t(opt.labelKey)}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Action picker modal ──────────────────────────────────── */}
      {modal === 'action' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
          onClick={() => setModal(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-5"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-white mb-4">{t('workflows.select_action')}</h3>
            <div className="space-y-2">
              {ACTION_OPTIONS.map(opt => {
                const Icon = opt.icon
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleAddStep(opt.id, t(opt.labelKey))}
                    className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all text-left hover:scale-[1.01]"
                    style={{ background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.15)', color: 'white' }}
                  >
                    <Icon className="w-4 h-4 text-[#2dd4bf] shrink-0" />
                    {t(opt.labelKey)}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

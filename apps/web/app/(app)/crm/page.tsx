'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus, Users, Mail, Building2, DollarSign, Trash2,
  MessageSquare, Phone, Briefcase, Globe, Linkedin,
  CalendarClock, Tag, Star,
} from 'lucide-react'
import { useTranslation } from '@/lib/i18n/context'
import type { TranslationKey } from '@/lib/i18n/translations'
import { BackButton } from '@/components/ui/BackButton'
import { api } from '@/lib/api'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/Button'

// ── Types ──────────────────────────────────────────────────────────────────────

interface Lead {
  id: string
  name: string
  email: string
  company: string
  stage: string
  estimatedValue: number
  dateAdded: string
  score: number        // 0-100 integer
  notes: string
  // Enriched
  phone?: string | null
  jobTitle?: string | null
  source?: string | null
  status?: string
  nextContactAt?: string | null
  linkedinUrl?: string | null
  websiteUrl?: string | null
  tags?: string[] | null
}

interface LeadCreatePayload {
  name: string
  email: string
  company: string
  estimated_value: number
  phone?: string
  job_title?: string
  source?: string
  status: string
  score: number
  notes?: string
  next_contact_at?: string
  linkedin_url?: string
  website_url?: string
  tags?: string[]
}

interface ApiLead {
  id: string
  name: string
  email: string
  company: string
  stage: string
  score: number
  estimated_value: number
  notes: string
  created_at: string
  phone?: string | null
  job_title?: string | null
  source?: string | null
  status?: string
  next_contact_at?: string | null
  linkedin_url?: string | null
  website_url?: string | null
  tags?: string[] | null
}

interface LeadsApiResponse {
  leads: ApiLead[]
  stats: Record<string, unknown>
}

function apiLeadToLead(r: ApiLead): Lead {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    company: r.company,
    stage: r.stage || 'nouveau',
    estimatedValue: r.estimated_value ?? 0,
    dateAdded: (r.created_at || '').slice(0, 10),
    score: typeof r.score === 'number' ? r.score : 50,
    notes: r.notes || '',
    phone: r.phone,
    jobTitle: r.job_title,
    source: r.source,
    status: r.status || 'to_contact',
    nextContactAt: r.next_contact_at ? r.next_contact_at.slice(0, 10) : null,
    linkedinUrl: r.linkedin_url,
    websiteUrl: r.website_url,
    tags: r.tags,
  }
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STAGES = ['nouveau', 'contacte', 'negociation', 'gagne'] as const
type Stage = (typeof STAGES)[number]

const STAGE_LABELS: Record<Stage, TranslationKey> = {
  nouveau: 'crm.stage.new.full',
  contacte: 'crm.stage.contacted',
  negociation: 'crm.stage.negotiation.full',
  gagne: 'crm.stage.won',
}

const STAGE_COLORS: Record<Stage, string> = {
  nouveau: 'from-blue-500 to-blue-600',
  contacte: 'from-yellow-500 to-yellow-600',
  negociation: 'from-purple-500 to-purple-600',
  gagne: 'from-green-500 to-green-600',
}

const SOURCE_ICONS: Record<string, string> = {
  linkedin: '💼',
  website: '🌐',
  referral: '🤝',
  event: '📅',
  other: '📌',
}

function scoreLabel(score: number): 'hot' | 'warm' | 'cold' {
  if (score >= 70) return 'hot'
  if (score >= 40) return 'warm'
  return 'cold'
}

const SCORE_COLORS = {
  hot:  { gradient: 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.08))', border: 'rgba(239,68,68,0.25)',  text: '#f87171' },
  warm: { gradient: 'linear-gradient(135deg, rgba(251,146,60,0.2), rgba(251,146,60,0.08))', border: 'rgba(251,146,60,0.25)', text: '#fb923c' },
  cold: { gradient: 'linear-gradient(135deg, rgba(14,165,233,0.2), rgba(14,165,233,0.08))', border: 'rgba(14,165,233,0.25)', text: '#38bdf8' },
}

const SCORE_LABEL_KEYS: Record<'hot' | 'warm' | 'cold', TranslationKey> = {
  hot: 'crm.score.hot',
  warm: 'crm.score.warm',
  cold: 'crm.score.cold',
}

// ── LeadCard ──────────────────────────────────────────────────────────────────

function LeadCard({ lead, onDelete }: { lead: Lead; onDelete: (id: string) => void }) {
  const router = useRouter()
  const { t } = useTranslation()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lead.id })

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }
  const tier = scoreLabel(lead.score)
  const sc = SCORE_COLORS[tier]

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="card-premium p-4 cursor-grab active:cursor-grabbing space-y-3 group"
      style={style}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#e2e8f0] text-sm truncate">{lead.name}</h3>
          <p className="text-[#64748b] text-xs mt-0.5 truncate">{lead.jobTitle ? `${lead.jobTitle} · ` : ''}{lead.company}</p>
        </div>
        <button
          onClick={() => onDelete(lead.id)}
          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded-lg ml-2"
        >
          <Trash2 className="w-4 h-4 text-red-400" />
        </button>
      </div>

      {/* Info rows */}
      <div className="space-y-1.5 text-xs">
        {lead.email && (
          <div className="flex items-center gap-2 text-[#64748b]">
            <Mail className="w-3 h-3 shrink-0" />
            <span className="truncate">{lead.email}</span>
          </div>
        )}
        {lead.phone && (
          <div className="flex items-center gap-2 text-[#64748b]">
            <Phone className="w-3 h-3 shrink-0" />
            <span>{lead.phone}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-[#e2e8f0] font-semibold">
          <DollarSign className="w-3 h-3 text-[#fb923c] shrink-0" />
          {lead.estimatedValue.toLocaleString()} €
        </div>
        {lead.nextContactAt && (
          <div className="flex items-center gap-2 text-[#64748b]">
            <CalendarClock className="w-3 h-3 shrink-0" />
            <span>{lead.nextContactAt}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className="text-xs px-2 py-0.5 rounded-full font-semibold shrink-0"
            style={{ background: sc.gradient, border: `1px solid ${sc.border}`, color: sc.text }}
          >
            {lead.score} · {t(SCORE_LABEL_KEYS[tier])}
          </span>
          {lead.source && (
            <span className="text-xs" title={lead.source}>{SOURCE_ICONS[lead.source] ?? '📌'}</span>
          )}
          {lead.tags && lead.tags.length > 0 && (
            <span className="text-xs text-[#64748b] truncate">{lead.tags[0]}</span>
          )}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            router.push(`/chat?agent=sales&lead=${encodeURIComponent(lead.name)}`)
          }}
          className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all duration-200 hover:-translate-y-0.5"
          style={{ background: 'rgba(14,165,233,0.12)', color: '#38bdf8', border: '1px solid rgba(14,165,233,0.2)' }}
          title={`${t('crm.contact')} ${lead.name}`}
        >
          <MessageSquare className="w-3 h-3" />
          {t('crm.contact')}
        </button>
      </div>
    </div>
  )
}

// ── Column ────────────────────────────────────────────────────────────────────

function Column({ stage, leads, onDelete }: { stage: Stage; leads: Lead[]; onDelete: (id: string) => void }) {
  const { t } = useTranslation()
  const { setNodeRef } = useSortable({ id: stage, data: { type: 'Column' } })
  const totalValue = leads.reduce((sum, l) => sum + l.estimatedValue, 0)

  return (
    <div ref={setNodeRef} className="card-premium flex-1 min-w-80 p-4">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${STAGE_COLORS[stage]} shadow-lg`} />
          <h3 className="font-semibold text-[#e2e8f0] text-sm">{t(STAGE_LABELS[stage])}</h3>
          <span
            className="ml-auto text-xs px-2.5 py-1 rounded-full font-semibold"
            style={{ background: 'rgba(14,165,233,0.12)', color: '#38bdf8', border: '1px solid rgba(14,165,233,0.2)' }}
          >
            {leads.length}
          </span>
        </div>
        <p className="text-xs text-[#64748b]">{t('crm.pipeline.label')} {totalValue.toLocaleString()} €</p>
      </div>
      <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3 min-h-96">
          {leads.map(lead => <LeadCard key={lead.id} lead={lead} onDelete={onDelete} />)}
        </div>
      </SortableContext>
    </div>
  )
}

// ── Form helpers ──────────────────────────────────────────────────────────────

const INPUT_STYLE = {
  background: 'var(--input-bg)',
  border: '1px solid var(--border-color)',
} as const

function inputFocus(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
  e.currentTarget.style.border = '1px solid rgba(14,165,233,0.4)'
  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.08)'
}
function inputBlur(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
  e.currentTarget.style.border = '1px solid var(--border-color)'
  e.currentTarget.style.boxShadow = 'none'
}

const BASE_FORM: LeadCreatePayload = {
  name: '', email: '', company: '', estimated_value: 0,
  phone: '', job_title: '', source: '', status: 'to_contact',
  score: 50, notes: '', next_contact_at: '', linkedin_url: '', website_url: '',
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CRMPage() {
  const { t } = useTranslation()

  const [leads, setLeads] = useState<Record<Stage, Lead[]>>({
    nouveau: [], contacte: [], negociation: [], gagne: [],
  })
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<LeadCreatePayload>(BASE_FORM)
  const [activeSection, setActiveSection] = useState<0 | 1 | 2 | 3>(0)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // ── Load leads from API ──
  const loadLeads = useCallback(async () => {
    setLoading(true)
    try {
      const resp = await api.get<LeadsApiResponse>('/api/v1/crm/leads')
      const byStage: Record<Stage, Lead[]> = { nouveau: [], contacte: [], negociation: [], gagne: [] }
      for (const raw of resp.leads) {
        const lead = apiLeadToLead(raw)
        const s = (STAGES as readonly string[]).includes(lead.stage) ? (lead.stage as Stage) : 'nouveau'
        byStage[s].push(lead)
      }
      setLeads(byStage)
    } catch {
      // keep empty state — API unavailable (unauthenticated demo mode)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadLeads() }, [loadLeads])

  // ── Drag & drop ──
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    let sourceStage: Stage | null = null
    let sourceIndex = -1
    const targetStage: Stage = (over.data?.current?.sortable?.containerId || over.id) as Stage

    for (const stage of STAGES) {
      const idx = leads[stage].findIndex(l => l.id === active.id)
      if (idx !== -1) { sourceStage = stage; sourceIndex = idx; break }
    }
    if (!sourceStage) return

    const lead = leads[sourceStage][sourceIndex]
    setLeads(prev => ({
      ...prev,
      [sourceStage!]: prev[sourceStage!].filter((_, i) => i !== sourceIndex),
    }))
    setLeads(prev => ({
      ...prev,
      [targetStage]: [...prev[targetStage], lead],
    }))
  }

  // ── Create lead ──
  const handleAddLead = async () => {
    if (!formData.name) return
    setSaving(true)
    try {
      const payload: LeadCreatePayload = {
        ...formData,
        estimated_value: Number(formData.estimated_value) || 0,
        score: Number(formData.score) || 50,
        phone: formData.phone || undefined,
        job_title: formData.job_title || undefined,
        source: (formData.source || undefined) as LeadCreatePayload['source'],
        notes: formData.notes || undefined,
        next_contact_at: formData.next_contact_at || undefined,
        linkedin_url: formData.linkedin_url || undefined,
        website_url: formData.website_url || undefined,
      }
      const created = await api.post<ApiLead>('/api/v1/crm/leads', payload)
      const lead = apiLeadToLead(created)
      setLeads(prev => ({ ...prev, nouveau: [...prev.nouveau, lead] }))
      setFormData(BASE_FORM)
      setActiveSection(0)
      setShowModal(false)
    } catch {
      // keep modal open on error
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteLead = (id: string) => {
    setLeads(prev => {
      const updated = { ...prev }
      for (const stage of STAGES) updated[stage] = updated[stage].filter(l => l.id !== id)
      return updated
    })
    // fire-and-forget delete
    api.delete(`/api/v1/crm/leads/${id}`).catch(() => {})
  }

  const set = (field: keyof LeadCreatePayload) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setFormData(prev => ({ ...prev, [field]: e.target.value }))

  const totalStats = {
    count: STAGES.reduce((s, st) => s + leads[st].length, 0),
    value: STAGES.reduce((s, st) => s + leads[st].reduce((a, l) => a + l.estimatedValue, 0), 0),
  }

  const SECTIONS: TranslationKey[] = [
    'crm.form.section.identity',
    'crm.form.section.professional',
    'crm.form.section.opportunity',
    'crm.form.section.followup',
  ]

  return (
    <div className="space-y-6 animate-fade-up">
      <BackButton />

      {/* Header */}
      <div className="flex items-center justify-between animate-fade-up">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.2), rgba(14,165,233,0.08))', border: '1px solid rgba(14,165,233,0.25)', boxShadow: '0 0 20px rgba(14,165,233,0.15)' }}
          >
            <Users className="w-5 h-5 text-[#0ea5e9]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white gradient-text" style={{ letterSpacing: '-0.02em' }}>CRM Pipeline</h1>
            <p className="text-[#64748b] text-sm mt-0.5">{t('crm.subtitle')}</p>
          </div>
        </div>
        <Button onClick={() => { setShowModal(true); setActiveSection(0) }} className="gap-2">
          <Plus className="w-4 h-4" />
          {t('crm.newlead.full')}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <div className="card-premium p-4">
          <p className="text-[#94a3b8] text-sm">{t('crm.leads.total')}</p>
          <p className="text-3xl font-bold text-white mt-2">{totalStats.count}</p>
        </div>
        <div className="card-premium p-4" style={{ border: '1px solid rgba(251,146,60,0.2)' }}>
          <p className="text-[#94a3b8] text-sm">{t('crm.pipeline.value')}</p>
          <p className="text-3xl font-bold text-[#fb923c] mt-2">{(totalStats.value / 1000).toFixed(0)}K €</p>
        </div>
      </div>

      {/* Kanban */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="text-sm text-[#64748b]">{t('crm.loading')}</span>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {STAGES.map(stage => (
              <Column key={stage} stage={stage} leads={leads[stage]} onDelete={handleDeleteLead} />
            ))}
          </div>
        </DndContext>
      )}

      {/* ── Create Lead Modal ── */}
      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
        >
          <div
            className="w-full max-w-lg animate-scale-in rounded-2xl flex flex-col"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(14,165,233,0.08)',
              maxHeight: '90vh',
            }}
          >
            {/* Modal header */}
            <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-white/[0.06]">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(14,165,233,0.12)', border: '1px solid rgba(14,165,233,0.2)' }}
              >
                <Users className="w-4 h-4 text-[#0ea5e9]" />
              </div>
              <h2 className="text-lg font-bold text-white flex-1">{t('crm.newlead.full')}</h2>
              <button onClick={() => setShowModal(false)} className="text-[#64748b] hover:text-white transition-colors text-xl leading-none">×</button>
            </div>

            {/* Section tabs */}
            <div className="flex border-b border-white/[0.06]">
              {SECTIONS.map((key, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSection(i as 0 | 1 | 2 | 3)}
                  className="flex-1 py-2.5 text-xs font-medium transition-colors"
                  style={activeSection === i
                    ? { color: '#38bdf8', borderBottom: '2px solid #0ea5e9' }
                    : { color: '#64748b', borderBottom: '2px solid transparent' }
                  }
                >
                  {t(key)}
                </button>
              ))}
            </div>

            {/* Section body */}
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

              {/* Section 0 — Identité */}
              {activeSection === 0 && (
                <>
                  <div>
                    <label className="text-xs font-medium text-[#94a3b8]">{t('crm.form.name')} *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={set('name')}
                      placeholder={t('crm.form.name.placeholder')}
                      className="w-full mt-1 rounded-xl px-3 py-2.5 text-[#e2e8f0] placeholder-[#475569] text-sm outline-none transition-all"
                      style={INPUT_STYLE}
                      onFocus={inputFocus} onBlur={inputBlur}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#94a3b8]">{t('common.email')}</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={set('email')}
                      placeholder="email@example.com"
                      className="w-full mt-1 rounded-xl px-3 py-2.5 text-[#e2e8f0] placeholder-[#475569] text-sm outline-none transition-all"
                      style={INPUT_STYLE}
                      onFocus={inputFocus} onBlur={inputBlur}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#94a3b8]">{t('crm.form.phone')}</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={set('phone')}
                      placeholder={t('crm.form.phone.placeholder')}
                      className="w-full mt-1 rounded-xl px-3 py-2.5 text-[#e2e8f0] placeholder-[#475569] text-sm outline-none transition-all"
                      style={INPUT_STYLE}
                      onFocus={inputFocus} onBlur={inputBlur}
                    />
                  </div>
                </>
              )}

              {/* Section 1 — Professionnel */}
              {activeSection === 1 && (
                <>
                  <div>
                    <label className="text-xs font-medium text-[#94a3b8]">{t('crm.form.company')}</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={set('company')}
                      placeholder={t('crm.form.company.placeholder')}
                      className="w-full mt-1 rounded-xl px-3 py-2.5 text-[#e2e8f0] placeholder-[#475569] text-sm outline-none transition-all"
                      style={INPUT_STYLE}
                      onFocus={inputFocus} onBlur={inputBlur}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#94a3b8]">{t('crm.form.job_title')}</label>
                    <input
                      type="text"
                      value={formData.job_title}
                      onChange={set('job_title')}
                      placeholder={t('crm.form.job_title.placeholder')}
                      className="w-full mt-1 rounded-xl px-3 py-2.5 text-[#e2e8f0] placeholder-[#475569] text-sm outline-none transition-all"
                      style={INPUT_STYLE}
                      onFocus={inputFocus} onBlur={inputBlur}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#94a3b8]">{t('crm.form.linkedin')}</label>
                    <input
                      type="url"
                      value={formData.linkedin_url}
                      onChange={set('linkedin_url')}
                      placeholder={t('crm.form.linkedin.placeholder')}
                      className="w-full mt-1 rounded-xl px-3 py-2.5 text-[#e2e8f0] placeholder-[#475569] text-sm outline-none transition-all"
                      style={INPUT_STYLE}
                      onFocus={inputFocus} onBlur={inputBlur}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#94a3b8]">{t('crm.form.website')}</label>
                    <input
                      type="url"
                      value={formData.website_url}
                      onChange={set('website_url')}
                      placeholder={t('crm.form.website.placeholder')}
                      className="w-full mt-1 rounded-xl px-3 py-2.5 text-[#e2e8f0] placeholder-[#475569] text-sm outline-none transition-all"
                      style={INPUT_STYLE}
                      onFocus={inputFocus} onBlur={inputBlur}
                    />
                  </div>
                </>
              )}

              {/* Section 2 — Opportunité */}
              {activeSection === 2 && (
                <>
                  <div>
                    <label className="text-xs font-medium text-[#94a3b8]">{t('crm.form.value')}</label>
                    <input
                      type="number"
                      value={formData.estimated_value}
                      onChange={set('estimated_value')}
                      placeholder="0"
                      className="w-full mt-1 rounded-xl px-3 py-2.5 text-[#e2e8f0] placeholder-[#475569] text-sm outline-none transition-all"
                      style={INPUT_STYLE}
                      onFocus={inputFocus} onBlur={inputBlur}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#94a3b8]">{t('crm.form.source')}</label>
                    <select
                      value={formData.source}
                      onChange={set('source')}
                      className="w-full mt-1 rounded-xl px-3 py-2.5 text-[#e2e8f0] text-sm outline-none transition-all"
                      style={{ ...INPUT_STYLE, appearance: 'none' }}
                      onFocus={inputFocus} onBlur={inputBlur}
                    >
                      <option value="">—</option>
                      <option value="linkedin">{t('crm.form.source.linkedin')}</option>
                      <option value="website">{t('crm.form.source.website')}</option>
                      <option value="referral">{t('crm.form.source.referral')}</option>
                      <option value="event">{t('crm.form.source.event')}</option>
                      <option value="other">{t('crm.form.source.other')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#94a3b8]">{t('crm.form.status')}</label>
                    <select
                      value={formData.status}
                      onChange={set('status')}
                      className="w-full mt-1 rounded-xl px-3 py-2.5 text-[#e2e8f0] text-sm outline-none transition-all"
                      style={{ ...INPUT_STYLE, appearance: 'none' }}
                      onFocus={inputFocus} onBlur={inputBlur}
                    >
                      <option value="to_contact">{t('crm.form.status.to_contact')}</option>
                      <option value="contacted">{t('crm.form.status.contacted')}</option>
                      <option value="qualified">{t('crm.form.status.qualified')}</option>
                      <option value="won">{t('crm.form.status.won')}</option>
                      <option value="lost">{t('crm.form.status.lost')}</option>
                    </select>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-[#94a3b8]">{t('crm.form.score')}</label>
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{
                          background: SCORE_COLORS[scoreLabel(Number(formData.score))].gradient,
                          color: SCORE_COLORS[scoreLabel(Number(formData.score))].text,
                          border: `1px solid ${SCORE_COLORS[scoreLabel(Number(formData.score))].border}`,
                        }}
                      >
                        {formData.score} · {t(SCORE_LABEL_KEYS[scoreLabel(Number(formData.score))])}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={formData.score}
                      onChange={set('score')}
                      className="w-full accent-[#0ea5e9]"
                    />
                    <div className="flex justify-between text-[10px] text-[#475569] mt-0.5">
                      <span>0</span><span>50</span><span>100</span>
                    </div>
                  </div>
                </>
              )}

              {/* Section 3 — Suivi */}
              {activeSection === 3 && (
                <>
                  <div>
                    <label className="text-xs font-medium text-[#94a3b8]">{t('crm.form.next_contact')}</label>
                    <input
                      type="date"
                      value={formData.next_contact_at}
                      onChange={set('next_contact_at')}
                      className="w-full mt-1 rounded-xl px-3 py-2.5 text-[#e2e8f0] text-sm outline-none transition-all"
                      style={{ ...INPUT_STYLE, colorScheme: 'dark' }}
                      onFocus={inputFocus} onBlur={inputBlur}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#94a3b8]">{t('crm.form.notes')}</label>
                    <textarea
                      value={formData.notes}
                      onChange={set('notes')}
                      placeholder={t('crm.form.notes.placeholder')}
                      rows={4}
                      className="w-full mt-1 rounded-xl px-3 py-2.5 text-[#e2e8f0] placeholder-[#475569] text-sm outline-none transition-all resize-none"
                      style={INPUT_STYLE}
                      onFocus={inputFocus} onBlur={inputBlur}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.06]">
              <div className="flex gap-1">
                {SECTIONS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveSection(i as 0 | 1 | 2 | 3)}
                    className="w-2 h-2 rounded-full transition-colors"
                    style={{ background: activeSection === i ? '#0ea5e9' : 'rgba(255,255,255,0.15)' }}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                {activeSection > 0 && (
                  <Button variant="secondary" onClick={() => setActiveSection((activeSection - 1) as 0 | 1 | 2 | 3)}>
                    ←
                  </Button>
                )}
                {activeSection < 3 ? (
                  <Button onClick={() => setActiveSection((activeSection + 1) as 0 | 1 | 2 | 3)}>
                    → {t(SECTIONS[activeSection + 1])}
                  </Button>
                ) : (
                  <Button onClick={handleAddLead} disabled={!formData.name || saving}>
                    {saving ? '…' : t('agenda.add')}
                  </Button>
                )}
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                  {t('common.cancel')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

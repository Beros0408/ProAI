'use client'

import { useState } from 'react'
import { Plus, Users, Mail, Building2, DollarSign, Calendar, Trash2, Zap } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/context'
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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/Button'

interface Lead {
  id: string
  name: string
  email: string
  company: string
  estimatedValue: number
  dateAdded: string
  score: 'hot' | 'warm' | 'cold'
}

interface LeadCardProps {
  lead: Lead
  onDelete: (id: string) => void
}

const STAGES = ['nouveau', 'contacte', 'negociation', 'gagne'] as const
type Stage = (typeof STAGES)[number]

const STAGE_LABELS: Record<Stage, string> = {
  nouveau: 'Nouveau lead',
  contacte: 'Contacté',
  negociation: 'En négociation',
  gagne: 'Gagné',
}

const STAGE_COLORS: Record<Stage, string> = {
  nouveau: 'from-blue-500 to-blue-600',
  contacte: 'from-yellow-500 to-yellow-600',
  negociation: 'from-purple-500 to-purple-600',
  gagne: 'from-green-500 to-green-600',
}

const SCORE_COLORS: Record<'hot' | 'warm' | 'cold', { bg: string; text: string; label: string }> = {
  hot: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Chaud' },
  warm: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Tiède' },
  cold: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Froid' },
}

function LeadCard({ lead, onDelete }: LeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="rounded-xl p-4 cursor-grab active:cursor-grabbing space-y-3 group transition-all duration-200 hover:-translate-y-0.5"
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.08)'
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
      }}
      style={{
        ...style,
        background: 'rgba(26,34,54,0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-[#e2e8f0] text-sm">{lead.name}</h3>
          <p className="text-[#64748b] text-xs mt-1">{lead.company}</p>
        </div>
        <button
          onClick={() => onDelete(lead.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded-lg"
        >
          <Trash2 className="w-4 h-4 text-red-400" />
        </button>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2 text-[#64748b]">
          <Mail className="w-3 h-3" />
          {lead.email}
        </div>
        <div className="flex items-center gap-2 text-[#e2e8f0] font-semibold">
          <DollarSign className="w-3 h-3 text-[#fb923c]" />
          {lead.estimatedValue.toLocaleString()} €
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${SCORE_COLORS[lead.score].bg} ${SCORE_COLORS[lead.score].text}`}>
          {SCORE_COLORS[lead.score].label}
        </span>
        <span className="text-[#64748b] text-xs">{lead.dateAdded}</span>
      </div>
    </div>
  )
}

function Column({ stage, leads, onDelete }: { stage: Stage; leads: Lead[]; onDelete: (id: string) => void }) {
  const { setNodeRef } = useSortable({
    id: stage,
    data: { type: 'Column' },
  })

  const totalValue = leads.reduce((sum, lead) => sum + lead.estimatedValue, 0)

  return (
    <div
      ref={setNodeRef}
      className="flex-1 min-w-80 rounded-2xl p-4"
      style={{
        background: 'rgba(11,18,32,0.6)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${STAGE_COLORS[stage]} shadow-lg`} />
          <h3 className="font-semibold text-[#e2e8f0] text-sm">{STAGE_LABELS[stage]}</h3>
          <span className="ml-auto text-xs px-2.5 py-1 rounded-full font-semibold"
            style={{ background: 'rgba(14,165,233,0.12)', color: '#38bdf8', border: '1px solid rgba(14,165,233,0.2)' }}>
            {leads.length}
          </span>
        </div>
        <p className="text-xs text-[#64748b]">
          Valeur: {totalValue.toLocaleString()} €
        </p>
      </div>

      <SortableContext items={leads.map((l) => l.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3 min-h-96">
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onDelete={onDelete} />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}

export default function CRMPage() {
  const { t } = useTranslation()
  const [leads, setLeads] = useState<Record<Stage, Lead[]>>({
    nouveau: [
      {
        id: '1',
        name: 'Alice Dubois',
        email: 'alice@techcorp.fr',
        company: 'TechCorp',
        estimatedValue: 50000,
        dateAdded: '2024-04-28',
        score: 'hot',
      },
      {
        id: '2',
        name: 'Bob Martin',
        email: 'bob@startup.io',
        company: 'Startup AI',
        estimatedValue: 30000,
        dateAdded: '2024-04-27',
        score: 'warm',
      },
    ],
    contacte: [
      {
        id: '3',
        name: 'Carol Johnson',
        email: 'carol@enterprise.com',
        company: 'Enterprise Co',
        estimatedValue: 100000,
        dateAdded: '2024-04-20',
        score: 'hot',
      },
    ],
    negociation: [
      {
        id: '4',
        name: 'David Lee',
        email: 'david@bigcorp.com',
        company: 'BigCorp',
        estimatedValue: 75000,
        dateAdded: '2024-04-10',
        score: 'warm',
      },
    ],
    gagne: [
      {
        id: '5',
        name: 'Emma Wilson',
        email: 'emma@success.com',
        company: 'Success Inc',
        estimatedValue: 120000,
        dateAdded: '2024-03-15',
        score: 'hot',
      },
    ],
  })

  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    estimatedValue: 0,
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    // Find which stage the active lead is in
    let sourceStage: Stage | null = null
    let sourceIndex = -1
    let targetStage: Stage = (over.data?.current?.sortable?.containerId || over.id) as Stage

    for (const stage of STAGES) {
      const index = leads[stage].findIndex((lead) => lead.id === active.id)
      if (index !== -1) {
        sourceStage = stage
        sourceIndex = index
        break
      }
    }

    if (!sourceStage) return

    const lead = leads[sourceStage][sourceIndex]

    // Remove from source
    setLeads((prev) => ({
      ...prev,
      [sourceStage]: prev[sourceStage].filter((_, idx) => idx !== sourceIndex),
    }))

    // Add to target
    setLeads((prev) => ({
      ...prev,
      [targetStage]: [...prev[targetStage], lead],
    }))
  }

  const handleAddLead = () => {
    if (!formData.name || !formData.email) return

    const newLead: Lead = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      company: formData.company,
      estimatedValue: formData.estimatedValue,
      dateAdded: new Date().toISOString().split('T')[0],
      score: 'cold',
    }

    setLeads((prev) => ({
      ...prev,
      nouveau: [...prev.nouveau, newLead],
    }))

    setFormData({ name: '', email: '', company: '', estimatedValue: 0 })
    setShowModal(false)
  }

  const handleDeleteLead = (id: string) => {
    setLeads((prev) => {
      const updated = { ...prev }
      for (const stage of STAGES) {
        updated[stage] = updated[stage].filter((lead) => lead.id !== id)
      }
      return updated
    })
  }

  const totalStats = {
    count: STAGES.reduce((sum, stage) => sum + leads[stage].length, 0),
    value: STAGES.reduce((sum, stage) => sum + leads[stage].reduce((s, l) => s + l.estimatedValue, 0), 0),
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between animate-fade-up">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.2), rgba(14,165,233,0.08))', border: '1px solid rgba(14,165,233,0.25)', boxShadow: '0 0 20px rgba(14,165,233,0.15)' }}>
            <Users className="w-5 h-5 text-[#0ea5e9]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white gradient-text">CRM Pipeline</h1>
            <p className="text-[#64748b] text-sm mt-0.5">Gérez vos leads et opportunités commerciales</p>
          </div>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          {t('crm.newlead.full')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5"
          style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.15)', boxShadow: '0 0 20px rgba(14,165,233,0.04)' }}>
          <p className="text-[#64748b] text-sm">Leads total</p>
          <p className="text-3xl font-bold text-white mt-2">{totalStats.count}</p>
        </div>
        <div className="rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5"
          style={{ background: 'rgba(251,146,60,0.06)', border: '1px solid rgba(251,146,60,0.15)', boxShadow: '0 0 20px rgba(251,146,60,0.04)' }}>
          <p className="text-[#64748b] text-sm">Valeur pipeline</p>
          <p className="text-3xl font-bold text-[#fb923c] mt-2">{(totalStats.value / 1000).toFixed(0)}K €</p>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => (
            <Column
              key={stage}
              stage={stage}
              leads={leads[stage]}
              onDelete={handleDeleteLead}
            />
          ))}
        </div>
      </DndContext>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-md space-y-4 animate-scale-in p-6 rounded-2xl"
            style={{
              background: 'rgba(17,24,39,0.95)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(14,165,233,0.08)',
            }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(14,165,233,0.12)', border: '1px solid rgba(14,165,233,0.2)' }}>
                <Users className="w-4 h-4 text-[#0ea5e9]" />
              </div>
              <h2 className="text-lg font-bold text-white">{t('crm.newlead.full')}</h2>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Nom', type: 'text', key: 'name' as const, placeholder: 'Nom complet' },
                { label: 'Email', type: 'email', key: 'email' as const, placeholder: 'email@example.com' },
                { label: 'Entreprise', type: 'text', key: 'company' as const, placeholder: "Nom de l'entreprise" },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-xs font-medium text-[#94a3b8]">{field.label}</label>
                  <input
                    type={field.type}
                    value={formData[field.key] as string}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    className="w-full mt-1 rounded-xl px-3 py-2.5 text-[#e2e8f0] placeholder-[#475569] text-sm outline-none transition-all duration-200"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                    onFocus={(e) => { e.currentTarget.style.border = '1px solid rgba(14,165,233,0.4)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.08)' }}
                    onBlur={(e) => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none' }}
                    placeholder={field.placeholder}
                  />
                </div>
              ))}
              <div>
                <label className="text-xs font-medium text-[#94a3b8]">Valeur estimée (€)</label>
                <input
                  type="number"
                  value={formData.estimatedValue}
                  onChange={(e) => setFormData({ ...formData, estimatedValue: Number(e.target.value) })}
                  className="w-full mt-1 rounded-xl px-3 py-2.5 text-[#e2e8f0] placeholder-[#475569] text-sm outline-none transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  onFocus={(e) => { e.currentTarget.style.border = '1px solid rgba(14,165,233,0.4)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.08)' }}
                  onBlur={(e) => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none' }}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleAddLead}>{t('agenda.add')}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

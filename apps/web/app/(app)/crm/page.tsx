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
      style={style}
      {...attributes}
      {...listeners}
      className="bg-surface border border-[#1E1E2E] rounded-xl p-4 cursor-grab active:cursor-grabbing hover-lift space-y-3 group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground text-sm">{lead.name}</h3>
          <p className="text-muted text-xs mt-1">{lead.company}</p>
        </div>
        <button
          onClick={() => onDelete(lead.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded"
        >
          <Trash2 className="w-4 h-4 text-red-400" />
        </button>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2 text-muted">
          <Mail className="w-3 h-3" />
          {lead.email}
        </div>
        <div className="flex items-center gap-2 text-foreground font-medium">
          <DollarSign className="w-3 h-3 text-accent" />
          {lead.estimatedValue.toLocaleString()} €
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[#1E1E2E]">
        <span className={`text-xs px-2 py-1 rounded-full ${SCORE_COLORS[lead.score].bg} ${SCORE_COLORS[lead.score].text}`}>
          {SCORE_COLORS[lead.score].label}
        </span>
        <span className="text-muted text-xs">{lead.dateAdded}</span>
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
      className="flex-1 min-w-80 bg-base rounded-xl p-4 border border-[#1E1E2E]"
    >
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${STAGE_COLORS[stage]}`} />
          <h3 className="font-semibold text-foreground">{STAGE_LABELS[stage]}</h3>
          <span className="ml-auto text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
            {leads.length}
          </span>
        </div>
        <p className="text-xs text-muted">
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
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
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
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground gradient-text">CRM Pipeline</h1>
            <p className="text-muted text-sm mt-0.5">Gérez vos leads et opportunités commerciales</p>
          </div>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Ajouter un lead
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-[#1E1E2E] rounded-xl p-4">
          <p className="text-muted text-sm">Leads total</p>
          <p className="text-3xl font-bold text-foreground mt-2">{totalStats.count}</p>
        </div>
        <div className="bg-surface border border-[#1E1E2E] rounded-xl p-4">
          <p className="text-muted text-sm">Valeur pipeline</p>
          <p className="text-3xl font-bold text-accent mt-2">{(totalStats.value / 1000).toFixed(0)}K €</p>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-surface border border-[#1E1E2E] rounded-xl p-6 w-full max-w-md space-y-4 animate-fade-up">
            <h2 className="text-xl font-bold text-foreground">Ajouter un lead</h2>

            <div className="space-y-3">
              <div>
                <label className="text-sm text-muted">Nom</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full mt-1 bg-base border border-[#1E1E2E] rounded-lg px-3 py-2 text-foreground placeholder-muted text-sm focus:border-primary focus:outline-none"
                  placeholder="Nom complet"
                />
              </div>

              <div>
                <label className="text-sm text-muted">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full mt-1 bg-base border border-[#1E1E2E] rounded-lg px-3 py-2 text-foreground placeholder-muted text-sm focus:border-primary focus:outline-none"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="text-sm text-muted">Entreprise</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full mt-1 bg-base border border-[#1E1E2E] rounded-lg px-3 py-2 text-foreground placeholder-muted text-sm focus:border-primary focus:outline-none"
                  placeholder="Nom de l'entreprise"
                />
              </div>

              <div>
                <label className="text-sm text-muted">Valeur estimée (€)</label>
                <input
                  type="number"
                  value={formData.estimatedValue}
                  onChange={(e) => setFormData({ ...formData, estimatedValue: Number(e.target.value) })}
                  className="w-full mt-1 bg-base border border-[#1E1E2E] rounded-lg px-3 py-2 text-foreground placeholder-muted text-sm focus:border-primary focus:outline-none"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Annuler
              </Button>
              <Button onClick={handleAddLead}>Ajouter</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

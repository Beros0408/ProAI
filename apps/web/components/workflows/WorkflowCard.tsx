import { Zap, Mail, MessageSquare, CheckSquare, Users, Globe, Clock, GitBranch, Trash2 } from 'lucide-react'

export type CardKind = 'trigger' | 'action'

interface StepData {
  step_type?: string
  name?: string
  description?: string
}

interface TriggerData {
  trigger_type: string
  name?: string
}

interface Props {
  kind: CardKind
  data: StepData | TriggerData
  onEdit: () => void
  onDelete?: () => void
}

const STEP_ICON: Record<string, React.ElementType> = {
  send_email:    Mail,
  send_slack:    MessageSquare,
  create_task:   CheckSquare,
  update_lead:   Users,
  linkedin_post: Globe,
  webhook_call:  Globe,
  wait:          Clock,
  condition:     GitBranch,
}

const TRIGGER_ICON: Record<string, React.ElementType> = {
  new_lead:       Users,
  webhook:        Globe,
  scheduled:      Clock,
  email_received: Mail,
  manual:         Zap,
}

const TRIGGER_LABEL: Record<string, string> = {
  new_lead:       'Nouveau lead CRM',
  webhook:        'Webhook entrant',
  scheduled:      'Planifié (cron)',
  email_received: 'Email reçu',
  manual:         'Déclenchement manuel',
}

const STEP_LABEL: Record<string, string> = {
  send_email:    'Envoyer un email',
  send_slack:    'Notifier Slack',
  create_task:   'Créer une tâche',
  update_lead:   'Mettre à jour lead',
  linkedin_post: 'Post LinkedIn',
  webhook_call:  'Appel Webhook',
  wait:          'Attendre',
  condition:     'Condition (si/sinon)',
}

export function WorkflowCard({ kind, data, onEdit, onDelete }: Props) {
  const isTrigger = kind === 'trigger'

  let Icon: React.ElementType
  let typeLabel: string
  let displayName: string

  if (isTrigger) {
    const td = data as TriggerData
    Icon = TRIGGER_ICON[td.trigger_type] ?? Zap
    typeLabel = 'DÉCLENCHEUR'
    displayName = td.name || TRIGGER_LABEL[td.trigger_type] || 'Configurer le déclencheur'
  } else {
    const sd = data as StepData
    Icon = STEP_ICON[sd.step_type ?? ''] ?? CheckSquare
    typeLabel = 'ACTION'
    displayName = sd.name || STEP_LABEL[sd.step_type ?? ''] || 'Configurer l\'action'
  }

  const accentColor  = isTrigger ? '#60a5fa' : '#2dd4bf'
  const accentBg     = isTrigger ? 'rgba(96,165,250,0.08)'  : 'rgba(45,212,191,0.08)'
  const accentBorder = isTrigger ? 'rgba(96,165,250,0.25)'  : 'rgba(45,212,191,0.25)'
  const accentBg2    = isTrigger ? 'rgba(96,165,250,0.15)'  : 'rgba(45,212,191,0.15)'

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onEdit}
      onKeyDown={(e) => e.key === 'Enter' && onEdit()}
      className="w-[260px] rounded-xl p-3 transition-all duration-200
                 hover:scale-[1.02] cursor-pointer relative group
                 focus:outline-none focus:ring-2 focus:ring-offset-2"
      style={{
        background: accentBg,
        border: `2px solid ${accentBorder}`,
        boxShadow: `0 4px 16px rgba(0,0,0,0.25)`,
      }}
    >
      {/* Delete button */}
      {!isTrigger && onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          aria-label="Supprimer l'étape"
          className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100
                     p-1 rounded-lg hover:bg-red-500/20 transition-all"
        >
          <Trash2 className="w-3 h-3 text-red-400" />
        </button>
      )}

      {/* Icon + type label row */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: accentBg2 }}
        >
          <Icon className="w-4 h-4" style={{ color: accentColor }} />
        </div>
        <span
          className="text-[9px] font-bold uppercase tracking-widest"
          style={{ color: accentColor, letterSpacing: '0.12em' }}
        >
          {typeLabel}
        </span>
      </div>

      {/* Display name */}
      <p className="text-xs font-semibold text-white leading-snug">
        {displayName}
      </p>
    </div>
  )
}

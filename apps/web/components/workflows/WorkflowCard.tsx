import { Zap, Mail, MessageSquare, CheckSquare, Users, Globe, Clock, GitBranch, X } from 'lucide-react'

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
  let displayName: string

  if (isTrigger) {
    const td = data as TriggerData
    Icon = TRIGGER_ICON[td.trigger_type] ?? Zap
    displayName = td.name || TRIGGER_LABEL[td.trigger_type] || 'Configurer le déclencheur'
  } else {
    const sd = data as StepData
    Icon = STEP_ICON[sd.step_type ?? ''] ?? CheckSquare
    displayName = sd.name || STEP_LABEL[sd.step_type ?? ''] || 'Configurer l\'action'
  }

  const accentColor  = isTrigger ? '#60a5fa' : '#2dd4bf'
  const accentBorder = isTrigger ? 'rgba(96,165,250,0.2)' : 'rgba(45,212,191,0.2)'

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onEdit}
      onKeyDown={(e) => e.key === 'Enter' && onEdit()}
      className="w-[280px] min-h-[44px] rounded-lg flex items-center gap-3 px-4 py-2.5
                 cursor-pointer transition-all duration-200
                 hover:shadow-md hover:scale-[1.02]
                 group focus:outline-none focus:ring-2 focus:ring-offset-2"
      style={{
        background:    isTrigger ? 'rgba(96,165,250,0.05)' : 'rgba(45,212,191,0.05)',
        borderTop:    `1px solid ${accentBorder}`,
        borderRight:  `1px solid ${accentBorder}`,
        borderBottom: `1px solid ${accentBorder}`,
        borderLeft:   `4px solid ${accentColor}`,
      }}
    >
      <Icon className="w-4 h-4 flex-shrink-0" style={{ color: accentColor }} />
      <span className="text-sm font-medium text-white flex-1 truncate">
        {displayName}
      </span>
      {!isTrigger && onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          aria-label="Supprimer l'étape"
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20
                     rounded-md transition-opacity"
        >
          <X className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
        </button>
      )}
    </div>
  )
}

import { cn } from '@/lib/utils'
import type { AgentType } from '@proai/types'

const AGENT_CONFIG: Record<AgentType, { label: string; emoji: string; badgeStyle: { background: string; color: string; border: string } }> = {
  general:       { label: 'Général',        emoji: '🤖', badgeStyle: { background: 'rgba(100,116,139,0.15)', color: '#94a3b8',  border: '1px solid rgba(100,116,139,0.3)' } },
  marketing:     { label: 'Marketing',      emoji: '📣', badgeStyle: { background: 'rgba(251,113,133,0.15)', color: '#fda4af',  border: '1px solid rgba(251,113,133,0.3)' } },
  sales:         { label: 'Ventes',         emoji: '💼', badgeStyle: { background: 'rgba(134,239,172,0.15)', color: '#86efac',  border: '1px solid rgba(134,239,172,0.3)' } },
  automation:    { label: 'Automatisation', emoji: '⚡', badgeStyle: { background: 'rgba(251,191,36,0.15)',  color: '#fcd34d',  border: '1px solid rgba(251,191,36,0.3)'  } },
  analytics:     { label: 'Analytics',      emoji: '📊', badgeStyle: { background: 'rgba(96,165,250,0.15)',  color: '#93c5fd',  border: '1px solid rgba(96,165,250,0.3)'  } },
  social_media:  { label: 'Social Media',   emoji: '📱', badgeStyle: { background: 'rgba(192,132,252,0.15)', color: '#d8b4fe',  border: '1px solid rgba(192,132,252,0.3)' } },
  communication: { label: 'Communication',  emoji: '💬', badgeStyle: { background: 'rgba(45,212,191,0.15)',  color: '#5eead4',  border: '1px solid rgba(45,212,191,0.3)'  } },
}

interface Props {
  agentType: AgentType
  size?: 'sm' | 'md'
}

export function AgentBadge({ agentType, size = 'sm' }: Props) {
  const config = AGENT_CONFIG[agentType]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
      )}
      style={config.badgeStyle}
    >
      <span>{config.emoji}</span>
      {config.label}
    </span>
  )
}

import { cn } from '@/lib/utils'
import type { AgentType } from '@proai/types'

const AGENT_CONFIG: Record<AgentType, { label: string; emoji: string; color: string }> = {
  general: { label: 'Général', emoji: '🤖', color: 'bg-slate-500/10 text-slate-300 border-slate-500/20' },
  marketing: { label: 'Marketing', emoji: '📣', color: 'bg-pink-500/10 text-pink-300 border-pink-500/20' },
  sales: { label: 'Ventes', emoji: '💼', color: 'bg-green-500/10 text-green-300 border-green-500/20' },
  automation: { label: 'Automatisation', emoji: '⚡', color: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20' },
  analytics: { label: 'Analytics', emoji: '📊', color: 'bg-blue-500/10 text-blue-300 border-blue-500/20' },
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
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        config.color,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
      )}
    >
      <span>{config.emoji}</span>
      {config.label}
    </span>
  )
}

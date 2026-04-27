import Link from 'next/link'
import { MessageSquarePlus } from 'lucide-react'

const AGENTS = [
  { type: 'marketing', label: 'Marketing', emoji: '📣', status: 'active', convCount: 12, lastUsed: 'Il y a 2h' },
  { type: 'sales', label: 'Ventes', emoji: '💼', status: 'active', convCount: 8, lastUsed: 'Il y a 4h' },
  { type: 'automation', label: 'Automatisation', emoji: '⚡', status: 'inactive', convCount: 3, lastUsed: 'Hier' },
  { type: 'analytics', label: 'Analytics', emoji: '📊', status: 'active', convCount: 6, lastUsed: 'Il y a 1h' },
  { type: 'general', label: 'Général', emoji: '🤖', status: 'active', convCount: 21, lastUsed: 'Il y a 30min' },
]

export function AgentStatus() {
  return (
    <div className="bg-surface border border-[#1E1E2E] rounded-xl p-5">
      <h3 className="font-semibold text-foreground text-sm mb-4">Statut des agents</h3>
      <div className="space-y-2">
        {AGENTS.map(agent => (
          <div
            key={agent.type}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#1E1E2E] transition-colors group"
          >
            <span className="text-lg shrink-0">{agent.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{agent.label}</span>
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    agent.status === 'active' ? 'bg-green-400' : 'bg-[#1E1E2E]'
                  }`}
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-muted mt-0.5">
                <span>{agent.convCount} conversations</span>
                <span>·</span>
                <span>{agent.lastUsed}</span>
              </div>
            </div>
            <Link
              href={`/chat/new?agent=${agent.type}`}
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-all"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

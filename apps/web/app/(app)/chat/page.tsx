import Link from 'next/link'
import { MessageSquarePlus, Bot } from 'lucide-react'

const AGENT_TYPES = [
  { type: 'general', label: 'Général', desc: 'Assistant polyvalent', emoji: '🤖', color: 'from-slate-500 to-slate-600' },
  { type: 'marketing', label: 'Marketing', desc: 'Contenu & campagnes', emoji: '📣', color: 'from-pink-500 to-rose-600' },
  { type: 'sales', label: 'Ventes', desc: 'Prospects & closing', emoji: '💼', color: 'from-green-500 to-emerald-600' },
  { type: 'automation', label: 'Automatisation', desc: 'Workflows & tâches', emoji: '⚡', color: 'from-yellow-500 to-orange-600' },
  { type: 'analytics', label: 'Analytics', desc: 'Données & insights', emoji: '📊', color: 'from-blue-500 to-cyan-600' },
]

export default function ChatPage() {
  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="text-center mb-10 animate-fade-up">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
          <Bot className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground gradient-text">Nouvelle conversation</h1>
        <p className="text-muted text-sm mt-2">Choisissez un agent pour commencer</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 stagger-children">
        {AGENT_TYPES.map(agent => (
          <Link
            key={agent.type}
            href={`/chat/new?agent=${agent.type}`}
            className="group flex items-center gap-4 p-4 rounded-xl bg-surface border border-[#1E1E2E] hover:border-primary/50 hover:bg-primary/5 transition-all hover-lift"
          >
            <div className={`flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${agent.color} text-xl shrink-0`}>
              {agent.emoji}
            </div>
            <div>
              <div className="font-medium text-foreground text-sm">{agent.label}</div>
              <div className="text-muted text-xs mt-0.5">{agent.desc}</div>
            </div>
            <MessageSquarePlus className="w-4 h-4 text-muted group-hover:text-primary ml-auto transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  )
}

import { CheckCircle2, Circle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const ACTIONS = [
  { id: '1', label: 'Rédiger une campagne email pour le lancement produit', agent: 'Marketing', done: true },
  { id: '2', label: 'Analyser les leads de la semaine et prioriser les 5 meilleurs', agent: 'Ventes', done: false },
  { id: '3', label: 'Générer le rapport de performance mensuel', agent: 'Analytics', done: false },
  { id: '4', label: 'Mettre à jour le script de relance clients', agent: 'Automatisation', done: false },
]

export function TodayActions() {
  const done = ACTIONS.filter(a => a.done).length
  return (
    <div className="bg-surface border border-[#1E1E2E] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground text-sm">Actions du jour</h3>
          <p className="text-xs text-muted mt-0.5">{done}/{ACTIONS.length} complétées</p>
        </div>
        <div className="w-full max-w-[80px] h-1.5 rounded-full bg-[#1E1E2E] overflow-hidden ml-4">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${(done / ACTIONS.length) * 100}%` }}
          />
        </div>
      </div>

      <ul className="space-y-2 stagger-children">
        {ACTIONS.map(action => (
          <li key={action.id} className="flex items-start gap-3 group hover-lift">
            {action.done ? (
              <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-muted mt-0.5 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${action.done ? 'line-through text-muted' : 'text-foreground'}`}>
                {action.label}
              </p>
              <span className="text-xs text-primary/70">{action.agent}</span>
            </div>
            {!action.done && (
              <Link href={`/chat/new?agent=${action.agent.toLowerCase()}`}>
                <ArrowRight className="w-3.5 h-3.5 text-muted group-hover:text-primary transition-colors shrink-0 mt-0.5" />
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

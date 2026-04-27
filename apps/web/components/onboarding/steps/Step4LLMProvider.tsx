import { cn } from '@/lib/utils'

const PROVIDERS = [
  {
    value: 'openai',
    label: 'OpenAI',
    model: 'GPT-4o',
    desc: 'Modèle le plus populaire, excellent pour la créativité et le code',
    badge: 'Recommandé',
  },
  {
    value: 'anthropic',
    label: 'Anthropic',
    model: 'Claude 3.5 Sonnet',
    desc: 'Excellent pour l\'analyse, la rédaction et les tâches complexes',
    badge: null,
  },
]

interface Props {
  data: Record<string, string>
  onChange: (key: string, value: string) => void
}

export function Step4LLMProvider({ data, onChange }: Props) {
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="text-center">
        <div className="text-5xl mb-4">🧠</div>
        <h2 className="text-xl font-bold text-foreground">Choisissez votre moteur IA</h2>
        <p className="text-muted text-sm mt-2">Vous pourrez changer à tout moment dans les paramètres</p>
      </div>

      <div className="space-y-3">
        {PROVIDERS.map(p => (
          <button
            key={p.value}
            type="button"
            onClick={() => onChange('llmProvider', p.value)}
            className={cn(
              'w-full flex items-start gap-4 px-4 py-4 rounded-xl border text-left transition-all',
              data.llmProvider === p.value
                ? 'border-primary bg-primary/10'
                : 'border-[#1E1E2E] bg-base hover:border-primary/40',
            )}
          >
            <div className="w-10 h-10 rounded-xl bg-[#1E1E2E] flex items-center justify-center shrink-0 text-lg">
              {p.value === 'openai' ? '🟢' : '🟣'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{p.label}</span>
                <span className="text-xs text-muted">· {p.model}</span>
                {p.badge && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {p.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted mt-1">{p.desc}</p>
            </div>
            {data.llmProvider === p.value && (
              <div className="mt-0.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="px-4 py-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20 text-xs text-yellow-400">
        💡 Vous aurez besoin d&apos;une clé API dans les paramètres pour activer les agents en production.
      </div>
    </div>
  )
}

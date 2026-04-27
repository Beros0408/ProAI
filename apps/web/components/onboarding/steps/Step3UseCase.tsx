import { cn } from '@/lib/utils'

const USE_CASES = [
  { value: 'marketing', emoji: '📣', label: 'Marketing', desc: 'Créer du contenu, gérer des campagnes' },
  { value: 'sales', emoji: '💼', label: 'Ventes', desc: 'Qualifier les leads, automatiser le suivi' },
  { value: 'automation', emoji: '⚡', label: 'Automatisation', desc: 'Automatiser les tâches répétitives' },
  { value: 'analytics', emoji: '📊', label: 'Analytics', desc: 'Analyser les données et créer des rapports' },
  { value: 'general', emoji: '🤖', label: 'Assistance générale', desc: 'Un assistant polyvalent pour tout' },
]

interface Props {
  data: Record<string, string>
  onChange: (key: string, value: string) => void
}

export function Step3UseCase({ data, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-5xl mb-4">🎯</div>
        <h2 className="text-xl font-bold text-foreground">Votre cas d&apos;usage principal</h2>
        <p className="text-muted text-sm mt-2">Nous configurerons votre premier agent en conséquence</p>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {USE_CASES.map(uc => (
          <button
            key={uc.value}
            type="button"
            onClick={() => onChange('useCase', uc.value)}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all',
              data.useCase === uc.value
                ? 'border-primary bg-primary/10'
                : 'border-[#1E1E2E] bg-base hover:border-primary/40',
            )}
          >
            <span className="text-xl shrink-0">{uc.emoji}</span>
            <div>
              <div className="text-sm font-medium text-foreground">{uc.label}</div>
              <div className="text-xs text-muted">{uc.desc}</div>
            </div>
            {data.useCase === uc.value && (
              <div className="ml-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

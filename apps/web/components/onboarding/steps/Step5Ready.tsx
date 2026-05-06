const USE_CASE_LABELS: Record<string, string> = {
  marketing: 'Marketing 📣',
  sales: 'Ventes 💼',
  automation: 'Automatisation ⚡',
  analytics: 'Analytics 📊',
  general: 'Assistant général 🤖',
}

const PROVIDER_LABELS: Record<string, string> = {
  openai: 'OpenAI GPT-4o',
  anthropic: 'Anthropic Claude',
}

interface Props {
  data: Record<string, string>
}

export function Step5Ready({ data }: Props) {
  return (
    <div className="space-y-6 text-center animate-fade-up">
      <div>
        <div className="text-5xl mb-4">🚀</div>
        <h2 className="text-xl font-bold text-foreground">Vous êtes prêt, {data.firstName || 'ami'} !</h2>
        <p className="text-muted text-sm mt-2">Voici un résumé de votre configuration</p>
      </div>

      <div className="bg-base border border-[#1E1E2E] rounded-xl p-4 text-left space-y-3">
        {[
          { label: 'Organisation',  value: data.orgName || '—' },
          { label: 'Secteur',       value: data.industry || '—' },
          { label: 'Cible client',  value: data.targetAudience || '—' },
          { label: "Cas d'usage",   value: USE_CASE_LABELS[data.useCase] || data.useCase || '—' },
          { label: 'Moteur IA',     value: PROVIDER_LABELS[data.llmProvider] || data.llmProvider || '—' },
        ].map(item => (
          <div key={item.label} className="flex items-center justify-between">
            <span className="text-xs text-muted">{item.label}</span>
            <span className="text-xs font-medium text-foreground">{item.value}</span>
          </div>
        ))}
      </div>

      <div className="space-y-2 text-left">
        {['Premier agent configuré automatiquement', 'Dashboard personnalisé activé', 'Prêt à automatiser votre business'].map(item => (
          <div key={item} className="flex items-center gap-2 text-sm text-foreground">
            <div className="w-5 h-5 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
              <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}

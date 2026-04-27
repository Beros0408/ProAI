interface Props {
  data: Record<string, string>
  onChange: (key: string, value: string) => void
}

export function Step1Welcome({ data, onChange }: Props) {
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="text-center">
        <div className="text-5xl mb-4">👋</div>
        <h2 className="text-xl font-bold text-foreground">Bienvenue sur ProAI</h2>
        <p className="text-muted text-sm mt-2">Commençons par faire connaissance</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Votre prénom</label>
          <input
            type="text"
            value={data.firstName ?? ''}
            onChange={e => onChange('firstName', e.target.value)}
            placeholder="Jean"
            className="w-full px-3 py-2.5 rounded-lg bg-base border border-[#1E1E2E] text-foreground placeholder-muted focus:outline-none focus:border-primary transition-colors text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Votre rôle</label>
          <select
            value={data.role ?? ''}
            onChange={e => onChange('role', e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-base border border-[#1E1E2E] text-foreground focus:outline-none focus:border-primary transition-colors text-sm"
          >
            <option value="">Sélectionner...</option>
            <option value="freelance">Freelance</option>
            <option value="entrepreneur">Entrepreneur</option>
            <option value="manager">Manager / Directeur</option>
            <option value="other">Autre</option>
          </select>
        </div>
      </div>
    </div>
  )
}

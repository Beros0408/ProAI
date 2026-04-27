interface Props {
  data: Record<string, string>
  onChange: (key: string, value: string) => void
}

export function Step2Organization({ data, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-5xl mb-4">🏢</div>
        <h2 className="text-xl font-bold text-foreground">Votre organisation</h2>
        <p className="text-muted text-sm mt-2">Ces informations personnalisent vos agents</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Nom de l&apos;organisation</label>
          <input
            type="text"
            value={data.orgName ?? ''}
            onChange={e => onChange('orgName', e.target.value)}
            placeholder="Ma Startup"
            className="w-full px-3 py-2.5 rounded-lg bg-base border border-[#1E1E2E] text-foreground placeholder-muted focus:outline-none focus:border-primary transition-colors text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Secteur d&apos;activité</label>
          <select
            value={data.industry ?? ''}
            onChange={e => onChange('industry', e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-base border border-[#1E1E2E] text-foreground focus:outline-none focus:border-primary transition-colors text-sm"
          >
            <option value="">Sélectionner...</option>
            <option value="tech">Tech / SaaS</option>
            <option value="ecommerce">E-commerce</option>
            <option value="consulting">Conseil / Consulting</option>
            <option value="agency">Agence marketing</option>
            <option value="retail">Commerce / Retail</option>
            <option value="other">Autre</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Taille de l&apos;équipe</label>
          <select
            value={data.teamSize ?? ''}
            onChange={e => onChange('teamSize', e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-base border border-[#1E1E2E] text-foreground focus:outline-none focus:border-primary transition-colors text-sm"
          >
            <option value="">Sélectionner...</option>
            <option value="solo">Solo (juste moi)</option>
            <option value="2-5">2-5 personnes</option>
            <option value="6-20">6-20 personnes</option>
            <option value="21+">21+ personnes</option>
          </select>
        </div>
      </div>
    </div>
  )
}

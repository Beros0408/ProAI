const ACTIVITIES = [
  { id: '1', emoji: '📣', text: 'Agent Marketing a généré 3 posts LinkedIn', time: '10min' },
  { id: '2', emoji: '💼', text: 'Lead qualifié ajouté au pipeline de ventes', time: '42min' },
  { id: '3', emoji: '⚡', text: 'Workflow de relance email exécuté avec succès', time: '1h' },
  { id: '4', emoji: '📊', text: 'Rapport hebdomadaire généré et envoyé', time: '2h' },
  { id: '5', emoji: '🤖', text: 'Nouvelle conversation initiée par un visiteur', time: '3h' },
  { id: '6', emoji: '📣', text: 'Campagne Google Ads analysée — ROI +12%', time: '5h' },
  { id: '7', emoji: '💼', text: 'Devis automatique créé pour un prospect', time: '6h' },
]

export function ActivityFeed() {
  return (
    <div className="bg-surface border border-[#1E1E2E] rounded-xl p-5 h-full">
      <h3 className="font-semibold text-foreground text-sm mb-4">Activité récente</h3>
      <ul className="space-y-3 stagger-children">
        {ACTIVITIES.map((item, idx) => (
          <li key={item.id} className="flex gap-3 items-start">
            <div className="relative shrink-0 flex flex-col items-center">
              <span className="text-base">{item.emoji}</span>
              {idx < ACTIVITIES.length - 1 && (
                <div className="absolute top-6 w-px h-3 bg-[#1E1E2E]" />
              )}
            </div>
            <div className="flex-1 min-w-0 pb-3">
              <p className="text-xs text-foreground leading-relaxed">{item.text}</p>
              <span className="text-[10px] text-muted mt-0.5 block">Il y a {item.time}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

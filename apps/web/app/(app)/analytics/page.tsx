'use client'
import { useRouter } from 'next/navigation'

export default function AnalyticsPage() {
  const router = useRouter()
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground gradient-text">Analytics</h1>
        <p className="text-muted mt-1">Suivez les performances de votre business</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <div className="bg-surface border border-[#1E1E2E] rounded-xl p-4 hover-lift hover-glow animate-fade-up">
          <p className="text-xs text-muted uppercase">Conversations</p>
          <p className="text-2xl font-bold text-foreground mt-1">142</p>
          <p className="text-xs text-green-400 mt-1">+12% cette semaine</p>
        </div>
        <div className="bg-surface border border-[#1E1E2E] rounded-xl p-4 hover-lift hover-glow animate-fade-up">
          <p className="text-xs text-muted uppercase">Taches auto.</p>
          <p className="text-2xl font-bold text-foreground mt-1">38</p>
          <p className="text-xs text-green-400 mt-1">+8% cette semaine</p>
        </div>
        <div className="bg-surface border border-[#1E1E2E] rounded-xl p-4 hover-lift hover-glow animate-fade-up">
          <p className="text-xs text-muted uppercase">Leads generes</p>
          <p className="text-2xl font-bold text-foreground mt-1">24</p>
          <p className="text-xs text-green-400 mt-1">+5% cette semaine</p>
        </div>
        <div className="bg-surface border border-[#1E1E2E] rounded-xl p-4 hover-lift hover-glow animate-fade-up">
          <p className="text-xs text-muted uppercase">Temps economise</p>
          <p className="text-2xl font-bold text-foreground mt-1">6h</p>
          <p className="text-xs text-green-400 mt-1">+2h cette semaine</p>
        </div>
      </div>
      <div className="bg-surface border border-[#1E1E2E] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Demandez a l IA</h2>
        <button
          onClick={() => router.push('/chat?agent=analytics')}
          className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/80 text-white text-sm transition-colors hover-lift hover-press"
        >
          Analyser mes performances avec l Agent Analytics
        </button>
      </div>
    </div>
  )
}
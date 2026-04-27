'use client'
import { useRouter } from 'next/navigation'

export default function AutomationsPage() {
  const router = useRouter()
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Automatisations</h1>
        <p className="text-muted mt-1">Configurez vos workflows automatiques</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          onClick={() => router.push('/chat?agent=automation')}
          className="bg-surface border border-[#1E1E2E] rounded-xl p-6 hover:border-primary/50 transition-colors cursor-pointer"
        >
          <span className="text-2xl">⚡</span>
          <h3 className="text-lg font-semibold text-foreground mt-3">Suivi prospects</h3>
          <p className="text-muted text-sm mt-1">Automatiser les relances apres un premier contact</p>
        </div>
        <div
          onClick={() => router.push('/chat?agent=automation')}
          className="bg-surface border border-[#1E1E2E] rounded-xl p-6 hover:border-primary/50 transition-colors cursor-pointer"
        >
          <span className="text-2xl">📧</span>
          <h3 className="text-lg font-semibold text-foreground mt-3">Emails automatiques</h3>
          <p className="text-muted text-sm mt-1">Sequences email de nurturing et relance</p>
        </div>
        <div
          onClick={() => router.push('/chat?agent=automation')}
          className="bg-surface border border-[#1E1E2E] rounded-xl p-6 hover:border-primary/50 transition-colors cursor-pointer"
        >
          <span className="text-2xl">🔄</span>
          <h3 className="text-lg font-semibold text-foreground mt-3">Workflows CRM</h3>
          <p className="text-muted text-sm mt-1">Connecter et automatiser votre pipeline</p>
        </div>
        <div
          onClick={() => router.push('/chat?agent=automation')}
          className="bg-surface border border-[#1E1E2E] rounded-xl p-6 hover:border-primary/50 transition-colors cursor-pointer"
        >
          <span className="text-2xl">📊</span>
          <h3 className="text-lg font-semibold text-foreground mt-3">Rapports auto</h3>
          <p className="text-muted text-sm mt-1">Generer et envoyer des rapports periodiques</p>
        </div>
      </div>
    </div>
  )
}
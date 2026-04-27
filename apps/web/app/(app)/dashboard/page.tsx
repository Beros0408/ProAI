import { TodayActions } from '@/components/dashboard/TodayActions'
import { AgentStatus } from '@/components/dashboard/AgentStatus'
import { KPICard } from '@/components/dashboard/KPICard'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { MessageSquare, Zap, TrendingUp, Clock } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="animate-fade-up">
        <h1 className="text-2xl font-bold text-foreground gradient-text">Tableau de bord</h1>
        <p className="text-muted text-sm mt-1">Vue d&apos;ensemble de vos agents IA</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <KPICard title="Conversations" value="142" delta="+12%" icon={MessageSquare} />
        <KPICard title="Tâches auto." value="38" delta="+8%" icon={Zap} />
        <KPICard title="Leads générés" value="24" delta="+5%" icon={TrendingUp} />
        <KPICard title="Temps économisé" value="6h" delta="+2h" icon={Clock} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <TodayActions />
          <AgentStatus />
        </div>
        <div>
          <ActivityFeed />
        </div>
      </div>
    </div>
  )
}

'use client'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/lib/i18n/context'
import { RevenueChart } from '@/components/charts/RevenueChart'
import { EngagementChart } from '@/components/charts/EngagementChart'
import { ConversionFunnel } from '@/components/charts/ConversionFunnel'

export default function AnalyticsPage() {
  const router = useRouter()
  const { t } = useTranslation()
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground gradient-text">{t('analytics')}</h1>
        <p className="text-muted mt-1">{t('analytics_description')}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <div className="bg-surface border border-[#1E1E2E] rounded-xl p-4 hover-lift hover-glow animate-fade-up">
          <p className="text-xs text-muted uppercase">{t('conversations')}</p>
          <p className="text-2xl font-bold text-foreground mt-1">142</p>
          <p className="text-xs text-green-400 mt-1">+12% cette semaine</p>
        </div>
        <div className="bg-surface border border-[#1E1E2E] rounded-xl p-4 hover-lift hover-glow animate-fade-up">
          <p className="text-xs text-muted uppercase">{t('auto_tasks')}</p>
          <p className="text-2xl font-bold text-foreground mt-1">38</p>
          <p className="text-xs text-green-400 mt-1">+8% cette semaine</p>
        </div>
        <div className="bg-surface border border-[#1E1E2E] rounded-xl p-4 hover-lift hover-glow animate-fade-up">
          <p className="text-xs text-muted uppercase">{t('generated_leads')}</p>
          <p className="text-2xl font-bold text-foreground mt-1">24</p>
          <p className="text-xs text-green-400 mt-1">+5% cette semaine</p>
        </div>
        <div className="bg-surface border border-[#1E1E2E] rounded-xl p-4 hover-lift hover-glow animate-fade-up">
          <p className="text-xs text-muted uppercase">{t('time_saved')}</p>
          <p className="text-2xl font-bold text-foreground mt-1">6h</p>
          <p className="text-xs text-green-400 mt-1">+2h cette semaine</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart />
        <EngagementChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConversionFunnel />
        <div className="bg-surface border border-[#1E1E2E] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">{t('ask_ai')}</h2>
          <button
            onClick={() => router.push('/chat?agent=analytics')}
            className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/80 text-white text-sm transition-colors hover-lift hover-press"
          >
            {t('analyze_performance_with_agent')}
          </button>
        </div>
      </div>
    </div>
  )
}
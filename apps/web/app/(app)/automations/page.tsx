'use client'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/lib/i18n/context'

export default function AutomationsPage() {
  const { t } = useTranslation()
  const router = useRouter()
  return (
    <div className="p-6 space-y-6 animate-fade-in stagger-children">
      <div className="animate-fade-up">
        <h1 className="text-2xl font-bold text-foreground gradient-text">{t('automations')}</h1>
        <p className="text-muted mt-1">{t('configure_your_workflows')}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
        <div
          onClick={() => router.push('/chat?agent=automation')}
          className="bg-surface border border-[#1E1E2E] rounded-xl p-6 hover:border-primary/50 transition-colors cursor-pointer hover-lift hover-glow animate-fade-up"
        >
          <span className="text-2xl">⚡</span>
          <h3 className="text-lg font-semibold text-foreground mt-3">{t('prospect_tracking')}</h3>
          <p className="text-muted text-sm mt-1">{t('prospect_tracking_description')}</p>
        </div>
        <div
          onClick={() => router.push('/chat?agent=automation')}
          className="bg-surface border border-[#1E1E2E] rounded-xl p-6 hover:border-primary/50 transition-colors cursor-pointer hover-lift hover-glow animate-fade-up"
        >
          <span className="text-2xl">📧</span>
          <h3 className="text-lg font-semibold text-foreground mt-3">{t('auto_emails')}</h3>
          <p className="text-muted text-sm mt-1">{t('auto_emails_description')}</p>
        </div>
        <div
          onClick={() => router.push('/chat?agent=automation')}
          className="bg-surface border border-[#1E1E2E] rounded-xl p-6 hover:border-primary/50 transition-colors cursor-pointer hover-lift hover-glow animate-fade-up"
        >
          <span className="text-2xl">🔄</span>
          <h3 className="text-lg font-semibold text-foreground mt-3">{t('crm_workflows')}</h3>
          <p className="text-muted text-sm mt-1">{t('crm_workflows_description')}</p>
        </div>
        <div
          onClick={() => router.push('/chat?agent=automation')}
          className="bg-surface border border-[#1E1E2E] rounded-xl p-6 hover:border-primary/50 transition-colors cursor-pointer hover-lift hover-glow animate-fade-up"
        >
          <h3 className="text-lg font-semibold text-foreground mt-3">{t('auto_reports')}</h3>
          <p className="text-muted text-sm mt-1">{t('auto_reports_description')}</p>
        </div>
      </div>
    </div>
  )
}
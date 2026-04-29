'use client'

import type { ComponentType } from 'react'
import { motion } from 'framer-motion'
import { Mail, MessageSquare, Calendar, FileText, Share2, Database, Bot, Workflow } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n/context'
import type { TranslationKey } from '@/lib/i18n/translations'

const INTEGRATIONS: Array<{ name: string; icon: React.ComponentType<{ className?: string }>; descriptionKey: TranslationKey; connected: boolean }> = [
  {
    name: 'Gmail',
    icon: Mail,
    descriptionKey: 'integration_gmail_description',
    connected: false,
  },
  {
    name: 'LinkedIn',
    icon: Share2,
    descriptionKey: 'integration_linkedin_description',
    connected: false,
  },
  {
    name: 'Slack',
    icon: MessageSquare,
    descriptionKey: 'integration_slack_description',
    connected: false,
  },
  {
    name: 'Instagram',
    icon: () => <span className="text-2xl">📷</span>,
    descriptionKey: 'integration_instagram_description',
    connected: false,
  },
  {
    name: 'Facebook',
    icon: () => <span className="text-2xl">📘</span>,
    descriptionKey: 'integration_facebook_description',
    connected: false,
  },
  {
    name: 'Notion',
    icon: () => <span className="text-2xl">📝</span>,
    descriptionKey: 'integration_notion_description',
    connected: false,
  },
  {
    name: 'Google Calendar',
    icon: Calendar,
    descriptionKey: 'integration_google_calendar_description',
    connected: false,
  },
  {
    name: 'Google Sheets',
    icon: FileText,
    descriptionKey: 'integration_google_sheets_description',
    connected: false,
  },
  {
    name: 'n8n',
    icon: Workflow,
    descriptionKey: 'integration_n8n_description',
    connected: false,
  },
  {
    name: 'Make',
    icon: Bot,
    descriptionKey: 'integration_make_description',
    connected: false,
  },
]

export default function IntegrationsPage() {
  const { t } = useTranslation()

  const handleConnect = (integration: string) => {
    alert(`${t('connect_action')} ${integration} - ${t('coming_soon')}`)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="animate-fade-up">
        <h1 className="text-2xl font-bold text-foreground gradient-text">{t('integrations')}</h1>
        <p className="text-muted text-sm mt-1">{t('integrations_description')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {INTEGRATIONS.map((integration, index) => {
          const IconComponent = integration.icon
          return (
            <motion.div
              key={integration.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-surface border border-[#1E1E2E] rounded-xl p-6 hover-lift hover-glow group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <IconComponent className="w-6 h-6 text-primary" />
                </div>
                <span className={cn(
                  "px-2 py-1 text-xs rounded-full font-medium",
                  integration.connected
                    ? "bg-green-500/20 text-green-400"
                    : "bg-gray-500/20 text-gray-400"
                )}>
                  {integration.connected ? t('connected') : t('not_connected')}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-foreground mb-2">{integration.name}</h3>
              <p className="text-muted text-sm mb-4">{t(integration.descriptionKey as any)}</p>

              <button
                onClick={() => handleConnect(integration.name)}
                className={cn(
                  "w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  integration.connected
                    ? "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                    : "bg-primary hover:bg-primary/80 text-white"
                )}
              >
                {integration.connected ? 'Déconnecter' : 'Connecter'}
              </button>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
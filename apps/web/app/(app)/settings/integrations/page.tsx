'use client'

import Image from 'next/image'
import { useTranslation } from '@/lib/i18n/context'
import type { TranslationKey } from '@/lib/i18n/translations'
import { BackButton } from '@/components/ui/BackButton'
import {
  GmailIcon, LinkedInIcon, SlackIcon, InstagramIcon, FacebookIcon,
  NotionIcon, GoogleCalendarIcon, GoogleSheetsIcon, MakeIcon,
} from '@/components/icons/BrandIcons'

type Integration = {
  name: string
  icon: React.ReactNode
  descriptionKey: TranslationKey
  connected: boolean
  glowColor: string
}

const INTEGRATIONS: Integration[] = [
  { name: 'Gmail',            icon: <GmailIcon size={28} />,           descriptionKey: 'integration_gmail_description',             connected: false, glowColor: '#EA4335' },
  { name: 'LinkedIn',         icon: <LinkedInIcon size={28} />,        descriptionKey: 'integration_linkedin_description',          connected: false, glowColor: '#0A66C2' },
  { name: 'Slack',            icon: <SlackIcon size={28} />,           descriptionKey: 'integration_slack_description',             connected: false, glowColor: '#E01E5A' },
  { name: 'Instagram',        icon: <InstagramIcon size={28} />,       descriptionKey: 'integration_instagram_description',         connected: false, glowColor: '#D6249F' },
  { name: 'Facebook',         icon: <FacebookIcon size={28} />,        descriptionKey: 'integration_facebook_description',          connected: false, glowColor: '#1877F2' },
  { name: 'Notion',           icon: <NotionIcon size={28} />,          descriptionKey: 'integration_notion_description',            connected: false, glowColor: '#94a3b8' },
  { name: 'Google Calendar',  icon: <GoogleCalendarIcon size={28} />,  descriptionKey: 'integration_google_calendar_description',   connected: false, glowColor: '#4285F4' },
  { name: 'Google Sheets',    icon: <GoogleSheetsIcon size={28} />,    descriptionKey: 'integration_google_sheets_description',     connected: false, glowColor: '#34A853' },
  { name: 'n8n',              icon: <Image src="/integrations/n8n-icon.svg" alt="n8n" width={48} height={20} unoptimized className="integration-icon" />, descriptionKey: 'integration_n8n_description',               connected: false, glowColor: '#EA4B71' },
  { name: 'Make',             icon: <MakeIcon size={28} />,            descriptionKey: 'integration_make_description',              connected: false, glowColor: '#6E3FC9' },
]

export default function IntegrationsPage() {
  const { t } = useTranslation()

  const handleConnect = (name: string) => {
    alert(`${t('connect_action')} ${name} — ${t('coming_soon')}`)
  }

  return (
    <div className="space-y-6 animate-fade-in p-6 lg:p-10">
      <BackButton />
      <div className="animate-fade-up">
        <h1 className="text-2xl font-bold text-white" style={{ letterSpacing: '-0.02em' }}>{t('integrations')}</h1>
        <p className="mt-1 text-sm text-slate-400">{t('integrations_description')}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {INTEGRATIONS.map((item, i) => (
          <div
            key={item.name}
            className="group flex cursor-pointer flex-col rounded-2xl p-6 transition-all duration-300 animate-fade-up"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              animationDelay: `${i * 60}ms`,
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLDivElement
              el.style.transform = 'translateY(-4px)'
              el.style.boxShadow = `0 12px 40px rgba(0,0,0,0.2), 0 0 0 1px ${item.glowColor}25`
              el.style.borderColor = `${item.glowColor}40`
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLDivElement
              el.style.transform = ''
              el.style.boxShadow = ''
              el.style.borderColor = 'var(--border-color)'
            }}
          >
            {/* Header row */}
            <div className="mb-4 flex items-center justify-between">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl transition-colors duration-300"
                style={{ background: 'var(--bg-elevated)' }}
              >
                {item.icon}
              </div>
              <span
                className="rounded-full px-2.5 py-1 text-xs font-medium"
                style={item.connected
                  ? { background: 'rgba(52,211,153,0.15)', color: '#34d399' }
                  : { background: 'rgba(100,116,139,0.15)', color: '#64748b' }
                }
              >
                {item.connected ? t('settings.connected') : t('settings.notconnected')}
              </span>
            </div>

            {/* Name + description */}
            <h3 className="mb-1.5 text-base font-semibold text-white">{item.name}</h3>
            <p className="mb-5 flex-1 text-sm leading-relaxed text-slate-500">{t(item.descriptionKey)}</p>

            {/* CTA button */}
            <button
              onClick={() => handleConnect(item.name)}
              className="w-full rounded-xl py-2.5 text-sm font-semibold transition-all duration-200"
              style={item.connected
                ? { background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }
                : { background: `${item.glowColor}18`, color: item.glowColor, border: `1px solid ${item.glowColor}30` }
              }
              onMouseEnter={(e) => {
                if (!item.connected) {
                  (e.currentTarget as HTMLButtonElement).style.background = `${item.glowColor}28`
                }
              }}
              onMouseLeave={(e) => {
                if (!item.connected) {
                  (e.currentTarget as HTMLButtonElement).style.background = `${item.glowColor}18`
                }
              }}
            >
              {item.connected ? t('settings.disconnect') : t('settings.connect')}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

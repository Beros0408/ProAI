'use client'

import { useState } from 'react'
import { useTranslation } from '@/lib/i18n/context'

type Props = {
  name: string
  icon: React.ReactNode
  glowColor: string
  description?: string
}

export function IntegrationComingSoonCard({ name, icon, glowColor, description }: Props) {
  const { t } = useTranslation()
  const [notified, setNotified] = useState(false)

  return (
    <div
      className="flex flex-col rounded-2xl p-5 transition-all duration-200"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        opacity: 0.75,
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.opacity = '1'
        el.style.borderColor = `${glowColor}30`
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.opacity = '0.75'
        el.style.borderColor = 'var(--border-color)'
      }}
    >
      <div className="mb-3 flex items-center justify-between">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl"
          style={{ background: 'var(--bg-elevated)' }}
        >
          {icon}
        </div>
        <span
          className="rounded-full px-2.5 py-1 text-xs font-medium"
          style={{ background: 'rgba(99,102,241,0.1)', color: '#6366F1' }}
        >
          {t('webhook.coming_soon_badge')}
        </span>
      </div>

      <h3 className="mb-1 text-sm font-semibold text-white">{name}</h3>
      {description && <p className="mb-4 flex-1 text-xs leading-relaxed text-slate-500">{description}</p>}

      <button
        onClick={() => setNotified(true)}
        disabled={notified}
        className="mt-auto w-full rounded-xl py-2 text-xs font-semibold transition-all disabled:opacity-60"
        style={
          notified
            ? { background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }
            : { background: `${glowColor}12`, color: glowColor, border: `1px solid ${glowColor}25` }
        }
      >
        {notified ? `✓ ${t('webhook.notified')}` : t('webhook.notify_me')}
      </button>
    </div>
  )
}

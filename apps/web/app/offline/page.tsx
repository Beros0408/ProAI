'use client'

import { useTranslation } from '@/lib/i18n/context'
import { WifiOff, RefreshCw } from 'lucide-react'

export default function OfflinePage() {
  const { t } = useTranslation()

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 50% 35% at 50% 45%, rgba(251,146,60,0.05) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
        {/* Icon */}
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mb-8"
          style={{
            background: 'rgba(251,146,60,0.1)',
            border: '1px solid rgba(251,146,60,0.2)',
            boxShadow: '0 0 40px rgba(251,146,60,0.08)',
          }}
        >
          <WifiOff size={36} style={{ color: '#fb923c' }} />
        </div>

        <h1
          className="text-2xl font-bold mb-3"
          style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
        >
          {t('pwa.offline.title')}
        </h1>
        <p
          className="text-sm mb-8 leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          {t('pwa.offline.subtitle')}
        </p>

        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
          style={{
            background: 'rgba(251,146,60,0.1)',
            border: '1px solid rgba(251,146,60,0.2)',
            color: '#fb923c',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(251,146,60,0.18)'
            e.currentTarget.style.borderColor = 'rgba(251,146,60,0.4)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(251,146,60,0.1)'
            e.currentTarget.style.borderColor = 'rgba(251,146,60,0.2)'
          }}
        >
          <RefreshCw size={15} />
          {t('pwa.offline.retry')}
        </button>
      </div>
    </div>
  )
}

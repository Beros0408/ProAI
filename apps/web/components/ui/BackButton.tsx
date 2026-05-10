'use client'

import { useRouter } from 'next/navigation'
import { useTranslation } from '@/lib/i18n/context'

interface BackButtonProps {
  href?: string
}

export function BackButton({ href }: BackButtonProps = {}) {
  const router = useRouter()
  const { t } = useTranslation()

  function handleClick() {
    if (href) router.push(href)
    else router.back()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200"
      style={{ color: '#94a3b8' }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#e2e8f0'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="15 18 9 12 15 6" />
      </svg>
      {t('common.back')}
    </button>
  )
}

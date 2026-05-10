'use client'

import { useRouter } from 'next/navigation'
import { useTranslation } from '@/lib/i18n/context'
import { ChevronLeft } from 'lucide-react'

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
      className="inline-flex items-center gap-1.5 text-sm font-medium rounded-lg px-2.5 py-1 mb-4 transition-all duration-200"
      style={{ color: 'var(--text-secondary)' }}
      onMouseEnter={e => {
        e.currentTarget.style.color = 'var(--text-primary)'
        e.currentTarget.style.background = 'var(--bg-elevated)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.color = 'var(--text-secondary)'
        e.currentTarget.style.background = 'transparent'
      }}
    >
      <ChevronLeft size={16} />
      {t('common.back')}
    </button>
  )
}

'use client'

import { useRouter } from 'next/navigation'
import { useTranslation } from '@/lib/i18n/context'
import { Home, Search, ChevronLeft } from 'lucide-react'

export default function NotFound() {
  const router = useRouter()
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
          background: 'radial-gradient(ellipse 60% 40% at 50% 40%, rgba(14,165,233,0.06) 0%, transparent 70%)',
        }}
      />

      {/* Floating 404 */}
      <div className="relative mb-8 select-none">
        <span
          className="text-[160px] font-black leading-none tracking-tighter"
          style={{
            background: 'linear-gradient(135deg, var(--text-secondary) 0%, var(--text-muted) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            opacity: 0.18,
            filter: 'blur(0.5px)',
          }}
        >
          404
        </span>
        <div
          className="absolute inset-0 flex items-center justify-center"
        >
          <span
            className="text-[80px] font-black leading-none tracking-tighter gradient-text"
          >
            404
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-md">
        <h1
          className="text-2xl font-bold mb-3"
          style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
        >
          {t('error.404.title')}
        </h1>
        <p
          className="text-sm mb-8 leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          {t('error.404.subtitle')}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {/* Back to home */}
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 btn-premium"
          >
            <Home size={15} />
            {t('error.404.home')}
          </button>

          {/* Previous page */}
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
            style={{
              color: 'var(--text-secondary)',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-color)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--text-primary)'
              e.currentTarget.style.borderColor = 'var(--nav-indicator)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--text-secondary)'
              e.currentTarget.style.borderColor = 'var(--border-color)'
            }}
          >
            <ChevronLeft size={15} />
            {t('error.404.back')}
          </button>

          {/* Search */}
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
            style={{
              color: 'var(--text-muted)',
              background: 'transparent',
              border: '1px solid var(--border-subtle)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--text-secondary)'
              e.currentTarget.style.borderColor = 'var(--border-color)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--text-muted)'
              e.currentTarget.style.borderColor = 'var(--border-subtle)'
            }}
          >
            <Search size={15} />
            {t('error.404.search')}
          </button>
        </div>
      </div>
    </div>
  )
}

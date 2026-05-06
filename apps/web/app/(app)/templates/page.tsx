'use client'

import type { TranslationKey } from '@/lib/i18n/translations'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/lib/i18n/context'

type TemplateCard = {
  key: string
  title: TranslationKey
  description: TranslationKey
}

const templates: TemplateCard[] = [
  {
    key: 'launch_product',
    title: 'launch_product',
    description: 'launch_product_description',
  },
  {
    key: 'article_summary',
    title: 'article_summary',
    description: 'article_summary_description',
  },
  {
    key: 'linkedin_post_template',
    title: 'linkedin_post_template',
    description: 'linkedin_post_template_description',
  },
  {
    key: 'follow_up_email',
    title: 'follow_up_email',
    description: 'follow_up_email_description',
  },
]

export default function TemplatesPage() {
  const router = useRouter()
  const { t } = useTranslation()

  return (
    <div className="space-y-8 p-6 lg:p-10">
      <div className="rounded-2xl p-8"
        style={{ background: 'rgba(17,24,39,0.7)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white gradient-text">{t('templates_page_title')}</h1>
            <p className="mt-2 text-[#64748b]">{t('templates_page_description')}</p>
          </div>
          <Button onClick={() => router.push('/content')} variant="secondary">
            {t('templates_cta')}
          </Button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {templates.map((template, i) => {
          const colors = ['#0ea5e9', '#fb923c', '#8b5cf6', '#34d399']
          const color = colors[i % colors.length]
          return (
            <article key={template.key}
              className="rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden"
              style={{ background: 'rgba(17,24,39,0.7)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.07)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.border = `1px solid ${color}30`
                ;(e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${color}12`
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.border = '1px solid rgba(255,255,255,0.07)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl"
                style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
              <h2 className="text-base font-semibold text-white">{t(template.title)}</h2>
              <p className="mt-3 text-sm text-[#64748b] leading-relaxed">{t(template.description)}</p>
              <div className="mt-5 flex justify-end">
                <Button variant="secondary" onClick={() => router.push('/content')}>{t('use')}</Button>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}

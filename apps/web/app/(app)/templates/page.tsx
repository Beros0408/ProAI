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
      <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-8 shadow-xl shadow-slate-950/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white">{t('templates_page_title')}</h1>
            <p className="mt-2 text-slate-400">{t('templates_page_description')}</p>
          </div>
          <Button onClick={() => router.push('/content')} variant="secondary">
            {t('templates_cta')}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {templates.map((template) => (
          <article key={template.key} className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-sm shadow-slate-950/10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">{t(template.title)}</h2>
              </div>
            </div>
            <p className="mt-4 text-slate-400">{t(template.description)}</p>
            <div className="mt-6 flex justify-end">
              <Button variant="secondary" onClick={() => router.push('/content')}>{t('use')}</Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

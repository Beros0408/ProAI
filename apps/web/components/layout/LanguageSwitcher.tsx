'use client';

import { useTranslation } from '@/lib/i18n/context'

const locales = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
];

export function LanguageSwitcher() {
  const { locale, switchLanguage, t } = useTranslation()

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="locale" className="text-sm text-slate-400">
        {t('language')}
      </label>
      <select
        id="locale"
        value={locale}
        onChange={(event) => switchLanguage(event.target.value as 'fr' | 'en')}
        className="rounded-md border border-default bg-base px-3 py-1 text-sm text-foreground transition focus:border-sky-500 focus:outline-none"
      >
        {locales.map((localeOption) => (
          <option key={localeOption.code} value={localeOption.code}>
            {localeOption.label}
          </option>
        ))}
      </select>
    </div>
  )
}

'use client';

const locales = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
];

export function LanguageSwitcher() {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="locale" className="text-sm text-slate-400">
        Language
      </label>
      <select
        id="locale"
        defaultValue="fr"
        onChange={(event) => {
          // TODO: Implement language switch
        }}
        className="rounded-md border border-slate-700 bg-slate-950 px-3 py-1 text-sm text-white transition focus:border-sky-500 focus:outline-none"
      >
        {locales.map((locale) => (
          <option key={locale.code} value={locale.code}>
            {locale.label}
          </option>
        ))}
      </select>
    </div>
  );
}

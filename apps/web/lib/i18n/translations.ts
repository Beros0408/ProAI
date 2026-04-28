export const translations = {
  fr: {
    dashboard: 'Tableau de bord',
    chat: 'Chat',
    automations: 'Automatisations',
    analytics: 'Analytics',
    content: 'Contenu IA',
    analyze: 'Analyseur',
    templates: 'Templates',
    mindmap: 'Mind Map',
    settings: 'Paramètres',
    my_space: 'Mon espace',
    free_plan: 'Plan Free',
  },
  en: {
    dashboard: 'Dashboard',
    chat: 'Chat',
    automations: 'Automations',
    analytics: 'Analytics',
    content: 'AI Content',
    analyze: 'Analyzer',
    templates: 'Templates',
    mindmap: 'Mind Map',
    settings: 'Settings',
    my_space: 'My Space',
    free_plan: 'Free Plan',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

# Script Python pour creer le fichier de traductions complet FR/EN
import os

TARGET = os.path.join(
    "C:", os.sep, "Users", "bkabe", "Desktop", "Porjet - ProAI",
    "ProAI", "apps", "web", "lib", "i18n", "translations.ts"
)
os.makedirs(os.path.dirname(TARGET), exist_ok=True)

CODE = """\
export const translations = {
  fr: {
    // Navigation
    'nav.dashboard': 'Tableau de bord',
    'nav.chat': 'Chat',
    'nav.automations': 'Automatisations',
    'nav.analytics': 'Analytics',
    'nav.content': 'Contenu IA',
    'nav.analyze': 'Analyseur',
    'nav.templates': 'Templates',
    'nav.mindmap': 'Mind Map',
    'nav.crm': 'CRM',
    'nav.workflows': 'Workflows',
    'nav.schedule': 'Calendrier',
    'nav.agenda': 'Agenda',
    'nav.reports': 'Rapports',
    'nav.predictions': 'Pr\\u00e9dictions',
    'nav.settings': 'Param\\u00e8tres',
    'nav.integrations': 'Int\\u00e9grations',
    'nav.pricing': 'Tarifs',
    'nav.myspace': 'Mon espace',
    'nav.freeplan': 'Plan Free',

    // Dashboard
    'dashboard.title': 'Tableau de bord',
    'dashboard.subtitle': "Vue d'ensemble de vos agents IA",
    'dashboard.conversations': 'Conversations',
    'dashboard.autotasks': 'T\\u00e2ches auto.',
    'dashboard.leads': 'Leads g\\u00e9n\\u00e9r\\u00e9s',
    'dashboard.timesaved': 'Temps \\u00e9conomis\\u00e9',
    'dashboard.todayactions': "Actions du jour",
    'dashboard.recentactivity': 'Activit\\u00e9 r\\u00e9cente',
    'dashboard.agentstatus': 'Statut des agents',
    'dashboard.quickactions': 'Actions rapides',
    'dashboard.newlead': 'Nouveau lead',
    'dashboard.createworkflow': 'Cr\\u00e9er workflow',
    'dashboard.planpost': 'Planifier post',
    'dashboard.generatecontent': 'G\\u00e9n\\u00e9rer contenu',
    'dashboard.viewpredictions': 'Voir pr\\u00e9dictions',
    'dashboard.weeklyreport': 'Rapport hebdo',

    // Chat
    'chat.title': 'Chat IA',
    'chat.placeholder': 'Tapez votre message...',
    'chat.send': 'Envoyer',
    'chat.selectagent': 'Choisissez un agent',
    'chat.marketing': 'Marketing',
    'chat.sales': 'Ventes',
    'chat.socialmedia': 'R\\u00e9seaux sociaux',
    'chat.communication': 'Communication',
    'chat.automation': 'Automatisation',
    'chat.analytics': 'Analytics',

    // Content
    'content.title': 'Contenu IA',
    'content.subtitle': 'G\\u00e9n\\u00e9rez du contenu pour toutes vos plateformes',
    'content.linkedin': 'LinkedIn',
    'content.newsletter': 'Newsletter',
    'content.email': 'Email',
    'content.instagram': 'Instagram',
    'content.facebook': 'Facebook',
    'content.twitter': 'Twitter/X',
    'content.blog': 'Blog SEO',
    'content.videoscript': 'Script vid\\u00e9o',
    'content.generate': 'G\\u00e9n\\u00e9rer',
    'content.copy': 'Copier',
    'content.download': 'T\\u00e9l\\u00e9charger',
    'content.regenerate': 'R\\u00e9g\\u00e9n\\u00e9rer',
    'content.topic': 'Sujet',
    'content.tone': 'Ton',
    'content.language': 'Langue',
    'content.professional': 'Professionnel',
    'content.casual': 'D\\u00e9contract\\u00e9',
    'content.inspirational': 'Inspirant',

    // Analyze
    'analyze.title': 'Analyseur de site web',
    'analyze.subtitle': 'Collez une URL pour obtenir un audit SEO et UX complet',
    'analyze.placeholder': 'Entrez une URL...',
    'analyze.button': 'Analyser',
    'analyze.recommendations': 'Recommandations',
    'analyze.score': 'Score global',

    // Templates
    'templates.title': 'Templates de strat\\u00e9gie',
    'templates.subtitle': 'Plans business pr\\u00eats \\u00e0 utiliser',
    'templates.use': 'Utiliser',
    'templates.marketing': 'Marketing',
    'templates.sales': 'Ventes',
    'templates.growth': 'Croissance',
    'templates.automation': 'Automatisation',
    'templates.all': 'Tous',

    // Mind Map
    'mindmap.title': 'Mind Map',
    'mindmap.subtitle': 'Transformez vos id\\u00e9es en carte visuelle',
    'mindmap.placeholder': 'D\\u00e9crivez votre id\\u00e9e...',
    'mindmap.generate': 'G\\u00e9n\\u00e9rer la mind map',

    // CRM
    'crm.title': 'CRM',
    'crm.subtitle': 'G\\u00e9rez votre pipeline de ventes',
    'crm.newlead': 'Nouveau lead',
    'crm.newlead.full': 'Ajouter un lead',
    'crm.stage.new': 'Nouveau',
    'crm.stage.contacted': 'Contact\\u00e9',
    'crm.stage.negotiation': 'N\\u00e9gociation',
    'crm.stage.won': 'Gagn\\u00e9',

    // Workflows
    'workflows.title': 'Workflows',
    'workflows.subtitle': 'Cr\\u00e9ez vos automatisations',
    'workflows.empty': 'Cr\\u00e9ez votre premier workflow',
    'workflows.emptydesc': 'Glissez un \\u00e9l\\u00e9ment depuis le panneau pour commencer',
    'workflows.start': 'Commencer',
    'workflows.save': 'Sauvegarder',
    'workflows.activate': 'Activer le workflow',
    'workflows.triggers': 'Triggers',
    'workflows.conditions': 'Conditions',
    'workflows.actions': 'Actions',

    // Schedule
    'schedule.title': 'Calendrier de publication',
    'schedule.subtitle': 'Planifiez vos posts sur tous les r\\u00e9seaux',
    'schedule.newpost': 'Nouveau post',
    'schedule.noevents': 'Aucun post planifi\\u00e9 ce mois',
    'schedule.planfirst': 'Planifier votre premier post',

    // Agenda
    'agenda.title': 'Agenda intelligent',
    'agenda.subtitle': 'Planifiez votre semaine et vos rappels',
    'agenda.planwithia': 'Planifier avec IA',
    'agenda.analyzing': 'Analyse en cours...',
    'agenda.today': "Aujourd'hui",
    'agenda.day': 'Jour',
    'agenda.week': 'Semaine',
    'agenda.month': 'Mois',
    'agenda.tasks': 'T\\u00e2ches du jour',
    'agenda.checklist': 'Checklist intelligente',
    'agenda.askia': "Demander \\u00e0 l'IA d'organiser",
    'agenda.addtask': 'Ajouter une t\\u00e2che',
    'agenda.newevent': 'Nouvel \\u00e9v\\u00e9nement',
    'agenda.add': 'Ajouter',
    'agenda.cancel': 'Annuler',
    'agenda.charge': 'Charge',

    // Reports
    'reports.title': 'Rapports',
    'reports.subtitle': 'G\\u00e9n\\u00e9rez et consultez vos rapports hebdomadaires',
    'reports.generate': 'G\\u00e9n\\u00e9rer le rapport',
    'reports.weekly': 'Rapport hebdomadaire',
    'reports.history': 'Historique des rapports',
    'reports.export': 'Exporter PDF',

    // Predictions
    'predictions.title': 'Pr\\u00e9dictions IA',
    'predictions.subtitle': 'Anticipez les tendances de votre business',
    'predictions.sales': 'Pr\\u00e9vision de ventes',
    'predictions.churn': 'Risque de churn',
    'predictions.trends': 'Tendances march\\u00e9',
    'predictions.refresh': 'Actualiser les pr\\u00e9dictions',

    // Settings
    'settings.title': 'Param\\u00e8tres',
    'settings.integrations': 'Int\\u00e9grations',
    'settings.connect': 'Connecter',
    'settings.disconnect': 'D\\u00e9connecter',
    'settings.connected': 'Connect\\u00e9',
    'settings.notconnected': 'Non connect\\u00e9',

    // Common
    'common.search': 'Rechercher...',
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.save': 'Sauvegarder',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.close': 'Fermer',
    'common.back': 'Retour',
    'common.next': 'Suivant',
    'common.previous': 'Pr\\u00e9c\\u00e9dent',
    'common.language': 'Langue',
    'common.french': 'Fran\\u00e7ais',
    'common.english': 'English',
  },

  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.chat': 'Chat',
    'nav.automations': 'Automations',
    'nav.analytics': 'Analytics',
    'nav.content': 'AI Content',
    'nav.analyze': 'Analyzer',
    'nav.templates': 'Templates',
    'nav.mindmap': 'Mind Map',
    'nav.crm': 'CRM',
    'nav.workflows': 'Workflows',
    'nav.schedule': 'Calendar',
    'nav.agenda': 'Agenda',
    'nav.reports': 'Reports',
    'nav.predictions': 'Predictions',
    'nav.settings': 'Settings',
    'nav.integrations': 'Integrations',
    'nav.pricing': 'Pricing',
    'nav.myspace': 'My Space',
    'nav.freeplan': 'Free Plan',

    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.subtitle': 'Overview of your AI agents',
    'dashboard.conversations': 'Conversations',
    'dashboard.autotasks': 'Auto tasks',
    'dashboard.leads': 'Generated leads',
    'dashboard.timesaved': 'Time saved',
    'dashboard.todayactions': "Today's actions",
    'dashboard.recentactivity': 'Recent activity',
    'dashboard.agentstatus': 'Agent status',
    'dashboard.quickactions': 'Quick actions',
    'dashboard.newlead': 'New lead',
    'dashboard.createworkflow': 'Create workflow',
    'dashboard.planpost': 'Plan post',
    'dashboard.generatecontent': 'Generate content',
    'dashboard.viewpredictions': 'View predictions',
    'dashboard.weeklyreport': 'Weekly report',

    // Chat
    'chat.title': 'AI Chat',
    'chat.placeholder': 'Type your message...',
    'chat.send': 'Send',
    'chat.selectagent': 'Choose an agent',
    'chat.marketing': 'Marketing',
    'chat.sales': 'Sales',
    'chat.socialmedia': 'Social Media',
    'chat.communication': 'Communication',
    'chat.automation': 'Automation',
    'chat.analytics': 'Analytics',

    // Content
    'content.title': 'AI Content',
    'content.subtitle': 'Generate content for all your platforms',
    'content.linkedin': 'LinkedIn',
    'content.newsletter': 'Newsletter',
    'content.email': 'Email',
    'content.instagram': 'Instagram',
    'content.facebook': 'Facebook',
    'content.twitter': 'Twitter/X',
    'content.blog': 'Blog SEO',
    'content.videoscript': 'Video Script',
    'content.generate': 'Generate',
    'content.copy': 'Copy',
    'content.download': 'Download',
    'content.regenerate': 'Regenerate',
    'content.topic': 'Topic',
    'content.tone': 'Tone',
    'content.language': 'Language',
    'content.professional': 'Professional',
    'content.casual': 'Casual',
    'content.inspirational': 'Inspirational',

    // Analyze
    'analyze.title': 'Website Analyzer',
    'analyze.subtitle': 'Paste a URL to get a full SEO and UX audit',
    'analyze.placeholder': 'Enter a URL...',
    'analyze.button': 'Analyze',
    'analyze.recommendations': 'Recommendations',
    'analyze.score': 'Overall score',

    // Templates
    'templates.title': 'Strategy Templates',
    'templates.subtitle': 'Ready-to-use business plans',
    'templates.use': 'Use',
    'templates.marketing': 'Marketing',
    'templates.sales': 'Sales',
    'templates.growth': 'Growth',
    'templates.automation': 'Automation',
    'templates.all': 'All',

    // Mind Map
    'mindmap.title': 'Mind Map',
    'mindmap.subtitle': 'Turn your ideas into a visual map',
    'mindmap.placeholder': 'Describe your idea...',
    'mindmap.generate': 'Generate mind map',

    // CRM
    'crm.title': 'CRM',
    'crm.subtitle': 'Manage your sales pipeline',
    'crm.newlead': 'New lead',
    'crm.newlead.full': 'Add a lead',
    'crm.stage.new': 'New',
    'crm.stage.contacted': 'Contacted',
    'crm.stage.negotiation': 'Negotiation',
    'crm.stage.won': 'Won',

    // Workflows
    'workflows.title': 'Workflows',
    'workflows.subtitle': 'Create your automations',
    'workflows.empty': 'Create your first workflow',
    'workflows.emptydesc': 'Drag an element from the panel to get started',
    'workflows.start': 'Get started',
    'workflows.save': 'Save',
    'workflows.activate': 'Activate workflow',
    'workflows.triggers': 'Triggers',
    'workflows.conditions': 'Conditions',
    'workflows.actions': 'Actions',

    // Schedule
    'schedule.title': 'Publication Calendar',
    'schedule.subtitle': 'Plan your posts across all networks',
    'schedule.newpost': 'New post',
    'schedule.noevents': 'No posts planned this month',
    'schedule.planfirst': 'Plan your first post',

    // Agenda
    'agenda.title': 'Smart Agenda',
    'agenda.subtitle': 'Plan your week and reminders',
    'agenda.planwithia': 'Plan with AI',
    'agenda.analyzing': 'Analyzing...',
    'agenda.today': 'Today',
    'agenda.day': 'Day',
    'agenda.week': 'Week',
    'agenda.month': 'Month',
    'agenda.tasks': "Today's tasks",
    'agenda.checklist': 'Smart checklist',
    'agenda.askia': 'Ask AI to organize',
    'agenda.addtask': 'Add a task',
    'agenda.newevent': 'New event',
    'agenda.add': 'Add',
    'agenda.cancel': 'Cancel',
    'agenda.charge': 'Load',

    // Reports
    'reports.title': 'Reports',
    'reports.subtitle': 'Generate and view your weekly reports',
    'reports.generate': 'Generate report',
    'reports.weekly': 'Weekly report',
    'reports.history': 'Report history',
    'reports.export': 'Export PDF',

    // Predictions
    'predictions.title': 'AI Predictions',
    'predictions.subtitle': 'Anticipate your business trends',
    'predictions.sales': 'Sales forecast',
    'predictions.churn': 'Churn risk',
    'predictions.trends': 'Market trends',
    'predictions.refresh': 'Refresh predictions',

    // Settings
    'settings.title': 'Settings',
    'settings.integrations': 'Integrations',
    'settings.connect': 'Connect',
    'settings.disconnect': 'Disconnect',
    'settings.connected': 'Connected',
    'settings.notconnected': 'Not connected',

    // Common
    'common.search': 'Search...',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.close': 'Close',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.language': 'Language',
    'common.french': 'French',
    'common.english': 'English',
  },
} as const

export type Locale = keyof typeof translations
export type TranslationKey = keyof typeof translations['fr']
"""

with open(TARGET, "w", encoding="utf-8") as f:
    f.write(CODE)

print(f"[OK] Traductions creees : {TARGET}")
print(f"[OK] Taille : {os.path.getsize(TARGET)} octets")

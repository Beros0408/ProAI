# Script Python pour appliquer i18n sur TOUTES les pages ProAI
import os
import re

BASE = os.path.join(
    "C:", os.sep, "Users", "bkabe", "Desktop", "Porjet - ProAI",
    "ProAI", "apps", "web"
)

# Helper: ajouter import useTranslation si absent
def ensure_translation_import(content):
    if "useTranslation" in content and "@/lib/i18n/context" in content:
        return content
    if "useTranslation" in content:
        # Fix wrong import path
        content = re.sub(
            r"import\s*\{[^}]*useTranslation[^}]*\}\s*from\s*['\"][^'\"]+['\"]",
            "import { useTranslation } from '@/lib/i18n/context'",
            content
        )
        return content
    # Add import after last import line
    lines = content.split('\n')
    last_import = 0
    for i, line in enumerate(lines):
        if line.strip().startswith('import '):
            last_import = i
    lines.insert(last_import + 1, "import { useTranslation } from '@/lib/i18n/context'")
    return '\n'.join(lines)

# Helper: ajouter const { t } = useTranslation() dans le composant
def ensure_t_hook(content):
    if "const { t }" in content or "const {t}" in content:
        return content
    # Trouver la ligne "export default function" ou la premiere ligne de state
    lines = content.split('\n')
    for i, line in enumerate(lines):
        if 'useState' in line or 'useRouter' in line or 'useRef' in line:
            lines.insert(i, "  const { t } = useTranslation()")
            return '\n'.join(lines)
        if 'return (' in line and i > 5:
            lines.insert(i, "  const { t } = useTranslation()")
            return '\n'.join(lines)
    return content

# Helper: ensure 'use client' en premiere ligne
def ensure_use_client(content):
    if content.strip().startswith("'use client'"):
        return content
    return "'use client'\n\n" + content

def apply_replacements(content, replacements):
    for old, new in replacements:
        content = content.replace(old, new)
    return content

# ============================================================
# PAGE: Dashboard
# ============================================================
def fix_dashboard():
    path = os.path.join(BASE, "app", "(app)", "dashboard", "page.tsx")
    if not os.path.exists(path):
        print(f"[SKIP] Dashboard non trouve: {path}")
        return
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    content = ensure_use_client(content)
    content = ensure_translation_import(content)
    content = ensure_t_hook(content)
    replacements = [
        (">Tableau de bord<", ">{t('dashboard.title')}<"),
        ('"Tableau de bord"', "t('dashboard.title')"),
        ("'Tableau de bord'", "t('dashboard.title')"),
        (">Vue d'ensemble", ">{t('dashboard.subtitle')}"),
        ('"Vue d\'ensemble de vos agents IA"', "t('dashboard.subtitle')"),
        (">Conversations<", ">{t('dashboard.conversations')}<"),
        ('"Conversations"', "t('dashboard.conversations')"),
        (">Actions du jour<", ">{t('dashboard.todayactions')}<"),
        ('"Actions du jour"', "t('dashboard.todayactions')"),
        (">Activit\u00e9 r\u00e9cente<", ">{t('dashboard.recentactivity')}<"),
        ('"Activit\u00e9 r\u00e9cente"', "t('dashboard.recentactivity')"),
        (">Statut des agents<", ">{t('dashboard.agentstatus')}<"),
        ('"Statut des agents"', "t('dashboard.agentstatus')"),
        (">Actions rapides<", ">{t('dashboard.quickactions')}<"),
        ('"Actions rapides"', "t('dashboard.quickactions')"),
        (">Nouveau lead<", ">{t('dashboard.newlead')}<"),
        ('"Nouveau lead"', "t('dashboard.newlead')"),
    ]
    content = apply_replacements(content, replacements)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("[OK] Dashboard i18n applique")

# ============================================================
# PAGE: Automations
# ============================================================
def fix_automations():
    path = os.path.join(BASE, "app", "(app)", "automations", "page.tsx")
    if not os.path.exists(path):
        print(f"[SKIP] Automations non trouve")
        return
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    content = ensure_use_client(content)
    content = ensure_translation_import(content)
    content = ensure_t_hook(content)
    replacements = [
        (">Automatisations<", ">{t('nav.automations')}<"),
        ('"Automatisations"', "t('nav.automations')"),
        ('"Configurez vos workflows automatiques"', "t('workflows.subtitle')"),
        (">Configurez vos workflows", ">{t('workflows.subtitle')}"),
    ]
    content = apply_replacements(content, replacements)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("[OK] Automations i18n applique")

# ============================================================
# PAGE: Content
# ============================================================
def fix_content():
    path = os.path.join(BASE, "app", "(app)", "content", "page.tsx")
    if not os.path.exists(path):
        print(f"[SKIP] Content non trouve")
        return
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    content = ensure_use_client(content)
    content = ensure_translation_import(content)
    content = ensure_t_hook(content)
    replacements = [
        (">Contenu IA<", ">{t('content.title')}<"),
        ('"Contenu IA"', "t('content.title')"),
        ('"G\u00e9n\u00e9rer"', "t('content.generate')"),
        (">G\u00e9n\u00e9rer<", ">{t('content.generate')}<"),
        ('"Copier"', "t('content.copy')"),
        (">Copier<", ">{t('content.copy')}<"),
        ('"T\u00e9l\u00e9charger"', "t('content.download')"),
        (">T\u00e9l\u00e9charger<", ">{t('content.download')}<"),
        ('"R\u00e9g\u00e9n\u00e9rer"', "t('content.regenerate')"),
        (">R\u00e9g\u00e9n\u00e9rer<", ">{t('content.regenerate')}<"),
    ]
    content = apply_replacements(content, replacements)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("[OK] Content i18n applique")

# ============================================================
# PAGE: Analyze
# ============================================================
def fix_analyze():
    path = os.path.join(BASE, "app", "(app)", "analyze", "page.tsx")
    if not os.path.exists(path):
        print(f"[SKIP] Analyze non trouve")
        return
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    content = ensure_use_client(content)
    content = ensure_translation_import(content)
    content = ensure_t_hook(content)
    replacements = [
        (">Analyseur de site web<", ">{t('analyze.title')}<"),
        ('"Analyseur de site web"', "t('analyze.title')"),
        ('"Analyseur"', "t('nav.analyze')"),
        (">Analyser<", ">{t('analyze.button')}<"),
        ('"Analyser"', "t('analyze.button')"),
        (">Recommandations<", ">{t('analyze.recommendations')}<"),
        ('"Recommandations"', "t('analyze.recommendations')"),
    ]
    content = apply_replacements(content, replacements)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("[OK] Analyze i18n applique")

# ============================================================
# PAGE: Templates
# ============================================================
def fix_templates():
    path = os.path.join(BASE, "app", "(app)", "templates", "page.tsx")
    if not os.path.exists(path):
        print(f"[SKIP] Templates non trouve")
        return
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    content = ensure_use_client(content)
    content = ensure_translation_import(content)
    content = ensure_t_hook(content)
    replacements = [
        (">Templates<", ">{t('templates.title')}<"),
        ('"Templates de strat\u00e9gie"', "t('templates.title')"),
        (">Utiliser<", ">{t('templates.use')}<"),
        ('"Utiliser"', "t('templates.use')"),
        ('"Tous"', "t('templates.all')"),
        (">Tous<", ">{t('templates.all')}<"),
    ]
    content = apply_replacements(content, replacements)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("[OK] Templates i18n applique")

# ============================================================
# PAGE: Mind Map
# ============================================================
def fix_mindmap():
    path = os.path.join(BASE, "app", "(app)", "mindmap", "page.tsx")
    if not os.path.exists(path):
        print(f"[SKIP] Mindmap non trouve")
        return
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    content = ensure_use_client(content)
    content = ensure_translation_import(content)
    content = ensure_t_hook(content)
    replacements = [
        (">Mind Map<", ">{t('mindmap.title')}<"),
        ('"Mind Map"', "t('mindmap.title')"),
        ('"D\u00e9crivez votre id\u00e9e"', "t('mindmap.placeholder')"),
        ('"G\u00e9n\u00e9rer la mind map"', "t('mindmap.generate')"),
        (">G\u00e9n\u00e9rer la mind map<", ">{t('mindmap.generate')}<"),
    ]
    content = apply_replacements(content, replacements)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("[OK] Mindmap i18n applique")

# ============================================================
# PAGE: Reports
# ============================================================
def fix_reports():
    path = os.path.join(BASE, "app", "(app)", "reports", "page.tsx")
    if not os.path.exists(path):
        print(f"[SKIP] Reports non trouve")
        return
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    content = ensure_use_client(content)
    content = ensure_translation_import(content)
    content = ensure_t_hook(content)
    replacements = [
        (">Rapports<", ">{t('reports.title')}<"),
        ('"Rapports"', "t('reports.title')"),
        ('"G\u00e9n\u00e9rer le rapport"', "t('reports.generate')"),
        (">G\u00e9n\u00e9rer le rapport<", ">{t('reports.generate')}<"),
        ('"Rapport hebdomadaire"', "t('reports.weekly')"),
        (">Rapport hebdomadaire<", ">{t('reports.weekly')}<"),
        ('"Historique des rapports"', "t('reports.history')"),
        (">Historique des rapports<", ">{t('reports.history')}<"),
        ('"Exporter PDF"', "t('reports.export')"),
        (">Exporter PDF<", ">{t('reports.export')}<"),
    ]
    content = apply_replacements(content, replacements)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("[OK] Reports i18n applique")

# ============================================================
# PAGE: Predictions
# ============================================================
def fix_predictions():
    path = os.path.join(BASE, "app", "(app)", "predictions", "page.tsx")
    if not os.path.exists(path):
        print(f"[SKIP] Predictions non trouve")
        return
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    content = ensure_use_client(content)
    content = ensure_translation_import(content)
    content = ensure_t_hook(content)
    replacements = [
        (">Pr\u00e9dictions IA<", ">{t('predictions.title')}<"),
        ('"Pr\u00e9dictions IA"', "t('predictions.title')"),
        ('"Pr\u00e9vision de ventes"', "t('predictions.sales')"),
        (">Pr\u00e9vision de ventes<", ">{t('predictions.sales')}<"),
        ('"Risque de churn"', "t('predictions.churn')"),
        (">Risque de churn<", ">{t('predictions.churn')}<"),
        ('"Tendances march\u00e9"', "t('predictions.trends')"),
        (">Tendances march\u00e9<", ">{t('predictions.trends')}<"),
        ('"Actualiser les pr\u00e9dictions"', "t('predictions.refresh')"),
        (">Actualiser les pr\u00e9dictions<", ">{t('predictions.refresh')}<"),
    ]
    content = apply_replacements(content, replacements)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("[OK] Predictions i18n applique")

# ============================================================
# PAGE: Settings
# ============================================================
def fix_settings():
    path = os.path.join(BASE, "app", "(app)", "settings", "page.tsx")
    if not os.path.exists(path):
        print(f"[SKIP] Settings non trouve")
        return
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    content = ensure_use_client(content)
    content = ensure_translation_import(content)
    content = ensure_t_hook(content)
    replacements = [
        (">Param\u00e8tres<", ">{t('settings.title')}<"),
        ('"Param\u00e8tres"', "t('settings.title')"),
        (">Int\u00e9grations<", ">{t('settings.integrations')}<"),
        ('"Int\u00e9grations"', "t('settings.integrations')"),
    ]
    content = apply_replacements(content, replacements)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("[OK] Settings i18n applique")

# ============================================================
# PAGE: Settings/Integrations
# ============================================================
def fix_integrations():
    path = os.path.join(BASE, "app", "(app)", "settings", "integrations", "page.tsx")
    if not os.path.exists(path):
        print(f"[SKIP] Integrations non trouve")
        return
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    content = ensure_use_client(content)
    content = ensure_translation_import(content)
    content = ensure_t_hook(content)
    replacements = [
        (">Connecter<", ">{t('settings.connect')}<"),
        ('"Connecter"', "t('settings.connect')"),
        (">D\u00e9connecter<", ">{t('settings.disconnect')}<"),
        ('"D\u00e9connecter"', "t('settings.disconnect')"),
        ('"Connect\u00e9"', "t('settings.connected')"),
        (">Connect\u00e9<", ">{t('settings.connected')}<"),
        ('"Non connect\u00e9"', "t('settings.notconnected')"),
        (">Non connect\u00e9<", ">{t('settings.notconnected')}<"),
    ]
    content = apply_replacements(content, replacements)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("[OK] Integrations i18n applique")

# ============================================================
# COMPOSANT: Header
# ============================================================
def fix_header():
    path = os.path.join(BASE, "components", "layout", "Header.tsx")
    if not os.path.exists(path):
        print(f"[SKIP] Header non trouve")
        return
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    content = ensure_use_client(content)
    content = ensure_translation_import(content)
    content = ensure_t_hook(content)
    replacements = [
        ('"Rechercher..."', "t('common.search')"),
        ('"Rechercher"', "t('common.search')"),
        ('"Langue"', "t('common.language')"),
        (">Langue<", ">{t('common.language')}<"),
    ]
    content = apply_replacements(content, replacements)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("[OK] Header i18n applique")

# ============================================================
# EXECUTION
# ============================================================
if __name__ == "__main__":
    print("=" * 50)
    print("ProAI i18n - Application sur toutes les pages")
    print("=" * 50)
    
    fix_dashboard()
    fix_automations()
    fix_content()
    fix_analyze()
    fix_templates()
    fix_mindmap()
    fix_reports()
    fix_predictions()
    fix_settings()
    fix_integrations()
    fix_header()
    
    print("=" * 50)
    print("[TERMINE] i18n applique sur toutes les pages")
    print("Rafraichissez le navigateur et testez FR/EN")
    print("=" * 50)

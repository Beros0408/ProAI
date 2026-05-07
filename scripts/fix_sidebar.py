# Script Python pour corriger la Sidebar (espacement + hover + accents)
import os

TARGET = os.path.join(
    "C:", os.sep, "Users", "bkabe", "Desktop", "Porjet - ProAI",
    "ProAI", "apps", "web", "components", "layout", "Sidebar.tsx"
)

with open(TARGET, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Espacement entre les sections accordeon (plus aere)
content = content.replace(
    '"space-y-1"',
    '"space-y-3"'
)

# 2. Espacement items principaux
content = content.replace(
    '"space-y-0.5 mb-3"',
    '"space-y-1 mb-5"'
)

# 3. Espacement entre sous-items
content = content.replace(
    '"pl-2 pt-1 space-y-0.5"',
    '"pl-2 pt-1.5 space-y-1"'
)

# 4. Ajouter onMouseEnter pour ouvrir au hover
old_trigger = 'onClick={() => toggleSection(section.key)}'
new_trigger = 'onClick={() => toggleSection(section.key)}\n                  onMouseEnter={() => setOpenSection(section.key)}'
if 'onMouseEnter' not in content:
    content = content.replace(old_trigger, new_trigger)

# 5. Augmenter la hauteur des boutons accordeon
content = content.replace(
    "compact ? 'justify-center px-2 py-2.5' : 'px-3 py-2'\n                  }`}",
    "compact ? 'justify-center px-2 py-3' : 'px-3 py-2.5'\n                  }`}"
)

# 6. Fix les accents echappes qui s'affichent comme texte brut
# Le probleme: \\u00e8 dans le TSX au lieu de \u00e8
content = content.replace("Param\\u00e8tres", "Param\u00e8tres")
content = content.replace("R\\u00e9duire", "R\u00e9duire")
content = content.replace("Pr\\u00e9dictions", "Pr\u00e9dictions")

with open(TARGET, "w", encoding="utf-8") as f:
    f.write(content)

print("[OK] Sidebar corrigee :")
print("  - Espacement entre sections augmente")
print("  - Hover ouvre les sous-menus")
print("  - Accents corriges (Parametres, Reduire, Predictions)")

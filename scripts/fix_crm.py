# Script Python pour corriger l'erreur TypeScript dans le CRM
import os

TARGET = os.path.join(
    "C:", os.sep, "Users", "bkabe", "Desktop", "Porjet - ProAI",
    "ProAI", "apps", "web", "app", "(app)", "crm", "page.tsx"
)

# Lire le fichier actuel
with open(TARGET, "r", encoding="utf-8") as f:
    content = f.read()

# Corriger l'erreur : distance doit etre dans activationConstraint
old = "useSensor(PointerSensor, { distance: 8 })"
new = "useSensor(PointerSensor, { activationConstraint: { distance: 8 } })"

if old in content:
    content = content.replace(old, new)
    with open(TARGET, "w", encoding="utf-8") as f:
        f.write(content)
    print("[OK] CRM page corrigee : activationConstraint ajoute")
else:
    print("[INFO] Pattern non trouve, verification manuelle necessaire")
    # Essayer une recherche plus large
    if "distance: 8" in content:
        content = content.replace(
            "{ distance: 8 }",
            "{ activationConstraint: { distance: 8 } }"
        )
        with open(TARGET, "w", encoding="utf-8") as f:
            f.write(content)
        print("[OK] CRM page corrigee (methode 2)")
    else:
        print("[ERREUR] Impossible de trouver le code a corriger")

print(f"[OK] Fichier : {TARGET}")

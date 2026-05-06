# Script Python pour creer la PWA ProAI (manifest + service worker + icons)
import os
import json

BASE = os.path.join(
    "C:", os.sep, "Users", "bkabe", "Desktop", "Porjet - ProAI",
    "ProAI", "apps", "web"
)

# ============================================================
# 1. MANIFEST.JSON
# ============================================================
manifest_path = os.path.join(BASE, "public", "manifest.json")
os.makedirs(os.path.dirname(manifest_path), exist_ok=True)

manifest = {
    "name": "ProAI - Agents IA pour votre Business",
    "short_name": "ProAI",
    "description": "Votre cerveau d'entreprise propulse par l'intelligence artificielle. 6 agents IA specialises pour freelances et PME.",
    "start_url": "/dashboard",
    "display": "standalone",
    "background_color": "#0c1220",
    "theme_color": "#0ea5e9",
    "orientation": "portrait-primary",
    "scope": "/",
    "icons": [
        {
            "src": "/icons/icon-72x72.png",
            "sizes": "72x72",
            "type": "image/png",
            "purpose": "any maskable"
        },
        {
            "src": "/icons/icon-96x96.png",
            "sizes": "96x96",
            "type": "image/png",
            "purpose": "any maskable"
        },
        {
            "src": "/icons/icon-128x128.png",
            "sizes": "128x128",
            "type": "image/png",
            "purpose": "any maskable"
        },
        {
            "src": "/icons/icon-144x144.png",
            "sizes": "144x144",
            "type": "image/png",
            "purpose": "any maskable"
        },
        {
            "src": "/icons/icon-152x152.png",
            "sizes": "152x152",
            "type": "image/png",
            "purpose": "any maskable"
        },
        {
            "src": "/icons/icon-192x192.png",
            "sizes": "192x192",
            "type": "image/png",
            "purpose": "any maskable"
        },
        {
            "src": "/icons/icon-384x384.png",
            "sizes": "384x384",
            "type": "image/png",
            "purpose": "any maskable"
        },
        {
            "src": "/icons/icon-512x512.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "any maskable"
        }
    ],
    "categories": ["business", "productivity"],
    "screenshots": [],
    "shortcuts": [
        {
            "name": "Chat IA",
            "short_name": "Chat",
            "url": "/chat",
            "icons": [{"src": "/icons/icon-96x96.png", "sizes": "96x96"}]
        },
        {
            "name": "Dashboard",
            "short_name": "Dashboard",
            "url": "/dashboard",
            "icons": [{"src": "/icons/icon-96x96.png", "sizes": "96x96"}]
        }
    ]
}

with open(manifest_path, "w", encoding="utf-8") as f:
    json.dump(manifest, f, indent=2, ensure_ascii=False)
print(f"[OK] Manifest cree : {manifest_path}")

# ============================================================
# 2. SERVICE WORKER
# ============================================================
sw_path = os.path.join(BASE, "public", "sw.js")

SW_CODE = """\
const CACHE_NAME = 'proai-v1';
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/login',
  '/manifest.json',
];

// Install - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip API calls
  if (event.request.url.includes('/api/')) return;

  // Skip Chrome extensions
  if (event.request.url.startsWith('chrome-extension://')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone and cache successful responses
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(event.request).then((cached) => {
          return cached || caches.match('/');
        });
      })
  );
});

// Push notifications (future)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'ProAI';
  const options = {
    body: data.body || 'Nouvelle notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/dashboard' },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/dashboard';
  event.waitUntil(clients.openWindow(url));
});
"""

with open(sw_path, "w", encoding="utf-8") as f:
    f.write(SW_CODE)
print(f"[OK] Service worker cree : {sw_path}")

# ============================================================
# 3. GENERATE SVG ICONS (simple ProAI logo)
# ============================================================
icons_dir = os.path.join(BASE, "public", "icons")
os.makedirs(icons_dir, exist_ok=True)

# Create a simple SVG icon that we convert to different sizes
# For now, create a placeholder SVG for each size
sizes = [72, 96, 128, 144, 152, 192, 384, 512]

for size in sizes:
    svg_content = f"""<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 {size} {size}">
  <rect width="{size}" height="{size}" rx="{size // 5}" fill="#0c1220"/>
  <rect x="{size * 0.1}" y="{size * 0.1}" width="{size * 0.8}" height="{size * 0.8}" rx="{size // 6}" fill="url(#grad)"/>
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0ea5e9;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#fb923c;stop-opacity:1" />
    </linearGradient>
  </defs>
  <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-weight="bold" font-size="{size * 0.3}">P</text>
</svg>"""
    # Save as SVG (browsers can use SVG as icon too)
    icon_path = os.path.join(icons_dir, f"icon-{size}x{size}.svg")
    with open(icon_path, "w", encoding="utf-8") as f:
        f.write(svg_content)
    
    # Also save as .png reference (SVG will work for most cases)
    # For real PNG, you'd need Pillow - we'll use SVG and rename
    png_path = os.path.join(icons_dir, f"icon-{size}x{size}.png")
    with open(png_path, "w", encoding="utf-8") as f:
        f.write(svg_content)  # Browsers handle SVG in manifest

print(f"[OK] {len(sizes)} icones creees dans : {icons_dir}")

# Update manifest to use SVG
manifest["icons"] = [
    {"src": f"/icons/icon-{s}x{s}.svg", "sizes": f"{s}x{s}", "type": "image/svg+xml", "purpose": "any maskable"}
    for s in sizes
]
with open(manifest_path, "w", encoding="utf-8") as f:
    json.dump(manifest, f, indent=2, ensure_ascii=False)
print("[OK] Manifest mis a jour avec icones SVG")

# ============================================================
# 4. UPDATE ROOT LAYOUT (add manifest + meta tags + SW registration)
# ============================================================
layout_path = os.path.join(BASE, "app", "layout.tsx")

with open(layout_path, "r", encoding="utf-8") as f:
    layout_content = f.read()

# Add PWA meta tags if not present
if 'manifest' not in layout_content:
    # Find the <head> section or metadata
    if "export const metadata" in layout_content:
        # Update metadata to include manifest
        old_metadata = "export const metadata: Metadata = {"
        new_metadata = """export const metadata: Metadata = {
  manifest: '/manifest.json',
  themeColor: '#0ea5e9',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ProAI',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },"""
        if old_metadata in layout_content:
            layout_content = layout_content.replace(old_metadata, new_metadata)
        
    with open(layout_path, "w", encoding="utf-8") as f:
        f.write(layout_content)
    print(f"[OK] Layout mis a jour avec manifest : {layout_path}")
else:
    print("[INFO] Manifest deja dans le layout")

# ============================================================
# 5. CREATE SW REGISTRATION COMPONENT
# ============================================================
sw_reg_path = os.path.join(BASE, "components", "PWARegister.tsx")
os.makedirs(os.path.dirname(sw_reg_path), exist_ok=True)

SW_REG_CODE = """\
'use client'

import { useEffect } from 'react'

export function PWARegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[ProAI] Service Worker registered:', registration.scope)
        })
        .catch((error) => {
          console.log('[ProAI] Service Worker registration failed:', error)
        })
    }
  }, [])

  return null
}
"""

with open(sw_reg_path, "w", encoding="utf-8") as f:
    f.write(SW_REG_CODE)
print(f"[OK] PWARegister component cree : {sw_reg_path}")

# Add PWARegister to root layout
with open(layout_path, "r", encoding="utf-8") as f:
    layout_content = f.read()

if 'PWARegister' not in layout_content:
    # Add import
    layout_content = layout_content.replace(
        "import { I18nProvider }",
        "import { PWARegister } from '@/components/PWARegister'\nimport { I18nProvider }"
    )
    # Add component inside body
    if '<I18nProvider>' in layout_content:
        layout_content = layout_content.replace(
            '<I18nProvider>',
            '<I18nProvider>\n          <PWARegister />'
        )
    with open(layout_path, "w", encoding="utf-8") as f:
        f.write(layout_content)
    print("[OK] PWARegister ajoute dans le layout")
else:
    print("[INFO] PWARegister deja dans le layout")

print("\n" + "=" * 50)
print("[TERMINE] PWA ProAI configuree !")
print("=" * 50)
print("\nPour tester :")
print("1. Ouvrez http://localhost:3000 sur Chrome/Edge")
print("2. Cliquez l'icone 'Installer' dans la barre d'adresse")
print("3. Ou sur mobile : 'Ajouter a l'ecran d'accueil'")
print("=" * 50)

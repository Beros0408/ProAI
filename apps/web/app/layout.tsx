import type { Metadata } from 'next'
import './globals.css'
import { PWARegister } from '@/components/PWARegister'
import { I18nProvider } from '@/lib/i18n/context'
import { ThemeProvider } from '@/lib/theme/context'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
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
  },
  title: 'ProAI — Votre équipe IA pour développer votre business',
  description: "6 agents IA spécialisés pour le marketing, les ventes, le contenu, l'automatisation, les analytics et la communication. Gratuit pour démarrer.",
  keywords: 'IA, agents IA, SaaS, marketing IA, automatisation, CRM, analytics, ProAI',
  authors: [{ name: 'ProAI' }],
  creator: 'ProAI',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://proai-saas.vercel.app',
    siteName: 'ProAI',
    title: 'ProAI — Votre équipe IA pour développer votre business',
    description: '6 agents IA spécialisés qui travaillent pour vous. Marketing, ventes, contenu, automatisation, analytics et communication.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'ProAI Dashboard' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ProAI — Votre équipe IA',
    description: '6 agents IA spécialisés pour développer votre business',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: { icon: '/icon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="bg-base text-foreground antialiased">
        <ThemeProvider>
          <I18nProvider>
            <PWARegister />
            {children}
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

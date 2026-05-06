import type { Metadata } from 'next'
import './globals.css'
import { PWARegister } from '@/components/PWARegister'
import { I18nProvider } from '@/lib/i18n/context'

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
  title: 'ProAI — AI Agents for Your Business',
  description: 'Automate your business with AI agents for marketing, sales, and more.',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="bg-base text-foreground antialiased">
        <I18nProvider>
          <PWARegister />
          {children}
        </I18nProvider>
      </body>
    </html>
  )
}

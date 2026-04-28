import type { Metadata } from 'next'
import './globals.css'
import { I18nProvider } from '@/lib/i18n/context'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'ProAI — AI Agents for Your Business',
  description: 'Automate your business with AI agents for marketing, sales, and more.',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="bg-base text-foreground antialiased">
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  )
}

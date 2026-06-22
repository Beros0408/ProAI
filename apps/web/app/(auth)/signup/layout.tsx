import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Créer un compte — Krezia',
  description: 'Créez votre compte Krezia gratuitement et commencez à automatiser votre business avec des agents IA spécialisés.',
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

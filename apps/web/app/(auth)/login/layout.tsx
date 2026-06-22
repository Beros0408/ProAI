import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Connexion — Krezia',
  description: 'Connectez-vous à votre espace Krezia et accédez à vos 6 agents IA spécialisés.',
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

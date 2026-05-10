import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Connexion — ProAI',
  description: 'Connectez-vous à votre espace ProAI et accédez à vos 6 agents IA spécialisés.',
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

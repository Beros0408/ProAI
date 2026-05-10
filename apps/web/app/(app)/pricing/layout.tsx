import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tarifs — ProAI',
  description: 'Découvrez les offres ProAI : plan gratuit, Pro à 29€/mois et Business à 79€/mois. Commencez sans carte bancaire.',
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

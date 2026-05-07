'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslation } from '@/lib/i18n/context'
import { Check, Zap, Star, Shield, ArrowRight, MessageSquare, Info, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

const AGENTS_INFO = [
  { name: 'Marketing', desc: 'Stratégie contenu, posts LinkedIn, newsletters, SEO' },
  { name: 'Sales', desc: 'Prospection, scripts, pipeline, emails de vente' },
  { name: 'Social Media', desc: 'Publication Instagram, Facebook, Twitter automatisée' },
  { name: 'Communication', desc: 'Emails Gmail, messages Slack, planning Calendar' },
  { name: 'Automation', desc: 'Workflows automatisés, connexion outils, tâches répétitives' },
  { name: 'Analytics', desc: 'Rapports, KPIs, prédictions, détection opportunités' },
]

const TESTIMONIALS = [
  { name: 'Sophie Laurent', role: 'Fondatrice, DigitalBoost', text: 'En 2 semaines, ProAI m’a généré plus de leads que mon agence en 3 mois.', initials: 'SL', color: '#0ea5e9' },
  { name: 'Marc Benoît', role: 'CEO, TechPulse', text: 'Le plan Pro se rentabilise dès le premier mois. ROI immédiat.', initials: 'MB', color: '#fb923c' },
]

export default function PricingPage() {
  const { t } = useTranslation()
  const [annual, setAnnual] = useState(false)
  const [showAgents, setShowAgents] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const paymentStatus = searchParams.get('payment')

  const proPrice = annual ? 23 : 29
  const enterprisePrice = annual ? 79 : 99

  const handleCheckout = async (plan: string) => {
    setLoading(plan)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        router.push('/login')
        return
      }

      const response = await fetch(`${API_URL}/api/v1/billing/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ plan, annual }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.detail || 'Erreur lors de la création du checkout')
      }

      const data = await response.json()
      window.location.href = data.checkout_url
    } catch (err: any) {
      alert(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen p-6 animate-fade-up">
      {/* Bannière de statut paiement */}
      {paymentStatus === 'success' && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-6 animate-fade-up" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)' }}>
          <CheckCircle size={18} style={{ color: '#34d399' }} />
          <span className="text-sm font-medium" style={{ color: '#34d399' }}>Paiement réussi ! Votre abonnement est actif.</span>
        </div>
      )}
      {paymentStatus === 'cancelled' && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-6 animate-fade-up" style={{ background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.3)' }}>
          <XCircle size={18} style={{ color: '#fb923c' }} />
          <span className="text-sm font-medium" style={{ color: '#fb923c' }}>Paiement annulé. Vous pouvez réessayer quand vous voulez.</span>
        </div>
      )}

      {/* En-tête */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6" style={{ background: 'rgba(14,165,233,0.1)', color: '#38bdf8', border: '1px solid rgba(14,165,233,0.2)' }}>
          <Zap size={14} /> Tarifs transparents
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Un prix qui respecte{' '}
          <span style={{ color: '#fb923c' }}>votre ambition</span>
        </h1>
        <p className="text-[#94a3b8] text-lg">Commencez gratuitement. Évoluez quand vos résultats parlent.</p>

        {/* Bascule mensuel / annuel */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <span className={`text-sm font-medium ${!annual ? 'text-white' : 'text-[#94a3b8]'}`}>Mensuel</span>
          <button onClick={() => setAnnual(!annual)} className="relative w-14 h-7 rounded-full transition-colors duration-300" style={{ background: annual ? '#0ea5e9' : 'rgba(255,255,255,0.15)' }}>
            <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white transition-transform duration-300 ${annual ? 'translate-x-7' : 'translate-x-0.5'}`} />
          </button>
          <span className={`text-sm font-medium ${annual ? 'text-white' : 'text-[#94a3b8]'}`}>
            Annuel
            {annual && <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399' }}>-20 %</span>}
          </span>
        </div>
      </div>

      {/* Cartes de prix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-8">

        {/* GRATUIT */}
        <div className="rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-1">Gratuit</h3>
            <p className="text-sm" style={{ color: '#94a3b8' }}>Idéal pour tester et découvrir ProAI</p>
          </div>
          <div className="mb-6">
            <span className="text-5xl font-extrabold text-white">0&#8364;</span>
            <span className="text-[#94a3b8] ml-1">/mois</span>
          </div>
          <p className="text-xs mb-6 px-3 py-2 rounded-lg" style={{ background: 'rgba(14,165,233,0.08)', color: '#38bdf8' }}>Sans engagement, sans carte bancaire</p>
          <ul className="space-y-3 mb-8">
            {[
              '1 agent IA spécialisé (au choix)',
              '50 réponses IA / mois',
              'Dashboard avec KPIs de base',
              'Générateur de contenu (1 plateforme)',
              'Mind map basique',
            ].map((f, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-[#e2e8f0]">
                <Check size={16} className="mt-0.5 flex-shrink-0" style={{ color: '#34d399' }} />{f}
              </li>
            ))}
          </ul>
          <button onClick={() => router.push('/signup')} className="w-full py-3 rounded-full text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5" style={{ background: 'transparent', border: '1.5px solid rgba(255,255,255,0.2)', color: 'white' }}>
            Tester gratuitement
          </button>
        </div>

        {/* PRO */}
        <div className="rounded-2xl p-8 relative transition-all duration-300 hover:-translate-y-1" style={{ background: '#111827', border: '2px solid #0ea5e9', boxShadow: '0 8px 40px rgba(14,165,233,0.15)', transform: 'scale(1.03)' }}>
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <span className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold" style={{ background: 'linear-gradient(135deg, #fb923c, #f97316)', color: 'white', boxShadow: '0 4px 12px rgba(251,146,60,0.4)' }}>
              <Star size={12} fill="white" /> Le plus choisi par nos utilisateurs
            </span>
          </div>
          <div className="mb-6 mt-2">
            <h3 className="text-xl font-bold mb-1" style={{ color: '#fb923c' }}>Pro</h3>
            <p className="text-sm" style={{ color: '#94a3b8' }}>Pour automatiser et faire évoluer votre business</p>
          </div>
          <div className="mb-6">
            <span className="text-5xl font-extrabold text-white">{proPrice}&#8364;</span>
            <span className="text-[#94a3b8] ml-1">/mois</span>
            {annual && <span className="ml-2 text-xs line-through text-[#64748b]">29&#8364;</span>}
          </div>
          <p className="text-xs mb-6 px-3 py-2 rounded-lg" style={{ background: 'rgba(251,146,60,0.1)', color: '#fdba74' }}>Essai 7 jours gratuit, annulable à tout moment</p>
          <ul className="space-y-3 mb-8">
            {[
              '6 agents IA spécialisés inclus',
              'Conversations IA illimitées',
              'CRM intelligent avec scoring de leads',
              'Générateur multi-plateforme (8 canaux)',
              'Workflows automatisés',
              'Calendrier de publication',
              'Rapports hebdomadaires automatiques',
              'Prédictions IA (ventes, churn)',
              'Mind map avancée',
              'Support prioritaire',
            ].map((f, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-[#e2e8f0]">
                <Check size={16} className="mt-0.5 flex-shrink-0" style={{ color: '#fb923c' }} />{f}
              </li>
            ))}
          </ul>
          <button
            onClick={() => handleCheckout('pro')}
            disabled={loading === 'pro'}
            className="w-full py-3 rounded-full text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #fb923c, #f97316)', boxShadow: '0 4px 20px rgba(251,146,60,0.3)' }}
          >
            {loading === 'pro' ? <><Loader2 size={16} className="animate-spin" /> Redirection…</> : <>Passer au Pro <ArrowRight size={16} /></>}
          </button>
        </div>

        {/* ENTERPRISE */}
        <div className="rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-1">Enterprise</h3>
            <p className="text-sm" style={{ color: '#94a3b8' }}>Pour les équipes à grande échelle</p>
          </div>
          <div className="mb-6">
            <span className="text-5xl font-extrabold text-white">{enterprisePrice}&#8364;</span>
            <span className="text-[#94a3b8] ml-1">/mois</span>
            {annual && <span className="ml-2 text-xs line-through text-[#64748b]">99&#8364;</span>}
          </div>
          <p className="text-xs mb-6 px-3 py-2 rounded-lg" style={{ background: 'rgba(139,92,246,0.1)', color: '#a78bfa' }}>SLA garanti 99,9 % uptime</p>
          <ul className="space-y-3 mb-8">
            {[
              'Tout le plan Pro inclus',
              'Agents IA illimités',
              'Mode équipe (multi-utilisateurs)',
              'Analytics avancées et benchmarks',
              'Accès API publique ProAI',
              'Intégrations premium (Slack, CRM, n8n)',
              'Export rapports PDF personnalisés',
              'Support dédié + onboarding',
              'White-label disponible',
            ].map((f, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-[#e2e8f0]">
                <Check size={16} className="mt-0.5 flex-shrink-0" style={{ color: '#8b5cf6' }} />{f}
              </li>
            ))}
          </ul>
          <button
            onClick={() => handleCheckout('enterprise')}
            disabled={loading === 'enterprise'}
            className="w-full py-3 rounded-full text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: 'transparent', border: '1.5px solid rgba(139,92,246,0.4)', color: '#a78bfa' }}
          >
            {loading === 'enterprise' ? <><Loader2 size={16} className="animate-spin" /> Redirection…</> : <><MessageSquare size={16} /> Passer à Enterprise</>}
          </button>
        </div>
      </div>

      {/* Réassurance */}
      <div className="flex flex-wrap items-center justify-center gap-6 mb-16 max-w-3xl mx-auto">
        {[
          { icon: Shield, text: 'Sans engagement' },
          { icon: Zap, text: 'Annulable à tout moment' },
          { icon: Shield, text: 'Données sécurisées RGPD' },
          { icon: Check, text: 'Support réactif' },
        ].map((item, i) => (
          <span key={i} className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full" style={{ color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}>
            <item.icon size={12} style={{ color: '#34d399' }} /> {item.text}
          </span>
        ))}
      </div>

      {/* Détail des agents */}
      <div className="max-w-3xl mx-auto mb-16">
        <button onClick={() => setShowAgents(!showAgents)} className="w-full flex items-center justify-between px-6 py-4 rounded-xl transition-all duration-300" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)' }}>
          <span className="flex items-center gap-3">
            <Info size={18} style={{ color: '#0ea5e9' }} />
            <span className="text-sm font-semibold text-white">Que font les 6 agents IA ? Voir le détail</span>
          </span>
          <span className="text-[#94a3b8] text-lg">{showAgents ? '−' : '+'}</span>
        </button>
        {showAgents && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 animate-fade-up">
            {AGENTS_INFO.map((agent, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-xl" style={{ background: '#1a2236', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm" style={{ background: 'rgba(14,165,233,0.15)', color: '#38bdf8' }}>{i + 1}</div>
                <div>
                  <p className="text-sm font-semibold text-white">{agent.name}</p>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>{agent.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Témoignages */}
      <div className="max-w-3xl mx-auto mb-16">
        <h3 className="text-center text-lg font-bold text-white mb-6">Ce que disent nos utilisateurs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TESTIMONIALS.map((item, i) => (
            <div key={i} className="px-6 py-5 rounded-xl transition-all duration-300 hover:-translate-y-1" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-sm mb-4" style={{ color: '#e2e8f0', fontStyle: 'italic', lineHeight: '1.7' }}>&laquo; {item.text} &raquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: `${item.color}20`, color: item.color }}>{item.initials}</div>
                <div>
                  <p className="text-sm font-semibold text-white">{item.name}</p>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto">
        <h3 className="text-center text-lg font-bold text-white mb-6">Questions fréquentes</h3>
        {[
          { q: 'Puis-je changer de plan à tout moment ?', a: 'Oui. Passez du Gratuit au Pro en un clic. Rétrogradez quand vous voulez sans frais.' },
          { q: 'Que se passe-t-il après les 50 messages gratuits ?', a: 'Vous pouvez continuer à utiliser le dashboard et consulter vos données. Pour plus de conversations IA, passez au Pro.' },
          { q: 'Mes données sont-elles sécurisées ?', a: 'Oui. Hébergement européen, chiffrement bout en bout, conformité RGPD. Vos données ne sont jamais partagées.' },
          { q: 'Comment fonctionne le scoring de leads ?', a: 'Notre IA analyse le comportement de vos prospects et attribue un score chaud / tiède / froid pour prioriser vos actions.' },
          { q: 'Le paiement est-il sécurisé ?', a: 'Oui. Nous utilisons Stripe, le leader mondial du paiement en ligne. Vos informations bancaires ne transitent jamais par nos serveurs.' },
        ].map((faq, i) => (
          <details key={i} className="mb-3 rounded-xl overflow-hidden group" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)' }}>
            <summary className="px-5 py-4 cursor-pointer text-sm font-medium text-white flex items-center justify-between hover:bg-[#1a2236] transition-colors">
              {faq.q}
              <span className="text-[#94a3b8] group-open:rotate-45 transition-transform">+</span>
            </summary>
            <p className="px-5 pb-4 text-sm" style={{ color: '#94a3b8', lineHeight: '1.7' }}>{faq.a}</p>
          </details>
        ))}
      </div>

      {/* Badge Stripe */}
      <div className="text-center mt-12">
        <p className="text-xs" style={{ color: '#64748b' }}>Paiements sécurisés par Stripe | Conforme PCI DSS</p>
      </div>
    </div>
  )
}

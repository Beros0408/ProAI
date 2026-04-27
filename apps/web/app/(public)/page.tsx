'use client'

import { motion, useMotionValue, useTransform } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'

export default function LandingPage() {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const handleMouseMove = (e: React.MouseEvent) => {
    mouseX.set(e.clientX)
    mouseY.set(e.clientY)
  }

  return (
    <div className="min-h-screen bg-base text-foreground" onMouseMove={handleMouseMove}>
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-surface/80 backdrop-blur-xl border-b border-[#1E1E2E] z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold gradient-text">ProAI</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-muted hover:text-foreground transition-colors">Fonctionnalités</a>
              <a href="#agents" className="text-muted hover:text-foreground transition-colors">Agents IA</a>
              <a href="#pricing" className="text-muted hover:text-foreground transition-colors">Tarifs</a>
              <Link href="/login" className="text-primary hover:underline">Se connecter</Link>
              <Link href="/signup" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors">
                Essai gratuit
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex justify-center mb-6">
              <div className="flex -space-x-2">
                <img className="w-10 h-10 rounded-full border-2 border-surface" src="https://api.dicebear.com/9.x/notionists/svg?seed=Alice" alt="Avatar" />
                <img className="w-10 h-10 rounded-full border-2 border-surface" src="https://api.dicebear.com/9.x/notionists/svg?seed=Bob" alt="Avatar" />
                <img className="w-10 h-10 rounded-full border-2 border-surface" src="https://api.dicebear.com/9.x/notionists/svg?seed=Charlie" alt="Avatar" />
                <img className="w-10 h-10 rounded-full border-2 border-surface" src="https://api.dicebear.com/9.x/notionists/svg?seed=Diana" alt="Avatar" />
                <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-surface flex items-center justify-center text-xs font-bold text-primary">+99</div>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-6">
              Automatisez votre business avec des Agents IA
            </h1>
            <p className="text-xl text-muted max-w-3xl mx-auto mb-8">
              Lancez vos workflows, chats IA et analyses en quelques clics. ProAI transforme votre productivité.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  x: useTransform(mouseX, [0, window.innerWidth], [-10, 10]),
                  y: useTransform(mouseY, [0, window.innerHeight], [-10, 10]),
                }}
              >
                <Link href="/signup" className="px-8 py-4 bg-primary text-white rounded-lg text-lg font-semibold hover:bg-primary/80 transition-colors hover-lift">
                  Démarrer gratuitement
                </Link>
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 border border-[#1E1E2E] rounded-lg text-lg hover:bg-[#1E1E2E] transition-colors"
              >
                Voir la démo
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">10k+</div>
              <div className="text-muted">Utilisateurs actifs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">500k+</div>
              <div className="text-muted">Conversations IA</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">99.9%</div>
              <div className="text-muted">Taux de disponibilité</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-surface/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <p className="text-muted">Utilisé par des entreprises de toutes tailles</p>
          </div>
          <div className="flex justify-center items-center space-x-8 opacity-60">
            <div className="text-2xl font-bold">Company A</div>
            <div className="text-2xl font-bold">Company B</div>
            <div className="text-2xl font-bold">Company C</div>
            <div className="text-2xl font-bold">Company D</div>
          </div>
        </div>
      </section>

      {/* Demo Window */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-surface border border-[#1E1E2E] rounded-xl p-8 shadow-2xl"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">Interface de chat IA</h2>
              <p className="text-muted">Discutez avec vos agents spécialisés</p>
            </div>
            <div className="bg-base rounded-lg p-4 space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm">U</div>
                <div className="bg-surface p-3 rounded-lg">
                  <p className="text-sm">Bonjour, pouvez-vous analyser mes ventes de ce mois ?</p>
                </div>
              </div>
              <div className="flex gap-3 flex-row-reverse">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">🤖</div>
                <div className="bg-primary p-3 rounded-lg text-white">
                  <p className="text-sm">Bien sûr ! Voici l'analyse de vos ventes...</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Fonctionnalités puissantes</h2>
            <p className="text-xl text-muted">Tout ce dont vous avez besoin pour automatiser votre business</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: '🤖', title: 'Agents IA spécialisés', desc: 'Marketing, ventes, analytics, automatisation' },
              { icon: '💬', title: 'Chat en temps réel', desc: 'Interface conversationnelle intuitive' },
              { icon: '⚡', title: 'Automatisation', desc: 'Workflows intelligents et tâches répétitives' },
              { icon: '📊', title: 'Analytics avancés', desc: 'Rapports et insights automatiques' },
              { icon: '🔗', title: 'Intégrations', desc: 'Connectez vos outils préférés' },
              { icon: '🔒', title: 'Sécurité', desc: 'Données chiffrées et conformes' },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="bg-surface border border-[#1E1E2E] rounded-xl p-6 hover-lift"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Agents IA */}
      <section id="agents" className="py-16 px-4 sm:px-6 lg:px-8 bg-surface/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Nos Agents IA</h2>
            <p className="text-xl text-muted">Spécialisés pour votre business</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: 'Marketing', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Marketing', desc: 'Création de contenu, campagnes' },
              { name: 'Ventes', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Ventes', desc: 'Qualification leads, closing' },
              { name: 'Analytics', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Analytics', desc: 'Données, rapports, insights' },
              { name: 'Automatisation', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Auto', desc: 'Workflows, tâches répétitives' },
            ].map((agent, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="bg-surface border border-[#1E1E2E] rounded-xl p-6 text-center hover-lift"
              >
                <img src={agent.avatar} alt={agent.name} className="w-16 h-16 rounded-full mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">{agent.name}</h3>
                <p className="text-muted">{agent.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Comment ça marche</h2>
            <p className="text-xl text-muted">3 étapes simples pour commencer</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Créez votre compte', desc: 'Inscription gratuite en 30 secondes' },
              { step: '2', title: 'Choisissez vos agents', desc: 'Sélectionnez les spécialisations IA' },
              { step: '3', title: 'Automatisez', desc: 'Lancez vos workflows et chats' },
            ].map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 px-4 sm:px-6 lg:px-8 bg-surface/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Tarifs simples</h2>
            <p className="text-xl text-muted">Choisissez le plan qui vous convient</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Gratuit', price: '0€', features: ['1 agent IA', '100 conversations/mois', 'Support basique'] },
              { name: 'Pro', price: '29€', features: ['5 agents IA', '1000 conversations/mois', 'Support prioritaire'], popular: true },
              { name: 'Entreprise', price: '99€', features: ['Agents illimités', 'Conversations illimitées', 'Support dédié'] },
            ].map((plan, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className={`bg-surface border rounded-xl p-8 ${plan.popular ? 'border-primary' : 'border-[#1E1E2E]'} hover-lift`}
              >
                {plan.popular && <div className="text-center mb-4"><span className="pill pill-blue">Populaire</span></div>}
                <h3 className="text-2xl font-bold text-foreground text-center mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold text-primary text-center mb-6">{plan.price}/mois</div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      <span className="text-muted">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="block text-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors">
                  Commencer
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Ce que disent nos utilisateurs</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Alice Dupont', role: 'CEO, StartupTech', text: 'ProAI a révolutionné notre productivité. Nos agents IA gèrent 80% de nos tâches répétitives.' },
              { name: 'Bob Martin', role: 'Directeur Marketing', text: 'Les agents marketing créent du contenu de qualité en quelques minutes. Incroyable !' },
              { name: 'Charlie Brown', role: 'Chef de ventes', text: 'Nos conversions ont augmenté de 40% grâce aux agents de qualification automatique.' },
            ].map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="bg-surface border border-[#1E1E2E] rounded-xl p-6 hover-lift"
              >
                <p className="text-muted mb-4">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <img src={`https://api.dicebear.com/9.x/notionists/svg?seed=${testimonial.name}`} alt={testimonial.name} className="w-10 h-10 rounded-full" />
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">Prêt à automatiser votre business ?</h2>
            <p className="text-xl text-white/80 mb-8">Rejoignez des milliers d'entreprises qui utilisent ProAI</p>
            <Link href="/signup" className="inline-block px-8 py-4 bg-white text-primary rounded-lg text-lg font-semibold hover:bg-white/90 transition-colors hover-lift">
              Démarrer gratuitement
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-surface border-t border-[#1E1E2E]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <span className="text-2xl font-bold gradient-text">ProAI</span>
              <p className="text-muted mt-2">Automatisez votre business avec des Agents IA</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Produit</h4>
              <ul className="space-y-2 text-muted">
                <li><a href="#" className="hover:text-foreground transition-colors">Fonctionnalités</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Agents IA</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Tarifs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <ul className="space-y-2 text-muted">
                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Légal</h4>
              <ul className="space-y-2 text-muted">
                <li><a href="#" className="hover:text-foreground transition-colors">Confidentialité</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">CGU</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#1E1E2E] mt-8 pt-8 text-center text-muted">
            <p>&copy; 2024 ProAI. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
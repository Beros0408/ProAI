'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      window.location.href = '/dashboard'
    }
  }

  return (
    <div className="bg-surface border border-[#1E1E2E] rounded-2xl p-8 shadow-2xl animate-fade-in">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
          <span className="text-2xl">&#9889;</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Connexion</h1>
        <p className="text-muted text-sm mt-1">Bienvenue sur ProAI</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2.5 rounded-lg bg-base border border-[#1E1E2E] text-foreground placeholder-muted focus:outline-none focus:border-primary transition-colors text-sm"
            placeholder="vous@exemple.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2.5 rounded-lg bg-base border border-[#1E1E2E] text-foreground placeholder-muted focus:outline-none focus:border-primary transition-colors text-sm"
            placeholder="********"
          />
        </div>
        {error && (
          <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-lg bg-primary hover:bg-primary-hover text-white font-medium text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Pas encore de compte ?{' '}
        <Link href="/signup" className="text-primary hover:underline">
          S&apos;inscrire
        </Link>
      </p>
    </div>
  )
}
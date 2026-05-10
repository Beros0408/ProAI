'use client'

import { useEffect, useState } from 'react'

export function VoiceOutput({ text }: { text: string }) {
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'speechSynthesis' in window)
  }, [])

  const speak = () => {
    if (!supported || !text) return
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'fr-FR'
    window.speechSynthesis.speak(utterance)
  }

  return (
    <div className="rounded-3xl border border-default bg-[var(--bg-base)] p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Sortie vocale</h3>
          <p className="text-xs text-muted">Lis le message généré à haute voix.</p>
        </div>
        <button
          onClick={speak}
          disabled={!supported || !text}
          className="rounded-2xl border border-default bg-surface px-4 py-2 text-sm text-foreground transition hover:bg-[var(--bg-elevated)] disabled:opacity-50"
        >
          Lire
        </button>
      </div>
    </div>
  )
}

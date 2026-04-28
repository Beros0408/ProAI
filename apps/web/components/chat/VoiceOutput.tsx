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
    <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Sortie vocale</h3>
          <p className="text-xs text-slate-400">Lis le message généré à haute voix.</p>
        </div>
        <button
          onClick={speak}
          disabled={!supported || !text}
          className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          Lire
        </button>
      </div>
    </div>
  )
}

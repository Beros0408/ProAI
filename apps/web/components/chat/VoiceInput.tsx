'use client'

import { useEffect, useState } from 'react'

export function VoiceInput({ onTranscript }: { onTranscript: (text: string) => void }) {
  const [recording, setRecording] = useState(false)
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  }, [])

  const handleStart = () => {
    if (!supported) return
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'fr-FR'
    recognition.interimResults = false
    recognition.onresult = (event: any) => {
      onTranscript(event.results[0][0].transcript)
    }
    recognition.onend = () => setRecording(false)
    recognition.start()
    setRecording(true)
  }

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Entrée vocale</h3>
          <p className="text-xs text-slate-400">Dicte ton message au lieu de taper.</p>
        </div>
        <button
          disabled={!supported}
          onClick={handleStart}
          className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          {recording ? 'Écoute...' : supported ? 'Démarrer' : 'Non supporté'}
        </button>
      </div>
    </div>
  )
}

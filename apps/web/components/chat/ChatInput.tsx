'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Send, Paperclip, Mic, MicOff, X } from 'lucide-react'

const ACCEPTED_MIME = new Set([
  'image/png', 'image/jpeg', 'image/jpg', 'image/webp',
  'application/pdf',
  'text/plain', 'text/csv',
])
const MAX_BYTES = 10 * 1024 * 1024

interface Props {
  onSend: (content: string) => void
  onFileSend?: (file: File, message?: string) => Promise<void>
  disabled?: boolean
  isUploading?: boolean
  placeholder?: string
}

export function ChatInput({
  onSend,
  onFileSend,
  disabled = false,
  isUploading = false,
  placeholder = 'Écrivez votre message...',
}: Props) {
  const [value, setValue] = useState('')
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    setVoiceSupported(
      typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window),
    )
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setFileError(null)
    if (!ACCEPTED_MIME.has(file.type)) {
      setFileError('Format non supporté. Acceptés : PNG, JPG, PDF, TXT, CSV.')
      return
    }
    if (file.size > MAX_BYTES) {
      setFileError('Fichier trop volumineux (max. 10 Mo).')
      return
    }
    setPendingFile(file)
  }

  const handleSend = useCallback(async () => {
    if (disabled || isUploading) return
    if (pendingFile && onFileSend) {
      await onFileSend(pendingFile, value.trim() || undefined)
      setPendingFile(null)
      setValue('')
      if (textareaRef.current) textareaRef.current.style.height = 'auto'
      return
    }
    const trimmed = value.trim()
    if (!trimmed) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }, [value, disabled, isUploading, pendingFile, onFileSend, onSend])

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleVoice = () => {
    if (!voiceSupported) return
    if (isRecording) {
      recognitionRef.current?.stop()
      setIsRecording(false)
      return
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SR()
    recognitionRef.current = recognition
    recognition.lang = 'fr-FR'
    recognition.interimResults = false
    recognition.onresult = (e: any) => {
      const transcript: string = e.results[0][0].transcript
      setValue(prev => (prev.trim() ? `${prev.trim()} ${transcript}` : transcript))
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto'
          textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px'
        }
      }, 0)
    }
    recognition.onend = () => setIsRecording(false)
    recognition.onerror = () => setIsRecording(false)
    recognition.start()
    setIsRecording(true)
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} o`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
    return `${(bytes / 1024 / 1024).toFixed(1)} Mo`
  }

  const fileEmoji = (file: File) => {
    if (file.type.startsWith('image/')) return '🖼️'
    if (file.type === 'application/pdf') return '📄'
    return '📝'
  }

  const canSend = !disabled && !isUploading && (!!pendingFile || !!value.trim())

  return (
    <div className="flex flex-col border-t border-[#1E1E2E] bg-surface">

      {/* File preview strip */}
      {pendingFile && (
        <div className="flex items-center gap-2 px-4 pt-3 pb-1 animate-slide-up">
          <div className="flex items-center gap-2.5 flex-1 min-w-0 px-3 py-2 rounded-xl"
            style={{
              background: 'rgba(14,165,233,0.08)',
              border: '1px solid rgba(14,165,233,0.25)',
            }}>
            <span className="text-base shrink-0">{fileEmoji(pendingFile)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: '#0ea5e9' }}>{pendingFile.name}</p>
              <p className="text-[10px] text-muted mt-0.5">{formatSize(pendingFile.size)}</p>
            </div>
            <button
              type="button"
              onClick={() => setPendingFile(null)}
              className="shrink-0 p-0.5 rounded hover:bg-white/10 transition-colors"
              aria-label="Retirer le fichier"
            >
              <X className="w-3.5 h-3.5 text-muted hover:text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Error message */}
      {fileError && (
        <p className="px-4 pt-2 text-xs text-red-400 flex items-center gap-1.5">
          <span>⚠</span>
          {fileError}
        </p>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2 p-4">

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".png,.jpg,.jpeg,.webp,.pdf,.txt,.csv"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Paperclip button */}
        <button
          type="button"
          onClick={() => { setFileError(null); fileInputRef.current?.click() }}
          disabled={disabled || isUploading}
          className="p-2 rounded-lg transition-colors shrink-0 disabled:opacity-40"
          aria-label="Joindre un fichier"
        >
          <Paperclip
            className="w-4 h-4 transition-colors"
            style={{ color: pendingFile ? '#0ea5e9' : '#64748b' }}
          />
        </button>

        {/* Textarea */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={disabled || isUploading}
            placeholder={
              isUploading
                ? 'Analyse en cours...'
                : pendingFile
                ? 'Ajouter un message (optionnel)...'
                : placeholder
            }
            rows={1}
            className="w-full resize-none px-3 py-2.5 rounded-xl bg-base border border-[#1E1E2E] text-foreground placeholder-muted text-sm focus:outline-none focus:border-primary transition-colors disabled:opacity-60 max-h-40 overflow-y-auto leading-relaxed"
          />
        </div>

        {/* Mic button */}
        <button
          type="button"
          onClick={handleVoice}
          disabled={!voiceSupported || disabled || isUploading}
          className={`p-2 rounded-lg transition-all shrink-0 disabled:opacity-40 ${isRecording ? 'animate-pulse' : ''}`}
          style={isRecording ? { background: 'var(--color-error-bg, rgba(248,113,113,0.15))' } : {}}
          aria-label={isRecording ? 'Arrêter l\'enregistrement' : 'Entrée vocale'}
          title={!voiceSupported ? 'Reconnaissance vocale non supportée par ce navigateur (Chrome recommandé)' : isRecording ? 'Cliquez pour arrêter' : 'Cliquez pour dicter'}
        >
          {isRecording ? (
            <MicOff className="w-4 h-4" style={{ color: 'var(--color-error, #f87171)' }} />
          ) : (
            <Mic className="w-4 h-4" style={{ color: 'var(--text-muted, #64748b)' }} />
          )}
        </button>

        {/* Send / spinner button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          className="p-2.5 rounded-xl bg-primary hover:bg-[#4F46E5] text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover-press shrink-0"
          aria-label="Envoyer"
        >
          {isUploading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Recording indicator */}
      {isRecording && (
        <div className="flex items-center gap-2 px-4 pb-2 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs text-red-400">Écoute en cours — parlez maintenant...</span>
        </div>
      )}
    </div>
  )
}

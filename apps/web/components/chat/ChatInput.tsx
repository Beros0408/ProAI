'use client'

import { useState, useRef, useCallback } from 'react'
import { Send, Paperclip, Mic } from 'lucide-react'

interface Props {
  onSend: (content: string) => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({ onSend, disabled = false, placeholder = 'Écrivez votre message...' }: Props) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [value, disabled, onSend])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }

  return (
    <div className="flex items-end gap-2 p-4 border-t border-[#1E1E2E] bg-surface">
      <button
        type="button"
        className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-[#1E1E2E] transition-colors shrink-0"
        aria-label="Joindre un fichier"
      >
        <Paperclip className="w-4 h-4" />
      </button>

      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          rows={1}
          className="w-full resize-none px-3 py-2.5 rounded-xl bg-base border border-[#1E1E2E] text-foreground placeholder-muted text-sm focus:outline-none focus:border-primary transition-colors disabled:opacity-60 max-h-40 overflow-y-auto leading-relaxed"
        />
      </div>

      <button
        type="button"
        className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-[#1E1E2E] transition-colors shrink-0"
        aria-label="Entrée vocale"
      >
        <Mic className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        className="p-2.5 rounded-xl bg-primary hover:bg-[#4F46E5] text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover-press shrink-0"
        aria-label="Envoyer"
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  )
}

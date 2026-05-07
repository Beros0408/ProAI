'use client'

import { useEffect, useRef, useState } from 'react'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { AgentBadge } from './AgentBadge'
import { useChat } from '@/hooks/useChat'
import { createClient } from '@/lib/supabase/client'
import type { AgentType } from '@proai/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

interface Props {
  conversationId: string | null
  agentType: AgentType
}

export function ChatContainer({ conversationId, agentType }: Props) {
  const { messages, sendMessage, addMessages, isLoading, isStreaming } = useChat(conversationId, agentType)
  const [isUploading, setIsUploading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isStreaming, isUploading])

  const handleFileSend = async (file: File, message?: string) => {
    const userContent = message?.trim()
      ? `📎 **${file.name}** — ${message.trim()}`
      : `📎 **${file.name}** — envoyé pour analyse`

    setIsUploading(true)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      const formData = new FormData()
      formData.append('file', file)
      if (message?.trim()) formData.append('message', message.trim())

      const response = await fetch(`${API_URL}/api/v1/upload/analyze`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.detail || "Erreur lors de l'analyse du fichier")
      }

      const data = await response.json()
      const assistantContent = `**Analyse de ${data.file_name}**\n\n${data.analysis}`
      addMessages(userContent, assistantContent)
    } catch (err: any) {
      addMessages(
        userContent,
        `⚠️ **Erreur lors de l'analyse**\n\n${err.message || 'Impossible d\'analyser ce fichier. Vérifiez le format et la taille (max. 10 Mo).'}`,
      )
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-base animate-fade-in">
      <div className="flex items-center gap-3 px-6 h-16 border-b border-[#1E1E2E] bg-surface shrink-0 animate-fade-down">
        <AgentBadge agentType={agentType} size="md" />
        {(isStreaming || isUploading) && (
          <div className="flex items-center gap-1.5 text-xs text-muted ml-auto">
            <span className="animate-pulse-dot w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="animate-pulse-dot w-1.5 h-1.5 rounded-full bg-primary" style={{ animationDelay: '0.2s' }} />
            <span className="animate-pulse-dot w-1.5 h-1.5 rounded-full bg-primary" style={{ animationDelay: '0.4s' }} />
            <span className="ml-1">{isUploading ? 'Analyse en cours...' : 'Génération en cours...'}</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 stagger-children">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 animate-fade-in">
            <div className="text-4xl">💬</div>
            <p className="text-muted text-sm max-w-xs">
              Commencez la conversation. L&apos;agent est prêt à vous aider.
            </p>
          </div>
        )}
        {messages.map(msg => (
          <ChatMessage key={msg.id} message={msg} agentType={agentType} />
        ))}
        <div ref={bottomRef} />
      </div>

      <ChatInput
        onSend={sendMessage}
        onFileSend={handleFileSend}
        disabled={isLoading || isStreaming || isUploading}
        isUploading={isUploading}
      />
    </div>
  )
}

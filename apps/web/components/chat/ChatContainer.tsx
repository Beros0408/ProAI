'use client'

import { useEffect, useRef } from 'react'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { AgentBadge } from './AgentBadge'
import { useChat } from '@/hooks/useChat'
import type { AgentType } from '@proai/types'

interface Props {
  conversationId: string | null
  agentType: AgentType
}

export function ChatContainer({ conversationId, agentType }: Props) {
  const { messages, sendMessage, isLoading, isStreaming } = useChat(conversationId, agentType)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isStreaming])

  return (
    <div className="flex flex-col h-full bg-base animate-fade-in">
      <div className="flex items-center gap-3 px-6 h-16 border-b border-[#1E1E2E] bg-surface shrink-0 animate-fade-down">
        <AgentBadge agentType={agentType} size="md" />
        {isStreaming && (
          <div className="flex items-center gap-1.5 text-xs text-muted ml-auto">
            <span className="animate-pulse-dot w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="animate-pulse-dot w-1.5 h-1.5 rounded-full bg-primary" style={{ animationDelay: '0.2s' }} />
            <span className="animate-pulse-dot w-1.5 h-1.5 rounded-full bg-primary" style={{ animationDelay: '0.4s' }} />
            <span className="ml-1">Génération en cours...</span>
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

      <ChatInput onSend={sendMessage} disabled={isLoading || isStreaming} />
    </div>
  )
}

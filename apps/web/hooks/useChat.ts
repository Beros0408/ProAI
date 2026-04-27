'use client'
import { useState, useCallback } from 'react'
import { generateId } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

interface Message {
  id: string
  conversationId: string
  role: 'user' | 'assistant'
  content: string
  agentType?: string
  createdAt: string
}

export function useChat(conversationId: string | null, agentType: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)

  const sendMessage = useCallback(
    async (content: string) => {
      const userMsg: Message = {
        id: generateId(),
        conversationId: conversationId ?? 'temp',
        role: 'user',
        content,
        createdAt: new Date().toISOString(),
      }

      setMessages(prev => [...prev, userMsg])
      setIsLoading(true)

      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token

        const response = await fetch(`${API_URL}/api/v1/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            message: content,
            agent_type: agentType,
            conversation_id: conversationId,
          }),
        })

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}))
          throw new Error(errData.detail || 'Chat request failed')
        }

        const data = await response.json()

        const assistantMsg: Message = {
          id: generateId(),
          conversationId: data.conversation_id || conversationId || 'temp',
          role: 'assistant',
          content: data.message?.content || data.response || 'No response',
          agentType: data.agent_used || agentType,
          createdAt: new Date().toISOString(),
        }

        setMessages(prev => [...prev, assistantMsg])
      } catch (err: any) {
        const errorMsg: Message = {
          id: generateId(),
          conversationId: conversationId ?? 'temp',
          role: 'assistant',
          content: `Erreur: ${err.message || 'Impossible de contacter le serveur'}`,
          createdAt: new Date().toISOString(),
        }
        setMessages(prev => [...prev, errorMsg])
      } finally {
        setIsLoading(false)
        setIsStreaming(false)
      }
    },
    [conversationId, agentType],
  )

  return { messages, sendMessage, isLoading, isStreaming }
}
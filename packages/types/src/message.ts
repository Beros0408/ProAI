import type { AgentType } from './conversation'
export type MessageRole = 'user' | 'assistant' | 'system'
export interface IMessage {
  id: string; conversationId: string; role: MessageRole; content: string
  agentType?: AgentType; tokensUsed?: number; metadata?: Record<string, unknown>; createdAt: string
}

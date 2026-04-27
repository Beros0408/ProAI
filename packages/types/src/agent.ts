import type { AgentType } from './conversation'

export type AgentStatus = 'active' | 'inactive' | 'archived'

export interface IAgent {
  id: string
  workspaceId: string
  organizationId: string
  name: string
  agentType: AgentType
  systemPrompt?: string
  status: AgentStatus
  llmProvider: 'openai' | 'anthropic'
  llmModel: string
  temperature: number
  maxTokens: number
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

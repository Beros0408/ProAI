export type AgentType = 'general' | 'marketing' | 'sales' | 'automation' | 'analytics'
export interface IConversation {
  id: string; workspaceId: string; title: string; agentType: AgentType
  messageCount: number; createdAt: string; updatedAt: string; deletedAt?: string
}

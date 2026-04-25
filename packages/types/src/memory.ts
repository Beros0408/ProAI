export type MemoryCategory = 'BUSINESS_FACT' | 'PREFERENCE' | 'DECISION' | 'PERSONA' | 'KPI'
export interface IMemoryItem {
  id: string; workspaceId: string; category: MemoryCategory; content: string
  importance: number; expiresAt?: string; createdAt: string; updatedAt: string; deletedAt?: string
}

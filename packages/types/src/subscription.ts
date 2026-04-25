export type PlanId = 'free' | 'pro' | 'business' | 'enterprise'
export interface ISubscription {
  id: string; organizationId: string; planId: PlanId
  stripeCustomerId?: string; stripeSubscriptionId?: string
  status: 'active' | 'canceled' | 'past_due' | 'trialing'
  currentPeriodEnd: string; createdAt: string
}
export const PLAN_LIMITS: Record<PlanId, { messagesPerMonth: number; workspaces: number; agents: number }> = {
  free:       { messagesPerMonth: 50,  workspaces: 1,  agents: 1  },
  pro:        { messagesPerMonth: -1,  workspaces: 3,  agents: 3  },
  business:   { messagesPerMonth: -1,  workspaces: 10, agents: -1 },
  enterprise: { messagesPerMonth: -1,  workspaces: -1, agents: -1 },
}

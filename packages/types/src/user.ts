export type UserRole = 'owner' | 'admin' | 'member' | 'viewer'
export interface IUser {
  id: string; email: string; fullName: string; avatarUrl?: string
  organizationId: string; role: UserRole; createdAt: string; updatedAt: string
}
export interface IOrganization {
  id: string; name: string; slug: string; planId: string; createdAt: string
}

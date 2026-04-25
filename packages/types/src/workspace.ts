export interface IBusinessProfile {
  sector: string; targetAudience: string; mainObjective: string
  teamSize: '1' | '2-5' | '6-20' | '21-50' | '50+'; currentTools: string[]
  businessSummary?: string
}
export interface IWorkspace {
  id: string; organizationId: string; name: string; description?: string
  businessProfile: IBusinessProfile; createdAt: string; updatedAt: string; deletedAt?: string
}

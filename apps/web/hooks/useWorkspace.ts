'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

interface Workspace {
  id: string
  name: string
  organizationId: string
  agentCount: number
  createdAt: string
}

export function useWorkspace(workspaceId?: string) {
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!workspaceId) {
      setLoading(false)
      return
    }

    let cancelled = false
    api
      .get<Workspace>(`/api/v1/workspaces/${workspaceId}`)
      .then(data => { if (!cancelled) setWorkspace(data) })
      .catch(err => { if (!cancelled) setError((err as Error).message) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [workspaceId])

  return { workspace, loading, error }
}

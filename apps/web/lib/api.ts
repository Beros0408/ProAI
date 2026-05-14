import { createClient } from './supabase/client'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

// Singleton client — avoids multiple instances racing on auth state
let _client: ReturnType<typeof createClient> | null = null
function supabaseBrowser() {
  if (typeof window === 'undefined') return null
  if (!_client) _client = createClient()
  return _client
}

/** Extract the JWT stored by @supabase/ssr (cookies) or supabase-js (localStorage). */
function readStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
    const match = supabaseUrl.match(/https?:\/\/([^.]+)\./)
    const projectRef = match?.[1]
    if (!projectRef) return null
    const key = `sb-${projectRef}-auth-token`

    // 1. localStorage (supabase-js default)
    const lsRaw = localStorage.getItem(key)
    if (lsRaw) {
      const parsed = JSON.parse(lsRaw)
      if (parsed?.access_token) return parsed.access_token as string
    }

    // 2. First cookie chunk (supabase/ssr splits large sessions)
    const allCookies = document.cookie.split(';')
    const chunks: string[] = []
    let i = 0
    while (true) {
      const chunkKey = i === 0 ? key : `${key}.${i}`
      const found = allCookies.find(c => c.trim().startsWith(`${chunkKey}=`))
      if (!found) break
      chunks.push(decodeURIComponent(found.trim().slice(chunkKey.length + 1)))
      i++
    }
    if (chunks.length) {
      const parsed = JSON.parse(chunks.join(''))
      if (parsed?.access_token) return parsed.access_token as string
    }
  } catch {
    // ignore parse errors
  }
  return null
}

async function getAuthHeaders(): Promise<HeadersInit> {
  try {
    const supabase = supabaseBrowser()
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        return { Authorization: `Bearer ${session.access_token}` }
      }
    }
  } catch {
    // ignore
  }

  // Fallback: read token directly from storage (handles SSR cookie edge-cases)
  const stored = readStoredToken()
  if (stored) return { Authorization: `Bearer ${stored}` }

  return {}
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const authHeaders = await getAuthHeaders()
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...init?.headers,
    },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`API error ${res.status}: ${body}`)
  }
  return res.json() as Promise<T>
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),

  streamChat(conversationId: string | null, message: string, agentType: string): EventSource {
    const params = new URLSearchParams({ message, agent_type: agentType })
    if (conversationId) params.set('conversation_id', conversationId)
    return new EventSource(`${API_URL}/api/v1/chat/stream?${params}`)
  },
}

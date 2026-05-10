/**
 * Shared mock factories for all test files.
 * Import from here instead of repeating jest.mock() calls everywhere.
 */

export const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
  replace: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
  forward: jest.fn(),
}

export const mockSearchParams = {
  get: jest.fn().mockReturnValue(null),
}

export const mockT = (key: string) => key

export const mockTheme = {
  theme: 'dark' as const,
  setTheme: jest.fn(),
  toggleTheme: jest.fn(),
}

export const mockNotifications = {
  notifications: [],
  unreadCount: 0,
  addNotification: jest.fn(),
  markAllRead: jest.fn(),
  markRead: jest.fn(),
}

export const mockSupabaseClient = {
  auth: {
    getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
    signUp: jest.fn().mockResolvedValue({ error: null }),
    signInWithPassword: jest.fn().mockResolvedValue({ error: null }),
    signInWithOAuth: jest.fn().mockResolvedValue({ error: null }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
  },
}

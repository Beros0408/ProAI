/**
 * Basic smoke tests — verify key components render without crashing.
 *
 * Note: the Next.js build (npx next build) is the primary test.
 * These tests verify individual component rendering in isolation.
 */
import '@testing-library/jest-dom'
import React from 'react'
import { render } from '@testing-library/react'

// ── Global mocks ──────────────────────────────────────────────────────────────

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
  usePathname: () => '/dashboard',
  useSearchParams: () => ({ get: () => null }),
}))

jest.mock('@/lib/i18n/context', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: 'fr',
    switchLanguage: jest.fn(),
  }),
}))

jest.mock('@/lib/theme/context', () => ({
  useTheme: () => ({ theme: 'dark', toggleTheme: jest.fn(), setTheme: jest.fn() }),
}))

jest.mock('@/lib/notifications/context', () => ({
  useNotifications: () => ({
    notifications: [],
    unreadCount: 0,
    addNotification: jest.fn(),
    markAllRead: jest.fn(),
    markRead: jest.fn(),
  }),
}))

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      signUp: jest.fn().mockResolvedValue({ error: null }),
      signInWithPassword: jest.fn().mockResolvedValue({ error: null }),
      signInWithOAuth: jest.fn().mockResolvedValue({ error: null }),
    },
  }),
}))

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('BackButton', () => {
  it('renders without crashing', () => {
    const { BackButton } = require('@/components/ui/BackButton')
    const { getByRole } = render(<BackButton />)
    expect(getByRole('button')).toBeTruthy()
  })
})

describe('Skeleton components', () => {
  it('Skeleton renders', () => {
    const { Skeleton } = require('@/components/ui/Skeleton')
    const { container } = render(<Skeleton className="h-4 w-24" />)
    expect(container.firstChild).toBeTruthy()
  })

  it('CardSkeleton renders', () => {
    const { CardSkeleton } = require('@/components/ui/Skeleton')
    const { container } = render(<CardSkeleton />)
    expect(container.firstChild).toBeTruthy()
  })

  it('DashboardSkeleton renders', () => {
    const { DashboardSkeleton } = require('@/components/ui/Skeleton')
    const { container } = render(<DashboardSkeleton />)
    expect(container.firstChild).toBeTruthy()
  })
})

describe('NotFound page', () => {
  it('renders without crashing', () => {
    const NotFound = require('@/app/not-found').default
    const { container } = render(<NotFound />)
    expect(container.firstChild).toBeTruthy()
  })
})

describe('OfflinePage', () => {
  it('renders without crashing', () => {
    const OfflinePage = require('@/app/offline/page').default
    const { container } = render(<OfflinePage />)
    expect(container.firstChild).toBeTruthy()
  })
})

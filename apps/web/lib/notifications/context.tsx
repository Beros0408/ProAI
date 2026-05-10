'use client'

import { createContext, useContext, useState, useCallback } from 'react'

export interface Notification {
  id: string
  title: string
  message: string
  read: boolean
  createdAt: Date
  type: 'info' | 'success' | 'warning'
}

interface NotificationsContextValue {
  notifications: Notification[]
  unreadCount: number
  addNotification: (n: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void
  markAllRead: () => void
  markRead: (id: string) => void
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null)

const INITIAL: Notification[] = [
  {
    id: '1',
    title: 'Agent Marketing',
    message: 'Votre campagne email a été générée avec succès.',
    read: false,
    createdAt: new Date(Date.now() - 10 * 60 * 1000),
    type: 'success',
  },
  {
    id: '2',
    title: 'Nouveau lead',
    message: 'Alice Dubois vient d\'entrer dans votre pipeline CRM.',
    read: false,
    createdAt: new Date(Date.now() - 42 * 60 * 1000),
    type: 'info',
  },
  {
    id: '3',
    title: 'Workflow déclenché',
    message: 'Séquence "Nurture B2B" exécutée pour 12 contacts.',
    read: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    type: 'info',
  },
]

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL)

  const unreadCount = notifications.filter(n => !n.read).length

  const addNotification = useCallback((n: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
    setNotifications(prev => [
      { ...n, id: String(Date.now()), read: false, createdAt: new Date() },
      ...prev,
    ])
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const markRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }, [])

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, addNotification, markAllRead, markRead }}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider')
  return ctx
}

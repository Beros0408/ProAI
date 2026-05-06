'use client'

import { useEffect } from 'react'

export function PWARegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[ProAI] Service Worker registered:', registration.scope)
        })
        .catch((error) => {
          console.log('[ProAI] Service Worker registration failed:', error)
        })
    }
  }, [])

  return null
}

'use client'

import { useEffect, useRef, useCallback } from 'react'

interface SSEOptions {
  onMessage: (data: string) => void
  onDone?: () => void
  onError?: (err: Event) => void
}

export function useSSE() {
  const esRef = useRef<EventSource | null>(null)

  const connect = useCallback((url: string, opts: SSEOptions) => {
    esRef.current?.close()
    const es = new EventSource(url)
    esRef.current = es

    es.onmessage = (e: MessageEvent<string>) => {
      if (e.data === '[DONE]') {
        opts.onDone?.()
        es.close()
      } else {
        opts.onMessage(e.data)
      }
    }

    es.onerror = (err) => {
      opts.onError?.(err)
      es.close()
    }
  }, [])

  const disconnect = useCallback(() => {
    esRef.current?.close()
    esRef.current = null
  }, [])

  useEffect(() => () => { esRef.current?.close() }, [])

  return { connect, disconnect }
}

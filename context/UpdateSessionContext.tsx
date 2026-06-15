'use client'
import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import type { Direction } from '@/types'

interface PendingChange {
  itemId: string
  itemName: string
  oldValue: number
  newValue: number
  unit: 'count' | 'lbs'
}

interface ActiveSession {
  direction: Direction
  note: string
  changes: Map<string, PendingChange>
  newItemIds: Set<string>
}

interface UpdateSessionContextType {
  session: ActiveSession | null
  startSession: (direction: Direction, note: string) => void
  setItemChange: (itemId: string, itemName: string, oldValue: number, newValue: number, unit: 'count' | 'lbs') => void
  clearItemChange: (itemId: string) => void
  trackNewItem: (itemId: string) => void
  cancelSession: () => void
  submitSession: () => Promise<void>
  isSubmitting: boolean
}

const UpdateSessionContext = createContext<UpdateSessionContextType | null>(null)

export function UpdateSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<ActiveSession | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const startSession = useCallback((direction: Direction, note: string) => {
    setSession({ direction, note, changes: new Map(), newItemIds: new Set() })
  }, [])

  const setItemChange = useCallback(
    (itemId: string, itemName: string, oldValue: number, newValue: number, unit: 'count' | 'lbs') => {
      setSession((prev) => {
        if (!prev) return null
        const changes = new Map(prev.changes)
        if (newValue !== oldValue) {
          changes.set(itemId, { itemId, itemName, oldValue, newValue, unit })
        } else {
          changes.delete(itemId)
        }
        return { ...prev, changes }
      })
    },
    []
  )

  const clearItemChange = useCallback((itemId: string) => {
    setSession((prev) => {
      if (!prev) return null
      const changes = new Map(prev.changes)
      changes.delete(itemId)
      return { ...prev, changes }
    })
  }, [])

  const trackNewItem = useCallback((itemId: string) => {
    setSession((prev) => {
      if (!prev) return null
      const newItemIds = new Set(prev.newItemIds)
      newItemIds.add(itemId)
      return { ...prev, newItemIds }
    })
  }, [])

  const cancelSession = useCallback(() => setSession(null), [])

  const submitSession = useCallback(async () => {
    if (!session) return
    setIsSubmitting(true)
    try {
      const changes = Array.from(session.changes.values()).map((c) => ({
        itemId: c.itemId,
        newValue: c.newValue,
      }))
      const newItemIds = Array.from(session.newItemIds)
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction: session.direction, note: session.note, changes, newItemIds }),
      })
      if (!res.ok) throw new Error('Failed to submit')
      setSession(null)
    } finally {
      setIsSubmitting(false)
    }
  }, [session])

  return (
    <UpdateSessionContext.Provider
      value={{ session, startSession, setItemChange, clearItemChange, trackNewItem, cancelSession, submitSession, isSubmitting }}
    >
      {children}
    </UpdateSessionContext.Provider>
  )
}

export function useUpdateSession() {
  const ctx = useContext(UpdateSessionContext)
  if (!ctx) throw new Error('useUpdateSession must be inside UpdateSessionProvider')
  return ctx
}

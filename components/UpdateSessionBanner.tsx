'use client'
import { useUpdateSession } from '@/context/UpdateSessionContext'

export default function UpdateSessionBanner() {
  const { session, cancelSession, submitSession, isSubmitting } = useUpdateSession()
  if (!session) return null

  const changeCount = session.changes.size
  const newCount = session.newItemIds.size
  const totalCount = changeCount + newCount
  const directionLabel = session.direction === 'in' ? 'Bringing In' : 'Taking Out'

  function statusLabel() {
    if (totalCount === 0) return 'Tap items to record changes'
    const parts = []
    if (changeCount > 0) parts.push(`${changeCount} updated`)
    if (newCount > 0) parts.push(`${newCount} added`)
    return parts.join(', ')
  }

  return (
    <div className="sticky top-0 z-40 bg-forest text-white px-4 py-3 shadow-md">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">
            {directionLabel} — {session.note}
          </p>
          <p className="text-xs text-forest-100">{statusLabel()}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={cancelSession}
            className="px-3 py-2 rounded-xl text-sm font-semibold bg-white/15 hover:bg-white/25 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={submitSession}
            disabled={isSubmitting || totalCount === 0}
            className="px-3 py-2 rounded-xl text-sm font-semibold bg-crimson hover:bg-crimson-700 disabled:opacity-40 transition-colors"
          >
            {isSubmitting ? 'Saving…' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  )
}

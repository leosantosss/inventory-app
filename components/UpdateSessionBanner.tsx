'use client'
import { useUpdateSession } from '@/context/UpdateSessionContext'

export default function UpdateSessionBanner() {
  const { session, cancelSession, submitSession, isSubmitting } = useUpdateSession()
  if (!session) return null

  const changeCount = session.changes.size
  const directionLabel = session.direction === 'in' ? 'In' : 'Out'

  return (
    <div className="sticky top-0 z-40 bg-blue-600 text-white px-4 py-3 shadow-md">
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">
            {directionLabel}: {session.note}
          </p>
          <p className="text-xs text-blue-200">
            {changeCount === 0 ? 'No changes yet' : `${changeCount} item${changeCount > 1 ? 's' : ''} changed`}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={cancelSession}
            className="px-3 py-2 rounded-xl text-sm font-semibold bg-blue-500 hover:bg-blue-400"
          >
            Cancel
          </button>
          <button
            onClick={submitSession}
            disabled={isSubmitting || changeCount === 0}
            className="px-3 py-2 rounded-xl text-sm font-semibold bg-white text-blue-600 disabled:opacity-40"
          >
            {isSubmitting ? 'Saving…' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  )
}

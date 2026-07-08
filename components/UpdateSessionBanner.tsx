'use client'
import { useState } from 'react'
import { useUpdateSession } from '@/context/UpdateSessionContext'

export default function UpdateSessionBanner() {
  const { session, cancelSession, submitSession, isSubmitting, clearItemChange } = useUpdateSession()
  const [expanded, setExpanded] = useState(false)
  if (!session) return null

  const changeList = Array.from(session.changes.values())
  const changeCount = changeList.length
  const newOnlyCount = Array.from(session.newItemIds).filter((id) => !session.changes.has(id)).length
  const totalCount = changeCount + newOnlyCount
  const directionLabel = session.direction === 'in' ? 'Bringing In' : 'Taking Out'

  function statusLabel() {
    if (totalCount === 0) return 'Tap items to record changes'
    const parts = []
    if (changeCount > 0) parts.push(`${changeCount} updated`)
    if (newOnlyCount > 0) parts.push(`${newOnlyCount} added`)
    return parts.join(', ')
  }

  return (
    <div className="sticky top-0 z-40 bg-forest text-white shadow-md">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <button
          onClick={() => changeCount > 0 && setExpanded((v) => !v)}
          className="min-w-0 text-left flex-1"
        >
          <p className="text-sm font-semibold truncate">
            {directionLabel} — {session.note}
          </p>
          <p className="text-xs text-forest-100 flex items-center gap-1">
            {statusLabel()}
            {changeCount > 0 && (
              <span className={`inline-block transition-transform ${expanded ? 'rotate-180' : ''}`}>▾</span>
            )}
          </p>
        </button>
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

      {expanded && changeCount > 0 && (
        <div className="max-h-52 overflow-y-auto bg-forest-700/50 border-t border-white/10">
          {changeList.map((c) => (
            <div
              key={c.itemId}
              className="flex items-center justify-between gap-3 px-4 py-2 border-b border-white/5 last:border-b-0"
            >
              <span className="text-sm truncate">{c.itemName}</span>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-forest-100 tabular-nums">
                  {c.oldValue} → {c.newValue} {c.unit === 'count' ? 'ct' : 'lbs'}
                </span>
                <button
                  onClick={() => clearItemChange(c.itemId)}
                  aria-label={`Remove change for ${c.itemName}`}
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

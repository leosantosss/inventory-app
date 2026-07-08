'use client'
import { useState, useEffect, useRef } from 'react'
import { useUpdateSession } from '@/context/UpdateSessionContext'
import type { ItemDoc } from '@/types'

interface Props {
  item: ItemDoc
  onClose: () => void
  onDone: () => void
}

export default function QuickUpdateModal({ item, onClose, onDone }: Props) {
  const { session, setItemChange, clearItemChange } = useUpdateSession()
  const baseValue = item.unit === 'count' ? (item.currentCount ?? 0) : (item.currentLbs ?? 0)
  const pending = session?.changes.get(item._id)
  const direction = session?.direction ?? 'out'
  const unitLabel = item.unit === 'count' ? 'ct' : 'lbs'
  const inputRef = useRef<HTMLInputElement>(null)

  const [delta, setDelta] = useState(String(pending ? Math.abs(pending.newValue - baseValue) : ''))

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  function handleChange(raw: string) {
    setDelta(raw)
    const num = parseFloat(raw)
    if (!isNaN(num) && num > 0) {
      const newValue = direction === 'out'
        ? Math.max(0, baseValue - num)
        : baseValue + num
      setItemChange(item._id, item.name, baseValue, newValue, item.unit)
    } else {
      clearItemChange(item._id)
    }
  }

  function handleClear() {
    clearItemChange(item._id)
    onClose()
  }

  const changed = pending !== undefined
  const newValue = changed ? pending.newValue : baseValue

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50" onClick={onClose}>
      <div className="bg-white w-full rounded-t-3xl pb-8" onClick={(e) => e.stopPropagation()}>
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-5" />
        <div className="px-6">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h2 className="font-display text-xl font-bold text-forest">{item.name}</h2>
              {item.subcategory && (
                <p className="text-xs text-forest-400 capitalize mt-0.5">{item.subcategory}</p>
              )}
            </div>
            <span
              className={`text-xs font-bold uppercase tracking-widest px-2 py-1 rounded ${
                direction === 'in' ? 'bg-forest text-white' : 'bg-crimson text-white'
              }`}
            >
              {direction === 'in' ? '▲ Bringing In' : '▼ Taking Out'}
            </span>
          </div>

          <p className="text-sm text-gray-400 mb-5">
            Currently <span className="font-semibold text-gray-600">{baseValue} {unitLabel}</span>
          </p>

          <label className="flex flex-col gap-2 mb-2">
            <span className="text-sm font-medium text-gray-500">
              How many are you {direction === 'in' ? 'adding' : 'removing'}?
            </span>
            <input
              ref={inputRef}
              type="number"
              min="0"
              step={item.unit === 'lbs' ? '0.1' : '1'}
              value={delta}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  onDone()
                }
              }}
              placeholder="0"
              className="border-2 border-gray-200 focus:border-forest rounded-xl px-4 py-4 text-3xl font-bold text-center focus:outline-none transition-colors"
            />
          </label>

          <p className="text-center text-sm mb-6">
            {changed ? (
              <span className="text-forest font-semibold">New total: {newValue} {unitLabel}</span>
            ) : (
              <span className="text-gray-300">Enter an amount to see the new total</span>
            )}
          </p>

          <div className="flex flex-col gap-2">
            <button
              onClick={onDone}
              className="bg-forest hover:bg-forest-600 text-white rounded-xl py-3.5 text-base font-semibold transition-colors"
            >
              Done
            </button>
            {changed && (
              <button
                onClick={handleClear}
                className="bg-crimson-50 hover:bg-crimson-100 text-crimson rounded-xl py-3 text-sm font-semibold transition-colors"
              >
                Clear this change
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

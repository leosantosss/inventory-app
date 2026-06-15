'use client'
import { useState, useEffect } from 'react'
import { useUpdateSession } from '@/context/UpdateSessionContext'
import type { ItemDoc } from '@/types'

interface Props {
  item: ItemDoc
}

export default function UpdateItemRow({ item }: Props) {
  const { session, setItemChange, clearItemChange } = useUpdateSession()
  const baseValue = item.unit === 'count' ? (item.currentCount ?? 0) : (item.currentLbs ?? 0)
  const pending = session?.changes.get(item._id)
  const direction = session?.direction ?? 'out'
  const label = item.unit === 'count' ? 'ct' : 'lbs'

  const [delta, setDelta] = useState(String(pending ? Math.abs(pending.newValue - baseValue) : ''))

  useEffect(() => {
    setDelta(String(pending ? Math.abs(pending.newValue - baseValue) : ''))
  }, [item._id])

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

  const changed = pending !== undefined
  const newValue = changed ? pending.newValue : baseValue

  return (
    <div className={`relative rounded-2xl p-3 flex flex-col shadow-sm min-h-[110px] border-l-4 transition-colors ${
      changed ? 'bg-forest-100 border-forest' : 'bg-white border-gray-200'
    }`}>
      <span className="text-sm font-semibold text-gray-700 leading-snug">{item.name}</span>
      {item.subcategory && (
        <span className="text-xs text-forest-400 capitalize">{item.subcategory}</span>
      )}
      <div className="mt-1 text-xs text-gray-400">
        {changed
          ? <span className="text-forest font-medium">{baseValue} → {newValue} {label}</span>
          : <span>{baseValue} {label}</span>
        }
      </div>
      <div className="mt-auto pt-2 flex flex-col items-center gap-0.5">
        <input
          type="number"
          min="0"
          step={item.unit === 'lbs' ? '0.1' : '1'}
          value={delta}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="0"
          className={`w-full rounded-xl px-2 py-1.5 text-2xl font-bold text-center transition-colors focus:outline-none focus:ring-2 focus:ring-forest-500 ${
            changed ? 'bg-white border-2 border-forest' : 'bg-gray-50 border border-gray-200'
          }`}
        />
        <span className="text-xs text-gray-400">
          {direction === 'out' ? 'taking out' : 'adding'} ({label})
        </span>
      </div>
    </div>
  )
}

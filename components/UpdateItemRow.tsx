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
  const [value, setValue] = useState(String(pending?.newValue ?? baseValue))

  useEffect(() => {
    setValue(String(pending?.newValue ?? baseValue))
  }, [item._id])

  const label = item.unit === 'count' ? 'ct' : 'lbs'
  const changed = pending !== undefined

  function handleChange(raw: string) {
    setValue(raw)
    const num = parseFloat(raw)
    if (!isNaN(num) && num >= 0) {
      setItemChange(item._id, item.name, baseValue, num, item.unit)
    } else {
      clearItemChange(item._id)
    }
  }

  return (
    <div className={`relative rounded-2xl p-4 flex flex-col shadow-sm min-h-[110px] border-l-4 transition-colors ${
      changed
        ? 'bg-forest-100 border-forest'
        : 'bg-white border-gray-200'
    }`}>
      <span className="text-sm font-semibold text-gray-700 leading-snug">{item.name}</span>
      <div className="mt-auto pt-3 flex flex-col items-center gap-0.5">
        <input
          type="number"
          min="0"
          step={item.unit === 'lbs' ? '0.1' : '1'}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          className={`w-full rounded-xl px-2 py-1.5 text-2xl font-bold text-center transition-colors focus:outline-none focus:ring-2 focus:ring-forest-500 ${
            changed ? 'bg-white border-2 border-forest' : 'bg-gray-50 border border-gray-200'
          }`}
        />
        <span className="text-xs text-gray-400">{label}</span>
      </div>
    </div>
  )
}

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

  function handleChange(raw: string) {
    setValue(raw)
    const num = parseFloat(raw)
    if (!isNaN(num) && num >= 0) {
      setItemChange(item._id, item.name, baseValue, num, item.unit)
    } else {
      clearItemChange(item._id)
    }
  }

  const changed = pending !== undefined

  return (
    <div className={`flex items-center justify-between py-4 px-4 border-b border-gray-100 ${changed ? 'bg-blue-50' : 'bg-white'}`}>
      <span className="text-lg font-medium text-gray-900">{item.name}</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min="0"
          step={item.unit === 'lbs' ? '0.1' : '1'}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-lg text-right"
        />
        <span className="text-sm text-gray-400 w-6">{label}</span>
      </div>
    </div>
  )
}

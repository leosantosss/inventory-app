'use client'
import { useState, FormEvent } from 'react'
import type { Category, Unit, ItemDoc } from '@/types'

interface Props {
  category: Category
  onClose: () => void
  onSaved: (item: ItemDoc) => void
}

const unitLabels: Record<Unit, string> = { count: 'Count (units)', lbs: 'Pounds (lbs)' }

export default function AddItemModal({ category, onClose, onSaved }: Props) {
  const [name, setName] = useState('')
  const [unit, setUnit] = useState<Unit>('count')
  const [startingValue, setStartingValue] = useState('0')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, category, unit, startingValue: parseFloat(startingValue) || 0 }),
    })
    const item = await res.json()
    onSaved(item)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50" onClick={onClose}>
      <div className="bg-white w-full rounded-t-3xl pb-8" onClick={(e) => e.stopPropagation()}>
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-5" />
        <div className="px-6">
          <h2 className="font-display text-xl font-bold text-forest mb-4">Add Item</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Item name"
              required
              className="border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent"
            />
            <div className="flex gap-3">
              {(['count', 'lbs'] as Unit[]).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUnit(u)}
                  className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-colors ${
                    unit === u ? 'bg-forest text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {unitLabels[u]}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                step={unit === 'lbs' ? '0.1' : '1'}
                value={startingValue}
                onChange={(e) => setStartingValue(e.target.value)}
                className="w-32 border border-gray-200 rounded-xl px-4 py-3 text-base text-right focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
              <span className="text-gray-500 text-sm">starting {unit === 'count' ? 'count' : 'lbs'}</span>
            </div>
            <button
              type="submit"
              disabled={!name.trim() || saving}
              className="bg-forest hover:bg-forest-600 text-white rounded-xl py-3.5 text-base font-semibold disabled:opacity-40 transition-colors"
            >
              {saving ? 'Saving…' : 'Add Item'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

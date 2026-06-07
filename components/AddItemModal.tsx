'use client'
import { useState, FormEvent } from 'react'
import type { Category, Unit } from '@/types'

interface Props {
  category: Category
  onClose: () => void
  onSaved: () => void
}

const unitLabels: Record<Unit, string> = { count: 'Count (whole units)', lbs: 'Pounds (lbs)' }

export default function AddItemModal({ category, onClose, onSaved }: Props) {
  const [name, setName] = useState('')
  const [unit, setUnit] = useState<Unit>('count')
  const [startingValue, setStartingValue] = useState('0')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, category, unit, startingValue: parseFloat(startingValue) || 0 }),
    })
    onSaved()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end z-50" onClick={onClose}>
      <div className="bg-white w-full rounded-t-2xl p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">Add Item</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Item name"
            required
            className="border border-gray-300 rounded-xl px-4 py-3 text-lg"
          />
          <div className="flex gap-3">
            {(['count', 'lbs'] as Unit[]).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setUnit(u)}
                className={`flex-1 py-3 rounded-xl font-semibold ${
                  unit === u ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
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
              className="w-32 border border-gray-300 rounded-xl px-4 py-3 text-lg text-right"
            />
            <span className="text-gray-500">starting {unit === 'count' ? 'count' : 'lbs'}</span>
          </div>
          <button
            type="submit"
            disabled={!name.trim() || saving}
            className="bg-blue-600 text-white rounded-xl py-3 text-lg font-semibold disabled:opacity-40"
          >
            {saving ? 'Saving…' : 'Add Item'}
          </button>
        </form>
      </div>
    </div>
  )
}

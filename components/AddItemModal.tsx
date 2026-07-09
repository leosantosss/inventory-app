'use client'
import { useState, FormEvent } from 'react'
import type { Category, Unit, ItemDoc, AlcoholType } from '@/types'
import { useToast } from '@/context/ToastContext'

interface Props {
  category: Category
  onClose: () => void
  onSaved: (item: ItemDoc) => void
}

const unitLabels: Record<Unit, string> = { count: 'Count (units)', lbs: 'Pounds (lbs)' }

const alcoholTypes: AlcoholType[] = [
  'tequila', 'vodka', 'whiskey', 'rum', 'mini tequila',
  'gin', 'cognac', 'brandy', 'wine', 'liqueur', 'other',
]

export default function AddItemModal({ category, onClose, onSaved }: Props) {
  const { showToast } = useToast()
  const [name, setName] = useState('')
  const [unit, setUnit] = useState<Unit>('count')
  const [startingValue, setStartingValue] = useState('0')
  const [subcategory, setSubcategory] = useState<AlcoholType | ''>('')
  const [unitsPerBox, setUnitsPerBox] = useState('')
  const [boxPrice, setBoxPrice] = useState('')
  const [minStock, setMinStock] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category,
          unit,
          startingValue: parseFloat(startingValue) || 0,
          subcategory: subcategory || undefined,
          unitsPerBox: unitsPerBox.trim() ? parseFloat(unitsPerBox) : null,
          boxPrice: boxPrice.trim() ? parseFloat(boxPrice) : null,
          minStock: minStock.trim() ? parseFloat(minStock) : null,
        }),
      })
      if (!res.ok) throw new Error('Failed to add item')
      const item = await res.json()
      showToast(`"${item.name}" added`)
      onSaved(item)
    } catch {
      showToast('Could not add the item — check your connection and try again.', 'error')
      setSaving(false)
    }
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
            {category === 'bar' && (
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-500">Type</span>
                <div className="flex gap-2 flex-wrap">
                  {alcoholTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSubcategory(subcategory === type ? '' : type)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${
                        subcategory === type
                          ? 'bg-forest text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            )}
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

            <div className="flex flex-col gap-2 pt-1 border-t border-gray-100">
              <span className="text-sm font-medium text-gray-500 pt-3">Box &amp; Pricing (optional)</span>
              <div className="grid grid-cols-3 gap-2">
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-gray-400">Units/Box</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={unitsPerBox}
                    onChange={(e) => setUnitsPerBox(e.target.value)}
                    placeholder="—"
                    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-gray-400">Box Price ($)</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={boxPrice}
                    onChange={(e) => setBoxPrice(e.target.value)}
                    placeholder="—"
                    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-gray-400">Min Stock</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                    placeholder="—"
                    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
                  />
                </label>
              </div>
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

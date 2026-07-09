'use client'
import { useState, FormEvent } from 'react'
import type { ItemDoc, Unit, AlcoholType } from '@/types'
import { useToast } from '@/context/ToastContext'

interface Props {
  item: ItemDoc
  onClose: () => void
  onSaved: () => void
}

const alcoholTypes: AlcoholType[] = [
  'tequila', 'vodka', 'whiskey', 'rum', 'mini tequila',
  'gin', 'cognac', 'brandy', 'wine', 'liqueur', 'other',
]

export default function EditItemModal({ item, onClose, onSaved }: Props) {
  const { showToast } = useToast()
  const [name, setName] = useState(item.name)
  const [unit, setUnit] = useState<Unit>(item.unit)
  const [subcategory, setSubcategory] = useState<AlcoholType | ''>(
    (item.subcategory as AlcoholType) ?? ''
  )
  const [unitsPerBox, setUnitsPerBox] = useState(item.unitsPerBox != null ? String(item.unitsPerBox) : '')
  const [boxPrice, setBoxPrice] = useState(item.boxPrice != null ? String(item.boxPrice) : '')
  const [minStock, setMinStock] = useState(item.minStock != null ? String(item.minStock) : '')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`/api/items/${item._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          unit,
          subcategory: subcategory || null,
          unitsPerBox: unitsPerBox.trim() ? parseFloat(unitsPerBox) : null,
          boxPrice: boxPrice.trim() ? parseFloat(boxPrice) : null,
          minStock: minStock.trim() ? parseFloat(minStock) : null,
        }),
      })
      if (!res.ok) throw new Error('Failed to save item')
      showToast(`"${name}" saved`)
      onSaved()
    } catch {
      showToast('Could not save changes — check your connection and try again.', 'error')
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/items/${item._id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete item')
      showToast(`"${item.name}" deleted`)
      onSaved()
    } catch {
      showToast('Could not delete the item — check your connection and try again.', 'error')
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-backdrop-in" onClick={onClose}>
      <div className="bg-white w-full rounded-t-3xl pb-8 animate-sheet-up" onClick={(e) => e.stopPropagation()}>
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-5" />
        <div className="px-6">
          <h2 className="font-display text-xl font-bold text-forest mb-4">Edit Item</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent"
              required
            />
            {item.category === 'bar' && (
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
                  {u === 'count' ? 'Count' : 'Pounds'}
                </button>
              ))}
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
              className="bg-forest hover:bg-forest-600 text-white rounded-xl py-3.5 text-base font-semibold disabled:opacity-40 transition active:scale-[0.98]"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="bg-crimson-50 hover:bg-crimson-100 text-crimson rounded-xl py-3.5 text-base font-semibold disabled:opacity-40 transition active:scale-[0.98]"
            >
              {deleting ? 'Deleting…' : 'Delete Item'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

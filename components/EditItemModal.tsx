'use client'
import { useState, FormEvent } from 'react'
import type { ItemDoc, Unit } from '@/types'

interface Props {
  item: ItemDoc
  onClose: () => void
  onSaved: () => void
}

export default function EditItemModal({ item, onClose, onSaved }: Props) {
  const [name, setName] = useState(item.name)
  const [unit, setUnit] = useState<Unit>(item.unit)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch(`/api/items/${item._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, unit }),
    })
    onSaved()
  }

  async function handleDelete() {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return
    setDeleting(true)
    await fetch(`/api/items/${item._id}`, { method: 'DELETE' })
    onSaved()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50" onClick={onClose}>
      <div className="bg-white w-full rounded-t-3xl pb-8" onClick={(e) => e.stopPropagation()}>
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
            <button
              type="submit"
              disabled={!name.trim() || saving}
              className="bg-forest hover:bg-forest-600 text-white rounded-xl py-3.5 text-base font-semibold disabled:opacity-40 transition-colors"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="bg-crimson-50 hover:bg-crimson-100 text-crimson rounded-xl py-3.5 text-base font-semibold disabled:opacity-40 transition-colors"
            >
              {deleting ? 'Deleting…' : 'Delete Item'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

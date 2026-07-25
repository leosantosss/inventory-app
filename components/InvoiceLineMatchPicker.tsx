'use client'
import { useMemo, useState } from 'react'
import type { ItemDoc, Category } from '@/types'

const categoryLabels: Record<Category, string> = { cooler: 'Cooler', bar: 'Bar', dry: 'Dry Storage' }

interface Props {
  catalog: ItemDoc[]
  onSelect: (item: ItemDoc) => void
  onClose: () => void
}

export default function InvoiceLineMatchPicker({ catalog, onSelect, onClose }: Props) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return catalog
    return catalog.filter((i) => i.name.toLowerCase().includes(q))
  }, [catalog, search])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-[60] animate-backdrop-in" onClick={onClose}>
      <div
        className="bg-white w-full rounded-t-3xl pb-4 animate-sheet-up max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-4" />
        <div className="px-6 pb-3">
          <h2 className="font-display text-lg font-bold text-forest mb-3">Choose the matching item</h2>
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items…"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent"
          />
        </div>
        <div className="flex-1 overflow-y-auto px-3">
          {filtered.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">No items match.</p>
          ) : (
            filtered.map((item) => (
              <button
                key={item._id}
                onClick={() => onSelect(item)}
                className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-forest-50 text-left transition-colors"
              >
                <span className="text-sm text-gray-800">{item.name}</span>
                <span className="text-xs text-gray-400">{categoryLabels[item.category]}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

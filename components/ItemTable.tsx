'use client'
import { useState } from 'react'
import { useUpdateSession } from '@/context/UpdateSessionContext'
import ItemRow from './ItemRow'
import UpdateItemRow from './UpdateItemRow'
import AddItemModal from './AddItemModal'
import EditItemModal from './EditItemModal'
import type { ItemDoc, Category } from '@/types'

interface Props {
  items: ItemDoc[]
  category: Category
  onRefresh: () => void
}

const categoryLabels: Record<Category, string> = {
  cooler: 'Cooler / Freezer',
  dry: 'Dry Storage',
  bar: 'Bar',
}

export default function ItemTable({ items, category, onRefresh }: Props) {
  const { session, startSession, setItemChange } = useUpdateSession()
  const [showAdd, setShowAdd] = useState(false)
  const [editItem, setEditItem] = useState<ItemDoc | null>(null)
  const [showStartUpdate, setShowStartUpdate] = useState(false)
  const [direction, setDirection] = useState<'in' | 'out'>('out')
  const [note, setNote] = useState('')
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
    : items

  function handleStartUpdate() {
    if (!note.trim()) return
    startSession(direction, note.trim())
    setShowStartUpdate(false)
    setNote('')
  }

  function handleItemAdded(item: ItemDoc) {
    if (session) {
      const val = item.unit === 'count' ? (item.currentCount ?? 0) : (item.currentLbs ?? 0)
      if (val > 0) setItemChange(item._id, item.name, 0, val, item.unit)
    }
    setShowAdd(false)
    onRefresh()
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-2xl font-bold text-forest">{categoryLabels[category]}</h1>
        <div className="flex gap-2">
          {!session && (
            <button
              onClick={() => setShowStartUpdate(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-crimson hover:bg-crimson-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" />
                <polyline points="19 5 12 12 5 5" />
              </svg>
              Update
            </button>
          )}
        </div>
      </div>

      {/* Update modal */}
      {showStartUpdate && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50" onClick={() => setShowStartUpdate(false)}>
          <div className="bg-white w-full rounded-t-3xl p-6 pb-8" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
            <h2 className="font-display text-xl font-bold text-forest mb-4">Update Inventory</h2>
            <div className="flex gap-3 mb-4">
              {(['out', 'in'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDirection(d)}
                  className={`flex-1 py-3 rounded-xl font-semibold text-base transition-colors ${
                    direction === d
                      ? d === 'out' ? 'bg-crimson text-white' : 'bg-forest text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {d === 'out' ? '▼ Taking Out' : '▲ Bringing In'}
                </button>
              ))}
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={direction === 'in' ? 'e.g. Shipment from Sysco arrived' : 'e.g. Prep for dinner service'}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent"
              rows={3}
            />
            <button
              onClick={handleStartUpdate}
              disabled={!note.trim()}
              className="w-full bg-forest hover:bg-forest-600 text-white rounded-xl py-3.5 text-base font-semibold disabled:opacity-40 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search items…"
          className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-base bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent"
        />
      </div>

      {/* Item grid */}
      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-base">No items yet.</p>
          <p className="text-gray-300 text-sm mt-1">Tap Update to add your first item.</p>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-400 py-10">No items match &quot;{search}&quot;</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map((item) =>
            session ? (
              <UpdateItemRow key={item._id} item={item} />
            ) : (
              <ItemRow key={item._id} item={item} onEdit={setEditItem} />
            )
          )}
          {session && (
            <button
              onClick={() => setShowAdd(true)}
              className="rounded-2xl border-2 border-dashed border-forest-100 bg-white flex flex-col items-center justify-center gap-1 min-h-[110px] text-forest-500 hover:border-forest hover:text-forest transition-colors"
            >
              <span className="text-2xl font-light">+</span>
              <span className="text-xs font-medium">Add Item</span>
            </button>
          )}
        </div>
      )}

      {showAdd && (
        <AddItemModal
          category={category}
          onClose={() => setShowAdd(false)}
          onSaved={handleItemAdded}
        />
      )}

      {editItem && (
        <EditItemModal
          item={editItem}
          onClose={() => setEditItem(null)}
          onSaved={() => { setEditItem(null); onRefresh() }}
        />
      )}
    </div>
  )
}

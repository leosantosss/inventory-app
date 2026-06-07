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
  const { session, startSession } = useUpdateSession()
  const [showAdd, setShowAdd] = useState(false)
  const [editItem, setEditItem] = useState<ItemDoc | null>(null)
  const [showStartUpdate, setShowStartUpdate] = useState(false)
  const [direction, setDirection] = useState<'in' | 'out'>('out')
  const [note, setNote] = useState('')

  function handleStartUpdate() {
    if (!note.trim()) return
    startSession(direction, note.trim())
    setShowStartUpdate(false)
    setNote('')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">{categoryLabels[category]}</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAdd(true)}
            className="w-10 h-10 rounded-full bg-blue-600 text-white text-xl flex items-center justify-center"
            aria-label="Add item"
          >
            +
          </button>
          {!session && (
            <button
              onClick={() => setShowStartUpdate(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold"
            >
              Start Update
            </button>
          )}
        </div>
      </div>

      {/* Start Update modal */}
      {showStartUpdate && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50" onClick={() => setShowStartUpdate(false)}>
          <div className="bg-white w-full rounded-t-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Start Update</h2>
            <div className="flex gap-3 mb-4">
              {(['out', 'in'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDirection(d)}
                  className={`flex-1 py-3 rounded-xl font-semibold text-lg ${
                    direction === d ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {d === 'out' ? 'Taking Out' : 'Bringing In'}
                </button>
              ))}
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={direction === 'in' ? 'e.g. Shipment from Sysco arrived' : 'e.g. Prep for dinner service'}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg mb-4 resize-none"
              rows={3}
            />
            <button
              onClick={handleStartUpdate}
              disabled={!note.trim()}
              className="w-full bg-green-600 text-white rounded-xl py-3 text-lg font-semibold disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Item list */}
      <div className="rounded-xl overflow-hidden border border-gray-200">
        {items.length === 0 && (
          <p className="text-center text-gray-400 py-10">No items yet. Tap + to add one.</p>
        )}
        {items.map((item) =>
          session ? (
            <UpdateItemRow key={item._id} item={item} />
          ) : (
            <ItemRow key={item._id} item={item} onEdit={setEditItem} />
          )
        )}
      </div>

      {showAdd && (
        <AddItemModal
          category={category}
          onClose={() => setShowAdd(false)}
          onSaved={() => { setShowAdd(false); onRefresh() }}
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

'use client'
import { useState, useMemo, useRef } from 'react'
import { useUpdateSession } from '@/context/UpdateSessionContext'
import ItemRow from './ItemRow'
import QuickUpdateModal from './QuickUpdateModal'
import AddItemModal from './AddItemModal'
import EditItemModal from './EditItemModal'
import FilterDropdown from './FilterDropdown'
import type { ItemDoc, Category, AlcoholType } from '@/types'
import { itemQuantity } from '@/lib/itemCalc'
import {
  detectSizes, detectMaterial, detectType,
  DRY_SIZES, DRY_MATERIALS, DRY_TYPES,
  type DryMaterial, type DryType,
} from '@/lib/dryStorageFilters'

type SortKey = 'name' | 'quantity'

interface ColumnDef {
  label: string
  sortKey?: SortKey
  align?: 'right'
}

const columns: ColumnDef[] = [
  { label: 'Item', sortKey: 'name' },
  { label: 'Category' },
  { label: 'Quantity', sortKey: 'quantity', align: 'right' },
  { label: 'Unit' },
  { label: '' },
]

function sortValue(item: ItemDoc, key: SortKey): number | string {
  switch (key) {
    case 'name': return item.name.toLowerCase()
    case 'quantity': return itemQuantity(item) ?? -Infinity
  }
}

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

const alcoholTypes: AlcoholType[] = [
  'tequila', 'vodka', 'whiskey', 'rum', 'mini tequila',
  'gin', 'cognac', 'brandy', 'wine', 'liqueur', 'other',
]

export default function ItemTable({ items, category, onRefresh }: Props) {
  const { session, startSession, setItemChange, trackNewItem } = useUpdateSession()
  const [showAdd, setShowAdd] = useState(false)
  const [editItem, setEditItem] = useState<ItemDoc | null>(null)
  const [showStartUpdate, setShowStartUpdate] = useState(false)
  const [direction, setDirection] = useState<'in' | 'out'>('out')
  const [note, setNote] = useState('')
  const [search, setSearch] = useState('')
  const [subcategoryFilter, setSubcategoryFilter] = useState<AlcoholType | null>(null)
  const [sizeFilter, setSizeFilter] = useState<number | null>(null)
  const [materialFilter, setMaterialFilter] = useState<DryMaterial | null>(null)
  const [typeFilter, setTypeFilter] = useState<DryType | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [showChangedOnly, setShowChangedOnly] = useState(false)
  const [quickUpdateItem, setQuickUpdateItem] = useState<ItemDoc | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const afterSearch = search.trim()
    ? items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
    : items

  const afterSubcategory = category === 'bar' && subcategoryFilter
    ? afterSearch.filter((i) => i.subcategory === subcategoryFilter)
    : afterSearch

  const afterDryFilters = category === 'dry'
    ? afterSubcategory.filter((i) => {
        if (sizeFilter !== null && !detectSizes(i.name).includes(sizeFilter)) return false
        if (materialFilter && detectMaterial(i.name) !== materialFilter) return false
        if (typeFilter && detectType(i.name) !== typeFilter) return false
        return true
      })
    : afterSubcategory

  const filtered = session && showChangedOnly
    ? afterDryFilters.filter((i) => session.changes.has(i._id))
    : afterDryFilters

  const sorted = useMemo(() => {
    const list = [...filtered]
    list.sort((a, b) => {
      // While a session is active, keep touched items pinned to the top so progress stays visible.
      if (session) {
        const aChanged = session.changes.has(a._id)
        const bChanged = session.changes.has(b._id)
        if (aChanged !== bChanged) return aChanged ? -1 : 1
      }
      const av = sortValue(a, sortKey)
      const bv = sortValue(b, sortKey)
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sortDir === 'asc' ? cmp : -cmp
    })
    return list
  }, [filtered, sortKey, sortDir, session])

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  // Search-and-enter flow: type a name fragment, hit Enter to open that item's update card.
  function handleSearchEnter() {
    if (sorted.length > 0) {
      setQuickUpdateItem(sorted[0])
    }
  }

  function handleModalDone() {
    setQuickUpdateItem(null)
    setSearch('')
    searchRef.current?.focus()
  }

  function handleStartUpdate() {
    if (!note.trim()) return
    startSession(direction, note.trim())
    setShowStartUpdate(false)
    setNote('')
  }

  function handleItemAdded(item: ItemDoc) {
    if (session) {
      trackNewItem(item._id)
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
          {session && (
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-forest hover:bg-forest-600 text-white rounded-xl text-sm font-semibold shadow-sm transition active:scale-[0.98]"
            >
              <span className="text-base leading-none">+</span>
              Add Item
            </button>
          )}
          {!session && (
            <button
              onClick={() => setShowStartUpdate(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-crimson hover:bg-crimson-700 text-white rounded-xl text-sm font-semibold shadow-sm transition active:scale-[0.98]"
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
        <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-backdrop-in" onClick={() => setShowStartUpdate(false)}>
          <div className="bg-white w-full rounded-t-3xl p-6 pb-8 animate-sheet-up" onClick={(e) => e.stopPropagation()}>
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
              className="w-full bg-forest hover:bg-forest-600 text-white rounded-xl py-3.5 text-base font-semibold disabled:opacity-40 transition active:scale-[0.98]"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={searchRef}
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && session) {
                e.preventDefault()
                handleSearchEnter()
              }
            }}
            placeholder={session ? 'Search, then press Enter to open an item…' : 'Search items…'}
            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-base bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent"
          />
        </div>
        {session && (
          <button
            onClick={() => setShowChangedOnly((v) => !v)}
            className={`shrink-0 px-3 py-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              showChangedOnly ? 'bg-forest text-white' : 'bg-white text-gray-500 border border-gray-200'
            }`}
          >
            Changed only ({session.changes.size})
          </button>
        )}
      </div>

      {/* Alcohol type filter (bar only) */}
      {category === 'bar' && (
        <div className="flex gap-2 flex-wrap mb-4">
          <FilterDropdown
            label="Type"
            options={alcoholTypes.map((type) => ({ value: type, label: type.charAt(0).toUpperCase() + type.slice(1) }))}
            selected={subcategoryFilter}
            onChange={setSubcategoryFilter}
          />
        </div>
      )}

      {/* Dry storage filters: size, material, type */}
      {category === 'dry' && (
        <div className="flex gap-2 flex-wrap mb-4">
          <FilterDropdown
            label="Size"
            options={DRY_SIZES.map((size) => ({ value: size, label: `${size} oz` }))}
            selected={sizeFilter}
            onChange={setSizeFilter}
          />
          <FilterDropdown
            label="Material"
            options={DRY_MATERIALS.map((material) => ({ value: material, label: material }))}
            selected={materialFilter}
            onChange={setMaterialFilter}
          />
          <FilterDropdown
            label="Type"
            options={DRY_TYPES.map((type) => ({ value: type, label: type }))}
            selected={typeFilter}
            onChange={setTypeFilter}
          />
        </div>
      )}

      {/* Item table */}
      {!session && items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-base">No items yet.</p>
          <p className="text-gray-300 text-sm mt-1">Start an update to add your first item.</p>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-400 py-10">
          {session && showChangedOnly
            ? 'No changes recorded yet.'
            : search.trim()
              ? `No items match "${search}"`
              : 'No items match the selected filters.'}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                {columns.map((col) => (
                  <th
                    key={col.label || 'actions'}
                    onClick={col.sortKey ? () => handleSort(col.sortKey!) : undefined}
                    className={`px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap ${
                      col.align === 'right' ? 'text-right' : 'text-left'
                    } ${col.sortKey ? 'cursor-pointer select-none hover:text-forest' : ''}`}
                  >
                    {col.label}
                    {col.sortKey && sortKey === col.sortKey && (
                      <span className="ml-1">{sortDir === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sorted.map((item) => (
                <ItemRow
                  key={item._id}
                  item={item}
                  onEdit={setEditItem}
                  sessionMode={!!session}
                  changeInfo={session?.changes.get(item._id)}
                  onQuickUpdate={() => setQuickUpdateItem(item)}
                />
              ))}
            </tbody>
          </table>
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

      {quickUpdateItem && (
        <QuickUpdateModal
          item={quickUpdateItem}
          onClose={() => setQuickUpdateItem(null)}
          onDone={handleModalDone}
        />
      )}
    </div>
  )
}

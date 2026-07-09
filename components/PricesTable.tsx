'use client'
import { useState, useMemo, useRef } from 'react'
import EditItemModal from './EditItemModal'
import type { ItemDoc, Category } from '@/types'
import { pricePerUnit, lineValue } from '@/lib/itemCalc'
import { parseCSV, toCSV } from '@/lib/csv'
import { useToast } from '@/context/ToastContext'

type SortKey = 'name' | 'category' | 'unitsPerBox' | 'boxPrice' | 'pricePerUnit' | 'value'

interface ColumnDef {
  label: string
  sortKey: SortKey
  align?: 'right'
}

const columns: ColumnDef[] = [
  { label: 'Item', sortKey: 'name' },
  { label: 'Category', sortKey: 'category' },
  { label: 'Units/Box', sortKey: 'unitsPerBox', align: 'right' },
  { label: 'Box Price', sortKey: 'boxPrice', align: 'right' },
  { label: 'Price/Unit', sortKey: 'pricePerUnit', align: 'right' },
  { label: 'Value', sortKey: 'value', align: 'right' },
]

const categoryLabels: Record<Category, string> = {
  cooler: 'Cooler',
  bar: 'Bar',
  dry: 'Dry Storage',
}

const categoryFilters: { label: string; value: Category | null }[] = [
  { label: 'All', value: null },
  { label: 'Cooler', value: 'cooler' },
  { label: 'Bar', value: 'bar' },
  { label: 'Dry Storage', value: 'dry' },
]

const labelToCategory: Record<string, Category> = {
  cooler: 'cooler', bar: 'bar', dry: 'dry', 'dry storage': 'dry',
}

const money = (n: number) => `$${n.toFixed(2)}`

const EXPORT_HEADERS = [
  'Name', 'Category', 'Subcategory', 'Unit',
  'Units per Box', 'Box Price', 'Min Stock', 'Price per Unit', 'Value',
]

function sortValue(item: ItemDoc, key: SortKey): number | string {
  switch (key) {
    case 'name': return item.name.toLowerCase()
    case 'category': return item.category
    case 'unitsPerBox': return item.unitsPerBox ?? -Infinity
    case 'boxPrice': return item.boxPrice ?? -Infinity
    case 'pricePerUnit': return pricePerUnit(item) ?? -Infinity
    case 'value': return lineValue(item)
  }
}

interface Props {
  items: ItemDoc[]
  onRefresh: () => void
}

export default function PricesTable({ items, onRefresh }: Props) {
  const { showToast } = useToast()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<Category | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [editItem, setEditItem] = useState<ItemDoc | null>(null)
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(() => {
    let list = items
    if (categoryFilter) list = list.filter((i) => i.category === categoryFilter)
    if (search.trim()) list = list.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
    return list
  }, [items, categoryFilter, search])

  const sorted = useMemo(() => {
    const list = [...filtered]
    list.sort((a, b) => {
      const av = sortValue(a, sortKey)
      const bv = sortValue(b, sortKey)
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sortDir === 'asc' ? cmp : -cmp
    })
    return list
  }, [filtered, sortKey, sortDir])

  const totalValue = useMemo(() => filtered.reduce((sum, i) => sum + lineValue(i), 0), [filtered])

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  function handleExport() {
    const rows: (string | number)[][] = [EXPORT_HEADERS]
    for (const item of sorted) {
      const perUnit = pricePerUnit(item)
      rows.push([
        item.name,
        categoryLabels[item.category],
        item.subcategory ?? '',
        item.unit,
        item.unitsPerBox ?? '',
        item.boxPrice ?? '',
        item.minStock ?? '',
        perUnit ?? '',
        lineValue(item),
      ])
    }
    const blob = new Blob([toCSV(rows)], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `prices-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    const text = await file.text()
    const table = parseCSV(text)
    if (table.length < 2) {
      showToast('That file has no data rows to import.', 'error')
      return
    }

    const header = table[0].map((h) => h.trim().toLowerCase())
    const idx = {
      name: header.indexOf('name'),
      category: header.indexOf('category'),
      unitsPerBox: header.indexOf('units per box'),
      boxPrice: header.indexOf('box price'),
      minStock: header.indexOf('min stock'),
    }
    if (idx.name === -1 || idx.category === -1) {
      showToast('CSV must include "Name" and "Category" columns.', 'error')
      return
    }

    const toNumberOrNull = (raw?: string) => {
      const trimmed = raw?.trim()
      if (!trimmed) return null
      const n = parseFloat(trimmed)
      return isNaN(n) ? null : n
    }

    const rows = table.slice(1)
      .filter((r) => r[idx.name]?.trim())
      .map((r) => ({
        name: r[idx.name].trim(),
        category: labelToCategory[r[idx.category]?.trim().toLowerCase()],
        unitsPerBox: idx.unitsPerBox !== -1 ? toNumberOrNull(r[idx.unitsPerBox]) : null,
        boxPrice: idx.boxPrice !== -1 ? toNumberOrNull(r[idx.boxPrice]) : null,
        minStock: idx.minStock !== -1 ? toNumberOrNull(r[idx.minStock]) : null,
      }))
      .filter((r) => r.category)

    if (rows.length === 0) {
      showToast('No valid rows found — check the Category column matches Cooler/Bar/Dry Storage.', 'error')
      return
    }

    if (!confirm(`Import will update pricing for up to ${rows.length} item(s). Continue?`)) return

    setImporting(true)
    try {
      const res = await fetch('/api/items/bulk-price-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows }),
      })
      if (!res.ok) throw new Error('Import failed')
      const result: { updated: number; skipped: string[] } = await res.json()
      showToast(
        result.skipped.length > 0
          ? `Updated ${result.updated} item(s), skipped ${result.skipped.length} not found`
          : `Updated ${result.updated} item(s)`
      )
      onRefresh()
    } catch {
      showToast('Import failed — check your connection and try again.', 'error')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-2xl font-bold text-forest">Prices</h1>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={handleImportClick}
            disabled={importing}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold shadow-sm hover:bg-gray-50 disabled:opacity-40 transition active:scale-[0.98]"
          >
            {importing ? 'Importing…' : 'Import CSV'}
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-forest hover:bg-forest-600 text-white rounded-xl text-sm font-semibold shadow-sm transition active:scale-[0.98]"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
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
      </div>

      <div className="flex gap-2 flex-wrap mb-4">
        {categoryFilters.map((f) => (
          <button
            key={f.label}
            onClick={() => setCategoryFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              categoryFilter === f.value
                ? 'bg-forest text-white'
                : 'bg-white text-gray-500 border border-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <p className="text-center text-gray-400 py-10">No items match your filters.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200">
                {columns.map((col) => (
                  <th
                    key={col.sortKey}
                    onClick={() => handleSort(col.sortKey)}
                    className={`px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-r border-gray-200 whitespace-nowrap cursor-pointer select-none hover:text-forest ${
                      col.align === 'right' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {col.label}
                    {sortKey === col.sortKey && (
                      <span className="ml-1">{sortDir === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </th>
                ))}
                <th className="px-2 py-2 border-gray-200" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sorted.map((item, i) => {
                const perUnit = pricePerUnit(item)
                const value = lineValue(item)
                return (
                  <tr key={item._id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2.5 text-sm font-medium text-gray-800 border-r border-gray-200">
                      <div className="flex flex-col">
                        <span>{item.name}</span>
                        {item.subcategory && (
                          <span className="text-[11px] text-forest-400 capitalize font-normal">{item.subcategory}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-sm text-gray-500 border-r border-gray-200">
                      {categoryLabels[item.category]}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-right tabular-nums text-gray-500 border-r border-gray-200">
                      {item.unitsPerBox ?? '—'}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-right tabular-nums text-gray-500 border-r border-gray-200">
                      {item.boxPrice != null ? money(item.boxPrice) : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-right tabular-nums text-gray-500 border-r border-gray-200">
                      {perUnit != null ? money(perUnit) : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-right tabular-nums font-semibold text-forest border-r border-gray-200">
                      {value > 0 ? money(value) : '—'}
                    </td>
                    <td className="px-2 py-2.5 text-right">
                      <button
                        onClick={() => setEditItem(item)}
                        className="w-7 h-7 rounded-lg inline-flex items-center justify-center text-gray-300 hover:text-forest hover:bg-forest-50 transition-colors"
                        aria-label={`Edit ${item.name}`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 border-t-2 border-gray-200 font-semibold">
                <td colSpan={5} className="px-4 py-2.5 text-sm text-right text-gray-600 border-r border-gray-200">
                  Total Value
                </td>
                <td className="px-4 py-2.5 text-sm text-right tabular-nums text-forest border-r border-gray-200">
                  {money(totalValue)}
                </td>
                <td className="px-2 py-2.5" />
              </tr>
            </tfoot>
          </table>
        </div>
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
